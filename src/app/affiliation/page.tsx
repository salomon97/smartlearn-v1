"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

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

    // Fetch des statistiques d'affiliation
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
    
    // Fetch historique des retraits
    useEffect(() => {
        if (session?.user?.id) {
            fetch("/api/user/withdrawals")
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setWithdrawalHistory(data);
                    }
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
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center text-[var(--primary-gold)] font-bold text-xl">
                Chargement...
            </div>
        );
    }

    const isPremium = session?.user?.isPremium;
    const role = session?.user?.role;

    return (
        <div className="min-h-screen bg-[var(--background)] flex">
            {/* Sidebar Latérale */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 min-h-screen sticky top-0 py-6 px-4">
                <Link href="/" className="flex items-center gap-2 mb-10 px-2">
                    <Image src="/logo.jpg" alt="Logo" width={32} height={32} className="rounded-full" />
                    <span className="text-xl font-bold text-[var(--primary-dark)]">
                        Smart<span className="text-[var(--primary-gold)]">Learn</span>
                    </span>
                </Link>
                <nav className="flex flex-col gap-2 flex-grow">
                    {role === "affiliate" ? (
                        <>
                            <Link href="/dashboard" className="px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium flex items-center gap-3">
                                <span className="text-lg">📈</span> Tableau de bord
                            </Link>
                            <Link href="/affiliation" className="px-4 py-3 bg-[var(--primary-dark)]/5 text-[var(--primary-dark)] rounded-xl font-bold flex items-center gap-3">
                                <span className="text-lg">💸</span> Programme Ambassadeur
                            </Link>
                            <Link href="/dashboard/profil" className="px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium flex items-center gap-3">
                                <span className="text-lg">👤</span> Mon Compte
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/dashboard" className="px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium flex items-center gap-3">
                                <span className="text-lg">📊</span> Vue d&apos;ensemble
                            </Link>
                            <Link href="/dashboard/cours" className="px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium flex items-center gap-3">
                                <span className="text-lg">📚</span> Mes Formations
                            </Link>
                            <Link href="/dashboard/profil" className="px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium flex items-center gap-3">
                                <span className="text-lg">👤</span> Profil
                            </Link>
                            <Link href="/affiliation" className="px-4 py-3 bg-[var(--primary-dark)]/5 text-[var(--primary-dark)] rounded-xl font-bold flex items-center gap-3">
                                <span className="text-lg">💸</span> Gagner de l&apos;argent
                            </Link>
                        </>
                    )}
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
                    {role === "student" && !isPremium && (
                        <Link href="/paiement" className="px-5 py-2 bg-[var(--primary-gold)] text-[var(--primary-dark)] rounded-full font-bold text-sm shadow-md">
                            Devenir VIP
                        </Link>
                    )}
                </header>

                <div className="p-6 md:p-10 max-w-5xl mx-auto">
                    {/* Hero Section */}
                    <div className="bg-[var(--primary-dark)] text-white rounded-3xl p-8 mb-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-[var(--primary-gold)]/20">
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--primary-gold)] rounded-full blur-3xl opacity-20"></div>
                        <div className="relative z-10 max-w-xl">
                            <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[var(--primary-gold)] text-sm font-bold mb-4 border border-[var(--primary-gold)]/30 backdrop-blur-sm">Partagez &amp; Gagnez</span>
                            <h2 className="text-3xl font-extrabold mb-4">Parrainez vos amis et encaissez de l&apos;argent.</h2>
                            <p className="text-gray-300 text-lg">Pour chaque ami qui crée son compte VIP grâce à votre lien, vous gagnez <strong className="text-[var(--primary-gold)]">10% de sa souscription (soit 200 FCFA)</strong>. Recevez vos gains directement sur votre Mobile Money !</p>

                        </div>
                        <div className="relative z-10 w-full md:w-auto">
                            <Image src="/logo.jpg" alt="Affiliation" width={150} height={150} className="rounded-full shadow-2xl border-4 border-[var(--primary-gold)]/50 mx-auto" />
                        </div>
                    </div>

                    {/* Parrainage Row */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-[var(--primary-gold)]/30 mb-8 border-l-4 border-l-[var(--primary-gold)]">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Votre lien exclusif</h3>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <input type="text" readOnly value={referralLink} className="flex-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 font-mono text-sm outline-none shadow-inner" />
                            <button onClick={copyToClipboard} className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white shadow-md transition-all ${copied ? "bg-green-500" : "bg-[var(--primary-dark)]"}`}>
                                {copied ? "Copié !" : "Copier"}
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                            <span className="text-2xl block mb-1">🧑‍🎓</span>
                            <span className="text-xl font-black">{statsLoading ? "…" : stats.referrals}</span>
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Inscrits</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                            <span className="text-2xl block mb-1">🌟</span>
                            <span className="text-xl font-black">{statsLoading ? "…" : stats.conversions}</span>
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">VIP</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                            <span className="text-2xl block mb-1">⏳</span>
                            <span className="text-xl font-black">{statsLoading ? "…" : stats.earnings_pending}</span>
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">En attente</p>
                        </div>
                        <div className="bg-gradient-to-br from-[var(--primary-gold)] to-yellow-500 p-6 rounded-2xl shadow-md text-center text-[var(--primary-dark)]">
                            <span className="text-2xl block mb-1">💰</span>
                            <span className="text-xl font-black">{statsLoading ? "…" : stats.earnings_available}</span>
                            <p className="text-[10px] uppercase font-bold tracking-wider">Disponible</p>
                        </div>
                    </div>

                    {/* Withdrawal Action */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h4 className="font-bold text-gray-900">Demander un paiement</h4>
                            <p className="text-sm text-gray-500">Seuil de {SEUIL_RETRAIT} FCFA requis.</p>
                        </div>
                        <button
                            onClick={() => setIsWithdrawModalOpen(true)}
                            disabled={statsLoading || (stats.earnings_available || 0) < SEUIL_RETRAIT}
                            className="px-6 py-3 bg-[var(--primary-dark)] text-white rounded-xl font-bold text-sm shadow-md disabled:opacity-50"
                        >
                            Retirer mes gains
                        </button>
                    </div>

                    {/* History */}
                    <div className="mt-12">
                        <h3 className="text-xl font-bold mb-6">Historique des Retraits</h3>
                        {withdrawalHistory.length === 0 ? (
                            <div className="bg-white border border-dashed rounded-3xl p-10 text-center text-gray-400">Aucun retrait.</div>
                        ) : (
                            <div className="bg-white rounded-3xl overflow-hidden border border-gray-100">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50">
                                        <tr className="text-gray-500 uppercase text-[10px] tracking-widest font-bold">
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Montant</th>
                                            <th className="px-6 py-4">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {withdrawalHistory.map((w) => (
                                            <tr key={w._id}>
                                                <td className="px-6 py-4">{new Date(w.createdAt).toLocaleDateString('fr-FR')}</td>
                                                <td className="px-6 py-4 font-bold">{w.amount.toLocaleString()} FCFA</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${w.status === 'paid' ? 'bg-green-100 text-green-700' : w.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                                        {w.status === 'paid' ? 'Payé' : w.status === 'pending' ? 'Attente' : 'Échec'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* MODALE & CONDITIONS — Placées en fin de main pour éviter les conflits de nesting */}
                {!statsLoading && (stats.earnings_available || 0) < SEUIL_RETRAIT && (
                    <div className="max-w-5xl mx-auto px-6 mb-8">
                        <p className="text-xs text-red-500 text-right">Il vous manque {SEUIL_RETRAIT - (stats.earnings_available || 0)} FCFA pour retirer.</p>
                    </div>
                )}

                {isWithdrawModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !withdrawLoading && setIsWithdrawModalOpen(false)}></div>
                        <div className="bg-white rounded-3xl w-full max-w-md p-8 relative z-10 shadow-2xl">
                            <h3 className="text-2xl font-black mb-6">Demande de Retrait</h3>
                            {withdrawSuccess ? (
                                <div className="text-center">
                                    <p className="text-green-600 font-bold mb-4">{withdrawSuccess}</p>
                                    <button onClick={() => window.location.reload()} className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold">Fermer</button>
                                </div>
                            ) : (
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    setWithdrawError(null);

                                    const amountNum = Number(withdrawAmount);
                                    if (isNaN(amountNum) || amountNum < SEUIL_RETRAIT) {
                                        setWithdrawError(`Le montant minimum est de ${SEUIL_RETRAIT} FCFA`);
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
                                            // Rafraîchir les stats et l'historique après un court délai
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
                                        <input type="number" required value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="Montant" className="w-full bg-gray-50 border p-3 rounded-xl font-bold" />
                                        <input type="text" required value={withdrawNumber} onChange={e => setWithdrawNumber(e.target.value)} placeholder="Numéro Mobile Money" className="w-full bg-gray-50 border p-3 rounded-xl font-bold" />
                                    </div>
                                    {withdrawError && <p className="text-red-500 text-xs mt-2">{withdrawError}</p>}
                                    <div className="mt-8 flex gap-3">
                                        <button type="button" onClick={() => setIsWithdrawModalOpen(false)} className="flex-1 bg-gray-100 p-3 rounded-xl font-bold">Annuler</button>
                                        <button type="submit" disabled={withdrawLoading} className="flex-1 bg-[var(--primary-dark)] text-white p-3 rounded-xl font-bold">{withdrawLoading ? "Envoi..." : "Confirmer"}</button>
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
