import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { SYNTHETIC_EMAIL_DOMAIN } from '@/lib/constants';

// Inscription manuelle d'un élève par l'administrateur (workflow terrain).
// — email OPTIONNEL : si l'admin l'a, on l'utilise (l'élève recevra les emails de relance).
//   Sinon on génère une adresse synthétique pour permettre le login, et le moteur de rétention
//   sait sauter ces adresses (cf. SYNTHETIC_EMAIL_DOMAIN).
// — phone REQUIS : canal universel au Cameroun, base du futur SMS.
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ message: "Non autorisé" }, { status: 403 });
        }

        const body = await req.json();
        const { name, grade, school, email: providedEmail, phone } = body as {
            name?: string; grade?: string; school?: string; email?: string; phone?: string;
        };

        if (!name || !grade) {
            return NextResponse.json({ message: "Le nom et la classe sont obligatoires" }, { status: 400 });
        }
        if (!phone) {
            return NextResponse.json({ message: "Le numéro de téléphone est obligatoire" }, { status: 400 });
        }

        // Validation téléphone : format permissif (chiffres, espaces, +, tirets). 8 à 15 chiffres.
        const phoneNormalized = phone.replace(/[\s-]/g, '');
        if (!/^[+]?[0-9]{8,15}$/.test(phoneNormalized)) {
            return NextResponse.json({ message: "Numéro de téléphone invalide" }, { status: 400 });
        }

        await connectToDatabase();

        // Email : réel si fourni et valide, sinon synthétique.
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const realEmail = providedEmail && emailRegex.test(providedEmail.trim())
            ? providedEmail.trim().toLowerCase()
            : null;

        // Si email réel fourni, refuser le doublon (l'élève existe peut-être déjà côté public).
        if (realEmail) {
            const exists = await User.findOne({ email: realEmail });
            if (exists) {
                return NextResponse.json({ message: "Un compte existe déjà avec cet email." }, { status: 400 });
            }
        }

        const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const finalEmail = realEmail ?? `${cleanName}.${randomNum}@${SYNTHETIC_EMAIL_DOMAIN}`;
        const isSyntheticEmail = !realEmail;

        // Mot de passe par défaut transmissible.
        const generatedPassword = `smart${randomNum}`;
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        await User.create({
            name,
            email: finalEmail,
            password: hashedPassword,
            role: 'student',
            grade_level: grade,
            isPremium: true,
            isVerified: true,
            school,
            phone: phoneNormalized,
        });

        return NextResponse.json({
            message: "Élève créé avec succès.",
            generatedEmail: finalEmail,
            generatedPassword,
            isSyntheticEmail,
            success: true,
        });

    } catch (error) {
        console.error("❌ Erreur lors de l'inscription manuelle :", error);
        return NextResponse.json({ message: "Erreur serveur lors de la création" }, { status: 500 });
    }
}
