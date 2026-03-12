import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ message: "Non autorisé" }, { status: 403 });
        }

        const body = await req.json();
        const { name, grade, origin } = body;

        if (!name || !grade) {
            return NextResponse.json({ message: "Le nom et la classe sont obligatoires" }, { status: 400 });
        }

        await connectToDatabase();

        // 1. Générer un pseudo-email unique
        const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 chiffres
        const generatedEmail = `${cleanName}.${randomNum}@eleve.smartlearn-edu.org`;

        // 2. Générer un mot de passe simple (ex: smart + 4 chiffres)
        const generatedPassword = `smart${randomNum}`;
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        // 3. Créer l'utilisateur "Student VIP"
        const newStudent = await User.create({
            name,
            email: generatedEmail,
            password: hashedPassword,
            role: 'student',
            grade_level: grade,
            isPremium: true, // Inscription manuelle = Accès VIP par défaut
            isVerified: true, // Pas besoin de vérifier l'email puisqu'il est faux
            origin_contract: origin // Info optionnelle pour savoir d'où il vient (Note: On peut l'ajouter physiquement au modèle plus tard si voulu)
        });

        // 4. On renvoie les identifiants en clair à l'administrateur pour qu'il les transmette
        return NextResponse.json({ 
            message: "Élève créé avec succès.", 
            generatedEmail: generatedEmail,
            generatedPassword: generatedPassword,
            success: true 
        });

    } catch (error) {
        console.error("❌ Erreur lors de l'inscription manuelle :", error);
        return NextResponse.json({ message: "Erreur serveur lors de la création" }, { status: 500 });
    }
}
