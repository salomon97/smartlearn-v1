import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ success: false, message: "Non authentifié" }, { status: 401 });
        }

        await connectToDatabase();
        const user = await User.findById((session.user as any).id).select("isPremium role");

        if (!user) {
            return NextResponse.json({ success: false, message: "Utilisateur non trouvé" }, { status: 404 });
        }

        // Si l'utilisateur est Premium ou Admin, on considère le paiement comme réussi/activé
        if (user.isPremium || user.role === 'admin') {
            return NextResponse.json({ success: true, message: "Accès VIP actif" });
        }

        return NextResponse.json({ success: false, message: "Paiement non encore confirmé" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
