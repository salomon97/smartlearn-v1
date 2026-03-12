"use client";

import { useState } from "react";

type Affiliate = {
    _id: string;
    name: string;
    email: string;
    balance_available: number;
};

export default function WithdrawalRequestsList({ initialAffiliates }: { initialAffiliates: Affiliate[] }) {
    const [affiliates, setAffiliates] = useState(initialAffiliates);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleMarkAsPaid = async (id: string) => {
        if (!confirm("Avez-vous bien envoyé l'argent via Mobile Money avant de confirmer ?")) return;
        
        setLoadingId(id);
        try {
            const res = await fetch("/api/admin/affiliates/pay", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ affiliateId: id })
            });

            if (res.ok) {
                // Retirer l'affilié de la vue courante (puisqu'il retombe à 0)
                setAffiliates(prev => prev.filter(a => a._id !== id));
            } else {
                const data = await res.json();
                alert(`Erreur: ${data.message}`);
            }
        } catch (error) {
            console.error("Erreur réseau:", error);
            alert("Une erreur de connexion est survenue.");
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Demandes de Retrait</h2>
                <span className="bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full text-sm">
                    {affiliates.length} éligible(s)
                </span>
            </div>

            {affiliates.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-xl">
                    Aucun affilié n'a atteint le seuil de 1000 FCFA dispo.
                </div>
            ) : (
                <div className="space-y-4">
                    {affiliates.map(affiliate => (
                        <div key={affiliate._id} className="border border-emerald-200 bg-emerald-50 p-4 rounded-xl flex justify-between items-center">
                            <div>
                                <div className="font-bold text-gray-900">{affiliate.name}</div>
                                <div className="text-xs text-gray-600 mt-1">{affiliate.email}</div>
                                <div className="text-sm font-black text-emerald-600 mt-1">Dispo: {affiliate.balance_available} FCFA</div>
                            </div>
                            <button 
                                onClick={() => handleMarkAsPaid(affiliate._id)}
                                disabled={loadingId === affiliate._id}
                                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                            >
                                {loadingId === affiliate._id ? "En cours..." : "Marquer comme payé"}
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            <div className="mt-6 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <strong>Rappel :</strong> Les paiements réels doivent être effectués manuellement via votre téléphone (Mobile Money) avant de cliquer sur "Marquer comme payé".
            </div>
        </div>
    );
}
