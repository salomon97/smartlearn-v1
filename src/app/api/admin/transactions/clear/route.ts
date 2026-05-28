import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from '@/lib/mongoose';
import Transaction from '@/models/Transaction';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ message: "Non autorisé" }, { status: 403 });
        }

        const body = await req.json();
        const { transactionId } = body;

        if (!transactionId) {
            return NextResponse.json({ message: "ID de transaction requis" }, { status: 400 });
        }

        await connectToDatabase();

        // 1. Trouver la transaction
        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
            return NextResponse.json({ message: "Transaction introuvable" }, { status: 404 });
        }

        if (transaction.status !== 'pending') {
            return NextResponse.json({ message: "Cette transaction n'est plus en attente." }, { status: 400 });
        }

        // Soldes calculés à la lecture : il suffit de changer le statut. La commission
        // bascule automatiquement de "pending" vers "available" (cleared).
        transaction.status = 'cleared';
        await transaction.save();

        return NextResponse.json({ message: "Fonds libérés avec succès", success: true });

    } catch (error) {
        console.error("❌ Erreur lors de la libération des fonds:", error);
        return NextResponse.json({ message: "Erreur interne" }, { status: 500 });
    }
}
