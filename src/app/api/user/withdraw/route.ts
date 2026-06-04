import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import WithdrawalHistory from "@/models/WithdrawalHistory";
import { computeBalances } from "@/lib/balances";
import { sendEmail } from "@/lib/email";
import { renderEmailLayout } from "@/lib/email-template";

function isSyntheticEmail(email: string): boolean {
    return /@eleve\.smartlearn-edu\.org$/i.test(email);
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
        }

        const body = await req.json();
        const { amount, accountNumber } = body;

        if (!amount || amount < 2000) {
            return NextResponse.json({ error: "Le montant minimum est de 2000 FCFA" }, { status: 400 });
        }

        if (!accountNumber) {
            return NextResponse.json({ error: "Le numéro Mobile Money est requis" }, { status: 400 });
        }

        await connectToDatabase();
        const userId = session.user.id;

        const user = await User.findById(userId).select("name email");
        if (!user) {
            return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
        }

        // Disponible calculé (cleared − retraits pending/paid). Pas de mutation :
        // la WithdrawalHistory "pending" créée ci-dessous réduit déjà ce disponible.
        const { available } = await computeBalances(userId);
        if (available < amount) {
            return NextResponse.json({ error: "Solde insuffisant" }, { status: 400 });
        }

        // Créer la demande dans l'historique (status pending par défaut)
        const withdrawal = await WithdrawalHistory.create({
            affiliateId: userId,
            affiliateName: user.name,
            affiliateEmail: user.email,
            amount: amount,
            accountNumber: accountNumber,
            paymentMethod: "Mobile Money",
            status: "pending"
        });

        // Notification email à l'ambassadeur (best-effort, n'échoue pas la requête)
        if (!isSyntheticEmail(user.email)) {
            try {
                const bodyHtml = `
                    <p style="color:#334155; line-height:1.6; font-size:15px; margin:0 0 12px 0;">
                        Bonjour ${user.name},
                    </p>
                    <p style="color:#334155; line-height:1.6; font-size:15px; margin:0 0 16px 0;">
                        Votre demande de retrait a bien été enregistrée. Voici le récapitulatif :
                    </p>
                    <div style="background-color:#F0FDFA; border:1px solid #99F6E4; border-radius:12px; padding:16px 20px; margin:16px 0;">
                        <p style="margin:0 0 8px 0; color:#334155; font-size:14px;">
                            <strong>Montant :</strong> ${amount.toLocaleString('fr-FR')} FCFA
                        </p>
                        <p style="margin:0 0 8px 0; color:#334155; font-size:14px;">
                            <strong>Méthode :</strong> Mobile Money
                        </p>
                        <p style="margin:0; color:#334155; font-size:14px;">
                            <strong>Numéro :</strong> ${accountNumber}
                        </p>
                    </div>
                    <p style="color:#334155; line-height:1.6; font-size:14px; margin:16px 0 12px 0;">
                        Notre équipe traite votre demande sous <strong>48 heures ouvrables</strong>.
                        Vous recevrez un e-mail de confirmation dès que le versement aura été effectué.
                    </p>
                    <p style="color:#64748B; font-size:13px; line-height:1.6; margin:0;">
                        Pour toute question, contactez-nous à
                        <a href="mailto:salomonfoe97@smartlearn-edu.org" style="color:#0FB69C;">salomonfoe97@smartlearn-edu.org</a>.
                    </p>
                `;
                await sendEmail({
                    to: user.email,
                    subject: "Demande de retrait enregistrée — SmartLearn",
                    html: renderEmailLayout({
                        title: "Demande de retrait enregistrée",
                        bodyHtml,
                        accent: "teal",
                    }),
                });
            } catch (emailErr) {
                console.error("⚠️ [WITHDRAW] Échec envoi email confirmation (non bloquant):", emailErr);
            }
        }

        return NextResponse.json({
            success: true,
            message: "Votre demande de retrait a été enregistrée. Vous recevrez un e-mail de confirmation sous 48h ouvrables."
        });

    } catch (error) {
        console.error("Erreur retrait:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
