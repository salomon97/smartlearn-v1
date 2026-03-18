import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import AffiliatesList from "./components/AffiliatesList";

export default async function AdminAffiliatesPage() {
    const session = await getServerSession(authOptions);
    await connectToDatabase();

    // Récupérer tous les affiliés
    const affiliatesRaw = await User.find({ role: 'affiliate' })
                               .sort({ createdAt: -1 })
                               .lean();
                               
    const affiliates = affiliatesRaw.map((a: any) => ({
        ...a, 
        _id: a._id.toString(),
        balance_available: a.balance_available || 0,
        balance_pending: a.balance_pending || 0
    }));

    // Calculs rapides
    const totalPending = affiliates.reduce((acc, curr) => acc + (curr.balance_pending || 0), 0);
    const totalAvailable = affiliates.reduce((acc, curr) => acc + (curr.balance_available || 0), 0);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Gestion des Ambassadeurs</h1>
                    <p className="text-gray-500 font-medium font-medium">Consultez les performances et gérez les taux de commission.</p>
                </div>
            </div>

            {/* KPIs Affiliés */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between h-32">
                    <div className="text-gray-400 text-xs font-black uppercase tracking-widest">Nombre d'Affiliés</div>
                    <div className="text-4xl font-black text-gray-900">{affiliates.length}</div>
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-gray-50 rounded-full opacity-50"></div>
                </div>
                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 shadow-sm relative overflow-hidden flex flex-col justify-between h-32">
                    <div className="text-amber-600/60 text-xs font-black uppercase tracking-widest">En Attente (72h)</div>
                    <div className="text-3xl font-black text-amber-600">{totalPending.toLocaleString()} <span className="text-sm">FCFA</span></div>
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-100/50 rounded-full opacity-50"></div>
                </div>
                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 shadow-sm relative overflow-hidden flex flex-col justify-between h-32">
                    <div className="text-emerald-600/60 text-xs font-black uppercase tracking-widest">Disponible (À Payer)</div>
                    <div className="text-3xl font-black text-emerald-600">{totalAvailable.toLocaleString()} <span className="text-sm">FCFA</span></div>
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-100/50 rounded-full opacity-50"></div>
                </div>
            </div>

            {/* Liste Interactive */}
            <AffiliatesList initialAffiliates={affiliates as any} />
        </div>
    );
}
