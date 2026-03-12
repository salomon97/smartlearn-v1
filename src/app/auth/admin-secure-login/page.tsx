"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ShieldCheck } from "lucide-react";

export default function AdminSecureLogin() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 selection:bg-brand-orange/20">
            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
                
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block transition-transform hover:scale-105">
                        <span className="text-2xl font-black tracking-tight text-gray-900">
                            Smart<span className="text-brand-orange">Learn</span>
                        </span>
                    </Link>
                    <div className="mt-4 flex justify-center">
                        <div className="bg-orange-100 p-3 rounded-full">
                            <ShieldCheck className="w-8 h-8 text-brand-orange" />
                        </div>
                    </div>
                    <h1 className="mt-4 text-2xl font-bold text-gray-900">Accès Sécurisé</h1>
                    <p className="text-gray-500 mt-2 text-sm">Zone réservée à l'administration du site.</p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
                    
                    {status === "success" ? (
                        <div className="text-center py-6 animate-in slide-in-from-right-4">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Vérifiez vos e-mails</h2>
                            <p className="text-gray-500 mb-6">
                                Un lien de connexion sécurisé a été envoyé à <strong>{email}</strong> si cette adresse correspond à un compte administrateur actif.
                            </p>
                            <p className="text-xs text-gray-400 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                Le lien expirera dans 15 minutes. N'oubliez pas de vérifier vos spams.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                                    Adresse e-mail administrateur
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-brand-orange focus:border-brand-orange transition-colors bg-gray-50 focus:bg-white outline-none text-gray-900"
                                        placeholder="admin@smartlearn-edu.org"
                                    />
                                </div>
                            </div>

                            {status === "error" && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 animate-in pulse">
                                    Une erreur est survenue lors de l'envoi du lien. Veuillez réessayer plus tard.
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-brand-orange/20 text-sm font-bold text-white bg-brand-orange hover:bg-brand-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange transition-all disabled:opacity-70 group"
                            >
                                {status === "loading" ? (
                                    "Génération..."
                                ) : (
                                    <>
                                        {"Recevoir mon lien magique"}
                                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                            
                            <p className="text-center text-xs text-gray-400 mt-6">
                                Par mesure de sécurité ultime, l'accès administrateur ne requiert aucun mot de passe.
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
