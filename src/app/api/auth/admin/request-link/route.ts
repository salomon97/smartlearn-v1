import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import AdminToken from '@/models/AdminToken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { BASE_URL } from '@/lib/auth-env';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ message: "Email requis" }, { status: 400 });
        }

        await connectToDatabase();

        // 1. Vérifier que c'est bien l'admin
        // On cherche un utilisateur avec cet email ET le rôle 'admin'
        const adminUser = await User.findOne({ email: email.toLowerCase(), role: 'admin' });

        // IMPORTANT : Pour des raisons de sécurité, on renvoie TOUJOURS le même message de succès
        // même si l'email n'est pas admin, pour éviter que des pirates "testent" des adresses emails.
        const successMessage = "Si cette adresse correspond au compte administrateur, un lien de connexion a été envoyé.";

        if (!adminUser) {
            return NextResponse.json({ message: successMessage, success: true });
        }

        // 2. C'est bien l'admin : on génère un jeton sécurisé
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = await bcrypt.hash(rawToken, 10);

        // Durée de vie = 15 minutes
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // 3. Enregistrer le token haché en BDD (après avoir supprimé les anciens pour éviter les conflits)
        await AdminToken.deleteMany({ email: adminUser.email });
        await AdminToken.create({
            email: adminUser.email,
            token: hashedToken,
            expiresAt
        });

        // 4. Envoyer l'email avec le jeton en clair
        // Le lien pointera vers la page de vérification qui s'occupera d'appeler NextAuth
        const loginUrl = `${BASE_URL}/api/auth/admin/verify?token=${rawToken}&email=${encodeURIComponent(adminUser.email)}`;

        const htmlTemplate = `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #ff6e14; padding: 24px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">SmartLearn Admin</h1>
            </div>
            
            <div style="padding: 32px; background-color: white;">
                <h2 style="color: #111827; margin-top: 0;">Connexion Sécurisée</h2>
                <p style="color: #4b5563; line-height: 1.6;">
                    Bonjour Administrateur,<br><br>
                    Une demande de connexion au tableau de bord a été effectuée. Cliquez sur le bouton ci-dessous pour accéder à votre espace de manière sécurisée.
                </p>
                
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${loginUrl}" style="background-color: #ff6e14; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                        Accéder au Tableau de Bord
                    </a>
                </div>
                
                <p style="color: #ef4444; font-size: 14px;">
                    ⚠️ Ce lien n'est valable que pendant <b>15 minutes</b> et s'autodétruira après utilisation.<br>
                    Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.
                </p>
            </div>
        </div>
        `;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: `"SmartLearn VIP" <${process.env.SMTP_USER}>`,
            to: adminUser.email,
            subject: "Accès Sécurisé Administrateur",
            html: htmlTemplate,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: successMessage, success: true });

    } catch (error) {
        console.error("❌ Erreur lors de la demande de magic link:", error);
        return NextResponse.json({ message: "Erreur interne" }, { status: 500 });
    }
}
