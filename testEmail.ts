import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config({ path: '.env.local' });

const test = async () => {
    console.log("Testing SMTP connection with:", process.env.SMTP_USER);
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        await transporter.verify();
        console.log("Server is ready to take our messages");
        
        // Try sending to the same email
        const info = await transporter.sendMail({
            from: `"SmartLearn Test" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            subject: "Test Email from SmartLearn",
            text: "This is a test email.",
        });
        console.log("Message sent: %s", info.messageId);
    } catch (e) {
        console.error("Connection error:", e);
    }
}
test();
