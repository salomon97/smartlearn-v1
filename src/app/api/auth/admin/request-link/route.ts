import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import AdminToken from '@/models/AdminToken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { BASE_URL } from '@/lib/auth-env';
import { renderEmailLayout, renderPrimaryButton } from '@/lib/email-template';

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

        const bodyHtml = `
            <p style="color:#334155; line-height:1.6; font-size:15px; margin:0 0 12px 0;">
                Bonjour Administrateur,
            </p>
            <p style="color:#334155; line-height:1.6; font-size:15px; margin:0 0 16px 0;">
                Une demande de connexion au tableau de bord SmartLearn a été effectuée. Cliquez sur le bouton ci-dessous pour accéder à votre espace de manière sécurisée.
            </p>
            ${renderPrimaryButton('Accéder au tableau de bord', loginUrl)}
            <div style="background-color:#FEF2F2; border:1px solid #FECACA; border-radius:8px; padding:12px 16px; margin-top:8px;">
                <p style="color:#991B1B; font-size:13px; line-height:1.5; margin:0;">
                    ⚠️ Ce lien n'est valable que pendant <strong>15 minutes</strong> et s'autodétruira après utilisation.<br>
                    Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
                </p>
            </div>
        `;

        const htmlTemplate = renderEmailLayout({
            title: 'Connexion administrateur sécurisée',
            bodyHtml,
            accent: 'orange',
            minimalFooter: true,
        });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: `"SmartLearn" <${process.env.SMTP_USER}>`,
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
