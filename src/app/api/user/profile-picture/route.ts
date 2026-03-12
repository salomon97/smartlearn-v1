import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import fs from "fs";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
        }

        // Vérification du type (seulement les images)
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ error: "Le fichier doit être une image." }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Sécuriser le nom du fichier
        const filename = `${session.user.id}-${Date.now()}${path.extname(file.name)}`;

        // Chemin de sauvegarde
        const publicDir = path.join(process.cwd(), "public");
        const uploadDir = path.join(publicDir, "uploads", "profiles");

        // Créer le dossier s'il n'existe pas
        if (!fs.existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, filename);

        // Sauvegarde physique du fichier
        await writeFile(filePath, buffer);

        const fileUrl = `/uploads/profiles/${filename}`;

        await connectToDatabase();

        // Mettre à jour l'utilisateur en BDD
        const user = await User.findByIdAndUpdate(
            session.user.id,
            { image: fileUrl },
            { new: true }
        );

        return NextResponse.json({
            message: "Image mise à jour",
            imageUrl: fileUrl
        });

    } catch (error) {
        console.error("Erreur d'upload :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
