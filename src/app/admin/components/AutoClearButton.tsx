"use client";

import { useState } from "react";
import { Sparkles, Loader2, CheckCircle } from "lucide-react";

export default function AutoClearButton({ count }: { count: number }) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleClear = async () => {
        if (count === 0) return;
        
        setLoading(true);
        setStatus("idle");
        try {
            const res = await fetch("/api/admin/transactions/clear-auto", {
                method: "POST"
            });
            const data = await res.json();
            
            if (res.ok) {
                setStatus("success");
                setMessage(data.message);
                // Rafraîchir la page après 2 secondes pour voir les nouveaux chiffres
                setTimeout(() => window.location.reload(), 2000);
            } else {
                setStatus("error");
                alert(data.message || "Erreur lors du traitement");
            }
        } catch (error) {
            console.error(error);
            setStatus("error");
            alert("Erreur réseau");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4">
            <button
                onClick={handleClear}
                disabled={loading || count === 0 || status === "success"}
                className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-black transition-all shadow-lg ${
                    status === "success" 
                        ? "bg-emerald-500 text-white" 
                        : count > 0 
                            ? "bg-[var(--primary-dark)] text-white hover:scale-[1.02] active:scale-[0.98] shadow-brand-orange/20" 
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
            >
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : status === "success" ? (
                    <CheckCircle className="w-5 h-5" />
                ) : (
                    <Sparkles className="w-5 h-5" />
                )}
                
                {status === "success" 
                    ? "Commissions Libérées !" 
                    : count > 0 
                        ? `Libérer ${count} commission(s)` 
                        : "Tout est à jour"}
            </button>
            
            {status === "success" && (
                <p className="text-center text-xs font-bold text-emerald-600 mt-2 animate-in fade-in slide-in-from-top-1">
                    {message}
                </p>
            )}
        </div>
    );
}
