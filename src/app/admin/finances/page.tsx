import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import WithdrawalHistory from "@/models/WithdrawalHistory";
import PendingValidationsList from "./components/PendingValidationsList";
import WithdrawalRequestsList from "./components/WithdrawalRequestsList";
import WithdrawalHistoryList from "./components/WithdrawalHistoryList";

export default async function AdminFinancesPage() {
    const session = await getServerSession(authOptions);
    await connectToDatabase();

    // 1. Transactions globales pour les statistiques
    const allTransactions = await Transaction.find().sort({ createdAt: -1 }).lean();
    
    // Calcul des Stats
    const totalTransactionsAmount = allTransactions
        .filter(t => t.status === 'cleared')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalPendingAmount = allTransactions
        .filter(t => t.status === 'pending')
        .reduce((sum, t) => sum + t.amount, 0);

    // 2. Identifier les transactions qui ont dépassé le délai de 72h mais sont toujours "pending"
    const now = new Date();
    const readyToClear = allTransactions.filter(t => t.status === 'pending' && new Date(t.clearingDate) <= now)
                                     .map(t => ({...t, _id: t._id.toString()}));
    
    // 3. Demandes de retrait
    const eligibleAffiliatesRaw = await User.find({ role: 'affiliate', balance_available: { $gte: 1000 } }).lean();
    const eligibleAffiliates = eligibleAffiliatesRaw.map((a: any) => ({...a, _id: a._id.toString()}));

    // 4. Historique des paiements affiliés
    const allWithdrawalsRaw = await WithdrawalHistory.find().sort({ createdAt: -1 }).lean();
    const allWithdrawals = allWithdrawalsRaw.map((w: any) => ({...w, _id: w._id.toString(), createdAt: w.createdAt.toISOString()}));
    
    const totalPaidToAffiliates = allWithdrawals.reduce((sum, w) => sum + w.amount, 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Finances & Retraits</h1>
                <p className="text-gray-500">Gérez les validations Chariow (72h) et les paiements aux affiliés.</p>
            </div>

            {/* Statistiques Globales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border text-left p-6 rounded-3xl shadow-sm">
                    <h3 className="text-sm font-bold text-gray-500 mb-1">Encaissements Globaux</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-gray-900">{totalTransactionsAmount.toLocaleString('fr-FR')}</span>
                        <span className="text-gray-500 mb-1 font-bold">FCFA</span>
                    </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 text-left p-6 rounded-3xl shadow-sm">
                    <h3 className="text-sm font-bold text-amber-700 mb-1">En attente Chariow</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-amber-600">{totalPendingAmount.toLocaleString('fr-FR')}</span>
                        <span className="text-amber-500 mb-1 font-bold">FCFA</span>
                    </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 text-left p-6 rounded-3xl shadow-sm">
                    <h3 className="text-sm font-bold text-emerald-700 mb-1">Payé aux Affiliés</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-emerald-600">{totalPaidToAffiliates.toLocaleString('fr-FR')}</span>
                        <span className="text-emerald-500 mb-1 font-bold">FCFA</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bloc 1 : Validation des Transactions Chariow (72h) - Client Component */}
                <PendingValidationsList initialTransactions={readyToClear} />

                {/* Bloc 2 : Demandes de Retrait Affiliés - Client Component */}
                <WithdrawalRequestsList initialAffiliates={eligibleAffiliates} />
            </div>

            {/* Bloc 3 : Historique Complet */}
            <WithdrawalHistoryList history={allWithdrawals} />
        </div>
    );
}
