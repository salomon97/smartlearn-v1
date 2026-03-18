import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ valid: false, error: "Non authentifié" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const currentId = (session.user as any).sessionId;

        if (!currentId) {
            return NextResponse.json({ valid: true }); // On laisse passer si pas de session ID (ancien compte)
        }

        await connectToDatabase();
        const user = await User.findById((session.user as any).id).select("sessionId");

        if (!user || user.sessionId !== currentId) {
            return NextResponse.json({ 
                valid: false, 
                reason: "session_mismatch",
                message: "Session ouverte sur un autre appareil" 
            }, { status: 403 });
        }

        return NextResponse.json({ valid: true });
    } catch (error: any) {
        return NextResponse.json({ valid: false, error: error.message }, { status: 500 });
    }
}
