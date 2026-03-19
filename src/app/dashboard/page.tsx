import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import connectToDatabase from "@/lib/mongoose";
import DynamicContentBrowser from "./components/DynamicContentBrowser";
import LogoutButton from "./components/LogoutButton";


export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/auth/connexion");
    }

    const { isPremium, grade_level, name, role } = session.user as any;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Latérale (Navigation Interne) */}
            <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-100 min-h-screen sticky top-0 py-8 px-6">
                <Link href="/" className="flex items-center gap-3 mb-12 px-2">
                    <div className="w-10 h-10 bg-brand-orange rounded-2xl flex items-center justify-center shadow-lg shadow-brand-orange/20">
                        <span className="text-white font-black text-xl">S</span>
                    </div>
                    <span className="text-2xl font-black text-gray-900 tracking-tighter">
                        Smart<span className="text-brand-orange">Learn</span>
                    </span>
                </Link>
                <nav className="flex flex-col gap-3 flex-grow">
                    {role === 'student' ? (
                        <>
                            <Link href="/dashboard" className="px-5 py-4 bg-gray-900 text-white rounded-[2rem] font-bold flex items-center gap-4 shadow-xl shadow-gray-900/10">
                                <span className="text-lg">📊</span> Vue d'ensemble
                            </Link>
                            <Link href="/dashboard/profil" className="px-5 py-4 text-gray-400 hover:bg-gray-50 hover:text-gray-900 rounded-[2rem] font-bold flex items-center gap-4 transition-all">
                                <span className="text-lg">👤</span> Profil
                            </Link>
                            <Link href="/affiliation" className="px-5 py-4 text-gray-400 hover:bg-gray-50 hover:text-gray-900 rounded-[2rem] font-bold flex items-center gap-4 transition-all">
                                <span className="text-lg">💸</span> Ambassadeur
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/dashboard" className="px-5 py-4 bg-gray-900 text-white rounded-[2rem] font-bold flex items-center gap-4 shadow-xl shadow-gray-900/10">
                                <span className="text-lg">📈</span> Tableau de bord
                            </Link>
                            <Link href="/dashboard/profil" className="px-5 py-4 text-gray-400 hover:bg-gray-50 hover:text-gray-900 rounded-[2rem] font-bold flex items-center gap-4 transition-all">
                                <span className="text-lg">👤</span> Mon Compte
                            </Link>
                        </>
                    )}
                </nav>
                <div className="mt-auto pt-8 border-t border-gray-100 flex flex-col gap-3">
                    <LogoutButton />
                </div>
                {isPremium && (
                    <div className="mt-6 bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] text-emerald-700 text-sm shadow-sm font-black text-center animate-pulse">
                        MEMBRE VIP ACTIF ✨
                    </div>
                )}
            </aside>


            {/* Main Content Area */}
            <main className="flex-1 overflow-x-hidden">
                {/* Header Mobile & User Status */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 py-6 px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-6 sticky top-0 z-40">
                    <div className="flex items-center md:hidden gap-3 w-full justify-center sm:justify-start">
                        <div className="w-8 h-8 bg-brand-orange rounded-xl flex items-center justify-center">
                            <span className="text-white font-black text-sm">S</span>
                        </div>
                        <span className="text-xl font-black text-gray-900 tracking-tighter">Smart<span className="text-brand-orange">Learn</span></span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 leading-tight">Bonjour, {name}</h1>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                            {role === 'affiliate' ? 'Tableau de bord Ambassadeur' : `Filière : ${grade_level}`}
                        </p>
                    </div>
                    {role === 'student' && !isPremium && (
                        <Link href="/paiement" className="px-8 py-3 bg-brand-orange text-white rounded-2xl font-black text-sm shadow-xl shadow-brand-orange/20 hover:scale-105 transition-all">
                            DÉBLOQUER MON PASS VIP
                        </Link>
                    )}
                </header>

                <div className="p-6 md:p-12 max-w-7xl mx-auto">
                    {role === 'student' ? (
                        <>
                            {/* Banner : Non-Premium Lock */}
                            {!isPremium && (
                                <div className="mb-12 bg-gray-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                                    <div className="absolute -right-10 -bottom-10 opacity-10">
                                        <span className="text-[12rem]">🔒</span>
                                    </div>
                                    <div className="relative z-10">
                                        <h2 className="text-3xl font-black mb-4">
                                            Tes cours sont <span className="text-brand-orange">verrouillés</span>
                                        </h2>
                                        <p className="text-gray-400 text-lg max-w-2xl mb-8 font-medium">
                                            Accède en illimité à toute l'arborescence de {grade_level} (Maths & Informatique). Vidéos, Chapitres PDF et Annales d'examens disponibles à vie pour un seul paiement.
                                        </p>
                                        <Link href="/paiement" className="inline-block px-10 py-4 bg-brand-orange text-white rounded-2xl font-black hover:shadow-2xl hover:shadow-brand-orange/40 transition-all">
                                            ACTIVER MON PASS VIP (2000 FCFA)
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Section Dynamique : Le Coeur du Site */}
                            {isPremium ? (
                                <div className="space-y-12">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-black text-gray-900">Vos modules d'apprentissage</h3>
                                        <div className="hidden sm:flex items-center gap-2 text-xs font-black text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-widest">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Contenu Synchronisé
                                        </div>
                                    </div>
                                    <DynamicContentBrowser gradeLevel={grade_level} />
                                </div>
                            ) : (
                                <div className="opacity-50 pointer-events-none blur-[2px] select-none">
                                    <DynamicContentBrowser gradeLevel={grade_level} />
                                </div>
                            )}
                        </>
                    ) : (
                        // Vue spécifique pour les Ambassadeurs (Affiliés)
                        <div className="bg-white border border-gray-100 rounded-[3rem] p-12 text-center sm:p-20 shadow-sm animate-in fade-in zoom-in duration-700">
                            <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center text-emerald-500 mx-auto mb-10">
                                <span className="text-5xl">💼</span>
                            </div>
                            <h2 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">Espace Ambassadeur VIP</h2>
                            <p className="text-gray-500 text-xl max-w-2xl mx-auto mb-12 font-medium">
                                Vous êtes le moteur de SmartLearn. Partagez votre lien, suivez vos retraits et générez des revenus en aidant les élèves à accéder à l'excellence.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                <Link href="/dashboard/profil" className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:shadow-gray-900/20 transition-all hover:-translate-y-1">
                                    Mon lien d'affiliation
                                </Link>
                                <Link href="/affiliation" className="px-10 py-4 bg-white text-gray-900 border-2 border-gray-100 rounded-2xl font-black hover:border-brand-orange transition-all hover:-translate-y-1">
                                    Suivre mes gains
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
