import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from '@/lib/mongoose';
import Transaction from '@/models/Transaction';
import User from '@/models/User';

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

        // 2. Si un parrain existe et qu'il y a eu une commission, on transfère l'argent du compte 'pending' au compte 'disponible'
        if (transaction.parrainId && transaction.commission > 0) {
            const parrain = await User.findById(transaction.parrainId);
            if (parrain) {
                // S'assurer que les soldes n'étaient pas indéfinis 
                if (parrain.balance_pending === undefined) parrain.balance_pending = 0;
                if (parrain.balance_available === undefined) parrain.balance_available = 0;

                // Transférer l'argent
                if (parrain.balance_pending >= transaction.commission) {
                    parrain.balance_pending -= transaction.commission;
                } else {
                    parrain.balance_pending = 0; // Sécurité au cas où
                }
                
                parrain.balance_available += transaction.commission;
                await parrain.save();
            }
        }

        // 3. Marquer la transaction comme 'cleared' (libérée)
        transaction.status = 'cleared';
        await transaction.save();

        return NextResponse.json({ message: "Fonds libérés avec succès", success: true });

    } catch (error) {
        console.error("❌ Erreur lors de la libération des fonds:", error);
        return NextResponse.json({ message: "Erreur interne" }, { status: 500 });
    }
}
