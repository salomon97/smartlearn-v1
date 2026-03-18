import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from '@/lib/mongoose';
import Transaction from '@/models/Transaction';
import User from '@/models/User';

/**
 * POST /api/admin/transactions/clear-auto
 * Libère automatiquement toutes les commissions dont le délai de 72h est passé.
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ message: "Non autorisé" }, { status: 403 });
        }

        await connectToDatabase();

        // 1. Trouver toutes les transactions 'pending' dont la date de clearing est dépassée
        const now = new Date();
        const pendingTransactions = await Transaction.find({
            status: 'pending',
            clearingDate: { $lte: now }
        });

        if (pendingTransactions.length === 0) {
            return NextResponse.json({ 
                message: "Aucune transaction à libérer pour le moment.", 
                count: 0 
            });
        }

        let processedCount = 0;

        // 2. Traiter chaque transaction
        for (const transaction of pendingTransactions) {
            if (transaction.parrainId && transaction.commission > 0) {
                const parrain = await User.findById(transaction.parrainId);
                if (parrain) {
                    // S'assurer que les soldes ne sont pas undefined
                    if (parrain.balance_pending === undefined) parrain.balance_pending = 0;
                    if (parrain.balance_available === undefined) parrain.balance_available = 0;

                    // Transférer du pending vers le disponible
                    const amountToClear = transaction.commission;
                    
                    if (parrain.balance_pending >= amountToClear) {
                        parrain.balance_pending -= amountToClear;
                    } else {
                        parrain.balance_pending = 0;
                    }
                    
                    parrain.balance_available += amountToClear;
                    await parrain.save();
                }
            }

            // Marquer la transaction comme 'cleared'
            transaction.status = 'cleared';
            await transaction.save();
            processedCount++;
        }

        return NextResponse.json({ 
            message: `${processedCount} transaction(s) libérée(s) avec succès.`, 
            success: true,
            count: processedCount
        });

    } catch (error) {
        console.error("❌ [AUTO-CLEAR] Erreur lors de la libération automatique:", error);
        return NextResponse.json({ message: "Erreur interne", error: "Erreur lors du clearing automatique" }, { status: 500 });
    }
}
