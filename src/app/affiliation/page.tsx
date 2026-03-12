"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function AffiliationPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [copied, setCopied] = useState(false);
    const [referralLink, setReferralLink] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/connexion");
        } else if (session?.user?.id) {
            // Construction du lien d'affiliation basé sur l'ID de l'utilisateur
            // Redirige vers la page d'inscription avec le paramètre ref
            setReferralLink(`${window.location.origin}/auth/inscription?ref=${session.user.id}`);
        }
    }, [status, session, router]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (status === "loading") {
        return <div className="min-h-screen bg-[var(--background)] flex items-center justify-center text-[var(--primary-gold)] font-bold text-xl">Chargement...</div>;
    }

    const isPremium = session?.user?.isPremium;

    // Données factices pour l'interface de l'MVP (à connecter à l'API plus tard)
    const stats = {
        clics: 42,
        inscrits: 8,
        ventes: 3,
        gains: 1500 // 500 FCFA par vente par exemple
    };

    return (
        <div className="min-h-screen bg-[var(--background)] flex">
            {/* Sidebar Latérale (Réutilisée du Dashboard) */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 min-h-screen sticky top-0 fixed py-6 px-4">
                <Link href="/" className="flex items-center gap-2 mb-10 px-2">
                    <Image src="/logo.jpg" alt="Logo" width={32} height={32} className="rounded-full" />
                    <span className="text-xl font-bold text-[var(--primary-dark)]">
                        Smart<span className="text-[var(--primary-gold)]">Learn</span>
                    </span>
                </Link>
                <nav className="flex flex-col gap-2 flex-grow">
                    <Link href="/dashboard" className="px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium flex items-center gap-3 transition-colors">
                        <span className="text-lg">📊</span> Vue d'ensemble
                    </Link>
                    <Link href="/dashboard/cours" className="px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium flex items-center gap-3 transition-colors">
                        <span className="text-lg">📚</span> Mes Formations
                    </Link>
                    <Link href="/dashboard/profil" className="px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium flex items-center gap-3 transition-colors">
                        <span className="text-lg">👤</span> Profil
                    </Link>
                    <Link href="/affiliation" className="px-4 py-3 bg-[var(--primary-dark)]/5 text-[var(--primary-dark)] rounded-xl font-bold flex items-center gap-3">
                        <span className="text-lg">💸</span> Gagner de l'argent
                    </Link>
                </nav>
                {isPremium && (
                    <div className="mt-auto bg-gradient-to-r from-[var(--primary-gold)] to-yellow-500 p-4 rounded-xl text-[var(--primary-dark)] text-sm shadow-md font-bold text-center">
                        Membre VIP Activé ✨
                    </div>
                )}
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto h-screen relative">
                <header className="bg-white border-b border-gray-100 py-4 px-6 flex items-center justify-between sticky top-0 z-10">
                    <h1 className="text-xl font-bold text-gray-900">Programme Ambassadeur</h1>
                    {!isPremium && (
                        <Link href="/paiement" className="px-5 py-2 bg-[var(--primary-gold)] text-[var(--primary-dark)] rounded-full font-bold text-sm shadow-md hover:bg-[var(--primary-gold-hover)] transition-colors">
                            Devenir VIP
                        </Link>
                    )}
                </header>

                <div className="p-6 md:p-10 max-w-5xl mx-auto">
                    {/* Hero Section Affiliation */}
                    <div className="bg-[var(--primary-dark)] text-white rounded-3xl p-8 mb-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-[var(--primary-gold)]/20">
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--primary-gold)] rounded-full blur-3xl opacity-20"></div>
                        <div className="relative z-10 max-w-xl">
                            <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[var(--primary-gold)] text-sm font-bold mb-4 border border-[var(--primary-gold)]/30 backdrop-blur-sm">Nouveau ! Partagez & Gagnez</span>
                            <h2 className="text-3xl font-extrabold mb-4">Parrainez vos amis et encaissez de l'argent.</h2>
                            <p className="text-gray-300 text-lg">Pour chaque ami qui crée son compte VIP grâce à votre lien, vous gagnez <strong className="text-[var(--primary-gold)]">500 FCFA</strong>. Recevez vos gains directement sur votre Mobile Money !</p>
                        </div>
                        <div className="relative z-10 w-full md:w-auto">
                            <Image src="/logo.jpg" alt="Affiliation" width={150} height={150} className="rounded-full shadow-2xl shadow-black/50 border-4 border-[var(--primary-gold)]/50 mx-auto" />
                        </div>
                    </div>

                    {/* Lien de Parrainage */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-[var(--primary-gold)]/30 mb-8 border-l-4 border-l-[var(--primary-gold)]">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Votre lien exclusif</h3>
                        <p className="text-gray-500 text-sm mb-4">Copiez ce lien et partagez-le sur WhatsApp, Facebook ou TikTok.</p>

                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <input
                                type="text"
                                readOnly
                                value={referralLink}
                                className="flex-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 font-mono text-sm outline-none focus:border-[var(--primary-gold)] transition-colors"
                            />
                            <button
                                onClick={copyToClipboard}
                                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white shadow-md transition-all ${copied ? 'bg-green-500 hover:bg-green-600' : 'bg-[var(--primary-dark)] hover:bg-[var(--primary-dark)]/90'}`}
                            >
                                {copied ? 'Copié ! ✅' : 'Copier le lien'}
                            </button>
                        </div>
                    </div>

                    {/* Statistiques (Mock) */}
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Vos Performances</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                            <span className="text-3xl mb-2">🖱️</span>
                            <span className="text-2xl font-black text-gray-900">{stats.clics}</span>
                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Clics uniques</span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                            <span className="text-3xl mb-2">🧑‍🎓</span>
                            <span className="text-2xl font-black text-gray-900">{stats.inscrits}</span>
                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Inscrits gratuits</span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                            <span className="text-3xl mb-2">🌟</span>
                            <span className="text-2xl font-black text-gray-900">{stats.ventes}</span>
                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Nouveaux VIP</span>
                        </div>
                        <div className="bg-gradient-to-br from-[var(--primary-gold)] to-yellow-500 p-6 rounded-2xl shadow-lg shadow-[var(--primary-gold)]/20 flex flex-col items-center justify-center text-center text-[var(--primary-dark)] border border-yellow-300">
                            <span className="text-3xl mb-2">💰</span>
                            <span className="text-2xl font-black">{stats.gains} <span className="text-sm">FCFA</span></span>
                            <span className="text-xs font-bold uppercase tracking-wide mt-1 opacity-90">Gains totaux</span>
                        </div>
                    </div>

                    {/* Bouton de Retrait */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h4 className="font-bold text-gray-900">Demander un paiement</h4>
                            <p className="text-sm text-gray-500">Le seuil minimum de retrait est de 2000 FCFA. Transfert direct sur votre numéro.</p>
                        </div>
                        <button
                            disabled={stats.gains < 2000}
                            className="px-6 py-3 bg-[var(--primary-dark)] text-white rounded-xl font-bold text-sm hover:bg-[var(--primary-dark)]/90 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            Retirer mes gains
                        </button>
                    </div>
                    {stats.gains < 2000 && (
                        <p className="text-xs text-red-500 mt-3 text-right">Il vous manque {2000 - stats.gains} FCFA pour retirer.</p>
                    )}

                </div>
            </main>
        </div>
    );
}
