"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CheckoutPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [selectedMethod, setSelectedMethod] = useState<"MTN" | "ORANGE" | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const PRIX_ACCES_A_VIE = 2000; // 2000 FCFA

    // Si l'utilisateur n'est pas connecté, le rediriger vers la connexion
    if (status === "unauthenticated") {
        // Dans un cas réel, on enregistrerait `/paiement` pour le rediriger ici après auth
        router.push("/auth/connexion");
        return null;
    }

    // Si l'utilisateur est déjà premium, le renvoyer au dashboard
    if (session?.user?.isPremium) {
        router.push("/dashboard");
        return null;
    }

    const handlePayment = async () => {
        if (!selectedMethod) {
            setError("Veuillez sélectionner un moyen de paiement.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            // On utilise notre Mock API créée à la Phase 2
            const res = await fetch("/api/payment/mock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: PRIX_ACCES_A_VIE,
                    paymentMethod: selectedMethod === "MTN" ? "MTN Mobile Money" : "Orange Money",
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Échec du paiement.");
            }

            // Paiement réussi !
            setSuccess(true);

            // On force le rechargement de la page après 3 secondes pour mettre à jour la session
            // et l'emmener vers son Dashboard.
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 3000);

        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (status === "loading") {
        return <div className="min-h-screen bg-[var(--background)] flex items-center justify-center text-[var(--primary-gold)] font-bold text-xl">Chargement sécurisé...</div>;
    }

    return (
        <div className="min-h-screen bg-[var(--background)] py-12 px-4">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">

                {/* Résumé de la commande (Gauche) */}
                <div className="flex-1">
                    <h1 className="text-3xl font-extrabold text-[var(--foreground)] mb-6">Valider l'Accès Premium</h1>

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-6">
                        <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-xl font-bold text-[var(--primary-dark)] mb-2">Accès Illimité - À Vie</h2>
                                <p className="text-gray-500 font-medium text-sm">Programme complet pour la classe : <span className="text-[var(--primary-gold-hover)] font-bold">{session?.user?.grade_level || "Votre Classe"}</span></p>
                            </div>
                            <div className="text-2xl font-black text-right">
                                {PRIX_ACCES_A_VIE} <span className="text-sm text-gray-400">FCFA</span>
                            </div>
                        </div>

                        <ul className="space-y-4 text-gray-600 mb-8">
                            <li className="flex items-center gap-3">
                                <div className="bg-green-100 p-1 rounded-full text-green-600">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                Vidéos de révision HD
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="bg-green-100 p-1 rounded-full text-green-600">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                PDFs téléchargeables et fiches pratiques
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="bg-green-100 p-1 rounded-full text-green-600">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                Accès sans abonnement ultérieur
                            </li>
                        </ul>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-4">
                            <span className="text-2xl">🔒</span>
                            <p className="text-sm text-yellow-800 font-medium">
                                Paiement 100% sécurisé via Mobile Money. L'activation de votre compte est immédiate après validation sur votre téléphone.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Moyens de Paiement (Droite) */}
                <div className="w-full md:w-96 flex flex-col gap-6">
                    <div className="bg-white rounded-3xl shadow-lg shadow-[var(--primary-dark)]/5 border-2 border-[var(--primary-dark)]/5 p-8 sticky top-24">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Moyen de paiement</h3>

                        {success ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 mb-2">Paiement Réussi !</h4>
                                <p className="text-gray-500 font-medium">Vous êtes maintenant VIP.</p>
                                <p className="text-sm text-gray-400 mt-4 animate-pulse">Redirection vers votre espace...</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4 mb-8">
                                    {/* MTN */}
                                    <label className={`cursor-pointer rounded-2xl border-2 p-4 flex items-center gap-4 transition-all ${selectedMethod === "MTN" ? 'border-yellow-400 bg-yellow-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                        <input type="radio" name="payment" className="hidden" onChange={() => setSelectedMethod("MTN")} />
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === "MTN" ? 'border-yellow-500' : 'border-gray-300'}`}>
                                            {selectedMethod === "MTN" && <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>}
                                        </div>
                                        <div className="flex-1 font-bold">MTN Mobile Money</div>
                                        <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center text-sm font-black text-black">MTN</div>
                                    </label>

                                    {/* ORANGE */}
                                    <label className={`cursor-pointer rounded-2xl border-2 p-4 flex items-center gap-4 transition-all ${selectedMethod === "ORANGE" ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                        <input type="radio" name="payment" className="hidden" onChange={() => setSelectedMethod("ORANGE")} />
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === "ORANGE" ? 'border-orange-500' : 'border-gray-300'}`}>
                                            {selectedMethod === "ORANGE" && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>}
                                        </div>
                                        <div className="flex-1 font-bold">Orange Money</div>
                                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-sm font-black text-white">OMG</div>
                                    </label>
                                </div>

                                {error && <p className="text-red-500 text-sm font-medium mb-4 text-center">{error}</p>}

                                <button
                                    onClick={handlePayment}
                                    disabled={loading || !selectedMethod}
                                    className="w-full py-4 rounded-xl bg-[var(--primary-dark)] text-white font-bold text-lg hover:bg-[var(--primary-dark)]/90 transition-all transform hover:-translate-y-1 shadow-lg shadow-[var(--primary-dark)]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {loading ? "Traitement..." : `Payer ${PRIX_ACCES_A_VIE} FCFA`}
                                </button>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
