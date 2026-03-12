import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import Transaction from "@/models/Transaction";
import User from "@/models/User";

// NOTE: C'est un mock pour le MVP.
// Quand vous intègrerez MTN/Orange Money via un agrégateur (SponsorPay, CinetPay, etc.),
// cette route sera remplacée par l'initialisation du paiement vers leur API
// et vous créerez une route Webhook (POST) pour écouter leur confirmation.

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Vous devez être connecté pour acheter." }, { status: 401 });
        }

        await connectToDatabase();

        const body = await request.json();
        const { amount, paymentMethod } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
        }

        // 1. Création de la transaction (Simulation)
        const transaction = await Transaction.create({
            userId: session.user.id,
            amount: amount,
            status: 'completed', // On simule un succès immédiat
            paymentMethod: paymentMethod || 'Mobile Money Mock',
            referenceId: `MOCK-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        });

        // 2. Mise à jour de l'utilisateur (Il devient Premium)
        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            { isPremium: true },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ error: "Utilisateur non trouvé en base" }, { status: 404 });
        }

        // Le succès renvoie les nouvelles informations de session nécessaires (Premium: true)
        return NextResponse.json({
            message: "Paiement simulé avec succès !",
            transaction: transaction.referenceId,
            userPremiumStatus: updatedUser.isPremium
        }, { status: 200 });

    } catch (error: any) {
        console.error("Erreur lors de la simulation du paiement:", error);
        return NextResponse.json({ error: "Erreur Serveur Interne" }, { status: 500 });
    }
}
