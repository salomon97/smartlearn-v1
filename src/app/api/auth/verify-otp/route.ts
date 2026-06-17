import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import VerificationCode from "@/models/VerificationCode";
import { grantTrialIfEligible, logFreemiumEvent } from "@/lib/freemium";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, code } = body;

        if (!email || !code) {
            return NextResponse.json({ error: "L'e-mail et le code sont obligatoires." }, { status: 400 });
        }

        await connectToDatabase();

        // Trouver l'utilisateur
        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({ error: "Aucun compte trouvé avec cet e-mail." }, { status: 404 });
        }

        if (user.isVerified) {
            return NextResponse.json({ message: "Ce compte est déjà vérifié." }, { status: 200 });
        }

        // Trouver le code de vérification
        const verificationRecord = await VerificationCode.findOne({
            userId: user._id,
            code: code
        });

        if (!verificationRecord) {
            return NextResponse.json({ error: "Code invalide ou expiré." }, { status: 400 });
        }

        // Vérifier si expiré (au cas où le TTL MongoDB n'a pas encore nettoyé)
        if (new Date() > verificationRecord.expiresAt) {
            await VerificationCode.deleteOne({ _id: verificationRecord._id });
            return NextResponse.json({ error: "Ce code a expiré. Veuillez en demander un nouveau." }, { status: 400 });
        }

        // Succès : marquer l'utilisateur comme vérifié
        user.isVerified = true;

        // Octroyer l'essai Premium 7 jours maintenant que l'user peut se connecter.
        // (Si on l'avait fait au /register, le compteur tournait pendant que l'user
        // attendait son email de vérification — promesse 7j non tenue.)
        const trialGranted = grantTrialIfEligible(user);

        await user.save();

        if (trialGranted) {
          await logFreemiumEvent(user._id.toString(), 'trial_granted', { source: 'register' });
        }

        // Supprimer le code utilisé
        await VerificationCode.deleteOne({ _id: verificationRecord._id });

        return NextResponse.json({ message: "Compte vérifié avec succès." }, { status: 200 });

    } catch (error: any) {
        console.error("Erreur lors de la vérification:", error);
        return NextResponse.json({ error: "Une erreur est survenue lors de la vérification." }, { status: 500 });
    }
}
