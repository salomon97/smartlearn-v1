"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";

type Plan = {
    code: string;
    name: string;
    price: number;
    period?: string;
};

type ReconcileResult =
    | { ok: true; message: string; transactionId: string; premiumUntil: string | null; action: string }
    | { ok: false; message: string; alreadyExists?: boolean };

export default function ReconcilePaymentPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [email, setEmail] = useState("");
    const [planCode, setPlanCode] = useState("");
    const [chariowReferenceId, setChariowReferenceId] = useState("");
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<ReconcileResult | null>(null);

    useEffect(() => {
        fetch("/api/plans")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setPlans(data);
                    if (data.length > 0 && !planCode) setPlanCode(data[0].code);
                }
            })
            .catch(() => {});
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        setResult(null);

        try {
            const res = await fetch("/api/admin/reconcile-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, planCode, chariowReferenceId, reason }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setResult({
                    ok: true,
                    message: data.message,
                    transactionId: data.transaction.id,
                    premiumUntil: data.transaction.premiumUntil,
                    action: data.transaction.action,
                });
                setEmail("");
                setChariowReferenceId("");
                setReason("");
            } else {
                setResult({
                    ok: false,
                    message: data.message || "Erreur inconnue",
                    alreadyExists: data.alreadyExists === true,
                });
            }
        } catch (err: any) {
            setResult({ ok: false, message: `Erreur réseau : ${err?.message || "inconnue"}` });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <Link href="/admin" className="text-xs text-slate-400 hover:text-teal transition-colors">
                    ← Retour au tableau de bord admin
                </Link>
                <h1 className="font-heading text-3xl font-bold text-white mt-2">Réconcilier un paiement</h1>
                <p className="text-slate-400 mt-1 text-sm">
                    Activation manuelle d&apos;un abonnement Premium quand le webhook Chariow a échoué.
                </p>
            </div>

            {/* Garde-fou visuel */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-100 leading-relaxed">
                    <strong className="block mb-1">À utiliser avec précaution.</strong>
                    Vérifie <strong>impérativement</strong> sur Chariow que le paiement existe et que son
                    ID de référence est exact. Une réconciliation crée un Premium réel avec extension de
                    durée. L&apos;opération est journalisée et tracée à votre compte admin.
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-8 space-y-5">

                <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Email du payeur
                    </label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="eleve@exemple.com"
                        className="w-full bg-slate-900/50 border border-slate-700 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none p-3 rounded-xl text-white"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Plan à activer
                    </label>
                    <select
                        required
                        value={planCode}
                        onChange={(e) => setPlanCode(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-700 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none p-3 rounded-xl text-white"
                    >
                        {plans.length === 0 && <option>Chargement des plans…</option>}
                        {plans.map((p) => (
                            <option key={p.code} value={p.code}>
                                {p.name} — {p.price.toLocaleString('fr-FR')} FCFA ({p.period || 'autre'})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        ID de référence Chariow
                    </label>
                    <input
                        type="text"
                        required
                        value={chariowReferenceId}
                        onChange={(e) => setChariowReferenceId(e.target.value)}
                        placeholder="ex. trx_pmt_01H..."
                        className="w-full bg-slate-900/50 border border-slate-700 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none p-3 rounded-xl text-white font-mono text-sm"
                    />
                    <p className="text-xs text-slate-500 mt-1.5">
                        L&apos;ID exact de la transaction côté Chariow (visible sur leur dashboard).
                        Doit être unique — la réconciliation refuse les doublons.
                    </p>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Raison (optionnel mais recommandé)
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="ex. Webhook perdu suite à coupure réseau le 2026-06-05, paiement confirmé par capture d'écran Chariow"
                        rows={3}
                        className="w-full bg-slate-900/50 border border-slate-700 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none p-3 rounded-xl text-white text-sm"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting || !email || !planCode || !chariowReferenceId}
                    className="w-full bg-orange hover:bg-orange/90 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-full font-semibold transition-all"
                >
                    {submitting ? "Réconciliation en cours…" : "Réconcilier le paiement"}
                </button>
            </form>

            {result && (
                <div className={`rounded-2xl p-5 border flex items-start gap-3 ${
                    result.ok
                        ? 'bg-teal/10 border-teal/30'
                        : result.alreadyExists
                            ? 'bg-slate-700/30 border-slate-600'
                            : 'bg-red-500/10 border-red-500/30'
                }`}>
                    {result.ok ? (
                        <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="text-sm leading-relaxed">
                        <p className={result.ok ? 'text-teal-light' : 'text-red-200'}>{result.message}</p>
                        {result.ok && (
                            <div className="mt-2 text-xs text-slate-400 space-y-0.5">
                                <p>Transaction ID : <span className="font-mono text-white">{result.transactionId}</span></p>
                                {result.premiumUntil && (
                                    <p>Premium jusqu&apos;au : <span className="text-white">{new Date(result.premiumUntil).toLocaleString('fr-FR')}</span></p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
