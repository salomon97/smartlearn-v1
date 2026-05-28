"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

type Plan = {
    _id: string;
    code: string;
    name: string;
    price: number;
    chariowUrl: string;
};

function CheckoutContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const paymentSuccess = searchParams.get("success") === "true";

    const [checking, setChecking] = useState(true);
    const [isVerified, setIsVerified] = useState(false);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [plansLoading, setPlansLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/connexion?callbackUrl=/paiement");
        }
    }, [status, router]);

    useEffect(() => {
        if (session?.user?.isPremium && !paymentSuccess) {
            router.push("/dashboard");
        }
    }, [session, router, paymentSuccess]);

    // Charger les plans actifs depuis l'API (fin des constantes hardcodées)
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/plans");
                const data = await res.json();
                if (!cancelled && Array.isArray(data)) setPlans(data);
            } catch (error) {
                console.error("Erreur chargement des plans :", error);
            } finally {
                if (!cancelled) setPlansLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // Polling pour vérifier le statut de paiement
    useEffect(() => {
        if (paymentSuccess && !isVerified) {
            let attempts = 0;
            const checkStatus = async () => {
                try {
                    const res = await fetch("/api/user/payment/verify");
                    const data = await res.json();
                    if (data.success) {
                        setIsVerified(true);
                        setChecking(false);
                        return true;
                    }
                } catch (error) {
                    console.error("Erreur de vérification :", error);
                }
                attempts++;
                if (attempts > 12) { // Max 1 minute (5s * 12)
                    setChecking(false);
                }
                return false;
            };

            checkStatus();
            const interval = setInterval(async () => {
                const done = await checkStatus();
                if (done) clearInterval(interval);
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [paymentSuccess, isVerified]);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center text-[var(--primary-gold)] font-bold text-xl">
                Chargement sécurisé...
            </div>
        );
    }

    // Page de confirmation après retour de Chariow
    if (paymentSuccess) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    {checking ? (
                        <>
                            <div className="w-20 h-20 border-4 border-[var(--primary-gold)] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                            <h1 className="text-2xl font-black text-gray-900 mb-3">Vérification en cours...</h1>
                            <p className="text-gray-500 font-medium">Nous confirmons la réception de votre paiement. Cela prend généralement quelques secondes.</p>
                        </>
                    ) : isVerified ? (
                        <>
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Paiement reçu !</h1>
                            <p className="text-gray-500 mb-8 font-medium">Votre accès VIP est maintenant actif. Bienvenue dans l&apos;excellence !</p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link href="/dashboard" className="px-6 py-3 bg-[var(--primary-dark)] text-white rounded-xl font-bold hover:shadow-lg transition-all">Aller à mon espace</Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">⏳</div>
                            <h1 className="text-2xl font-black text-gray-900 mb-3">Confirmation différée</h1>
                            <p className="text-gray-500 mb-8 font-medium">Le paiement est toujours en cours de traitement par l&apos;opérateur. Ne vous inquiétez pas, votre accès sera activé dès la confirmation reçue.</p>
                            <Link href="/dashboard" className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold">Retourner au tableau de bord</Link>
                        </>
                    )}
                </div>
            </div>
        );
    }

    const userId = (session?.user as any)?.id as string | undefined;
    const buildCheckoutUrl = (plan: Plan) =>
        userId
            ? `${plan.chariowUrl}?custom_data=${encodeURIComponent(`${userId}__${plan.code}`)}`
            : plan.chariowUrl;

    return (
        <div className="min-h-screen bg-[var(--background)] py-12 px-4">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">

                {/* Résumé de la commande (Gauche) */}
                <div className="flex-1">
                    <h1 className="text-3xl font-extrabold text-[var(--foreground)] mb-6">Valider l&apos;Accès Premium</h1>

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-6">
                        <div className="mb-6 pb-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-[var(--primary-dark)] mb-2">Accès au programme</h2>
                            <p className="text-gray-500 font-medium text-sm">
                                Programme complet pour la classe :{" "}
                                <span className="text-[var(--primary-gold-hover)] font-bold">
                                    {session?.user?.grade_level || "Votre Classe"}
                                </span>
                            </p>
                        </div>

                        <ul className="space-y-4 text-gray-600 mb-8">
                            {[
                                "Vidéos de révision HD",
                                "PDFs téléchargeables et fiches pratiques",
                                "Accès sans abonnement ultérieur",
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-3">
                                    <div className="bg-green-100 p-1 rounded-full text-green-600">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-4">
                            <span className="text-2xl mt-0.5">🔒</span>
                            <p className="text-sm text-yellow-800 font-medium">
                                Paiement sécurisé via Chariow. Accepte MTN MoMo, Orange Money, Visa et Mastercard. Votre accès est activé après confirmation.
                            </p>
                        </div>
                    </div>

                    {/* Moyens de paiement acceptés */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-4">Moyens de paiement acceptés</p>
                        <div className="flex flex-wrap gap-3">
                            {[
                                { label: "MTN MoMo", color: "bg-yellow-400", text: "text-black" },
                                { label: "Orange Money", color: "bg-orange-500", text: "text-white" },
                                { label: "Visa", color: "bg-blue-700", text: "text-white" },
                                { label: "Mastercard", color: "bg-red-600", text: "text-white" },
                            ].map((m) => (
                                <span
                                    key={m.label}
                                    className={`${m.color} ${m.text} px-3 py-1.5 rounded-lg text-xs font-black`}
                                >
                                    {m.label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Choix du plan + bouton Chariow (Droite) */}
                <div className="w-full md:w-96 flex flex-col gap-6">
                    <div className="bg-white rounded-3xl shadow-lg shadow-[var(--primary-dark)]/5 border-2 border-[var(--primary-dark)]/5 p-8 sticky top-24">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Choisissez votre accès</h3>

                        {plansLoading ? (
                            <p className="text-sm text-gray-500">Chargement des offres...</p>
                        ) : plans.length === 0 ? (
                            <p className="text-sm text-red-500">Aucune offre disponible pour le moment. Réessayez plus tard.</p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {plans.map((plan) => (
                                    <div key={plan._id} className="border border-gray-100 rounded-2xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-bold text-gray-900">{plan.name}</span>
                                            <span className="text-xl font-black">
                                                {plan.price} <span className="text-xs text-gray-400">FCFA</span>
                                            </span>
                                        </div>
                                        <a
                                            href={buildCheckoutUrl(plan)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-3 px-6 rounded-xl bg-[var(--primary-dark)] text-white font-bold hover:bg-[var(--primary-dark)]/90 transition-all flex items-center justify-center gap-2 text-center"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            Payer {plan.price} FCFA
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}

                        <p className="text-xs text-gray-400 text-center mt-4">
                            Vous serez redirigé vers Chariow, une plateforme de paiement sécurisée. Votre accès VIP sera activé après confirmation du paiement.
                        </p>

                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <p className="text-xs text-gray-400 font-medium mb-2">🔐 Paiement géré par Chariow</p>
                            <p className="text-xs text-gray-400">Aucune donnée bancaire n&apos;est stockée sur notre serveur.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[var(--background)] flex items-center justify-center text-[var(--primary-gold)] font-bold text-xl">Chargement...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}
