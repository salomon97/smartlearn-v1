"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
                router.refresh(); // Forcer le rafraichissement de la session globale
            }
        } catch (err) {
            setError("Une erreur inattendue est survenue.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] flex bg-opacity-95 items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-[var(--primary-gold)]/10">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block text-3xl font-extrabold mb-2 text-gray-900">
                        Smart<span className="text-[var(--primary-gold)]">Learn</span>
                    </Link>
                    <p className="text-gray-500 font-medium">Accédez à votre espace</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 animate-pulse">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">E-mail</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:border-[var(--primary-gold)] focus:ring-2 focus:ring-[var(--primary-gold)]/20 outline-none transition-all text-gray-900"
                            placeholder="eleve@smartlearn.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-bold text-gray-700">Mot de passe</label>
                            <Link href="/auth/mot-de-passe-oublie" className="text-sm font-medium text-[var(--primary-dark)] hover:text-[var(--primary-gold-hover)] hover:underline transition-colors">
                                Oublié ?
                            </Link>
                        </div>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:border-[var(--primary-gold)] focus:ring-2 focus:ring-[var(--primary-gold)]/20 outline-none transition-all text-gray-900"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-xl bg-[var(--primary-gold)] text-[var(--primary-dark)] font-bold text-lg hover:bg-[var(--primary-gold-hover)] transition-all transform hover:-translate-y-1 shadow-lg shadow-[var(--primary-gold)]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {loading ? "Connexion..." : "Se Connecter"}
                    </button>
                </form>

                <p className="mt-8 text-center text-gray-500 text-sm font-medium">
                    Nouveau ? <Link href="/auth/inscription" className="text-[var(--primary-dark)] hover:underline hover:text-[var(--primary-gold-hover)] transition-colors">Créer un compte</Link>
                </p>
            </div>
        </div>
    );
}
