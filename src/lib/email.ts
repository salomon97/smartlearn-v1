import nodemailer from 'nodemailer';
import { renderEmailLayout, renderOtpBlock } from './email-template';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendVerificationEmail = async (to: string, code: string) => {
    const bodyHtml = `
      <p style="color:#334155; line-height:1.6; font-size:15px; margin:0 0 12px 0;">
        Bonjour et bienvenue sur SmartLearn,
      </p>
      <p style="color:#334155; line-height:1.6; font-size:15px; margin:0 0 8px 0;">
        Pour finaliser la création de votre compte, saisissez le code de vérification ci-dessous dans la page d'inscription :
      </p>
      ${renderOtpBlock(code)}
      <p style="color:#64748B; font-size:13px; line-height:1.6; margin:0;">
        Ce code est valable <strong>15 minutes</strong>. Si vous n'avez pas demandé la création d'un compte SmartLearn, vous pouvez ignorer cet email en toute sécurité.
      </p>
    `;

    const htmlContent = renderEmailLayout({
        title: 'Vérification de votre compte',
        bodyHtml,
        accent: 'teal',
    });

    try {
        const info = await transporter.sendMail({
            from: `"SmartLearn" <${process.env.SMTP_USER}>`,
            to,
            subject: 'Votre code de vérification SmartLearn',
            html: htmlContent,
        });

        console.log('Message sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
};

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailOptions) => {
    try {
        const info = await transporter.sendMail({
            from: `"SmartLearn" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });

        console.log('Message sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
};
