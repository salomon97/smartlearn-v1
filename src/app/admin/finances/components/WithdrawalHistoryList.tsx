"use client";

type Withdrawal = {
    _id: string;
    affiliateName: string;
    affiliateEmail: string;
    amount: number;
    paymentMethod: string;
    status: string;
    createdAt: string;
};

export default function WithdrawalHistoryList({ history }: { history: Withdrawal[] }) {
    if (history.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Historique des Paiements</h2>
                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-xl">
                    Aucun paiement n'a encore été effectué.
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Historique des Paiements</h2>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="pb-3 text-sm font-bold text-gray-500">Date</th>
                            <th className="pb-3 text-sm font-bold text-gray-500">Affilié</th>
                            <th className="pb-3 text-sm font-bold text-gray-500">Montant</th>
                            <th className="pb-3 text-sm font-bold text-gray-500">Méthode</th>
                            <th className="pb-3 text-sm font-bold text-gray-500">Statut</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {history.map((withdrawal) => (
                            <tr key={withdrawal._id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-4 text-sm text-gray-900">
                                    {new Date(withdrawal.createdAt).toLocaleDateString('fr-FR', {
                                        day: '2-digit', month: 'short', year: 'numeric',
                                        hour: '2-digit', minute:'2-digit'
                                    })}
                                </td>
                                <td className="py-4">
                                    <div className="font-bold text-gray-900 text-sm">{withdrawal.affiliateName}</div>
                                    <div className="text-xs text-gray-500">{withdrawal.affiliateEmail}</div>
                                </td>
                                <td className="py-4 font-black text-emerald-600 text-sm">{withdrawal.amount} FCFA</td>
                                <td className="py-4 text-sm text-gray-600">{withdrawal.paymentMethod}</td>
                                <td className="py-4">
                                    <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded-md text-xs">
                                        Payé
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
