"use client";

import { useState } from "react";

type Transaction = {
    _id: string;
    amount: number;
    createdAt: string;
    parrainId?: string;
    commission: number;
};

export default function PendingValidationsList({ initialTransactions }: { initialTransactions: Transaction[] }) {
    const [transactions, setTransactions] = useState(initialTransactions);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleClearTransaction = async (id: string) => {
        setLoadingId(id);
        try {
            const res = await fetch("/api/admin/transactions/clear", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transactionId: id })
            });

            if (res.ok) {
                // Retirer la transaction de la liste affichée
                setTransactions(prev => prev.filter(t => t._id !== id));
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
                <h2 className="text-xl font-bold text-gray-900">Validations en attente (72h)</h2>
                <span className="bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-full text-sm">
                    {transactions.length} action(s) requise(s)
                </span>
            </div>

            {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-xl">
                    Aucune transaction à valider pour le moment.
                </div>
            ) : (
                <div className="space-y-4">
                    {transactions.map(t => (
                        <div key={t._id} className="border border-amber-200 bg-amber-50 p-4 rounded-xl flex justify-between items-center">
                            <div>
                                <div className="font-bold text-gray-900">{t.amount} FCFA</div>
                                <div className="text-xs text-gray-500 mt-1">Payé le: {new Date(t.createdAt).toLocaleDateString()}</div>
                                {t.parrainId && <div className="text-xs text-amber-600 mt-1"> Commission liée: {t.commission} FCFA</div>}
                            </div>
                            <button 
                                onClick={() => handleClearTransaction(t._id)}
                                disabled={loadingId === t._id}
                                className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                            >
                                {loadingId === t._id ? "En cours..." : "Libérer les fonds"}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
