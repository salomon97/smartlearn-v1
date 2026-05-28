import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import LearningEvent from '@/models/LearningEvent';

const DAY = 24 * 60 * 60 * 1000;
// Événements "significatifs" pour la rétention (apprentissage réel, pas login/paiement).
const SIGNIFICANT = ['lesson_started', 'lesson_completed', 'quiz_submitted'];

// Début de semaine (lundi 00:00) pour grouper les cohortes par semaine calendaire.
function weekStart(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const dow = (x.getDay() + 6) % 7; // 0 = lundi
  x.setDate(x.getDate() - dow);
  return x;
}

export type CohortRow = {
  weekStart: string;
  label: string;
  size: number;
  w1Active: number;
  w1Rate: number; // 0..1
  w4Active: number;
  w4Rate: number;
  mature: boolean; // assez ancienne pour avoir une fenêtre W4 complète
};

async function activeInWindow(userId: string, start: Date, end: Date): Promise<boolean> {
  const n = await LearningEvent.countDocuments({
    userId,
    type: { $in: SIGNIFICANT },
    occurredAt: { $gte: start, $lt: end },
  });
  return n > 0;
}

// Rétention par cohorte hebdomadaire. W1 = [J0,J7[, W4 = [J21,J28[ après inscription.
export async function computeCohorts(
  numWeeks = 6,
): Promise<{ cohorts: CohortRow[]; summary: { w4Rate: number; w4Active: number; matureSize: number } }> {
  await connectToDatabase();
  const students = (await User.find({ role: 'student' }).select('_id createdAt').lean()) as any[];

  const groups = new Map<string, any[]>();
  for (const s of students) {
    if (!s.createdAt) continue;
    const ws = weekStart(new Date(s.createdAt)).toISOString().slice(0, 10);
    (groups.get(ws) ?? groups.set(ws, []).get(ws)!).push(s);
  }

  const weeks = [...groups.keys()].sort().reverse().slice(0, numWeeks);
  const now = Date.now();
  const cohorts: CohortRow[] = [];
  let sumW4Active = 0;
  let sumMature = 0;

  for (const ws of weeks) {
    const members = groups.get(ws)!;
    let w1 = 0;
    let w4 = 0;
    for (const m of members) {
      const reg = new Date(m.createdAt).getTime();
      if (await activeInWindow(String(m._id), new Date(reg), new Date(reg + 7 * DAY))) w1++;
      if (await activeInWindow(String(m._id), new Date(reg + 21 * DAY), new Date(reg + 28 * DAY))) w4++;
    }
    const mature = now - new Date(ws).getTime() >= 28 * DAY;
    cohorts.push({
      weekStart: ws,
      label: `Semaine du ${new Date(ws).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}`,
      size: members.length,
      w1Active: w1,
      w1Rate: members.length ? w1 / members.length : 0,
      w4Active: w4,
      w4Rate: members.length ? w4 / members.length : 0,
      mature,
    });
    if (mature) {
      sumW4Active += w4;
      sumMature += members.length;
    }
  }

  return {
    cohorts,
    summary: { w4Rate: sumMature ? sumW4Active / sumMature : 0, w4Active: sumW4Active, matureSize: sumMature },
  };
}
