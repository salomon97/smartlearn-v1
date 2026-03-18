"use client";

import { useState } from "react";

type WithdrawalRequest = {
    _id: string;
    affiliateName: string;
    affiliateEmail: string;
    amount: number;
    accountNumber: string;
};

export default function WithdrawalRequestsList({ initialRequests }: { initialRequests: WithdrawalRequest[] }) {
    const [requests, setRequests] = useState(initialRequests);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleAction = async (id: string, status: "paid" | "failed") => {
        const confirmMsg = status === "paid" 
            ? "Avez-vous bien envoyé l'argent via Mobile Money avant de confirmer ?"
            : "Voulez-vous vraiment rejeter cette demande ? L'argent sera rendu au solde de l'affilié.";
        
        if (!confirm(confirmMsg)) return;
        
        setLoadingId(id);
        try {
            const res = await fetch("/api/admin/withdrawals", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ withdrawalId: id, status })
            });

            if (res.ok) {
                setRequests(prev => prev.filter(r => r._id !== id));
            } else {
                const data = await res.json();
                alert(`Erreur: ${data.error || data.message}`);
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
                <span className="bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-full text-sm">
                    {requests.length} en attente
                </span>
            </div>

            {requests.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-xl">
                    Aucune nouvelle demande de retrait.
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map(request => (
                        <div key={request._id} className="border border-amber-200 bg-amber-50/50 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <div className="font-bold text-gray-900">{request.affiliateName}</div>
                                <div className="text-xs text-gray-600 font-mono mb-2">{request.affiliateEmail}</div>
                                <div className="inline-block bg-white px-2 py-1 rounded border border-amber-100 text-xs font-black text-amber-700">
                                    Numéro : {request.accountNumber}
                                </div>
                                <div className="text-sm font-black text-amber-600 mt-2">Montant : {request.amount.toLocaleString()} FCFA</div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button 
                                    onClick={() => handleAction(request._id, "failed")}
                                    disabled={loadingId === request._id}
                                    className="flex-1 sm:flex-none border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 font-bold py-2 px-4 rounded-lg transition-colors text-xs"
                                >
                                    Rejeter
                                </button>
                                <button 
                                    onClick={() => handleAction(request._id, "paid")}
                                    disabled={loadingId === request._id}
                                    className="flex-2 sm:flex-none bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition-colors text-xs shadow-sm"
                                >
                                    {loadingId === request._id ? "En cours..." : "Marquer comme payé"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <div className="mt-6 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                <strong>Rappel sécurité :</strong> Effectuez TOUJOURS le transfert Mobile Money réel avant de marquer comme payé. Pensez à vérifier le numéro affiché.
            </div>
        </div>
    );
}
