import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import Course from "@/models/Course";
import WithdrawalHistory from "@/models/WithdrawalHistory";
import { Users, GraduationCap, Handshake, Star, BookOpen, AlertCircle, TrendingUp, CreditCard, Wallet, Sparkles } from "lucide-react";
import AutoClearButton from "./components/AutoClearButton";

export default async function AdminDashboardPage() {
    const session = await getServerSession(authOptions);
    await connectToDatabase();

    const now = new Date();

    // Statistiques Utilisateurs
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAffiliates = await User.countDocuments({ role: 'affiliate' });
    const totalVIPs = await User.countDocuments({ isPremium: true });

    // Statistiques Contenu
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ isPublished: true });

    // Statistiques Financières
    const transactions = await Transaction.find({ status: { $ne: 'failed' } });
    const totalRevenue = transactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalCommissions = transactions.reduce((acc, curr) => acc + (curr.commission || 0), 0);
    const netProfit = totalRevenue - totalCommissions;

    // Transactions prêtes à être libérées (Automatic Clearing)
    const clearableTransactions = await Transaction.countDocuments({
        status: 'pending',
        clearingDate: { $lte: now }
    });

    // Retraits
    const pendingWithdrawals = await WithdrawalHistory.countDocuments({ status: 'pending' });
    const totalWithdrawalsPaid = await WithdrawalHistory.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const paidAmount = totalWithdrawalsPaid[0]?.total || 0;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Vue Globale</h1>
                    <p className="text-gray-500 font-medium">Bon retour, <span className="text-brand-orange font-bold">{session?.user?.name}</span>. Voici l'état actuel de SmartLearn.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Données en temps réel</span>
                </div>
            </div>

            {/* Cartes KPI Financières (Cards 2.0) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
                    <TrendingUp className="w-6 h-6 text-blue-500 mb-4 relative z-10" />
                    <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1 relative z-10">Chiffre d'Affaires Brut</h3>
                    <div className="text-4xl font-black text-gray-900 relative z-10">
                        {totalRevenue.toLocaleString('fr-FR')} <span className="text-lg text-gray-300">F</span>
                    </div>
                </div>
                
                <div className="bg-amber-50 border border-amber-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-100 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
                    <Handshake className="w-6 h-6 text-amber-600 mb-4 relative z-10" />
                    <h3 className="text-amber-700/60 text-xs font-black uppercase tracking-widest mb-1 relative z-10">Commissions Affiliés</h3>
                    <div className="text-4xl font-black text-amber-600 relative z-10">
                        {totalCommissions.toLocaleString('fr-FR')} <span className="text-lg text-amber-400">F</span>
                    </div>
                </div>
                
                <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-100 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
                    <Wallet className="w-6 h-6 text-emerald-600 mb-4 relative z-10" />
                    <h3 className="text-emerald-700/60 text-xs font-black uppercase tracking-widest mb-1 relative z-10">Bénéfice Net Estimé</h3>
                    <div className="text-4xl font-black text-emerald-600 relative z-10">
                        {netProfit.toLocaleString('fr-FR')} <span className="text-lg text-emerald-400">F</span>
                    </div>
                </div>
            </div>

            {/* Section Communauté & Contenu */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-brand-orange transition-colors">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Inscrits</div>
                        <div className="text-xl font-black text-gray-900">{totalUsers}</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-brand-orange transition-colors">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Élèves</div>
                        <div className="text-xl font-black text-gray-900">{totalStudents}</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-brand-orange transition-colors">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Formations</div>
                        <div className="text-xl font-black text-gray-900">{totalCourses} <span className="text-xs font-medium text-gray-400">({publishedCourses} pub.)</span></div>
                    </div>
                </div>

                <div className="bg-brand-orange p-6 rounded-3xl border border-brand-orange shadow-lg shadow-brand-orange/20 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white">
                        <Star className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/70">Membres VIP</div>
                        <div className="text-xl font-black text-white">{totalVIPs}</div>
                    </div>
                </div>

            </div>

            {/* Alertes et Actions Rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-blue-900 mb-2">Actions Requises</h3>
                            <ul className="space-y-2 text-blue-800/80 text-sm font-medium">
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                    {pendingWithdrawals > 0 ? (
                                        <Link href="/admin/retraits" className="text-blue-900 font-bold hover:underline">{pendingWithdrawals} demande(s) de retrait en attente</Link>
                                    ) : (
                                        "Aucune demande de retrait"
                                    )}
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                    Vérifier les inscriptions manuelles
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-[2.5rem] flex flex-col justify-between">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-emerald-900">Affiliation Automatique</h3>
                            <p className="text-emerald-700/60 text-xs font-bold uppercase tracking-widest">Libération des fonds (72h)</p>
                        </div>
                    </div>
                    <AutoClearButton count={clearableTransactions} />
                </div>

                <div className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gray-50 rounded-2xl text-gray-400">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900">Déjà Payé</h3>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total versé aux ambassadeurs</p>
                        </div>
                    </div>
                    <div className="text-3xl font-black text-gray-900">
                        {paidAmount.toLocaleString('fr-FR')} <span className="text-sm text-gray-300 tracking-normal">FCFA</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
