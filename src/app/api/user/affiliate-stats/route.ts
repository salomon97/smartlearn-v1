import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

/**
 * GET /api/user/affiliate-stats
 * Retourne les statistiques d'affiliation de l'utilisateur connecté :
 * - referrals : nombre d'utilisateurs inscrits via son lien
 * - conversions : nombre de filleuls devenus Premium (VIP)
 * - earnings_pending : gains en attente de clearing (72h)
 * - earnings_available : gains disponibles pour le retrait
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
        }

        await connectToDatabase();

        const userId = session.user.id;

        // Nombre d'utilisateurs ayant ce parrain
        const referrals = await User.countDocuments({ parrainId: userId });

        // Nombre de filleuls devenus Premium
        const conversions = await User.countDocuments({ parrainId: userId, isPremium: true });

        // Lire les balances depuis le modèle utilisateur
        const user = await User.findById(userId).select("balance_pending balance_available").lean();

        return NextResponse.json({
            referrals,
            conversions,
            earnings_pending: (user as any)?.balance_pending || 0,
            earnings_available: (user as any)?.balance_available || 0,
        });

    } catch (error) {
        console.error("Erreur affiliate-stats:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
