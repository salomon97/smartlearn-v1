"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { classesDisponibles } from "@/lib/constants";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "student",
        grade_level: classesDisponibles[0]
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Validation en temps réel simple
    const isPasswordValid = formData.password.length >= 8;
    const isConfirmPasswordValid = formData.password === formData.confirmPassword;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!isEmailValid) {
            setError("L'adresse e-mail est invalide.");
            return;
        }

        if (!isPasswordValid) {
            setError("Le mot de passe doit faire au moins 8 caractères.");
            return;
        }

        if (!isConfirmPasswordValid) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Une erreur est survenue");
            }

            // Redirection vers la page de vérification OTP
            router.push(`/auth/verification?email=${encodeURIComponent(formData.email)}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] flex bg-opacity-95 items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block text-3xl font-extrabold mb-2 text-gray-900">
                        Smart<span className="text-[var(--primary-gold)]">Learn</span>
                    </Link>
                    <p className="text-gray-500 font-medium">Rejoignez l'élite scolaire</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 animate-pulse">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nom Complet</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary-gold)] focus:ring-2 focus:ring-[var(--primary-gold)]/20 outline-none transition-all text-gray-900"
                            placeholder="Ex: Isabelle OBONO"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Vous êtes ?</label>
                        <div className="flex gap-4">
                            <label className={`flex-1 cursor-pointer rounded-xl border-2 p-3 text-center transition-all ${formData.role === 'student' ? 'border-[var(--primary-gold)] bg-yellow-50 text-[var(--primary-dark)] font-bold' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                                <input type="radio" name="role" className="hidden" checked={formData.role === 'student'} onChange={() => setFormData({ ...formData, role: 'student' })} />
                                🎓 Élève
                            </label>
                            <label className={`flex-1 cursor-pointer rounded-xl border-2 p-3 text-center transition-all ${formData.role === 'affiliate' ? 'border-[var(--primary-gold)] bg-yellow-50 text-[var(--primary-dark)] font-bold' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                                <input type="radio" name="role" className="hidden" checked={formData.role === 'affiliate'} onChange={() => setFormData({ ...formData, role: 'affiliate' })} />
                                💸 Ambassadeur
                            </label>
                        </div>
                    </div>

                    {formData.role === "student" && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Classe</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary-gold)] focus:ring-2 focus:ring-[var(--primary-gold)]/20 outline-none transition-all bg-white text-gray-900"
                                value={formData.grade_level}
                                onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                            >
                                {classesDisponibles.map(classe => (
                                    <option key={classe} value={classe}>{classe}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">E-mail</label>
                        <input
                            type="email"
                            required
                            className={`w-full px-4 py-3 rounded-xl border ${formData.email && !isEmailValid ? 'border-red-300' : 'border-gray-200'} focus:border-[var(--primary-gold)] focus:ring-2 focus:ring-[var(--primary-gold)]/20 outline-none transition-all text-gray-900`}
                            placeholder="eleve@ecole.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Mot de passe</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className={`w-full px-4 py-3 rounded-xl border ${formData.password && !isPasswordValid ? 'border-red-300' : 'border-gray-200'} focus:border-[var(--primary-gold)] focus:ring-2 focus:ring-[var(--primary-gold)]/20 outline-none transition-all text-gray-900 pr-12`}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {formData.password && !isPasswordValid && (
                            <p className="text-xs text-red-500 mt-1">Au moins 8 caractères requis.</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Confirmez le mot de passe</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className={`w-full px-4 py-3 rounded-xl border ${formData.confirmPassword && !isConfirmPasswordValid ? 'border-red-300' : 'border-gray-200'} focus:border-[var(--primary-gold)] focus:ring-2 focus:ring-[var(--primary-gold)]/20 outline-none transition-all text-gray-900 pr-12`}
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                        </div>
                        {formData.confirmPassword && !isConfirmPasswordValid && (
                            <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas.</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid}
                        className="w-full py-4 rounded-xl bg-[var(--primary-dark)] text-white font-bold text-lg hover:bg-[var(--primary-dark)]/90 transition-all transform hover:-translate-y-1 shadow-lg shadow-[var(--primary-dark)]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {loading ? "Création en cours..." : "Créer mon compte VIP"}
                    </button>
                </form>

                <p className="mt-8 text-center text-gray-500 text-sm font-medium">
                    Déjà membre ? <Link href="/auth/connexion" className="text-[var(--primary-gold-hover)] hover:underline">Se connecter</Link>
                </p>
            </div>
        </div>
    );
}
