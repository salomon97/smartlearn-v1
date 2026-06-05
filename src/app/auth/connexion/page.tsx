"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await signIn("credentials", {
                redirect: false,
                email: formData.email,
                password: formData.password,
            });

            if (res?.error) {
                setError(res.error);
                setLoading(false);
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err) {
            setError("Une erreur inattendue est survenue.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">

            {/* Décor : halo navy + teal en fond */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-navy/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal/10 rounded-full blur-3xl"></div>

            <div className="relative max-w-md w-full bg-white rounded-3xl shadow-xl shadow-navy/5 p-8 md:p-10 border border-slate-100">

                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" aria-label="SmartLearn — Accueil" className="inline-block mb-5">
                        <Logo variant="compact" theme="light" size={36} />
                    </Link>
                    <h1 className="font-heading text-2xl font-bold text-navy mb-1">Bon retour</h1>
                    <p className="text-slate-500 text-sm">Connectez-vous à votre espace SmartLearn.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            autoComplete="email"
                            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy placeholder:text-slate-400"
                            placeholder="vous@exemple.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Mot de passe
                            </label>
                            <Link
                                href="/auth/mot-de-passe-oublie"
                                className="text-xs font-medium text-teal hover:text-teal-dark transition-colors"
                            >
                                Oublié ?
                            </Link>
                        </div>
                        <input
                            type="password"
                            required
                            autoComplete="current-password"
                            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-navy placeholder:text-slate-400"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-full bg-orange hover:bg-orange/90 text-white font-semibold transition-all transform hover:-translate-y-0.5 shadow-lg shadow-orange/25 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {loading ? "Connexion…" : "Se connecter"}
                    </button>
                </form>

                <p className="mt-8 text-center text-slate-500 text-sm">
                    Pas encore de compte ?{" "}
                    <Link href="/auth/inscription" className="text-teal font-semibold hover:text-teal-dark transition-colors">
                        Créer un compte
                    </Link>
                </p>
            </div>
        </div>
    );
}
