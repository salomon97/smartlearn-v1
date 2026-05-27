import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
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

        const customData = data.custom_data ||
                          data.metadata?.custom_data ||
                          searchParams.get('custom_data') ||
                          null;

        const userId = customData || body.metadata?.custom_data;

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

        // 3. Activer le compte VIP
        if (!user.isPremium && user.role !== 'admin') {
            user.isPremium = true;
            await user.save();
            console.log(`✅ [WEBHOOK] Compte VIP activé avec succès pour ${user.email}`);
        } else {
            console.log(`ℹ️ [WEBHOOK] L'utilisateur ${user.email} est déjà VIP ou admin.`);
        }

        // 4. Gérer l'affiliation et la création de la transaction avec délai de 72h
        const amountPaid = 2000; // Prix fixe du Pass VIP pour l'instant
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
                    // S'assurer que les champs existent (pour les anciens comptes)
                    if (parrainDoc.balance_pending === undefined) parrainDoc.balance_pending = 0;
                    if (parrainDoc.commission_rate === undefined) parrainDoc.commission_rate = 10;

                    // Calculer la commission dynamiquement basée sur le taux de l'affilié
                    commissionAmount = (amountPaid * parrainDoc.commission_rate) / 100;

                    // Ajouter la commission en ATTENTE (balance_pending)
                    parrainDoc.balance_pending += commissionAmount;

                    await parrainDoc.save();
                    console.log(`💸 [WEBHOOK] Commission EN ATTENTE de ${commissionAmount} FCFA ajoutée au parrain ${parrainDoc.email}`);
                }
            } else {
                console.log(`⚠️ [WEBHOOK] Le parrain (ID: ${user.parrainId}) n'a pas été trouvé pour l'affiliation.`);
            }
        }

        // 5. Créer la Transaction pour garder une trace stricte (et libérer les fonds plus tard)
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
            referenceId: data.id || null, // ID de la vente venant de Chariow (si dispo)
            clearingDate: clearingDate,
            metadata: {
                buyerIp: user.registrationIp,
                parrainIp: parrainDoc?.registrationIp,
                fraudReason: (commissionAmount === 0 && user.parrainId) ? "Même IP ou Email détecté (Auto-Affiliation)" : null
            }
        });
        
        console.log(`📝 [WEBHOOK] Transaction enregistrée. Libération prévue le : ${clearingDate.toLocaleDateString()}`);

        return NextResponse.json({ message: 'Paiement traité avec succès', success: true });

    } catch (error) {
        console.error('❌ [WEBHOOK] Erreur lors du traitement :', error);
        return NextResponse.json({ message: 'Erreur interne', error: 'Une erreur est survenue' }, { status: 500 });
    }
}
