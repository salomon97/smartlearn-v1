"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoveLeft, Mail, KeyRound, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const router = useRouter();

    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccessMessage("Un code de vérification à 6 chiffres a été envoyé à votre email.");
                setStep(2);
            } else {
                setError(data.message || "Une erreur s'est produite.");
            }
        } catch (err) {
            setError("Erreur de connexion au serveur.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        if (newPassword.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccessMessage("Votre mot de passe a été réinitialisé avec succès !");
                setTimeout(() => {
                    router.push("/auth/connexion");
                }, 2000);
            } else {
                setError(data.message || "Code OTP invalide ou expiré.");
            }
        } catch (err) {
            setError("Erreur de connexion au serveur.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--primary-dark)] flex flex-col justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[var(--primary-gold)]/5 blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[120px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md mx-auto px-6">
                {/* Logo & Back button */}
                <div className="mb-10 text-center relative">
                    <Link href="/auth/connexion" className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                        <MoveLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium hidden sm:block">Retour</span>
                    </Link>
                    <Link href="/" className="inline-block">
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Smart<span className="text-[var(--primary-gold)]">Learn</span>
                        </h1>
                    </Link>
                </div>

                {/* Main Card */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">Mot de passe oublié ?</h2>
                        <p className="text-slate-400 text-sm">
                            {step === 1
                                ? "Entrez votre email pour recevoir un code de réinitialisation sécurisé."
                                : "Entrez le code reçu et définissez votre nouveau mot de passe."}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center">
                            {successMessage}
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleRequestOTP} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="email" className="text-sm font-bold text-white ml-1">Adresse E-mail</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white font-medium placeholder-slate-500 focus:ring-2 focus:ring-[var(--primary-gold)] focus:border-transparent transition-all outline-none"
                                            placeholder="vous@exemple.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !email}
                                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-[var(--primary-dark)] bg-[var(--primary-gold)] hover:bg-[var(--primary-gold-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-[var(--primary-gold)] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Envoyer le code <ArrowRight className="ml-2 w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-6 animate-in slide-in-from-right-4">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="otp" className="text-sm font-bold text-white ml-1">Code de Vérification (6 chiffres)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                            <ShieldCheck className="h-5 w-5" />
                                        </div>
                                        <input
                                            id="otp"
                                            type="text"
                                            required
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            className="block w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-[var(--primary-gold)] focus:border-transparent transition-all outline-none tracking-[0.5em] text-center font-bold"
                                            placeholder="000000"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="newPassword" className="text-sm font-bold text-white ml-1">Nouveau mot de passe</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                            <KeyRound className="h-5 w-5" />
                                        </div>
                                        <input
                                            id="newPassword"
                                            type="password"
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="block w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-[var(--primary-gold)] focus:border-transparent transition-all outline-none"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="confirmPassword" className="text-sm font-bold text-white ml-1">Confirmer mot de passe</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                            <KeyRound className="h-5 w-5" />
                                        </div>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="block w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-[var(--primary-gold)] focus:border-transparent transition-all outline-none"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || otp.length !== 6 || !newPassword || !confirmPassword}
                                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-[var(--primary-dark)] bg-[var(--primary-gold)] hover:bg-[var(--primary-gold-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-[var(--primary-gold)] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "Réinitialiser le mot de passe"
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
