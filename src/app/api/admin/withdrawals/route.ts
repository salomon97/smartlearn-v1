import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import WithdrawalHistory from "@/models/WithdrawalHistory";
import User from "@/models/User";

// GET /api/admin/withdrawals : Liste toutes les demandes (filtre possible sur le statut)
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "admin") {
            return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
        }

        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        const query = status ? { status } : {};
        const withdrawals = await WithdrawalHistory.find(query).sort({ createdAt: -1 }).lean();

        return NextResponse.json(withdrawals);
    } catch (error) {
        console.error("Erreur admin withdrawals GET:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// PATCH /api/admin/withdrawals : Approuver ou rejeter une demande
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "admin") {
            return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
        }

        const body = await req.json();
        const { withdrawalId, status } = body; // status can be 'paid' or 'failed'

        if (!withdrawalId || !["paid", "failed"].includes(status)) {
            return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
        }

        await connectToDatabase();
        const withdrawal = await WithdrawalHistory.findById(withdrawalId);

        if (!withdrawal) {
            return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
        }

        if (withdrawal.status !== "pending") {
            return NextResponse.json({ error: "Cette demande a déjà été traitée" }, { status: 400 });
        }

        if (status === "paid") {
            withdrawal.status = "paid";
            await withdrawal.save();
        } else if (status === "failed") {
            // Si rejeté, on rend l'argent à l'affilié
            withdrawal.status = "failed";
            await withdrawal.save();

            const user = await User.findById(withdrawal.affiliateId);
            if (user) {
                user.balance_available = (user.balance_available || 0) + withdrawal.amount;
                await user.save();
            }
        }

        return NextResponse.json({ success: true, message: `Demande marquée comme ${status === 'paid' ? 'payée' : 'rejetée'}.` });
    } catch (error) {
        console.error("Erreur admin withdrawals PATCH:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
