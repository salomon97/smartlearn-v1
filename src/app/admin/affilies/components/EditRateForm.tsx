"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Save, X, Percent, Check } from "lucide-react";

export default function EditRateForm({ affiliateId, currentRate }: { affiliateId: string, currentRate: number }) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [rate, setRate] = useState(currentRate);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (rate < 0 || rate > 100) {
            alert("Le taux doit être compris entre 0 et 100.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/affilies/${affiliateId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ commission_rate: rate })
            });

            if (res.ok) {
                setIsEditing(false);
                router.refresh();
            } else {
                const data = await res.json();
                alert(`Erreur: ${data.error || "Une erreur est survenue"}`);
            }
        } catch (error) {
            console.error("Erreur réseau:", error);
            alert("Erreur de connexion");
        } finally {
            setLoading(false);
        }
    };


    if (isEditing) {
        return (
            <div className="flex items-center justify-end gap-2 animate-in slide-in-from-right-2 duration-200">
                <div className="relative">
                    <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        value={rate} 
                        onChange={e => setRate(Number(e.target.value))} 
                        className="w-20 pl-3 pr-7 py-2 text-sm font-bold rounded-xl border border-brand-orange outline-none bg-white text-gray-900"
                        autoFocus
                    />
                    <Percent className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                </div>
                
                <button 
                    onClick={handleSave} 
                    disabled={loading}
                    className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-sm transition-colors disabled:opacity-50"
                    title="Sauvegarder"
                >
                    <Check className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => { setIsEditing(false); setRate(currentRate); }} 
                    disabled={loading}
                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-xl transition-colors disabled:opacity-50"
                    title="Annuler"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <button 
                type="button" 
                onClick={() => setIsEditing(true)}
                className="text-xs font-bold text-gray-600 hover:text-brand-orange bg-white border border-gray-200 hover:border-brand-orange px-4 py-2 rounded-xl transition-all"
            >
                Ajuster Taux
            </button>
        </div>
    );
}
