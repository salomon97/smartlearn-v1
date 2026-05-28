import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import Plan from '@/models/Plan';
import { parseCustomData } from '@/lib/chariow';
import { DEFAULT_PLAN_CODE } from '@/lib/constants';
import { trackEvent } from '@/lib/retention';
import crypto from 'crypto';

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

    // Rediriger vers la page de paiement avec success=true pour déclencher le polling
    // du côté client qui vérifiera l'activation effective du compte VIP.
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
            console.log('📝 [WEBHOOK] Log enregistré dans la collection webhook_logs');
        } catch (logErr) {
            console.error('❌ Erreur lors de l\'enregistrement du log Webhook :', logErr);
        }

        // 6. Analyser les données
        const data = body.data || body;
        const customerEmail = data.customer?.email;

        const rawCustomData = data.custom_data ||
                          data.metadata?.custom_data ||
                          searchParams.get('custom_data') ||
                          body.metadata?.custom_data ||
                          null;

        const { userId, planCode } = parseCustomData(rawCustomData);

        let user = null;

        // 7. Trouver l'utilisateur qui a payé
        if (userId) {
            user = await User.findById(userId).catch(() => null);
        }

        // Fallback par email — comparaison exacte insensible à la casse (sans $regex)
        if (!user && customerEmail) {
            console.log(`⚠️ [WEBHOOK] ID non trouvé. Recherche par e-mail : ${customerEmail}`);
            user = await User.findOne({ email: customerEmail.toLowerCase().trim() });
        }

        if (!user) {
            console.log(`❌ [WEBHOOK] Utilisateur non trouvé (ID: ${userId}, Email: ${customerEmail})`);
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Résoudre le plan (planCode du custom_data, sinon plan par défaut = rétro-compat).
        const plan = await Plan.findOne({ code: planCode || DEFAULT_PLAN_CODE });
        if (!plan) {
            console.error(`❌ [WEBHOOK] Plan introuvable (code: ${planCode || DEFAULT_PLAN_CODE}).`);
            return NextResponse.json({ message: 'Plan introuvable' }, { status: 500 });
        }
        const amountPaid = plan.price; // Montant autoritaire (jamais deviné du payload)

        // 8. Activer le compte VIP
        if (!user.isPremium && user.role !== 'admin') {
            user.isPremium = true;
            await user.save();
            console.log(`✅ [WEBHOOK] Compte VIP activé avec succès pour ${user.email}`);
        } else {
            console.log(`ℹ️ [WEBHOOK] L'utilisateur ${user.email} est déjà VIP ou admin.`);
        }

        // 9. Gérer l'affiliation et la création de la transaction avec délai de 72h
        let parrainDoc = null;
        let commissionAmount = 0;

        if (user.parrainId) {
            parrainDoc = await User.findById(user.parrainId);

            if (parrainDoc) {
                // --- ANTI-FRAUDE : AUTO-AFFILIATION ---
                // On vérifie si l'acheteur et le parrain ont la même IP de création de compte
                const isSameIp = user.registrationIp && parrainDoc.registrationIp && user.registrationIp === parrainDoc.registrationIp;
                const isSameEmail = user.email.toLowerCase() === parrainDoc.email.toLowerCase();

                if (isSameIp || isSameEmail) {
                    console.log(`🚫 [FRAUDE] Tentative d'auto-affiliation détectée pour ${user.email} (Parrain: ${parrainDoc.email}). Commission annulée.`);
                    commissionAmount = 0; // Pas de commission si c'est la même personne
                } else {
                    // Calculer la commission selon le taux de l'affilié (défaut 10%).
                    const rate = parrainDoc.commission_rate ?? 10;
                    commissionAmount = (amountPaid * rate) / 100;

                    // Plus de mutation de solde : la commission EN ATTENTE est portée par la
                    // Transaction (status 'pending') et recalculée à la lecture (computeBalances).
                    console.log(`💸 [WEBHOOK] Commission EN ATTENTE de ${commissionAmount} FCFA enregistrée (Transaction pending) pour ${parrainDoc.email}`);
                }
            } else {
                console.log(`⚠️ [WEBHOOK] Le parrain (ID: ${user.parrainId}) n'a pas été trouvé pour l'affiliation.`);
            }
        }

        // 10. Créer la Transaction pour garder une trace stricte (et libérer les fonds plus tard)
        const clearingDate = new Date();
        clearingDate.setDate(clearingDate.getDate() + 3); // +72 heures (3 jours)

        // Dynamic import pour éviter d'éventuelles erreurs de dépendance circulaire
        const Transaction = (await import('@/models/Transaction')).default;

        await Transaction.create({
            userId: user._id.toString(),
            parrainId: user.parrainId || null,
            amount: amountPaid,
            commission: commissionAmount,
            status: commissionAmount === 0 && user.parrainId ? 'fraud_suspected' : 'pending',
            paymentMethod: 'Chariow',
            planCode: plan.code,
            referenceId: data.id || null, // ID de la vente venant de Chariow (si dispo)
            clearingDate: clearingDate,
            metadata: {
                buyerIp: user.registrationIp,
                parrainIp: parrainDoc?.registrationIp,
                fraudReason: (commissionAmount === 0 && user.parrainId) ? "Même IP ou Email détecté (Auto-Affiliation)" : null
            }
        });

        console.log(`📝 [WEBHOOK] Transaction enregistrée. Libération prévue le : ${clearingDate.toLocaleDateString()}`);

        // Instrumentation rétention (best-effort)
        await trackEvent(user._id.toString(), 'payment_succeeded', { value: amountPaid });

        return NextResponse.json({ message: 'Paiement traité avec succès', success: true });

    } catch (error) {
        console.error('❌ [WEBHOOK] Erreur lors du traitement :', error);
        return NextResponse.json({ message: 'Erreur interne', error: 'Une erreur est survenue' }, { status: 500 });
    }
}
