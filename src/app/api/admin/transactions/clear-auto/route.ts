import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from '@/lib/mongoose';
import Transaction from '@/models/Transaction';

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

        // Soldes calculés à la lecture : libérer = passer les transactions éligibles à 'cleared'.
        // Aucun transfert de solde à faire (la commission bascule de pending→available toute seule).
        const now = new Date();
        const result = await Transaction.updateMany(
            { status: 'pending', clearingDate: { $lte: now } },
            { $set: { status: 'cleared' } }
        );

        const count = result.modifiedCount ?? 0;
        return NextResponse.json({
            message: count === 0
                ? "Aucune transaction à libérer pour le moment."
                : `${count} transaction(s) libérée(s) avec succès.`,
            success: true,
            count
        });

    } catch (error) {
        console.error("❌ [AUTO-CLEAR] Erreur lors de la libération automatique:", error);
        return NextResponse.json({ message: "Erreur interne", error: "Erreur lors du clearing automatique" }, { status: 500 });
    }
}
