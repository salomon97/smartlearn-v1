import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import EditRateForm from "./components/EditRateForm";
import Link from "next/link";

export default async function AdminAffiliatesPage() {
    const session = await getServerSession(authOptions);
    await connectToDatabase();

    // Récupérer tous les affiliés
    const affiliatesRaw = await User.find({ role: 'affiliate' })
                               .sort({ createdAt: -1 })
                               .lean();
                               
    const affiliates = affiliatesRaw.map((a: any) => ({...a, _id: a._id.toString()}));

    // Calculs rapides
    const totalPending = affiliates.reduce((acc, curr) => acc + (curr.balance_pending || 0), 0);
    const totalAvailable = affiliates.reduce((acc, curr) => acc + (curr.balance_available || 0), 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Ambassadeurs</h1>
                <p className="text-gray-500">Consultez les performances de vos affiliés et ajustez leurs taux de commission.</p>
            </div>

            {/* KPIs Affiliés */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="text-gray-500 text-sm font-medium mb-1">Nombre d'Affiliés</div>
                    <div className="text-3xl font-black text-gray-900">{affiliates.length}</div>
                </div>
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden">
                    <div className="text-amber-700 text-sm font-medium mb-1">Total En Attente (72h)</div>
                    <div className="text-3xl font-black text-amber-600">{totalPending} <span className="text-base text-amber-600/50">FCFA</span></div>
                </div>
                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden">
                    <div className="text-emerald-700 text-sm font-medium mb-1">Total Disponible (À Payer)</div>
                    <div className="text-3xl font-black text-emerald-600">{totalAvailable} <span className="text-base text-emerald-600/50">FCFA</span></div>
                </div>
            </div>

            {/* Liste des Affiliés */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Liste des Ambassadeurs</h2>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 text-gray-500 text-sm">
                                <th className="pb-3 font-medium">Nom / E-mail</th>
                                <th className="pb-3 font-medium">Code Promo</th>
                                <th className="pb-3 font-medium">Taux Actuel</th>
                                <th className="pb-3 font-medium">Solde (Dispo / Attente)</th>
                                <th className="pb-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {affiliates.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-400 font-medium">
                                        Aucun ambassadeur inscrit pour le moment.
                                    </td>
                                </tr>
                            ) : affiliates.map(affiliate => (
                                <tr key={affiliate._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="py-4">
                                        <div className="font-bold text-gray-900">{affiliate.name}</div>
                                        <div className="text-xs text-gray-500">{affiliate.email}</div>
                                    </td>
                                    <td className="py-4">
                                        <span className="bg-slate-100 text-slate-700 font-mono font-bold px-3 py-1 rounded text-sm tracking-wider border border-slate-200">
                                            {affiliate.codeAffiliation || '-'}
                                        </span>
                                    </td>
                                    <td className="py-4">
                                        <span className="bg-brand-orange/10 text-brand-orange font-bold px-3 py-1 rounded-full text-sm">
                                            {affiliate.commission_rate || 10}%
                                        </span>
                                    </td>
                                    <td className="py-4">
                                        <div className="text-sm font-black text-emerald-600">{affiliate.balance_available || 0} F</div>
                                        <div className="text-xs font-semibold text-amber-500 mt-0.5">+{affiliate.balance_pending || 0} F (72h)</div>
                                    </td>
                                    <td className="py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link 
                                                href={`/admin/affilies/${affiliate._id}`}
                                                className="text-sm font-bold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:border-gray-300 px-4 py-2 rounded-lg shadow-sm transition-all"
                                            >
                                                Voir Détails
                                            </Link>
                                            <EditRateForm affiliateId={affiliate._id} currentRate={affiliate.commission_rate || 10} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
