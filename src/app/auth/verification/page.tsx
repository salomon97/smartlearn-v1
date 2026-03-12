"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Suspense } from "react";

function VerificationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (!email) {
            router.push("/auth/inscription");
        }
    }, [email, router]);

    const handleChange = (index: number, value: string) => {
        // N'accepter que les chiffres
        if (value && !/^\d+$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Passer au champ suivant s'il y a une valeur
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Gérer le retour arrière pour repasser au champ précédent
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text/plain").trim();

        // Si ça ressemble à un OTP à 6 chiffres
        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split("");
            setOtp(digits);
            inputRefs.current[5]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join("");

        if (code.length !== 6) {
            setError("Veuillez entrer les 6 chiffres du code.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Code invalide");
            }

            // Succès ! Redirection vers la connexion
            router.push("/auth/connexion?verified=true");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!email) return null; // Ne pas afficher la page si pas d'email dans l'URL (évite flash)

    return (
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 text-center">

            <div className="mb-6 inline-flex p-4 rounded-full bg-yellow-50 text-[var(--primary-gold)]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Vérifiez votre E-mail</h2>
            <p className="text-gray-500 mb-8 text-sm">
                Nous avons envoyé un code à 6 chiffres à <strong>{email}</strong>. Entrez-le ci-dessous.
            </p>

            {error && (
                <div className="mb-6 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="flex justify-between gap-2 mb-8">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => { inputRefs.current[index] = el; }}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            className="w-12 h-14 text-center text-2xl font-bold rounded-xl border border-gray-200 focus:border-[var(--primary-gold)] focus:ring-2 focus:ring-[var(--primary-gold)]/20 outline-none transition-all text-gray-900 bg-gray-50 focus:bg-white"
                        />
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={loading || otp.join("").length !== 6}
                    className="w-full py-4 rounded-xl bg-[var(--primary-dark)] text-white font-bold text-lg hover:bg-[var(--primary-dark)]/90 transition-all transform hover:-translate-y-1 shadow-lg shadow-[var(--primary-dark)]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {loading ? "Vérification..." : "Valider mon compte"}
                </button>
            </form>

            <p className="mt-8 text-center text-gray-400 text-sm">
                Pas reçu d'e-mail ? Vérifiez vos spams ou <Link href="/auth/inscription" className="text-[var(--primary-gold)] font-medium hover:underline">recommencez</Link>.
            </p>
        </div>
    );
}

export default function VerificationPage() {
    return (
        <div className="min-h-screen bg-[var(--background)] flex bg-opacity-95 items-center justify-center p-4">
            <Suspense fallback={<div className="text-white text-xl">Chargement...</div>}>
                <VerificationContent />
            </Suspense>
        </div>
    );
}
