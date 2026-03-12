import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

export default async function AdminDashboardPage() {
    const session = await getServerSession(authOptions);
    await connectToDatabase();

    // Statistiques rapides
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAffiliates = await User.countDocuments({ role: 'affiliate' });
    const totalVIPs = await User.countDocuments({ isPremium: true });

    // Statistiques Financières (Simplifiées pour le MVP)
    const transactions = await Transaction.find();
    
    // Calculer le Chiffre d'Affaires global (toutes les ventes)
    const totalRevenue = transactions.reduce((acc, curr) => acc + curr.amount, 0);
    
    // Calculer les commissions dues aux affiliés (Total)
    const totalCommissions = transactions.reduce((acc, curr) => acc + curr.commission, 0);

    // Bénéfice Net (CA - Commissions prêtes à être versées ou déjà versées)
    const netProfit = totalRevenue - totalCommissions;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Vue d'ensemble</h1>
                <p className="text-gray-500">Bienvenue, {session?.user?.name}. Voici un résumé de l'activité de SmartLearn.</p>
            </div>

            {/* Cartes KPI (Statistiques Financières) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                    <h3 className="text-gray-500 font-medium mb-1">Chiffre d'Affaires (Brut)</h3>
                    <div className="text-3xl font-black text-gray-900">{totalRevenue.toLocaleString('fr-FR')} <span className="text-lg text-gray-400">FCFA</span></div>
                </div>
                
                <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl shadow-sm">
                    <h3 className="text-amber-700 font-medium mb-1">Commissions Réservées</h3>
                    <div className="text-3xl font-black text-amber-600">{totalCommissions.toLocaleString('fr-FR')} <span className="text-lg text-amber-400">FCFA</span></div>
                    <p className="text-xs text-amber-600/70 mt-2">Gains des affiliés (en attente + dispo)</p>
                </div>
                
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl shadow-sm">
                    <h3 className="text-emerald-700 font-medium mb-1">Bénéfice (Net estimé)</h3>
                    <div className="text-3xl font-black text-emerald-600">{netProfit.toLocaleString('fr-FR')} <span className="text-lg text-emerald-400">FCFA</span></div>
                </div>
            </div>

            {/* Cartes Utilisateurs */}
            <h2 className="text-xl font-bold text-gray-900 mt-12 mb-6">Communauté</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-5xl">👥</div>
                    <div className="text-gray-500 text-sm font-medium mb-1 relative z-10">Total Inscrits</div>
                    <div className="text-2xl font-bold text-gray-900 relative z-10">{totalUsers}</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-5xl">🎓</div>
                    <div className="text-gray-500 text-sm font-medium mb-1 relative z-10">Élèves</div>
                    <div className="text-2xl font-bold text-gray-900 relative z-10">{totalStudents}</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-5xl">🤝</div>
                    <div className="text-gray-500 text-sm font-medium mb-1 relative z-10">Ambassadeurs</div>
                    <div className="text-2xl font-bold text-gray-900 relative z-10">{totalAffiliates}</div>
                </div>

                <div className="bg-gradient-to-br from-brand-orange-light to-brand-orange p-6 rounded-2xl border border-brand-orange shadow-lg shadow-brand-orange/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20 text-5xl text-white">⭐</div>
                    <div className="text-white text-sm font-medium mb-1 relative z-10">Membres VIP</div>
                    <div className="text-2xl font-bold text-white relative z-10">{totalVIPs}</div>
                </div>

            </div>

            <div className="mt-12 p-6 bg-blue-50 border border-blue-100 rounded-2xl">
                <h3 className="text-lg font-bold text-blue-900 mb-4">Dernières Actions Administrateur Requises</h3>
                <p className="text-blue-800 text-sm">
                    Utilisez le menu de gauche pour naviguer vers l'onglet <strong>Finances</strong> afin de valider les transactions de plus de 72h, ou vers l'onglet <strong>Élèves</strong> pour inscrire de nouveaux élèves manuellement.
                </p>
            </div>
        </div>
    );
}
