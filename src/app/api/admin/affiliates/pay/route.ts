import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import WithdrawalHistory from '@/models/WithdrawalHistory';
import { computeBalances } from '@/lib/balances';
import { sendEmail } from '@/lib/email';
import { renderEmailLayout } from '@/lib/email-template';

function isSyntheticEmail(email: string): boolean {
    return /@eleve\.smartlearn-edu\.org$/i.test(email);
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ message: "Non autorisé" }, { status: 403 });
        }

        const body = await req.json();
        const { affiliateId } = body;

        if (!affiliateId) {
            return NextResponse.json({ message: "ID de l'affilié requis" }, { status: 400 });
        }

        await connectToDatabase();

        const affiliate = await User.findOne({ _id: affiliateId, role: 'affiliate' });

        if (!affiliate) {
            return NextResponse.json({ message: "Affilié introuvable" }, { status: 404 });
        }

        // Disponible calculé (cleared − retraits pending/paid).
        const { available } = await computeBalances(affiliate._id.toString());

        // Cohérent avec le seuil utilisateur (frontend + /api/user/withdraw).
        const SEUIL_RETRAIT = 2000;
        if (available < SEUIL_RETRAIT) {
            return NextResponse.json({ message: `Le solde disponible est insuffisant (< ${SEUIL_RETRAIT} FCFA).` }, { status: 400 });
        }

        // "Payer" = tracer une WithdrawalHistory 'paid' du disponible. Plus de champ à
        // réinitialiser : le disponible calculé retombe à 0 grâce à cette écriture.
        // (accountNumber est requis par le schéma : versement direct admin, pas de numéro saisi.)
        await WithdrawalHistory.create({
            affiliateId: affiliate._id,
            affiliateName: affiliate.name,
            affiliateEmail: affiliate.email,
            amount: available,
            accountNumber: "Versement direct (admin)",
            paymentMethod: "Mobile Money",
            status: "paid"
        });

        // Notification email à l'ambassadeur (best-effort, n'échoue pas la requête).
        if (!isSyntheticEmail(affiliate.email)) {
            try {
                const bodyHtml = `
                    <p style="color:#334155; line-height:1.6; font-size:15px; margin:0 0 12px 0;">
                        Bonjour ${affiliate.name},
                    </p>
                    <p style="color:#334155; line-height:1.6; font-size:15px; margin:0 0 16px 0;">
                        Bonne nouvelle ! Votre versement Ambassadeur a été effectué.
                    </p>
                    <div style="background-color:#F0FDFA; border:1px solid #99F6E4; border-radius:12px; padding:16px 20px; margin:16px 0;">
                        <p style="margin:0 0 8px 0; color:#334155; font-size:14px;">
                            <strong>Montant versé :</strong> ${available.toLocaleString('fr-FR')} FCFA
                        </p>
                        <p style="margin:0; color:#334155; font-size:14px;">
                            <strong>Méthode :</strong> Mobile Money
                        </p>
                    </div>
                    <p style="color:#334155; line-height:1.6; font-size:14px; margin:16px 0 12px 0;">
                        Le transfert est en cours d'acheminement par notre opérateur. Si vous ne
                        recevez rien sous 24h ouvrables, contactez-nous.
                    </p>
                    <p style="color:#64748B; font-size:13px; line-height:1.6; margin:0;">
                        Merci pour votre confiance et votre rôle dans la croissance de SmartLearn.
                    </p>
                `;
                await sendEmail({
                    to: affiliate.email,
                    subject: `Versement de ${available.toLocaleString('fr-FR')} FCFA effectué — SmartLearn`,
                    html: renderEmailLayout({
                        title: 'Votre versement Ambassadeur',
                        bodyHtml,
                        accent: 'teal',
                    }),
                });
            } catch (emailErr) {
                console.error("⚠️ [ADMIN PAY] Échec envoi email confirmation (non bloquant):", emailErr);
            }
        }

        return NextResponse.json({
            message: `Paiement de ${available} FCFA enregistré avec succès. Email de confirmation envoyé.`,
            success: true
        });

    } catch (error) {
        console.error("❌ Erreur lors du marquage du paiement:", error);
        return NextResponse.json({ message: "Erreur interne" }, { status: 500 });
    }
}
