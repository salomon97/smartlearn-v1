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
            <div style="background-color: #0f172a; padding: 40px; font-family: sans-serif; color: #ffffff; border-radius: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #ffffff; margin: 0;">Smart<span style="color: #fbbf24;">Learn</span></h1>
                </div>
                <div style="background-color: #1e293b; padding: 30px; border-radius: 15px; border: 1px solid #334155;">
                    <h2 style="color: #ffffff; margin-top: 0;">Réinitialisation de mot de passe</h2>
                    <p style="color: #94a3b8; line-height: 1.6;">Bonjour ${user.name},</p>
                    <p style="color: #94a3b8; line-height: 1.6;">Vous avez demandé à réinitialiser votre mot de passe sur SmartLearn. Utilisez le code suivant pour valider l'opération :</p>
                    
                    <div style="background-color: #0f172a; padding: 20px; text-align: center; border-radius: 12px; margin: 30px 0; border: 1px dashed #fbbf24;">
                        <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #fbbf24;">${otp}</span>
                    </div>
                    
                    <p style="color: #94a3b8; font-size: 14px; text-align: center;">Ce code est valable pendant 15 minutes.</p>
                </div>
                <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 30px;">
                    © 2026 SmartLearn - L'Élite de l'Éducation au Cameroun
                </p>
            </div>
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
