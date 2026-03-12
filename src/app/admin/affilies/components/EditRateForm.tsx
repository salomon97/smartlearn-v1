"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
            const res = await fetch("/api/admin/affiliates/rate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ affiliateId, newRate: rate })
            });

            if (res.ok) {
                setIsEditing(false);
                router.refresh();
            } else {
                const data = await res.json();
                alert(`Erreur: ${data.message}`);
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
            <div className="flex items-center justify-end gap-2">
                <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={rate} 
                    onChange={e => setRate(Number(e.target.value))} 
                    className="w-16 px-2 py-1 text-sm rounded border border-gray-300 outline-none focus:border-blue-500"
                />
                <span className="text-gray-500 text-sm">%</span>
                
                <button 
                    onClick={handleSave} 
                    disabled={loading}
                    className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1.5 rounded disabled:opacity-50"
                >
                    Ok
                </button>
                <button 
                    onClick={() => { setIsEditing(false); setRate(currentRate); }} 
                    disabled={loading}
                    className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1.5 rounded disabled:opacity-50"
                >
                    Annuler
                </button>
            </div>
        );
    }

    return (
        <button 
            type="button" 
            onClick={() => setIsEditing(true)}
            className="text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors border border-blue-100"
        >
            Modifier le Taux
        </button>
    );
}
