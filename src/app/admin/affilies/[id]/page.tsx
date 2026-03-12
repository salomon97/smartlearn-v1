import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import WithdrawalHistory from "@/models/WithdrawalHistory";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, CreditCard, Banknote } from "lucide-react";
import EditRateForm from "../components/EditRateForm";

export default async function AffiliateDetailsPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    
    // Vérification admin stricte
    if (!session || !session.user || session.user.role !== 'admin') {
        redirect('/');
    }

    await connectToDatabase();

    // 1. Récupérer l'affilié
    const affiliate = await User.findById(params.id).lean();
    if (!affiliate || affiliate.role !== 'affiliate') {
        redirect('/admin/affilies');
    }

    // 2. Récupérer les filleuls (élèves inscrits via ce code promo)
    // Note: Pour l'instant on se base sur `referredBy` si ça existe dans ton User model.
    // S'il n'y est pas, on s'assure qu'il l'est pour l'avenir.
    const referralsRaw = await User.find({ referredBy: params.id }).sort({ createdAt: -1 }).lean();
    const referrals = referralsRaw.map((r: any) => ({...r, _id: r._id.toString()}));

    // 3. Récupérer les transactions (ventes) liées à cet affilié
    const transactionsRaw = await Transaction.find({ parrainId: params.id }).sort({ createdAt: -1 }).lean();
    const transactions = transactionsRaw.map((t: any) => ({...t, _id: t._id.toString()}));

    // 4. Récupérer l'historique de ses paiements (retraits)
    const withdrawalsRaw = await WithdrawalHistory.find({ affiliateId: params.id }).sort({ createdAt: -1 }).lean();
    const withdrawals = withdrawalsRaw.map((w: any) => ({...w, _id: w._id.toString()}));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* En-tête avec bouton retour */}
            <div className="flex items-center gap-4">
                <Link 
                    href="/admin/affilies" 
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">{affiliate.name}</h1>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-500">{affiliate.email}</span>
                        <span className="bg-slate-100 text-slate-700 font-mono font-bold px-2 py-0.5 rounded tracking-wider border border-slate-200">
                            Code: {affiliate.codeAffiliation || '-'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Statistiques & Actions de l'Affilié */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Solde Dispo */}
                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium mb-1">
                        <Banknote className="w-4 h-4" /> Solde Disponible
                    </div>
                    <div className="text-3xl font-black text-emerald-600">
                        {affiliate.balance_available || 0} <span className="text-base text-emerald-600/50">FCFA</span>
                    </div>
                </div>

                {/* En attente 72h */}
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-2 text-amber-700 text-sm font-medium mb-1">
                        <Banknote className="w-4 h-4" /> En Attente (72h)
                    </div>
                    <div className="text-3xl font-black text-amber-600">
                        {affiliate.balance_pending || 0} <span className="text-base text-amber-600/50">FCFA</span>
                    </div>
                </div>

                {/* Nombre de Filleuls */}
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-2 text-blue-700 text-sm font-medium mb-1">
                        <Users className="w-4 h-4" /> Élèves Référés
                    </div>
                    <div className="text-3xl font-black text-blue-600">{referrals.length}</div>
                </div>

                {/* Taux de Commission (Action) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="text-gray-500 text-sm font-medium mb-1">Taux de Commission</div>
                        <div className="text-3xl font-black text-gray-900">
                            <span className="text-brand-orange">{affiliate.commission_rate || 10}%</span>
                        </div>
                    </div>
                    <div className="mt-3">
                        <EditRateForm affiliateId={affiliate._id.toString()} currentRate={affiliate.commission_rate || 10} />
                    </div>
                </div>

            </div>

            {/* Grille des Listes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Historique des Ventes (Transactions) */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <h2 className="text-xl font-bold text-gray-900">Ventes Générées</h2>
                    </div>
                    
                    {transactions.length === 0 ? (
                        <div className="text-center py-8 border border-dashed text-gray-500 border-gray-200 rounded-xl">
                            Aucune vente générée pour le moment.
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                            {transactions.map((t: any) => (
                                <div key={t._id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        t.status === 'cleared' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                    }`}>
                                        <Banknote className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">Vente de Formation</p>
                                        <p className="text-xs text-gray-500">
                                            {t.status === 'cleared' ? 'Payée le' : 'En attente depuis le'} {new Date(t.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-bold ${
                                            t.status === 'cleared' ? 'text-emerald-600' : 'text-amber-600'
                                        }`}>+{t.commission} FCFA</p>
                                        <p className="text-xs text-gray-500">Total payé: {t.amount} F</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Historique des Retraits (Paiements) */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <Banknote className="w-5 h-5 text-emerald-500" />
                        <h2 className="text-xl font-bold text-gray-900">Historique des Paiements reçus</h2>
                    </div>

                    {withdrawals.length === 0 ? (
                        <div className="text-center py-8 border border-dashed text-gray-500 border-gray-200 rounded-xl">
                            Aucun paiement effectué à cet ambassadeur.
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                            {withdrawals.map((w: any) => (
                                <div key={w._id} className="flex items-center justify-between p-4 rounded-xl border border-emerald-100 bg-emerald-50/50">
                                    <div>
                                        <p className="text-sm font-bold text-emerald-900">{w.amount} FCFA Payés</p>
                                        <p className="text-xs text-emerald-600/70">
                                            via {w.paymentMethod} le {new Date(w.createdAt).toLocaleDateString('fr-FR', {
                                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div className="bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded text-xs">
                                        Succès
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
