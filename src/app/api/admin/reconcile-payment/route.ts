import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import Plan from '@/models/Plan';
import Transaction from '@/models/Transaction';
import { trackEvent } from '@/lib/retention';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * POST /api/admin/reconcile-payment
 *
 * Activation/extension MANUELLE d'un abonnement Premium quand le webhook Chariow
 * a été perdu (réseau coupé, retry épuisés, etc.) mais que le paiement a bien
 * eu lieu côté Chariow.
 *
 * Workflow :
 *   1. L'admin obtient une preuve de paiement Chariow (ID transaction côté Chariow)
 *   2. Il appelle cet endpoint avec { email, planCode, chariowReferenceId }
 *   3. On vérifie qu'aucune Transaction avec ce referenceId n'existe déjà
 *      (sinon double comptabilité → on refuse)
 *   4. On applique exactement la même logique que le webhook : isPremium=true,
 *      extension de premiumUntil, Transaction créée avec metadata.manuallyReconciled=true
 *
 * Body JSON :
 *   - email : string (email du payeur)
 *   - planCode : string (code du plan, ex. 'vip_monthly')
 *   - chariowReferenceId : string (ID Chariow de la transaction)
 *   - reason : string optionnel (raison du reconcile, pour traçabilité)
 *
 * SÉCURITÉ : protégé par role='admin'. Toute opération est journalisée.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ message: 'Accès admin requis' }, { status: 403 });
    }

    const body = await req.json();
    const { email, planCode, chariowReferenceId, reason } = body;

    if (!email || !planCode || !chariowReferenceId) {
      return NextResponse.json({
        message: 'email, planCode et chariowReferenceId sont requis'
      }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Vérifier qu'on ne double-compte pas — si ce referenceId existe déjà, refuser.
    const existing = await Transaction.findOne({ referenceId: chariowReferenceId });
    if (existing) {
      return NextResponse.json({
        message: `Transaction ${chariowReferenceId} déjà enregistrée (id=${existing._id}). Aucune action effectuée.`,
        alreadyExists: true,
        existingTransactionId: existing._id.toString(),
      }, { status: 409 });
    }

    // 2. Trouver l'utilisateur
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ message: `Utilisateur introuvable pour ${email}` }, { status: 404 });
    }

    // 3. Résoudre le plan
    const plan = await Plan.findOne({ code: planCode });
    if (!plan) {
      return NextResponse.json({ message: `Plan ${planCode} introuvable` }, { status: 404 });
    }
    if (!plan.isActive) {
      return NextResponse.json({ message: `Plan ${planCode} archivé — refusé` }, { status: 400 });
    }
    if (!plan.durationDays || plan.durationDays <= 0) {
      return NextResponse.json({
        message: `Plan ${planCode} sans durationDays — la formule à vie n'est plus acceptée`
      }, { status: 400 });
    }

    // 4. Appliquer EXACTEMENT la même logique que le webhook
    const now = new Date();
    const wasPremium = user.isPremium;

    if (user.role !== 'admin') {
      user.isPremium = true;
      const current = user.premiumUntil ? new Date(user.premiumUntil) : null;
      const base = current && current > now ? current : now;
      user.premiumUntil = new Date(base.getTime() + plan.durationDays * DAY_MS);
      await user.save();
    }

    // 5. Tracer la Transaction (avec metadata.manuallyReconciled pour audit)
    const clearingDate = new Date(now.getTime() + 3 * DAY_MS);
    const transaction = await Transaction.create({
      userId: user._id.toString(),
      parrainId: user.parrainId || null,
      amount: plan.price,
      commission: 0, // Pas de commission affilié sur les paiements reconciliés (politique conservative)
      status: 'pending',
      paymentMethod: 'Chariow (manual reconcile)',
      referenceId: chariowReferenceId,
      planCode: plan.code,
      clearingDate,
      metadata: {
        manuallyReconciled: true,
        reconciledBy: (session.user as any).id,
        reconciledByEmail: session.user.email,
        reconciledAt: now,
        reason: reason || null,
      },
    });

    // 6. Tracker l'événement de rétention (le flag manuallyReconciled est dans la Transaction)
    await trackEvent(user._id.toString(), 'payment_succeeded', { value: plan.price });

    const action = wasPremium && user.premiumUntil ? 'Renouvellement' : 'Activation';
    console.log(`✅ [RECONCILE] ${action} Premium MANUEL pour ${user.email} (plan ${plan.code}, ref ${chariowReferenceId}) par admin ${session.user.email}`);

    return NextResponse.json({
      message: `${action} Premium effectuée avec succès pour ${user.email}`,
      success: true,
      transaction: {
        id: transaction._id.toString(),
        amount: plan.price,
        premiumUntil: user.premiumUntil,
        action: action.toLowerCase(),
      },
    });

  } catch (error: any) {
    console.error('❌ [RECONCILE] Erreur :', error);
    return NextResponse.json({
      message: 'Erreur interne lors de la réconciliation',
      error: error?.message,
    }, { status: 500 });
  }
}
