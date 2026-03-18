import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// PATCH : Mettre à jour un affilié (commission_rate, etc.)
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await req.json();
        const { commission_rate, name, codeAffiliation } = body;

        await connectToDatabase();
        
        const updatedUser = await User.findByIdAndUpdate(
            params.id,
            { 
                ...(commission_rate !== undefined && { commission_rate: Number(commission_rate) }),
                ...(name !== undefined && { name }),
                ...(codeAffiliation !== undefined && { codeAffiliation })
            },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ error: "Affilié non trouvé" }, { status: 404 });
        }

        return NextResponse.json({ message: "Affilié mis à jour avec succès", user: updatedUser });
    } catch (error) {
        console.error("Erreur PATCH affilié:", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}

// DELETE : Supprimer un affilié
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        await connectToDatabase();
        
        const deletedUser = await User.findByIdAndDelete(params.id);

        if (!deletedUser) {
            return NextResponse.json({ error: "Affilié non trouvé" }, { status: 404 });
        }

        return NextResponse.json({ message: "Compte affilié supprimé" });
    } catch (error) {
        console.error("Erreur DELETE affilié:", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}
