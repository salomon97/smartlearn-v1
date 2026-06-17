"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

/**
 * Bannière conditionnelle affichée en haut du dashboard et du catalogue
 * pour pousser à la conversion freemium.
 *
 * Trois états mutuellement exclusifs :
 *   - TRIAL  : essai Premium actif (isOnTrial=true, isPremium=true)
 *   - FREE   : compte non-Premium hors essai (isPremium=false)
 *   - aucun  : Premium payé OU admin → bannière masquée
 *
 * La bannière est gated par NEXT_PUBLIC_FREEMIUM_ENABLED. Si =false, rien ne s'affiche
 * (le freemium n'est pas encore activé en prod).
 */
export default function FreemiumBanner() {
    const { data: session } = useSession();
    const [dismissed, setDismissed] = useState(false);

    if (process.env.NEXT_PUBLIC_FREEMIUM_ENABLED !== 'true') return null;
    if (!session?.user) return null;

    const user = session.user as any;

    // Admin → jamais de bannière
    if (user.role === 'admin') return null;

    // Premium payé (pas trial) → jamais de bannière
    if (user.isPremium && !user.isOnTrial) return null;

    // TRIAL ACTIF
    if (user.isOnTrial) {
        if (dismissed) return null;
        const days = user.premiumDaysRemaining ?? 0;
        return (
            <div className="bg-teal/10 border-b border-teal/30 px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-sm">
                    <span className="text-teal">✨</span>
                    <span className="text-white/90">
                        <strong className="text-teal">Essai Premium gratuit · J-{days} restants</strong>
                        {" — "}Profite de tous les chapitres et annales.
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/paiement"
                        className="bg-orange hover:bg-orange/90 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors whitespace-nowrap"
                    >
                        Conserver mon accès — 3 000 FCFA/mois →
                    </Link>
                    <button
                        type="button"
                        onClick={() => setDismissed(true)}
                        aria-label="Masquer la bannière"
                        className="text-white/50 hover:text-white/80 transition-colors w-7 h-7 flex items-center justify-center"
                    >
                        ✕
                    </button>
                </div>
            </div>
        );
    }

    // FREE (post-trial ou jamais payé)
    return (
        <div className="bg-orange/10 border-b border-orange/30 px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm">
                <span className="text-orange">🔒</span>
                <span className="text-white/90">
                    Tu as accès au <strong className="text-white">chapitre 1 de chaque matière</strong>.
                    Continue avec l&apos;intégralité de ton programme MINESEC + toutes les annales corrigées.
                </span>
            </div>
            <Link
                href="/paiement"
                className="bg-orange hover:bg-orange/90 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors whitespace-nowrap"
            >
                Voir les tarifs →
            </Link>
        </div>
    );
}
