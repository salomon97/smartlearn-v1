import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import WithdrawalHistory from "@/models/WithdrawalHistory";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
        }

        const body = await req.json();
        const { amount, accountNumber } = body;

        if (!amount || amount < 2000) {
            return NextResponse.json({ error: "Le montant minimum est de 2000 FCFA" }, { status: 400 });
        }

        if (!accountNumber) {
            return NextResponse.json({ error: "Le numéro Mobile Money est requis" }, { status: 400 });
        }

        await connectToDatabase();
        const userId = session.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
        }

        if (user.balance_available < amount) {
            return NextResponse.json({ error: "Solde insuffisant" }, { status: 400 });
        }

        // 1. Déduire du solde disponible (on le met en "réservé" implicitement en le déduisant)
        user.balance_available -= amount;
        await user.save();

        // 2. Créer la demande dans l'historique (status pending par défaut)
        await WithdrawalHistory.create({
            affiliateId: userId,
            affiliateName: user.name,
            affiliateEmail: user.email,
            amount: amount,
            accountNumber: accountNumber,
            paymentMethod: "Mobile Money",
            status: "pending"
        });

        return NextResponse.json({ 
            success: true, 
            message: "Votre demande de retrait a été enregistrée avec succès et sera traitée sous peu." 
        });

    } catch (error) {
        console.error("Erreur retrait:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
