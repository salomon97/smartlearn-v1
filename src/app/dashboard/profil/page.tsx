import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/auth/connexion");
    }

    await connectToDatabase();

    // Récupérer les données fraîches de l'utilisateur
    let dbUser = await User.findById(session.user.id).lean();

    if (!dbUser) {
        redirect("/auth/connexion");
    }

    // Si c'est un affilié et qu'il n'a pas encore de code (anciens comptes), on lui en génère un
    if (dbUser.role === 'affiliate' && !dbUser.codeAffiliation) {
        const prefix = dbUser.name.replace(/\s+/g, '').substring(0, 4).toUpperCase();
        const randomNums = Math.floor(1000 + Math.random() * 9000);
        const newCode = `${prefix}${randomNums}`;
        
        await User.findByIdAndUpdate(dbUser._id, { codeAffiliation: newCode });
        dbUser.codeAffiliation = newCode;
    }

    const { name, email, role, grade_level, isPremium, isVerified, codeAffiliation, balance_pending = 0, balance_available = 0, commission_rate = 10, image } = dbUser as any;
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    Mon Profil
                </h1>
                <p className="text-slate-400 mt-2">
                    Gérez vos informations personnelles et vos préférences.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Carte Principale : Informations */}
                <div className="md:col-span-2">
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sm:p-8">
                        <div className="flex items-center space-x-4 mb-8">
                            <ProfilePictureUpload currentImage={image} userName={name} />
                            <div>
                                <h2 className="text-2xl font-semibold text-white">{name}</h2>
                                <p className="text-slate-400">{email}</p>
                                <div className="mt-2 flex gap-2">
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                                        {role === 'admin' ? 'Administrateur' : role === 'student' ? 'Élève' : 'Affilié'}
                                    </span>
                                    {isVerified && (
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                                            ✓ Vérifié
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Nom Complet</label>
                                    <div className="text-white font-medium bg-slate-800/50 px-4 py-3 rounded-xl border border-slate-700/50">
                                        {name}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">E-mail</label>
                                    <div className="text-white font-medium bg-slate-800/50 px-4 py-3 rounded-xl border border-slate-700/50">
                                        {email}
                                    </div>
                                </div>
                            </div>

                            {role === 'student' && grade_level && (
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Classe (Niveau)</label>
                                    <div className="text-white font-medium bg-slate-800/50 px-4 py-3 rounded-xl border border-slate-700/50">
                                        {grade_level}
                                    </div>
                                </div>
                            )}

                            {role === 'affiliate' && codeAffiliation && (
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Code d'Affiliation</label>
                                    <div className="flex items-center gap-3">
                                        <div className="text-amber-400 font-bold bg-amber-500/10 px-4 py-3 rounded-xl border border-amber-500/20 tracking-widest">
                                            {codeAffiliation}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar : Statut & Actions */}
                <div className="space-y-6">
                    {/* Carte VIP */}
                    <div className={`p-6 rounded-2xl border backdrop-blur-xl relative overflow-hidden group ${isPremium
                        ? 'bg-gradient-to-br from-amber-500/10 to-orange-600/10 border-amber-500/30'
                        : 'bg-slate-800/50 border-slate-700/50'
                        }`}>

                        {/* Glow effect */}
                        {isPremium && (
                            <div className="absolute top-0 right-0 p-32 bg-amber-500/10 blur-3xl rounded-full group-hover:bg-amber-500/20 transition-all duration-700"></div>
                        )}

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${isPremium ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'
                                }`}>
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                            </div>
                            <h3 className={`text-xl font-bold mb-1 ${isPremium ? 'text-amber-400' : 'text-white'}`}>
                                {isPremium ? 'Membre VIP' : 'Compte Gratuit'}
                            </h3>
                            <p className="text-sm text-slate-400 mb-6">
                                {isPremium
                                    ? 'Vous avez un accès complet et illimité à tous les cours et corrections.'
                                    : 'Accédez à plus de contenu en devenant membre VIP.'}
                            </p>

                            {!isPremium && role === 'student' && (
                                <a href="/paiement" className="w-full py-2.5 px-4 bg-gradient-to-r from-brand-orange to-brand-orange-dark hover:from-brand-orange-light focus:ring-4 focus:ring-brand-orange/20 text-white rounded-xl font-medium transition-all text-sm shadow-lg shadow-brand-orange/20">
                                    Devenir VIP
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Carte Solde (Affiliés uniquement) */}
                    {role === 'affiliate' && (
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-white font-medium">Solde Disponible</h3>
                                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">
                                {balance_available} <span className="text-lg text-slate-400">FCFA</span>
                            </div>
                            
                            {/* Affichage des gains en attente (72h) */}
                            {balance_pending > 0 && (
                                <div className="mt-2 mb-4 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-between">
                                    <span className="text-xs text-amber-400/80 font-medium">En attente (72h)</span>
                                    <span className="text-sm font-bold text-amber-500">+{balance_pending} FCFA</span>
                                </div>
                            )}

                            <p className="text-xs text-slate-400 mb-6">
                                Gains validés depuis vos affiliations.<br />
                                <span className="text-brand-orange-light font-medium mt-1 inline-block">Votre Taux de commission : {commission_rate}%</span>
                            </p>

                            <div className="space-y-3">
                                <button
                                    className={`w-full py-2.5 px-4 rounded-xl font-medium transition-all text-sm shadow-lg ${balance_available >= 1000
                                        ? 'bg-emerald-500 hover:bg-emerald-600 focus:ring-4 focus:ring-emerald-500/20 text-white shadow-emerald-500/20'
                                        : 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600'
                                        }`}
                                    disabled={balance_available < 1000}
                                >
                                    {balance_available >= 1000 ? 'Demander un retrait' : 'Seuil dispo insuffisant (1000 FCFA)'}
                                </button>

                                <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700 text-xs text-slate-400 space-y-2">
                                    <p className="flex items-start gap-2">
                                        <span className="text-brand-orange font-bold">•</span>
                                        Déblocage automatique des paiements "en attente" après 72 heures de garantie technique.
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <span className="text-brand-orange font-bold">•</span>
                                        Les retraits sont gérés par les administrateurs manuellement sur votre numéro d'inscription.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
