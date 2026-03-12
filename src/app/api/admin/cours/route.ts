import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import Course from "@/models/Course";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Vérification stricte du rôle Administrateur
        if (!session || session.user?.role !== "admin") {
            return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
        }

        const body = await req.json();
        const { title, description, grade_level, imageUrl, isPublished } = body;

        // Validation basique
        if (!title || !description || !grade_level) {
            return NextResponse.json({ error: "Veuillez remplir les champs obligatoires." }, { status: 400 });
        }

        await connectToDatabase();

        // Création du cours (la coquille vide)
        const newCourse = await Course.create({
            title,
            description,
            grade_level,
            imageUrl: imageUrl || "",
            isPublished: isPublished || false,
        });

        return NextResponse.json(
            { message: "Cours créé avec succès", courseId: newCourse._id },
            { status: 201 }
        );

    } catch (error: any) {
        console.error("Erreur lors de la création du cours :", error);
        return NextResponse.json({ error: "Erreur serveur lors de la création" }, { status: 500 });
    }
}
