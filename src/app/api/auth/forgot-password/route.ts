import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: "L'email est requis." }, { status: 400 });
        }

        const user = await User.findOne({ email });

        if (!user) {
            // Pour des raisons de sécurité, on ne dit pas si l'email existe ou non de manière explicite 
            // C'est une bonne pratique de sécurité (Evite l'énumération de comptes)
            return NextResponse.json({ message: "Si cet email est enregistré, un code a été envoyé." }, { status: 200 });
        }

        // Générer un code OTP à 6 chiffres
        const otp = crypto.randomInt(100000, 999999).toString();

        // Hasher l'OTP avant de le stocker en base (sécurité)
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        // Mettre à jour l'utilisateur avec l'OTP et une date d'expiration (15 minutes)
        user.resetPasswordOtp = hashedOtp;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        // Envoyer l'email
        const emailContent = `
            <h2>Réinitialisation de votre mot de passe</h2>
            <p>Bonjour ${user.name},</p>
            <p>Vous avez demandé à réinitialiser votre mot de passe sur SmartLearn.</p>
            <p>Voici votre code de sécurité : <strong style="font-size: 24px; letter-spacing: 5px;">${otp}</strong></p>
            <p>Ce code est valable pendant 15 minutes.</p>
            <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
            <br/>
            <p>L'équipe SmartLearn</p>
        `;

        await sendEmail({
            to: email,
            subject: "SmartLearn - Code de réinitialisation de mot de passe",
            html: emailContent,
        });

        return NextResponse.json({ message: "Si cet email est enregistré, un code a été envoyé." }, { status: 200 });

    } catch (error: any) {
        console.error("Erreur Forgot Password:", error);
        return NextResponse.json({ message: "Une erreur interne s'est produite." }, { status: 500 });
    }
}
