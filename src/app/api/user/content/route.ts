export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from '@/lib/mongoose';
import ContentMapping from '@/models/ContentMapping';
import User from '@/models/User';
import { computePremiumStatus } from '@/lib/premium-core';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
        }

        await connectToDatabase();

        // 1. Récupérer l'utilisateur pour avoir sa classe (grade_level)
        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 404 });
        }

        // Sécurité : seuls les Premium actifs (ou admins) voient le contenu dynamique.
        // computePremiumStatus respecte l'expiration : un abonné échu ne passe plus ici.
        const access = computePremiumStatus(user);
        if (!access.isPremium && user.role !== 'admin') {
            return NextResponse.json({
                message: access.status === 'expired'
                    ? "Votre abonnement a expiré — renouvelez pour reprendre l'accès."
                    : "Accès réservé aux membres Premium",
                isPremium: false,
                status: access.status,
            }, { status: 403 });
        }

        if (!user.grade_level) {
            return NextResponse.json({ message: "Classe non définie pour cet utilisateur" }, { status: 400 });
        }

        // 2. Récupérer tous les mappings pour cette classe
        const contentMappings = await ContentMapping.find({
            grade_level: { $in: [user.grade_level, 'TOUTES'] }
        }).sort({ subject: 1, contentType: 1 });

        return NextResponse.json({
            grade_level: user.grade_level,
            mappings: contentMappings
        });

    } catch (error) {
        console.error("❌ [API CONTENT] Erreur :", error);
        return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
}
