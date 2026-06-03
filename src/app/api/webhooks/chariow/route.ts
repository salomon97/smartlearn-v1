import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import Plan from '@/models/Plan';
import Transaction from '@/models/Transaction';
import { parseCustomData } from '@/lib/chariow';
import { DEFAULT_PLAN_CODE } from '@/lib/constants';
import { trackEvent } from '@/lib/retention';
import crypto from 'crypto';

const DAY_MS = 24 * 60 * 60 * 1000;

function verifyChariowSignature(rawBody: string, signature: string | null): boolean {
    const secret = process.env.CHARIOW_WEBHOOK_SECRET;
    if (!secret) {
        console.error('❌ [WEBHOOK] CHARIOW_WEBHOOK_SECRET non défini — vérification ignorée');
        return false;
    }
    if (!signature) return false;

    const expected = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
    // Chariow peut préfixer avec "sha256="
    const received = signature.startsWith('sha256=') ? signature.slice(7) : signature;

    try {
        return crypto.timingSafeEqual(Buffer.from(received, 'hex'), Buffer.from(expected, 'hex'));
    } catch {
        return false;
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const purchase = searchParams.get('purchase');

    console.log('🔔 [REDIRECT CHARIOW] Retour utilisateur après achat :', purchase);

    return NextResponse.redirect(new URL('/paiement?success=true', req.url));
}

export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        // 1. Lire le corps brut (nécessaire pour vérifier la signature HMAC)
        const rawBody = await req.text();

        // 2. Vérifier la signature Chariow AVANT tout traitement
        const signature = req.headers.get('x-chariow-signature');
        if (!verifyChariowSignature(rawBody, signature)) {
            console.warn('🚫 [WEBHOOK] Signature invalide ou absente — requête rejetée');
            return NextResponse.json({ message: 'Signature invalide' }, { status: 401 });
        }

        // 3. Parser le corps maintenant que la signature est validée
        let body: Record<string, any> = {};
        try { body = JSON.parse(rawBody); } catch { body = {}; }

        // 4. Connexion à la base de données
        const mongooseInstance = await connectToDatabase();

        console.log('🔔 [WEBHOOK CHARIOW] Nouveau Pulse reçu :', JSON.stringify(body, null, 2));

        // 5. Enregistrer la requête brute pour le diagnostic
        try {
            const db = (mongooseInstance as any).connection.db;
            await db.collection('webhook_logs').insertOne({
                receivedAt: new Date(),
                method: 'POST',
                url: req.url,
                body: body,
                query: Object.fromEntries(searchParams.entries()),
            });
        } catch (logErr) {
            console.error('❌ Erreur lors de l\'enregistrement du log Webhook :', logErr);
        }

        // 6. Analyser les données
        const data = body.data || body;
        const customerEmail = data.customer?.email;
        const referenceId = data.id || null;

        const rawCustomData = data.custom_data ||
                          data.metadata?.custom_data ||
                          searchParams.get('custom_data') ||
                          body.metadata?.custom_data ||
                          null;

        const { userId, planCode } = parseCustomData(rawCustomData);

        // 7. IDÉMPOTENCE — si on a déjà traité ce paiement (referenceId Chariow connu),
        // on retourne OK sans rien refaire. Évite la double-extension de premiumUntil en cas
        // de retry du webhook par Chariow.
        if (referenceId) {
            const already = await Transaction.findOne({ referenceId });
            if (already) {
                console.log(`♻️  [WEBHOOK] Paiement ${referenceId} déjà traité — idempotent, OK`);
                return NextResponse.json({ message: 'Déjà traité', success: true });
            }
        } else {
            console.warn('⚠️  [WEBHOOK] Pas de referenceId Chariow — idempotence impossible, on traite quand même');
        }

        // 8. Trouver l'utilisateur qui a payé
        let user = null;
        if (userId) {
            user = await User.findById(userId).catch(() => null);
        }
        if (!user && customerEmail) {
            console.log(`⚠️ [WEBHOOK] ID non trouvé. Recherche par e-mail : ${customerEmail}`);
            user = await User.findOne({ email: customerEmail.toLowerCase().trim() });
        }
        if (!user) {
            console.log(`❌ [WEBHOOK] Utilisateur non trouvé (ID: ${userId}, Email: ${customerEmail})`);
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // 9. Résoudre le plan (planCode du custom_data, sinon plan par défaut = rétro-compat).
        const plan = await Plan.findOne({ code: planCode || DEFAULT_PLAN_CODE });
        if (!plan) {
            console.error(`❌ [WEBHOOK] Plan introuvable (code: ${planCode || DEFAULT_PLAN_CODE}).`);
            return NextResponse.json({ message: 'Plan introuvable' }, { status: 500 });
        }
        const amountPaid = plan.price;

        // 10. Activer / étendre l'accès VIP.
        //   - isPremium = true (toujours — drapeau "a payé au moins une fois", jamais reset)
        //   - premiumUntil étendu de plan.durationDays JOURS depuis max(now, premiumUntil actuel)
        //     → renouvellement précoce ne perd aucun jour.
        //   - Si plan.durationDays absent/0 (lifetime, ex: legacy vip_avie) → premiumUntil
        //     n'est pas touché (reste null = grandfather à vie).
        if (user.role !== 'admin') {
            const now = new Date();
            const wasPremium = user.isPremium;
            user.isPremium = true;

            if (plan.durationDays && plan.durationDays > 0) {
                const current = user.premiumUntil ? new Date(user.premiumUntil) : null;
                const base = current && current > now ? current : now;
                user.premiumUntil = new Date(base.getTime() + plan.durationDays * DAY_MS);
            }

            await user.save();
            const action = wasPremium && user.premiumUntil ? 'Renouvellement' : 'Activation';
            console.log(`✅ [WEBHOOK] ${action} VIP pour ${user.email} (plan ${plan.code}, expire: ${user.premiumUntil || 'à vie'})`);
        } else {
            console.log(`ℹ️ [WEBHOOK] Utilisateur ${user.email} est admin — accès intact, on enregistre quand même la Transaction.`);
        }

        // 11. Gérer l'affiliation et la commission
        let parrainDoc = null;
        let commissionAmount = 0;

        if (user.parrainId) {
            parrainDoc = await User.findById(user.parrainId);

            if (parrainDoc) {
                const isSameIp = user.registrationIp && parrainDoc.registrationIp && user.registrationIp === parrainDoc.registrationIp;
                const isSameEmail = user.email.toLowerCase() === parrainDoc.email.toLowerCase();

                if (isSameIp || isSameEmail) {
                    console.log(`🚫 [FRAUDE] Tentative d'auto-affiliation détectée pour ${user.email} (Parrain: ${parrainDoc.email}). Commission annulée.`);
                    commissionAmount = 0;
                } else {
                    const rate = parrainDoc.commission_rate ?? 10;
                    commissionAmount = (amountPaid * rate) / 100;
                    console.log(`💸 [WEBHOOK] Commission EN ATTENTE de ${commissionAmount} FCFA enregistrée (Transaction pending) pour ${parrainDoc.email}`);
                }
            } else {
                console.log(`⚠️ [WEBHOOK] Le parrain (ID: ${user.parrainId}) n'a pas été trouvé pour l'affiliation.`);
            }
        }

        // 12. Créer la Transaction (clé d'idempotence + audit comptable)
        const clearingDate = new Date();
        clearingDate.setDate(clearingDate.getDate() + 3); // +72 heures

        await Transaction.create({
            userId: user._id.toString(),
            parrainId: user.parrainId || null,
            amount: amountPaid,
            commission: commissionAmount,
            status: commissionAmount === 0 && user.parrainId ? 'fraud_suspected' : 'pending',
            paymentMethod: 'Chariow',
            planCode: plan.code,
            referenceId: referenceId,
            clearingDate: clearingDate,
            metadata: {
                buyerIp: user.registrationIp,
                parrainIp: parrainDoc?.registrationIp,
                fraudReason: (commissionAmount === 0 && user.parrainId) ? "Même IP ou Email détecté (Auto-Affiliation)" : null,
            },
        });

        // 13. Tracker l'événement de rétention (best-effort, non bloquant)
        await trackEvent(user._id.toString(), 'payment_succeeded', { value: amountPaid });

        console.log(`📝 [WEBHOOK] Transaction enregistrée. Libération prévue le : ${clearingDate.toLocaleDateString()}`);

        return NextResponse.json({ message: 'Paiement traité avec succès', success: true });

    } catch (error) {
        console.error('❌ [WEBHOOK] Erreur lors du traitement :', error);
        return NextResponse.json({ message: 'Erreur interne', error: 'Une erreur est survenue' }, { status: 500 });
    }
}
