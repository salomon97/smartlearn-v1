import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendVerificationEmail = async (to: string, code: string) => {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #0F172A; padding: 20px; text-align: center;">
            <h1 style="color: #FBBF24; margin: 0; font-size: 24px;">SmartLearn</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #333333; margin-top: 0;">Vérification de votre compte</h2>
            <p style="color: #555555; text-height: 1.5; font-size: 16px;">
                Bonjour et bienvenue sur SmartLearn ! Pour finaliser la création de votre compte VIP, veuillez entrer le code de vérification suivant :
            </p>
            <div style="background-color: #F8FAFC; padding: 15px; border-radius: 8px; text-align: center; margin: 25px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0F172A;">${code}</span>
            </div>
            <p style="color: #555555; font-size: 14px;">
                Ce code est valide pendant <strong>15 minutes</strong>. Si vous n'avez pas demandé la création d'un compte sur SmartLearn, vous pouvez ignorer cet e-mail.
            </p>
        </div>
        <div style="background-color: #F1F5F9; padding: 15px; text-align: center; color: #64748B; font-size: 12px;">
            © ${new Date().getFullYear()} SmartLearn. Tous droits réservés.
        </div>
    </div>
    `;

    try {
        const info = await transporter.sendMail({
            from: `"SmartLearn" <${process.env.SMTP_USER}>`, // sender address
            to, // list of receivers
            subject: "Votre code de vérification SmartLearn", // Subject line
            html: htmlContent, // html body
        });

        console.log("Message sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
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
            from: `"SmartLearn" <${process.env.SMTP_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            html, // html body
        });

        console.log("Message sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error };
    }
};
