import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import Plan from '@/models/Plan';
import Transaction from '@/models/Transaction';
import { parseCustomData, parseChariowSale } from '@/lib/chariow';
import { DEFAULT_PLAN_CODE } from '@/lib/constants';
import { trackEvent } from '@/lib/retention';
import crypto from 'crypto';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Vérifie l'authenticité du webhook Chariow.
 *
 * Stratégie principale : TOKEN URL.
 *   Chariow (du moins dans sa version actuelle) n'expose pas de "Webhook
 *   Signing Secret" comme Stripe ou Paystack. On utilise donc un token
 *   secret dans l'URL du Pulse :
 *     https://www.smartlearn-edu.org/api/webhooks/chariow?token=XXX
 *   La variable CHARIOW_WEBHOOK_TOKEN sur Vercel contient la valeur de
 *   référence et on compare en temps-constant.
 *
 * Fallback HMAC : on conserve la vérification HMAC pour le jour où Chariow
 * ajouterait un signing secret. Si un header x-chariow-signature est présent
 * ET que CHARIOW_WEBHOOK_SECRET est défini, on le valide en plus.
 *
 * Au moins UNE des deux protections doit être configurée. Si aucune des deux
 * n'est définie, on refuse — c'est un déploiement non sécurisé.
 */
function verifyWebhookAuth(
    rawBody: string,
    signatureHeader: string | null,
    urlToken: string | null,
): { ok: boolean; reason: string } {
    const expectedToken = process.env.CHARIOW_WEBHOOK_TOKEN;
    const hmacSecret = process.env.CHARIOW_WEBHOOK_SECRET;

    // Mode 1 — token URL (principal)
    if (expectedToken) {
        if (!urlToken) return { ok: false, reason: 'token URL manquant' };
        const a = Buffer.from(urlToken);
        const b = Buffer.from(expectedToken);
        if (a.length !== b.length) return { ok: false, reason: 'token URL invalide' };
        const tokenOk = crypto.timingSafeEqual(a, b);
        if (!tokenOk) return { ok: false, reason: 'token URL invalide' };
        return { ok: true, reason: 'token URL ok' };
    }

    // Mode 2 — HMAC signature (legacy / futur)
    if (hmacSecret && signatureHeader) {
        const expected = crypto.createHmac('sha256', hmacSecret).update(rawBody, 'utf8').digest('hex');
        const received = signatureHeader.startsWith('sha256=') ? signatureHeader.slice(7) : signatureHeader;
        try {
            const ok = crypto.timingSafeEqual(Buffer.from(received, 'hex'), Buffer.from(expected, 'hex'));
            return { ok, reason: ok ? 'HMAC ok' : 'HMAC invalide' };
        } catch {
            return { ok: false, reason: 'HMAC malformé' };
        }
    }

    // Aucune config — refuse pour ne pas accepter n'importe qui
    return { ok: false, reason: 'aucune méthode d\'authentification configurée (CHARIOW_WEBHOOK_TOKEN ou CHARIOW_WEBHOOK_SECRET)' };
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

        // 1. Lire le corps brut (nécessaire pour fallback HMAC)
        const rawBody = await req.text();

        // 2. Vérifier l'authenticité du webhook AVANT tout traitement
        //    (token URL en mode principal, HMAC en fallback — voir verifyWebhookAuth)
        const signature = req.headers.get('x-chariow-signature');
        const urlToken = searchParams.get('token');
        const auth = verifyWebhookAuth(rawBody, signature, urlToken);
        if (!auth.ok) {
            console.warn(`🚫 [WEBHOOK] Auth refusée : ${auth.reason}`);
            return NextResponse.json({ message: 'Authentification refusée' }, { status: 401 });
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

        // 6. Analyser les données (voir parseChariowSale pour la structure réelle Chariow)
        const parsed = parseChariowSale(body);
        const { customerEmail, referenceId, chariowProductId } = parsed;
        const rawCustomData = parsed.rawCustomData || searchParams.get('custom_data');
        const { userId, planCode } = parseCustomData(rawCustomData);

        // 7. IDÉMPOTENCE STRICTE — sans referenceId, on REFUSE de traiter. Sinon, un attaquant
        // qui forgerait un webhook valide HMAC (ou un retry malformé) pourrait re-étendre
        // premiumUntil indéfiniment. Politique : pas de referenceId = pas de traitement.
        if (!referenceId) {
            console.error('🚫 [WEBHOOK] Aucun referenceId fourni — paiement refusé pour préserver l\'idempotence.');
            return NextResponse.json({ message: 'referenceId requis pour traitement idempotent' }, { status: 400 });
        }

        const already = await Transaction.findOne({ referenceId });
        if (already) {
            console.log(`♻️  [WEBHOOK] Paiement ${referenceId} déjà traité — idempotent, OK`);
            return NextResponse.json({ message: 'Déjà traité', success: true });
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

        // 9. Résoudre le plan : priorité au planCode du custom_data, puis mapping
        //    Chariow product.id → Plan.chariowUrl (cas standard pour les paiements réels où
        //    Chariow n'echo pas le custom_data), puis fallback DEFAULT_PLAN_CODE.
        let resolvedCode = planCode;
        if (!resolvedCode && chariowProductId) {
            const planByProduct = await Plan.findOne({
                chariowUrl: { $regex: chariowProductId, $options: 'i' },
                isActive: true,
            });
            if (planByProduct) {
                resolvedCode = planByProduct.code;
                console.log(`🔎 [WEBHOOK] Plan résolu via product.id "${chariowProductId}" → ${resolvedCode}`);
            }
        }
        if (!resolvedCode) resolvedCode = DEFAULT_PLAN_CODE;
        const plan = await Plan.findOne({ code: resolvedCode });
        if (!plan) {
            console.error(`❌ [WEBHOOK] Plan introuvable (code: ${resolvedCode}).`);
            return NextResponse.json({ message: 'Plan introuvable' }, { status: 500 });
        }
        // Garde-fou : un plan archivé (isActive=false) ne doit JAMAIS activer un accès. Ça vise
        // les vieux liens (ex. legacy vip_avie 2000 FCFA à vie) qui pourraient encore traîner.
        if (!plan.isActive) {
            console.error(`🚫 [WEBHOOK] Tentative de paiement sur plan ARCHIVÉ : ${plan.code}. Refus. Action admin requise : désactiver le produit Chariow correspondant ET rembourser le client.`);
            return NextResponse.json({ message: 'Plan archivé — paiement refusé' }, { status: 500 });
        }
        // Garde-fou : les plans "à vie" (sans durationDays) ne sont plus acceptés. Toute formule
        // doit avoir une durée d'abonnement explicite.
        if (!plan.durationDays || plan.durationDays <= 0) {
            console.error(`🚫 [WEBHOOK] Plan ${plan.code} sans durationDays — la formule "à vie" n'est plus acceptée.`);
            return NextResponse.json({ message: 'Plan invalide (pas de durée d\'abonnement)' }, { status: 500 });
        }
        const amountPaid = plan.price;

        // 10. Activer / étendre l'accès Premium.
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
            console.log(`✅ [WEBHOOK] ${action} Premium pour ${user.email} (plan ${plan.code}, expire: ${user.premiumUntil || 'à vie'})`);
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
