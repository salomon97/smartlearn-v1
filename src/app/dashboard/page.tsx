import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import DynamicContentBrowser from "./components/DynamicContentBrowser";
import LogoutButton from "./components/LogoutButton";
import { Logo } from "@/components/ui/Logo";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/auth/connexion");
    }

    const { isPremium, grade_level, name, role } = session.user as any;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* ─── Sidebar ─── */}
            <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 min-h-screen sticky top-0 py-8 px-6">
                <Link href="/" className="mb-12 px-1" aria-label="SmartLearn — Accueil">
                    <Logo variant="compact" theme="light" size={36} />
                </Link>

                <nav className="flex flex-col gap-2 flex-grow">
                    {role === 'student' ? (
                        <>
                            <Link
                                href="/dashboard"
                                className="px-5 py-3.5 bg-navy text-white rounded-2xl font-semibold flex items-center gap-3"
                            >
                                <span>📊</span> Vue d&apos;ensemble
                            </Link>
                            <Link
                                href="/dashboard/profil"
                                className="px-5 py-3.5 text-slate-500 hover:bg-slate-50 hover:text-navy rounded-2xl font-medium flex items-center gap-3 transition-all"
                            >
                                <span>👤</span> Mon profil
                            </Link>
                            <Link
                                href="/affiliation"
                                className="px-5 py-3.5 text-slate-500 hover:bg-slate-50 hover:text-navy rounded-2xl font-medium flex items-center gap-3 transition-all"
                            >
                                <span>💸</span> Ambassadeur
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/dashboard"
                                className="px-5 py-3.5 bg-navy text-white rounded-2xl font-semibold flex items-center gap-3"
                            >
                                <span>📈</span> Tableau de bord
                            </Link>
                            <Link
                                href="/dashboard/profil"
                                className="px-5 py-3.5 text-slate-500 hover:bg-slate-50 hover:text-navy rounded-2xl font-medium flex items-center gap-3 transition-all"
                            >
                                <span>👤</span> Mon compte
                            </Link>
                        </>
                    )}
                </nav>

                <div className="mt-auto pt-8 border-t border-slate-100 flex flex-col gap-3">
                    <LogoutButton />
                </div>

                {isPremium && (
                    <div className="mt-6 bg-teal/10 border border-teal/20 px-4 py-3 rounded-2xl text-center">
                        <span className="text-xs font-semibold uppercase tracking-widest text-teal-dark">
                            ✨ Premium actif
                        </span>
                    </div>
                )}
            </aside>

            {/* ─── Main ─── */}
            <main className="flex-1 overflow-x-hidden">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 py-5 px-6 md:px-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-0 z-40">
                    {/* Logo mobile */}
                    <div className="flex md:hidden">
                        <Logo variant="compact" theme="light" size={32} />
                    </div>

                    <div>
                        <h1 className="font-heading text-2xl font-bold text-navy leading-tight">
                            Bonjour, {name}
                        </h1>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
                            {role === 'affiliate' ? 'Tableau de bord Ambassadeur' : `Filière : ${grade_level}`}
                        </p>
                    </div>

                    {role === 'student' && !isPremium && (
                        <Link
                            href="/paiement"
                            className="px-6 py-3 bg-orange text-white rounded-full font-semibold text-sm shadow-md shadow-orange/20 hover:shadow-lg hover:shadow-orange/30 transition-all"
                        >
                            Activer mon accès Premium
                        </Link>
                    )}
                </header>

                <div className="p-6 md:p-10 max-w-7xl mx-auto">
                    {role === 'student' ? (
                        <>
                            {/* Bandeau d'invitation Premium */}
                            {!isPremium && (
                                <div className="mb-10 bg-navy text-white p-8 md:p-10 rounded-3xl shadow-lg relative overflow-hidden">
                                    <div className="absolute -right-12 -bottom-16 opacity-[0.08]">
                                        <span className="text-[10rem]">🔒</span>
                                    </div>
                                    <div className="relative z-10 max-w-2xl">
                                        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-teal mb-3">
                                            Accès limité
                                        </span>
                                        <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3 leading-tight">
                                            Tes cours t&apos;attendent.
                                        </h2>
                                        <p className="text-slate-300 mb-7 leading-relaxed">
                                            Active ton accès Premium pour débloquer toute l&apos;arborescence
                                            de <strong className="text-white">{grade_level}</strong> (Mathématiques &amp;
                                            Informatique) : vidéos, fiches PDF, annales corrigées.
                                            Trois formules d&apos;abonnement au choix.
                                        </p>
                                        <Link
                                            href="/paiement"
                                            className="inline-flex items-center gap-2 px-7 py-3.5 bg-orange hover:bg-orange/90 text-white rounded-full font-semibold transition-all transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange/30"
                                        >
                                            Voir les formules
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Contenu d'apprentissage */}
                            {(isPremium || role === 'admin') ? (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between flex-wrap gap-3">
                                        <h3 className="font-heading text-xl md:text-2xl font-bold text-navy">
                                            Vos modules d&apos;apprentissage
                                        </h3>
                                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-dark bg-teal/10 px-3 py-1.5 rounded-full uppercase tracking-widest">
                                            <div className="w-1.5 h-1.5 bg-teal rounded-full animate-pulse"></div>
                                            Contenu synchronisé
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
                        // Vue Ambassadeur
                        <div className="bg-white border border-slate-200 rounded-3xl p-10 md:p-16 text-center">
                            <div className="w-20 h-20 bg-teal/10 rounded-3xl flex items-center justify-center text-teal mx-auto mb-8">
                                <span className="text-4xl">💼</span>
                            </div>
                            <h2 className="font-heading text-3xl md:text-4xl font-bold text-navy mb-4 tracking-tight">
                                Espace Ambassadeur
                            </h2>
                            <p className="text-slate-500 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                                Vous êtes le moteur de SmartLearn. Partagez votre lien, suivez vos retraits et
                                générez des revenus en aidant les élèves à accéder à l&apos;excellence.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/dashboard/profil"
                                    className="px-8 py-3.5 bg-navy text-white rounded-full font-semibold hover:-translate-y-0.5 transition-all"
                                >
                                    Mon lien d&apos;affiliation
                                </Link>
                                <Link
                                    href="/affiliation"
                                    className="px-8 py-3.5 bg-white text-navy border-2 border-slate-200 rounded-full font-semibold hover:border-teal hover:-translate-y-0.5 transition-all"
                                >
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
