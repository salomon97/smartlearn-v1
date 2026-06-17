"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

type PaywallReason = 'premium-required-content' | 'premium-required-annale';

interface PaywallModalProps {
    open: boolean;
    onClose: () => void;
    reason?: PaywallReason | null;
    /** Nom du chapitre / annale verrouillé (pour le message) */
    itemName?: string;
}

/**
 * Modal affiché au clic sur un item verrouillé (chapitre Premium ou annale).
 * Le message s'adapte au reason — annale ou contenu standard.
 *
 * Ne s'affiche que si open=true. Pas de friction sur "Plus tard" (close sans pression).
 */
export default function PaywallModal({ open, onClose, reason, itemName }: PaywallModalProps) {
    const { data: session } = useSession();
    const userId = (session?.user as any)?.id;

    useEffect(() => {
        if (open && userId) {
            fetch('/api/user/freemium/event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event: 'paywall_shown', metadata: { itemName, reason } }),
            }).catch(() => {});
        }
    }, [open, userId, itemName, reason]);

    if (!open) return null;

    const isAnnale = reason === 'premium-required-annale';

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="paywall-title"
        >
            {/* Backdrop */}
            <button
                type="button"
                aria-label="Fermer"
                onClick={onClose}
                className="absolute inset-0 bg-navy-deep/80 backdrop-blur-sm"
            />

            {/* Panel */}
            <div className="relative bg-navy border border-white/10 rounded-3xl max-w-md w-full p-8 shadow-2xl">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-orange/15 border border-orange/30 flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🔒</span>
                    </div>
                    <h2 id="paywall-title" className="font-heading text-2xl font-bold text-white mb-2">
                        {isAnnale ? 'Annale Premium' : 'Chapitre Premium'}
                    </h2>
                    {itemName && (
                        <p className="text-sm text-white/60">{itemName}</p>
                    )}
                </div>

                <p className="text-white/80 text-sm leading-relaxed mb-6">
                    {isAnnale
                        ? "Les annales corrigées MINESEC (BEPC, Probatoire, Bac) sont exclusivement réservées aux membres Premium."
                        : "Tu as déjà découvert SmartLearn avec le chapitre 1 gratuit. Le reste de ton programme officiel MINESEC est derrière Premium."}
                </p>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
                    <p className="text-xs font-semibold uppercase tracking-widest text-teal mb-3">
                        Avec Premium, tu débloques :
                    </p>
                    <ul className="space-y-2 text-sm text-white/90">
                        <li className="flex items-start gap-2">
                            <span className="text-teal mt-0.5">✓</span>
                            <span>Tous les chapitres en Mathématiques et Informatique</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-teal mt-0.5">✓</span>
                            <span>Toutes les annales corrigées MINESEC (BEPC, Probatoire, Bac)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-teal mt-0.5">✓</span>
                            <span>Accès illimité — vidéos HD, PDFs, exercices avec corrigés</span>
                        </li>
                    </ul>
                    <p className="text-xs text-white/50 mt-4">
                        À partir de <strong className="text-white">3 000 FCFA / mois</strong>
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <Link
                        href="/paiement"
                        onClick={() => {
                            if (userId) {
                                fetch('/api/user/freemium/event', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ event: 'paywall_clicked_cta', metadata: { itemName, reason } }),
                                }).catch(() => {});
                            }
                        }}
                        className="w-full text-center bg-orange hover:bg-orange/90 text-white font-semibold py-3 rounded-full transition-colors"
                    >
                        Voir les formules →
                    </Link>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full text-center text-white/60 hover:text-white/90 font-semibold py-2 transition-colors"
                    >
                        Plus tard
                    </button>
                </div>
            </div>
        </div>
    );
}
