import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ message: "Non autorisé" }, { status: 403 });
        }

        const body = await req.json();
        const { affiliateId, newRate } = body;

        if (!affiliateId || newRate === undefined) {
            return NextResponse.json({ message: "ID de l'affilié et nouveau taux requis" }, { status: 400 });
        }

        const rateNum = Number(newRate);
        if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
            return NextResponse.json({ message: "Le taux doit être un nombre entre 0 et 100" }, { status: 400 });
        }

        await connectToDatabase();

        const affiliate = await User.findOne({ _id: affiliateId, role: 'affiliate' });

        if (!affiliate) {
            return NextResponse.json({ message: "Affilié introuvable" }, { status: 404 });
        }

        affiliate.commission_rate = rateNum;
        await affiliate.save();

        return NextResponse.json({ 
            message: `Le taux de commission a été mis à jour à ${rateNum}%.`, 
            success: true 
        });

    } catch (error) {
        console.error("❌ Erreur lors de la modification du taux:", error);
        return NextResponse.json({ message: "Erreur interne" }, { status: 500 });
    }
}
