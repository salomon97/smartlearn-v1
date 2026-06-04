"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

type Plan = {
    _id: string;
    code: string;
    name: string;
    price: number;
    chariowUrl: string;
    period?: 'monthly' | 'quarterly' | 'annual' | 'lifetime';
    durationDays?: number;
};

const PERIOD_LABEL: Record<string, string> = {
    monthly: '/ mois',
    quarterly: '/ trimestre',
    annual: '/ an',
    lifetime: 'à vie',
};

function monthlyEquivalent(plan: Plan): number | null {
    if (!plan.durationDays || plan.durationDays <= 0) return null;
    return plan.price / (plan.durationDays / 30);
}

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
        if ((session?.user as any)?.premiumStatus === 'lifetime' && !paymentSuccess) {
            router.push("/dashboard");
        }
    }, [session, router, paymentSuccess]);

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
                if (attempts > 12) setChecking(false);
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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Chargement sécurisé…</p>
                </div>
            </div>
        );
    }

    // Page de confirmation post-Chariow
    if (paymentSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center bg-white rounded-3xl shadow-sm border border-slate-200 p-10">
                    {checking ? (
                        <>
                            <div className="w-20 h-20 border-4 border-teal border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                            <h1 className="font-heading text-2xl font-bold text-navy mb-3">Vérification en cours…</h1>
                            <p className="text-slate-500">Nous confirmons la réception de votre paiement. Cela prend généralement quelques secondes.</p>
                        </>
                    ) : isVerified ? (
                        <>
                            <div className="w-20 h-20 bg-teal/15 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h1 className="font-heading text-3xl font-bold text-navy mb-3">Paiement reçu !</h1>
                            <p className="text-slate-500 mb-8">Votre accès Premium est maintenant actif. Bienvenue.</p>
                            <Link
                                href="/dashboard"
                                className="inline-flex w-full justify-center px-6 py-3 bg-orange text-white rounded-full font-semibold hover:bg-orange/90 transition-all"
                            >
                                Aller à mon espace
                            </Link>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">⏳</div>
                            <h1 className="font-heading text-2xl font-bold text-navy mb-3">Confirmation différée</h1>
                            <p className="text-slate-500 mb-8">Le paiement est toujours en cours de traitement par l&apos;opérateur. Pas d&apos;inquiétude : votre accès sera activé dès la confirmation reçue.</p>
                            <Link
                                href="/dashboard"
                                className="inline-flex w-full justify-center px-6 py-3 bg-slate-100 text-slate-700 rounded-full font-semibold hover:bg-slate-200 transition-all"
                            >
                                Retourner au tableau de bord
                            </Link>
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
        <div className="min-h-screen bg-slate-50">

            {/* Mini-header checkout (sobre, sans navbar complète) */}
            <header className="bg-navy text-white py-5 px-6 border-b border-white/5">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link href="/" aria-label="SmartLearn — Accueil">
                        <Logo variant="compact" theme="dark" size={32} />
                    </Link>
                    <Link href="/dashboard" className="text-sm text-slate-300 hover:text-teal transition-colors">
                        ← Retour
                    </Link>
                </div>
            </header>

            <div className="max-w-5xl mx-auto py-12 px-4 md:px-6">

                {/* Titre */}
                <div className="text-center mb-12">
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-teal mb-3">
                        Choisir ma formule
                    </span>
                    <h1 className="font-heading text-3xl md:text-5xl font-bold text-navy mb-3">
                        Activer mon accès Premium
                    </h1>
                    <p className="text-slate-500 max-w-xl mx-auto">
                        Trois formules pour s&apos;adapter à votre budget.
                        {session?.user?.grade_level && (
                            <> Programme officiel <span className="text-navy font-semibold">{session.user.grade_level}</span>.</>
                        )}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* COLONNE GAUCHE — récap inclus + sécurité */}
                    <div className="lg:col-span-1 space-y-5">

                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h2 className="font-heading text-lg font-bold text-navy mb-4">Ce qui est inclus</h2>
                            <ul className="space-y-3 text-sm text-slate-700">
                                {[
                                    "Cours vidéo HD, structurés APC",
                                    "Annales et exercices corrigés",
                                    "PDFs téléchargeables hors-ligne",
                                    "Suivi de progression personnalisé",
                                    "Accès depuis tout téléphone Android",
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-3">
                                        <span className="bg-teal/15 text-teal rounded-full p-1 flex-shrink-0 mt-0.5">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-3">
                                Moyens de paiement
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { label: "MTN MoMo", cls: "bg-yellow-400 text-black" },
                                    { label: "Orange Money", cls: "bg-orange text-white" },
                                    { label: "Visa", cls: "bg-blue-700 text-white" },
                                    { label: "Mastercard", cls: "bg-red-600 text-white" },
                                ].map((m) => (
                                    <span key={m.label} className={`${m.cls} px-3 py-1.5 rounded-lg text-xs font-bold`}>
                                        {m.label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-teal/5 border border-teal/20 rounded-2xl p-5 flex items-start gap-3">
                            <span className="text-xl flex-shrink-0">🔒</span>
                            <div className="text-xs text-navy/80 leading-relaxed">
                                Paiement sécurisé via <strong>Chariow</strong>. Aucune donnée bancaire n&apos;est stockée sur nos serveurs.
                            </div>
                        </div>
                    </div>

                    {/* COLONNE DROITE — plans */}
                    <div className="lg:col-span-2">
                        {plansLoading ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                                <div className="w-10 h-10 border-4 border-teal border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                <p className="text-slate-500 text-sm">Chargement des offres…</p>
                            </div>
                        ) : plans.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-red-200 p-10 text-center">
                                <p className="text-red-600 font-medium">Aucune offre disponible pour le moment.</p>
                                <p className="text-slate-500 text-sm mt-2">Réessayez plus tard.</p>
                            </div>
                        ) : (() => {
                            const monthlyPlan = plans.find(p => p.period === 'monthly');
                            const monthlyRef = monthlyPlan?.price ?? null;
                            return (
                                <div className="flex flex-col gap-4">
                                    {plans.map((plan) => {
                                        const periodLabel = PERIOD_LABEL[plan.period || 'lifetime'] || '';
                                        const eqMonthly = monthlyEquivalent(plan);
                                        const savings = monthlyRef && eqMonthly && plan.period !== 'monthly' && plan.period !== 'lifetime'
                                            ? Math.round((1 - eqMonthly / monthlyRef) * 100)
                                            : 0;
                                        const isBestValue = plan.period === 'annual';

                                        return (
                                            <div
                                                key={plan._id}
                                                className={`relative bg-white rounded-2xl border-2 p-6 transition-all ${
                                                    isBestValue
                                                        ? 'border-orange shadow-xl shadow-orange/10'
                                                        : 'border-slate-200 hover:border-teal/50'
                                                }`}
                                            >
                                                {isBestValue && (
                                                    <span className="absolute -top-3 left-6 bg-orange text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                                                        ⭐ Meilleur rapport
                                                    </span>
                                                )}

                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                                                    {/* Infos plan */}
                                                    <div className="flex-1">
                                                        <h3 className="font-heading text-xl font-bold text-navy mb-1">{plan.name}</h3>
                                                        <div className="flex items-baseline gap-2 mb-1">
                                                            <span className="text-3xl font-bold text-navy">
                                                                {plan.price.toLocaleString('fr-FR')}
                                                            </span>
                                                            <span className="text-sm text-slate-500 font-medium">
                                                                FCFA {periodLabel}
                                                            </span>
                                                        </div>
                                                        {eqMonthly && plan.period !== 'monthly' && (
                                                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                                                <span className="text-slate-500">
                                                                    soit {Math.round(eqMonthly).toLocaleString('fr-FR')} FCFA/mois
                                                                </span>
                                                                {savings > 0 && (
                                                                    <span className="inline-flex items-center gap-1 bg-teal/15 text-teal-dark font-bold px-2 py-0.5 rounded-full">
                                                                        −{savings}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* CTA */}
                                                    <a
                                                        href={buildCheckoutUrl(plan)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold transition-all text-sm whitespace-nowrap ${
                                                            isBestValue
                                                                ? 'bg-orange hover:bg-orange/90 text-white shadow-lg hover:shadow-xl hover:shadow-orange/30'
                                                                : 'bg-navy hover:bg-navy/90 text-white'
                                                        }`}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                        </svg>
                                                        Payer
                                                    </a>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}

                        <p className="text-xs text-slate-400 text-center mt-6 leading-relaxed">
                            Vous serez redirigé vers Chariow, plateforme de paiement sécurisée.<br />
                            Votre accès Premium est activé après confirmation du paiement.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-600 font-medium">Chargement…</p>
                    </div>
                </div>
            }
        >
            <CheckoutContent />
        </Suspense>
    );
}
