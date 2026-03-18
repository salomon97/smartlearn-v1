import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        // Obtenir le corps de la requête envoyée par Chariow
        const body = await req.json();

        console.log('🔔 [WEBHOOK CHARIOW] Nouveau Pulse reçu :', JSON.stringify(body, null, 2));

        // Note : En production, nous devrions vérifier la signature secrète ici.
        // Comme elle n'est pas encore visible, nous laissons passer pour les tests.

        // Chariow envoie souvent les données dans un champ 'data'
        const data = body.data || body;

        // Identifier si c'est bien une vente réussie
        // L'événement s'appelle généralement 'sale.successful' ou similaire
        // Pour être sûr, on accepte le test tant qu'il y a un custom field

        // -------------------------------------------------------------
        // LOGIQUE D'AFFILIATION & D'ACTIVATION VIP
        // -------------------------------------------------------------

        // Sur Chariow, on va passer l'ID de notre utilisateur dans un champ personnalisé (custom_field ou metadata)
        // Par exemple: https://...mychariow.shop/... ?custom_data=ID_DE_L_USER
        const customData = data.custom_data || data.metadata?.custom_data || null;

        if (!customData) {
            console.log('⚠️ [WEBHOOK] Aucun custom_data (ID utilisateur) trouvé. Ceci est peut-être juste un test Pulse.');
            return NextResponse.json({ message: 'Webhook reçu, mais pas de custom_data', success: true });
        }

        const userId = customData;

        // 1. Connexion à la base de données
        await connectToDatabase();

        // 2. Trouver l'utilisateur qui a payé
        const user = await User.findById(userId);

        if (!user) {
            console.log(`❌ [WEBHOOK] Utilisateur non trouvé avec l'ID: ${userId}`);
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
