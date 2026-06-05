"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function AdminSecureLogin() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus("loading");

        try {
            const res = await fetch("/api/auth/admin/request-link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            if (res.ok) {
                setStatus("success");
            } else {
                setStatus("error");
            }
        } catch (error) {
            console.error(error);
            setStatus("error");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">

            {/* Décor : halos */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-navy/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange/10 rounded-full blur-3xl"></div>

            <div className="w-full max-w-md relative">

                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <Link href="/" aria-label="SmartLearn — Accueil" className="inline-block mb-5">
                        <Logo variant="compact" theme="light" size={36} />
                    </Link>
                    <div className="flex justify-center mb-4">
                        <div className="bg-orange/10 border border-orange/20 p-3 rounded-full">
                            <ShieldCheck className="w-7 h-7 text-orange" />
                        </div>
                    </div>
                    <h1 className="font-heading text-2xl font-bold text-navy mb-1">Accès sécurisé</h1>
                    <p className="text-slate-500 text-sm">Zone réservée à l&apos;administration de la plateforme.</p>
                </div>

                {/* Carte */}
                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-navy/5 border border-slate-100">

                    {status === "success" ? (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-teal/15 text-teal rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8" />
                            </div>
                            <h2 className="font-heading text-xl font-bold text-navy mb-2">Vérifiez vos e-mails</h2>
                            <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                                Un lien de connexion sécurisé a été envoyé à{" "}
                                <strong className="text-navy break-all">{email}</strong> si cette adresse
                                correspond à un compte administrateur actif.
                            </p>
                            <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                Le lien expirera dans <strong>15 minutes</strong>. N&apos;oubliez pas de vérifier vos spams.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2"
                                >
                                    Adresse e-mail administrateur
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal/20 focus:border-teal transition-colors bg-slate-50 focus:bg-white outline-none text-navy placeholder:text-slate-400"
                                        placeholder="admin@smartlearn-edu.org"
                                    />
                                </div>
                            </div>

                            {status === "error" && (
                                <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
                                    Une erreur est survenue lors de l&apos;envoi du lien. Veuillez réessayer plus tard.
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className="w-full flex justify-center items-center py-3.5 px-4 rounded-full shadow-lg shadow-orange/25 text-sm font-semibold text-white bg-orange hover:bg-orange/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed group"
                            >
                                {status === "loading" ? (
                                    "Génération…"
                                ) : (
                                    <>
                                        Recevoir mon lien magique
                                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            <p className="text-center text-xs text-slate-400 mt-4 leading-relaxed">
                                Par mesure de sécurité, l&apos;accès administrateur ne requiert aucun mot de passe.<br />
                                Un lien à usage unique est généré pour chaque connexion.
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
