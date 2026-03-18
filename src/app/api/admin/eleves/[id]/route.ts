import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// PATCH : Mettre à jour un élève (statut VIP ou Classe)
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
        const { isPremium, grade_level, name } = body;

        await connectToDatabase();
        
        const updatedUser = await User.findByIdAndUpdate(
            params.id,
            { 
                ...(isPremium !== undefined && { isPremium }),
                ...(grade_level !== undefined && { grade_level }),
                ...(name !== undefined && { name })
            },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ error: "Élève non trouvé" }, { status: 404 });
        }

        return NextResponse.json({ message: "Élève mis à jour avec succès", user: updatedUser });
    } catch (error) {
        console.error("Erreur PATCH élève:", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}

// DELETE : Supprimer un élève
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
            return NextResponse.json({ error: "Élève non trouvé" }, { status: 404 });
        }

        return NextResponse.json({ message: "Élève supprimé définitivement" });
    } catch (error) {
        console.error("Erreur DELETE élève:", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}
