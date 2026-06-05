import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from '@/lib/mongoose';
import { clearMatureCommissions } from '@/lib/affiliate-clearing';

/**
 * POST /api/admin/transactions/clear-auto
 * Déclenche manuellement la libération des commissions matures (>72h).
 * Doublon admin du cron `/api/cron/clear-affiliate-commissions` qui tourne
 * automatiquement chaque heure ; ce bouton sert au cas où l'admin veut forcer.
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ message: "Non autorisé" }, { status: 403 });
        }

        await connectToDatabase();
        const { count } = await clearMatureCommissions();

        return NextResponse.json({
            message: count === 0
                ? "Aucune transaction à libérer pour le moment."
                : `${count} transaction(s) libérée(s) avec succès.`,
            success: true,
            count,
        });

    } catch (error) {
        console.error("❌ [AUTO-CLEAR] Erreur lors de la libération automatique:", error);
        return NextResponse.json({ message: "Erreur interne", error: "Erreur lors du clearing automatique" }, { status: 500 });
    }
}
