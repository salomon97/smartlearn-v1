"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Logo } from "@/components/ui/Logo";

interface AffiliateStats {
    referrals: number;
    conversions: number;
    earnings_pending: number;
    earnings_available: number;
}

export default function AffiliationPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [copied, setCopied] = useState(false);
    const [referralLink, setReferralLink] = useState("");
    const [stats, setStats] = useState<AffiliateStats>({
        referrals: 0,
        conversions: 0,
        earnings_pending: 0,
        earnings_available: 0,
    });
    const [statsLoading, setStatsLoading] = useState(true);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [withdrawNumber, setWithdrawNumber] = useState("");
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);
    const [withdrawError, setWithdrawError] = useState<string | null>(null);
    const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);

    const SEUIL_RETRAIT = 2000;

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/connexion");
        } else if (session?.user?.id) {
            setReferralLink(`${window.location.origin}/auth/inscription?ref=${session.user.id}`);
        }
    }, [status, session, router]);

    useEffect(() => {
        if (session?.user?.id) {
            setStatsLoading(true);
            fetch("/api/user/affiliate-stats")
                .then((res) => res.json())
                .then((data) => {
                    if (data && !data.error) setStats(data);
                })
                .catch(() => {})
                .finally(() => setStatsLoading(false));
        }
    }, [session?.user?.id]);

    useEffect(() => {
        if (session?.user?.id) {
            fetch("/api/user/withdrawals")
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setWithdrawalHistory(data);
                })
                .catch(err => console.error("Erreur historique:", err));
        }
    }, [session?.user?.id]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Chargement…</p>
                </div>
            </div>
        );
    }

    const isPremium = session?.user?.isPremium;
    const role = session?.user?.role;

    return (
        <div className="min-h-screen bg-slate-50 flex">

            {/* ─── Sidebar ─── */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 min-h-screen sticky top-0 py-8 px-5">
                <Link href="/" className="mb-10 px-1" aria-label="SmartLearn — Accueil">
                    <Logo variant="compact" theme="light" size={34} />
                </Link>

                <nav className="flex flex-col gap-1.5 flex-grow">
                    {role === "affiliate" ? (
                        <>
                            <Link href="/dashboard" className="px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-navy rounded-2xl font-medium flex items-center gap-3 transition-colors">
                                <span>📈</span> Tableau de bord
                            </Link>
                            <Link href="/affiliation" className="px-4 py-3 bg-teal/10 text-teal-dark border border-teal/30 rounded-2xl font-semibold flex items-center gap-3">
                                <span>💸</span> Programme Ambassadeur
                            </Link>
                            <Link href="/dashboard/profil" className="px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-navy rounded-2xl font-medium flex items-center gap-3 transition-colors">
                                <span>👤</span> Mon compte
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/dashboard" className="px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-navy rounded-2xl font-medium flex items-center gap-3 transition-colors">
                                <span>📊</span> Vue d&apos;ensemble
                            </Link>
                            <Link href="/dashboard/cours" className="px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-navy rounded-2xl font-medium flex items-center gap-3 transition-colors">
                                <span>📚</span> Mes formations
                            </Link>
                            <Link href="/dashboard/profil" className="px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-navy rounded-2xl font-medium flex items-center gap-3 transition-colors">
                                <span>👤</span> Profil
                            </Link>
                            <Link href="/affiliation" className="px-4 py-3 bg-teal/10 text-teal-dark border border-teal/30 rounded-2xl font-semibold flex items-center gap-3">
                                <span>💸</span> Gagner de l&apos;argent
                            </Link>
                        </>
                    )}
                </nav>

                {isPremium && (
                    <div className="mt-6 bg-teal/10 border border-teal/20 px-4 py-3 rounded-2xl text-center">
                        <span className="text-xs font-semibold uppercase tracking-widest text-teal-dark">
                            ✨ Premium actif
                        </span>
                    </div>
                )}
            </aside>

            {/* ─── Main ─── */}
            <main className="flex-1 overflow-y-auto h-screen relative">
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 py-5 px-6 flex items-center justify-between sticky top-0 z-10">
                    <h1 className="font-heading text-xl md:text-2xl font-bold text-navy">Programme Ambassadeur</h1>
                    {role === "student" && !isPremium && (
                        <Link
                            href="/paiement"
                            className="px-5 py-2.5 bg-orange hover:bg-orange/90 text-white rounded-full font-semibold text-sm shadow-md shadow-orange/20 transition-all"
                        >
                            Devenir Premium
                        </Link>
                    )}
                </header>

                <div className="p-6 md:p-10 max-w-5xl mx-auto">

                    {/* Hero */}
                    <section className="bg-navy text-white rounded-3xl p-8 md:p-10 mb-8 shadow-xl relative overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-72 h-72 bg-teal/20 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-orange/10 rounded-full blur-3xl"></div>

                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                            <div className="md:col-span-2">
                                <span className="inline-block px-3 py-1 bg-teal/15 border border-teal/30 rounded-full text-teal text-xs font-semibold uppercase tracking-widest mb-4">
                                    Partagez &amp; gagnez
                                </span>
                                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 leading-tight">
                                    Parrainez vos amis,<br />
                                    encaissez vos gains.
                                </h2>
                                <p className="text-slate-300 leading-relaxed">
                                    Pour chaque ami qui s&apos;abonne grâce à votre lien, vous touchez{" "}
                                    <strong className="text-teal">10 % de sa souscription</strong>.
                                    Plus la formule est longue, plus la commission est élevée.
                                    Retraits via Mobile Money à partir de <strong className="text-white">{SEUIL_RETRAIT.toLocaleString('fr-FR')} FCFA</strong>.
                                </p>
                            </div>

                            <div className="hidden md:flex justify-center">
                                <div className="w-32 h-32 bg-gradient-to-br from-teal/30 to-orange/20 rounded-full flex items-center justify-center text-6xl border-4 border-white/10">
                                    💸
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Lien de parrainage */}
                    <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 mb-8 border-l-4 border-l-teal">
                        <h3 className="font-heading text-lg font-bold text-navy mb-3">Votre lien exclusif</h3>
                        <div className="flex flex-col sm:flex-row items-stretch gap-3">
                            <input
                                type="text"
                                readOnly
                                value={referralLink}
                                className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-mono text-sm outline-none"
                                aria-label="Lien d'affiliation"
                            />
                            <button
                                onClick={copyToClipboard}
                                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-white shadow-md transition-all ${
                                    copied
                                        ? "bg-teal hover:bg-teal-dark"
                                        : "bg-navy hover:bg-navy/90"
                                }`}
                            >
                                {copied ? "✓ Copié !" : "Copier"}
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-3">
                            Partagez ce lien sur WhatsApp, Facebook, ou par SMS. Chaque conversion vous rapporte.
                        </p>
                    </section>

                    {/* Stats */}
                    <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 text-center">
                            <span className="text-2xl block mb-2">🧑‍🎓</span>
                            <span className="text-2xl font-bold text-navy">{statsLoading ? "…" : stats.referrals}</span>
                            <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-widest mt-1">Inscrits</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 text-center">
                            <span className="text-2xl block mb-2">⭐</span>
                            <span className="text-2xl font-bold text-navy">{statsLoading ? "…" : stats.conversions}</span>
                            <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-widest mt-1">Premium</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 text-center">
                            <span className="text-2xl block mb-2">⏳</span>
                            <span className="text-2xl font-bold text-navy">{statsLoading ? "…" : stats.earnings_pending.toLocaleString('fr-FR')}</span>
                            <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-widest mt-1">En attente</p>
                        </div>
                        <div className="bg-gradient-to-br from-teal to-teal-dark p-5 rounded-2xl shadow-md text-center text-white">
                            <span className="text-2xl block mb-2">💰</span>
                            <span className="text-2xl font-bold">{statsLoading ? "…" : stats.earnings_available.toLocaleString('fr-FR')}</span>
                            <p className="text-[10px] uppercase font-semibold tracking-widest mt-1 text-white/90">Disponible</p>
                        </div>
                    </section>

                    {/* Action retrait */}
                    <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h4 className="font-semibold text-navy">Demander un paiement</h4>
                            <p className="text-sm text-slate-500 mt-1">
                                Seuil de retrait : <strong className="text-navy">{SEUIL_RETRAIT.toLocaleString('fr-FR')} FCFA</strong>
                            </p>
                        </div>
                        <button
                            onClick={() => setIsWithdrawModalOpen(true)}
                            disabled={statsLoading || (stats.earnings_available || 0) < SEUIL_RETRAIT}
                            className="px-6 py-3 bg-orange hover:bg-orange/90 text-white rounded-full font-semibold text-sm shadow-md shadow-orange/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none disabled:hover:bg-slate-300 transition-all"
                        >
                            Retirer mes gains
                        </button>
                    </section>

                    {!statsLoading && (stats.earnings_available || 0) < SEUIL_RETRAIT && (
                        <p className="text-xs text-slate-500 text-right mt-3">
                            Il vous manque <strong className="text-orange">{(SEUIL_RETRAIT - (stats.earnings_available || 0)).toLocaleString('fr-FR')} FCFA</strong> pour atteindre le seuil de retrait.
                        </p>
                    )}

                    {/* Historique */}
                    <section className="mt-12">
                        <h3 className="font-heading text-xl font-bold text-navy mb-5">Historique des retraits</h3>
                        {withdrawalHistory.length === 0 ? (
                            <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-10 text-center text-slate-400 text-sm">
                                Aucun retrait pour le moment.
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50">
                                        <tr className="text-slate-500 uppercase text-[10px] tracking-widest font-semibold">
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Montant</th>
                                            <th className="px-6 py-4">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {withdrawalHistory.map((w) => (
                                            <tr key={w._id}>
                                                <td className="px-6 py-4 text-slate-600">
                                                    {new Date(w.createdAt).toLocaleDateString('fr-FR')}
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-navy">
                                                    {w.amount.toLocaleString('fr-FR')} FCFA
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                                        w.status === 'paid' ? 'bg-teal/15 text-teal-dark' :
                                                        w.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        {w.status === 'paid' ? 'Payé' : w.status === 'pending' ? 'En attente' : 'Échec'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>

                {/* ─── Modale retrait ─── */}
                {isWithdrawModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-navy/70 backdrop-blur-sm"
                            onClick={() => !withdrawLoading && setIsWithdrawModalOpen(false)}
                        ></div>
                        <div className="bg-white rounded-3xl w-full max-w-md p-8 relative z-10 shadow-2xl">
                            <h3 className="font-heading text-2xl font-bold text-navy mb-6">Demande de retrait</h3>
                            {withdrawSuccess ? (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-teal/15 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-navy font-semibold mb-6">{withdrawSuccess}</p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="px-6 py-2.5 bg-teal hover:bg-teal-dark text-white rounded-full font-semibold transition-colors"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    setWithdrawError(null);

                                    const amountNum = Number(withdrawAmount);
                                    if (isNaN(amountNum) || amountNum < SEUIL_RETRAIT) {
                                        setWithdrawError(`Le montant minimum est de ${SEUIL_RETRAIT.toLocaleString('fr-FR')} FCFA`);
                                        return;
                                    }
                                    if (amountNum > stats.earnings_available) {
                                        setWithdrawError("Vous ne pouvez pas retirer plus que votre solde disponible.");
                                        return;
                                    }
                                    if (!withdrawNumber || withdrawNumber.length < 8) {
                                        setWithdrawError("Veuillez entrer un numéro Mobile Money valide.");
                                        return;
                                    }

                                    setWithdrawLoading(true);
                                    try {
                                        const res = await fetch("/api/user/withdraw", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ amount: amountNum, accountNumber: withdrawNumber })
                                        });
                                        const result = await res.json();

                                        if (res.ok) {
                                            setWithdrawSuccess("Votre demande de retrait a été envoyée avec succès !");
                                            setTimeout(() => window.location.reload(), 2000);
                                        } else {
                                            setWithdrawError(result.error || "Une erreur est survenue.");
                                        }
                                    } catch (err) {
                                        setWithdrawError("Erreur de connexion au serveur.");
                                    } finally {
                                        setWithdrawLoading(false);
                                    }
                                }}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                                Montant (FCFA)
                                            </label>
                                            <input
                                                type="number"
                                                required
                                                value={withdrawAmount}
                                                onChange={e => setWithdrawAmount(e.target.value)}
                                                placeholder={`Minimum ${SEUIL_RETRAIT}`}
                                                className="w-full bg-slate-50 border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none p-3 rounded-xl text-navy font-semibold transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                                Numéro Mobile Money
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                value={withdrawNumber}
                                                onChange={e => setWithdrawNumber(e.target.value)}
                                                placeholder="+237 6 XX XX XX XX"
                                                className="w-full bg-slate-50 border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none p-3 rounded-xl text-navy font-semibold transition-all"
                                            />
                                        </div>
                                    </div>
                                    {withdrawError && (
                                        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                                            <p className="text-red-700 text-xs">{withdrawError}</p>
                                        </div>
                                    )}
                                    <div className="mt-8 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsWithdrawModalOpen(false)}
                                            disabled={withdrawLoading}
                                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-navy p-3 rounded-full font-semibold transition-colors disabled:opacity-50"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={withdrawLoading}
                                            className="flex-1 bg-orange hover:bg-orange/90 text-white p-3 rounded-full font-semibold disabled:opacity-50 transition-colors"
                                        >
                                            {withdrawLoading ? "Envoi…" : "Confirmer"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
