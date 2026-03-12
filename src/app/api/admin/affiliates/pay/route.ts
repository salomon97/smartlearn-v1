import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import WithdrawalHistory from '@/models/WithdrawalHistory';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ message: "Non autorisé" }, { status: 403 });
        }

        const body = await req.json();
        const { affiliateId } = body;

        if (!affiliateId) {
            return NextResponse.json({ message: "ID de l'affilié requis" }, { status: 400 });
        }

        await connectToDatabase();

        const affiliate = await User.findOne({ _id: affiliateId, role: 'affiliate' });

        if (!affiliate) {
            return NextResponse.json({ message: "Affilié introuvable" }, { status: 404 });
        }

        if ((affiliate.balance_available || 0) < 1000) {
            return NextResponse.json({ message: "Le solde disponible est insuffisant (< 1000 FCFA)." }, { status: 400 });
        }

        // Réinitialiser le solde disponible (on considère qu'il a été payé en totalité via Mobile Money)
        const payoutAmount = affiliate.balance_available;
        affiliate.balance_available = 0;
        await affiliate.save();

        // Créer un historique des retraits
        await WithdrawalHistory.create({
            affiliateId: affiliate._id,
            affiliateName: affiliate.name,
            affiliateEmail: affiliate.email,
            amount: payoutAmount,
            paymentMethod: "Mobile Money",
            status: "paid"
        });

        return NextResponse.json({ 
            message: `Paiement de ${payoutAmount} FCFA enregistré avec succès.`, 
            success: true 
        });

    } catch (error) {
        console.error("❌ Erreur lors du marquage du paiement:", error);
        return NextResponse.json({ message: "Erreur interne" }, { status: 500 });
    }
}
