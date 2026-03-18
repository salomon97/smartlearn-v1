import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import WithdrawalHistory from "@/models/WithdrawalHistory";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
        }

        await connectToDatabase();
        const withdrawals = await WithdrawalHistory.find({ 
            affiliateId: session.user.id 
        }).sort({ createdAt: -1 }).lean();

        return NextResponse.json(withdrawals);
    } catch (error) {
        console.error("Erreur user withdrawals GET:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
