import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ isValid: false }, { status: 401 });
        }

        await connectToDatabase();

        const userInDb = await User.findById(session.user.id);

        if (!userInDb) {
            return NextResponse.json({ isValid: false }, { status: 404 });
        }

        // Vérifier si le sessionId de la session actuelle correspond au sessionId en base
        if (userInDb.sessionId && session.user.sessionId !== userInDb.sessionId) {
            // La session ne correspond plus, l'utilisateur s'est connecté ailleurs
            return NextResponse.json({ isValid: false, reason: "session_mismatch" }, { status: 403 });
        }

        return NextResponse.json({ isValid: true }, { status: 200 });
    } catch (error) {
        console.error("Erreur de vérification de session:", error);
        return NextResponse.json({ isValid: false }, { status: 500 });
    }
}
