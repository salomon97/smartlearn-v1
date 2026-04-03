import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import VerificationCode from "@/models/VerificationCode";
import bcrypt from "bcryptjs";
import { validate } from "email-validator-node";
import { sendVerificationEmail } from "@/lib/email";

// Fonction pour générer un code à 6 chiffres
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password, grade_level, role, parrainId } = body;

        // Validation stricte
        if (!name || !email || !password) {
            return NextResponse.json({ error: "Nom, email et mot de passe sont obligatoires." }, { status: 400 });
        }

        const finalRole = role === 'affiliate' ? 'affiliate' : 'student';

        if (finalRole === 'student' && !grade_level) {
            return NextResponse.json({ error: "La classe est obligatoire pour un élève." }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères." }, { status: 400 });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "Le format de l'e-mail est invalide." }, { status: 400 });
        }

        // Vérification de l'existence du domaine (MX Records) et anti jetable
        // DÉSACTIVÉ TEMPORAIREMENT POUR LE DÉBOGAGE
        // const emailValidation = await validate(email);
        // if (!emailValidation.isValid) {
        //    return NextResponse.json({ error: "L'adresse e-mail ou son domaine semble invalide ou jetable." }, { status: 400 });
        // }

        await connectToDatabase();

        // Vérifier si l'utilisateur existe déjà
        const userExists = await User.findOne({ email });
        if (userExists) {
            if (!userExists.isVerified) {
                // L'utilisateur existe mais n'a jamais été vérifié (compte fantôme ou e-mail non reçu)
                // On supprime l'ancien compte non vérifié et ses anciens codes pour lui permettre de recommencer
                await User.deleteOne({ email });
                await VerificationCode.deleteMany({ userId: userExists._id });
            } else {
                return NextResponse.json({ error: "Cet e-mail est déjà utilisé." }, { status: 400 });
            }
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 12);

        // Si c'est un affilié, lui générer un code unique (ex: SALOMON1234)
        let newCodeAffiliation = undefined;
        if (finalRole === 'affiliate') {
            const prefix = name.replace(/\s+/g, '').substring(0, 4).toUpperCase();
            const randomNums = Math.floor(1000 + Math.random() * 9000);
            newCodeAffiliation = `${prefix}${randomNums}`;
        }

        // Capturer l'IP (pour l'anti-fraude)
        const forwarded = request.headers.get("x-forwarded-for");
        const ip = forwarded ? forwarded.split(',')[0] : "127.0.0.1";

        // Créer l'utilisateur (non vérifié par défaut)
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: finalRole,
            grade_level: finalRole === 'student' ? grade_level : undefined,
            isPremium: false,
            isVerified: false,
            codeAffiliation: newCodeAffiliation,
            parrainId: parrainId || undefined,
            registrationIp: ip
        });

        // Générer et enregistrer le code
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Valide 15 minutes

        await VerificationCode.create({
            userId: user._id,
            code: otpCode,
            expiresAt
        });

        // Envoyer l'email
        const emailResult = await sendVerificationEmail(email, otpCode);
        if (!emailResult.success) {
            console.error("Erreur e-mail :", emailResult.error);
            // Si l'e-mail échoue, on annule la création du compte pour éviter les comptes fantômes
            await User.findByIdAndDelete(user._id);
            await VerificationCode.deleteMany({ userId: user._id });
            return NextResponse.json({ error: "Impossible d'envoyer l'e-mail de vérification. Veuillez vérifier que l'adresse est correcte et réessayer." }, { status: 500 });
        }

        return NextResponse.json({
            message: "Compte créé, veuillez vérifier votre e-mail",
            userId: user._id,
            requiresVerification: true
        }, { status: 201 });

    } catch (error: any) {
        console.error("Erreur lors de l'inscription:", error);
        return NextResponse.json({ error: "Une erreur est survenue lors de l'inscription." }, { status: 500 });
    }
}
