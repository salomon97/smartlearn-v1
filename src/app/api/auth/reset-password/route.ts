import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const { email, otp, newPassword } = await req.json();

        if (!email || !otp || !newPassword) {
            return NextResponse.json({ message: "Veuillez fournir toutes les informations." }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ message: "Le mot de passe doit contenir au moins 6 caractères" }, { status: 400 });
        }

        const user = await User.findOne({
            email,
            resetPasswordExpires: { $gt: Date.now() } // Doit être non expiré
        });

        if (!user || !user.resetPasswordOtp) {
            return NextResponse.json({ message: "Code OTP invalide ou expiré." }, { status: 400 });
        }

        // Vérifier l'OTP
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        if (user.resetPasswordOtp !== hashedOtp) {
            return NextResponse.json({ message: "Code OTP incorrect." }, { status: 400 });
        }

        // OTP valide, on hache le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // On met à jour l'utilisateur et on efface les champs OTP
        user.password = hashedPassword;
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return NextResponse.json({ message: "Mot de passe réinitialisé avec succès." }, { status: 200 });

    } catch (error: any) {
        console.error("Erreur Reset Password:", error);
        return NextResponse.json({ message: "Une erreur interne s'est produite." }, { status: 500 });
    }
}
