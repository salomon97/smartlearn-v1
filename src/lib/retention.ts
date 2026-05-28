import connectToDatabase from '@/lib/mongoose';
import LearningEvent, { LearningEventType } from '@/models/LearningEvent';
import StudentHealth from '@/models/StudentHealth';
import Reengagement from '@/models/Reengagement';
import ReengagementLog from '@/models/ReengagementLog';
import User from '@/models/User';
import { sendEmail } from '@/lib/email';
import { computeHealthScore, HealthStatus } from '@/lib/retention-core';

const DAY = 24 * 60 * 60 * 1000;

// ───────────────────────── INGESTION ─────────────────────────
// Best-effort : ne JAMAIS casser le flux appelant (login, leçon, paiement).
export async function trackEvent(
  userId: string,
  type: LearningEventType,
  extra?: { courseId?: string; lessonId?: string; value?: number; tenantId?: string },
): Promise<void> {
  try {
    if (!userId) return;
    await connectToDatabase();
    await LearningEvent.create({ userId, type, occurredAt: new Date(), ...extra });
  } catch (e) {
    console.error('[retention] trackEvent échec (non bloquant):', e);
  }
}

// ───────────────────────── RECALCUL (idempotent) ─────────────────────────
export async function recomputeAllHealth(): Promise<{ processed: number }> {
  await connectToDatabase();
  const userIds: string[] = await LearningEvent.distinct('userId');
  const now = Date.now();
  const since14 = new Date(now - 14 * DAY);
  let processed = 0;

  for (const userId of userIds) {
    const events = await LearningEvent.find({ userId }).select('type occurredAt').lean();
    if (events.length === 0) continue;

    let lastActivityAt = new Date(0);
    const activeDays = new Set<string>();
    let lessonsCompleted14 = 0;

    for (const e of events as any[]) {
      const d = new Date(e.occurredAt);
      if (d > lastActivityAt) lastActivityAt = d;
      if (d >= since14) {
        activeDays.add(d.toISOString().slice(0, 10));
        if (e.type === 'lesson_completed') lessonsCompleted14++;
      }
    }

    const recencyDays = Math.floor((now - lastActivityAt.getTime()) / DAY);
    const activeDays14 = activeDays.size;
    const { score, status } = computeHealthScore({ recencyDays, activeDays14, lessonsCompleted14 });

    await StudentHealth.findOneAndUpdate(
      { userId },
      { $set: { score, status, recencyDays, activeDays14, lessonsCompleted14, lastActivityAt, computedAt: new Date() } },
      { upsert: true },
    );
    processed++;

    await advanceReengagement(userId, status);
  }

  return { processed };
}

// ───────────────────────── SÉQUENCE DE RÉ-ENGAGEMENT ─────────────────────────
// Étape 1 (J0) · Étape 2 (J+3) · Étape 3 (J+7) · completed (J+10 sans retour).
async function advanceReengagement(userId: string, status: HealthStatus): Promise<void> {
  const active = await Reengagement.findOne({ userId, status: 'active' });

  // L'élève est redevenu actif → recovered, sortie de séquence.
  if (active && (status === 'healthy' || status === 'cooling')) {
    active.status = 'recovered';
    active.recoveredAt = new Date();
    await active.save();
    return;
  }

  if (status !== 'at_risk' && status !== 'churned') return;

  // Pas de séquence active : on en démarre une SEULEMENT à l'entrée en at_risk.
  if (!active) {
    if (status === 'at_risk') {
      await Reengagement.create({ userId, sequenceStep: 1, status: 'active', triggeredAt: new Date(), lastStepAt: new Date() });
      await sendReengagement(userId, 1);
    }
    return;
  }

  // Séquence active : avancer selon le délai écoulé depuis le déclenchement.
  const daysSince = Math.floor((Date.now() - new Date(active.triggeredAt).getTime()) / DAY);
  const desiredStep = daysSince >= 7 ? 3 : daysSince >= 3 ? 2 : 1;

  if (desiredStep > active.sequenceStep) {
    active.sequenceStep = desiredStep;
    active.lastStepAt = new Date();
    await active.save();
    await sendReengagement(userId, desiredStep);
  } else if (active.sequenceStep >= 3 && daysSince >= 10) {
    active.status = 'completed'; // décrochage confirmé
    await active.save();
  }
}

// ───────────────────────── CANAL (abstrait) ─────────────────────────
// Email via le nodemailer existant si SMTP configuré, sinon LOG SEULEMENT.
// Toujours journalisé (reengagement_log) → testable sans provider.
// L'interface accepte un `channel` pour brancher 'sms' (Africa's Talking) plus tard
// SANS réécrire la séquence.
type TemplateCtx = { firstName: string; lastLessonUrl: string };

function buildTemplate(step: number, ctx: TemplateCtx): { subject: string; text: string; html: string } {
  const map: Record<number, { subject: string; text: string }> = {
    1: {
      subject: `${ctx.firstName}, on t'a gardé ta place sur SmartLearn`,
      text: `Bonjour ${ctx.firstName}, on a remarqué ton absence. Ta progression t'attend — reprends là où tu t'es arrêté : ${ctx.lastLessonUrl}`,
    },
    2: {
      subject: `${ctx.firstName}, un conseil pour ne pas perdre le fil`,
      text: `Bonjour ${ctx.firstName}, quelques jours sans réviser et le rythme se perd. 15 minutes aujourd'hui suffisent à relancer ta progression : ${ctx.lastLessonUrl}`,
    },
    3: {
      subject: `${ctx.firstName}, on aimerait te revoir 💪`,
      text: `Bonjour ${ctx.firstName}, dernier petit rappel. Chaque révision te rapproche de ton objectif scolaire. On t'attend : ${ctx.lastLessonUrl}`,
    },
  };
  const t = map[step] || map[1];
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden">
    <div style="background:#0F172A;padding:20px;text-align:center"><h1 style="color:#FBBF24;margin:0">SmartLearn</h1></div>
    <div style="padding:30px;color:#333;line-height:1.6">${t.text.replace(ctx.lastLessonUrl, `<a href="${ctx.lastLessonUrl}" style="color:#ff6e14;font-weight:bold">reprendre ma révision</a>`)}</div>
  </div>`;
  return { subject: t.subject, text: t.text, html };
}

export async function sendReengagement(
  userId: string,
  step: number,
  channel: 'email' | 'sms' = 'email',
): Promise<void> {
  await connectToDatabase();
  const user = (await User.findById(userId).select('name email').lean()) as any;

  const ctx: TemplateCtx = {
    firstName: (user?.name || 'cher élève').split(' ')[0],
    lastLessonUrl: `${process.env.NEXTAUTH_URL || 'https://smartlearn-edu.org'}/dashboard`,
  };
  const tpl = buildTemplate(step, ctx);

  let provider = 'log';
  let delivered = false;

  if (channel === 'email' && user?.email && process.env.SMTP_USER) {
    const res = await sendEmail({ to: user.email, subject: tpl.subject, html: tpl.html });
    provider = 'nodemailer';
    delivered = !!res.success;
  } else {
    console.log(`[retention] (log-only) relance étape ${step} → user ${userId} : ${tpl.subject}`);
  }

  await ReengagementLog.create({
    userId, step, channel, subject: tpl.subject, body: tpl.text, sentAt: new Date(), provider, delivered,
  });
}
