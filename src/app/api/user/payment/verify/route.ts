import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import { computePremiumStatus } from "@/lib/premium-core";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ success: false, message: "Non authentifié" }, { status: 401 });
        }

        await connectToDatabase();
        const user = await User.findById((session.user as any).id).select("isPremium premiumUntil role");

        if (!user) {
            return NextResponse.json({ success: false, message: "Utilisateur non trouvé" }, { status: 404 });
        }

        const access = computePremiumStatus(user);
        const isAdmin = user.role === 'admin';

        if (access.isPremium || isAdmin) {
            return NextResponse.json({
                success: true,
                message: "Accès Premium actif",
                status: isAdmin ? 'admin' : access.status,
                expiresAt: access.expiresAt,
                daysRemaining: access.daysRemaining,
            });
        }

        // Inclut le cas "expired" : l'utilisateur a déjà payé mais son abonnement est échu.
        return NextResponse.json({
            success: false,
            message: access.status === 'expired' ? "Abonnement expiré" : "Paiement non encore confirmé",
            status: access.status,
            expiresAt: access.expiresAt,
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
