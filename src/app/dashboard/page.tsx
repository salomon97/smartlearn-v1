import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import connectToDatabase from "@/lib/mongoose";
import Course from "@/models/Course";

// Composant Serveur (Server Component) pour récupérer les cours
async function getStudentCourses(gradeLevel: string) {
    await connectToDatabase();
    // Ne récupérer que les cours correspondant au niveau de l'étudiant
    const courses = await Course.find({ grade_level: gradeLevel, isPublished: true }).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(courses));
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/auth/connexion");
    }

    const { isPremium, grade_level, name, role } = session.user as any;

    // Si affilié, pas besoin de charger les cours
    const courses = role === 'student' ? await getStudentCourses(grade_level) : [];

    return (
        <div className="min-h-screen bg-[var(--background)] flex">
            {/* Sidebar Latérale (Navigation Interne) */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 min-h-screen sticky top-0 fixed py-6 px-4">
                <Link href="/" className="flex items-center gap-2 mb-10 px-2">
                    <Image src="/logo.jpg" alt="Logo" width={32} height={32} className="rounded-full" />
                    <span className="text-xl font-bold text-[var(--primary-dark)]">
                        Smart<span className="text-[var(--primary-gold)]">Learn</span>
                    </span>
                </Link>
                <nav className="flex flex-col gap-2 flex-grow">
                    {role === 'student' ? (
                        <>
                            <Link href="/dashboard" className="px-4 py-3 bg-[var(--primary-dark)]/5 text-[var(--primary-dark)] rounded-xl font-bold flex items-center gap-3">
                                <span className="text-lg">📊</span> Vue d'ensemble
                            </Link>
                            <Link href="/dashboard/cours" className="px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium flex items-center gap-3 transition-colors">
                                <span className="text-lg">📚</span> Mes Formations
                            </Link>
                            <Link href="/dashboard/profil" className="px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium flex items-center gap-3 transition-colors">
                                <span className="text-lg">👤</span> Profil
                            </Link>
                            <Link href="/affiliation" className="px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium flex items-center gap-3 transition-colors">
                                <span className="text-lg">💸</span> Gagner de l'argent
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/dashboard" className="px-4 py-3 bg-[var(--primary-dark)]/5 text-[var(--primary-dark)] rounded-xl font-bold flex items-center gap-3">
                                <span className="text-lg">📈</span> Tableau de bord
                            </Link>
                            <Link href="/dashboard/profil" className="px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium flex items-center gap-3 transition-colors">
                                <span className="text-lg">👤</span> Mon Compte
                            </Link>
                        </>
                    )}
                </nav>
                {isPremium && (
                    <div className="mt-auto bg-gradient-to-r from-[var(--primary-gold)] to-yellow-500 p-4 rounded-xl text-[var(--primary-dark)] text-sm shadow-md font-bold text-center">
                        Membre VIP Activé ✨
                    </div>
                )}
            </aside>

            {/* Main Content Area */}
            <main className="flex-1">
                {/* Header Mobile & User Status */}
                <header className="bg-white border-b border-gray-100 py-4 px-6 md:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-40">
                    <div className="flex items-center md:hidden gap-2 w-full justify-center sm:justify-start">
                        <Image src="/logo.jpg" alt="Logo" width={32} height={32} className="rounded-full" />
                        <span className="text-xl font-bold text-[var(--primary-dark)]">Smart<span className="text-[var(--primary-gold)]">Learn</span></span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Bienvenue, {name}</h1>
                        <p className="text-sm text-gray-500">
                            {role === 'affiliate' ? 'Espace Ambassadeur' : `Espace ${grade_level}`}
                        </p>
                    </div>
                    {role === 'student' && !isPremium && (
                        <Link href="/paiement" className="px-5 py-2 bg-[var(--primary-gold)] text-[var(--primary-dark)] rounded-full font-bold text-sm shadow-md hover:bg-[var(--primary-gold-hover)] transition-colors animate-bounce">
                            Débloquer le Pass VIP
                        </Link>
                    )}
                </header>

                <div className="p-6 md:p-10 max-w-6xl mx-auto">
                    {role === 'student' ? (
                        <>
                            {/* Banner : Non-Premium Lock */}
                            {!isPremium && (
                                <div className="mb-10 bg-[var(--primary-dark)] text-white p-8 rounded-3xl shadow-xl border border-[var(--primary-gold)]/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <span className="text-9xl">🔒</span>
                                    </div>
                                    <h2 className="text-2xl font-extrabold mb-3 flex items-center gap-2">
                                        <span className="text-[var(--primary-gold)]">Vos cours sont verrouillés</span>
                                    </h2>
                                    <p className="text-gray-300 max-w-2xl mb-6">
                                        Pour accéder en illimité à tous les cours vidéos, QCM et synthèses PDF de {grade_level}, validez votre profil VIP. C'est un paiement unique, valable toute l'année.
                                    </p>
                                    <Link href="/paiement" className="inline-block px-8 py-3 bg-[var(--primary-gold)] text-[var(--primary-dark)] rounded-xl font-bold hover:scale-105 transition-transform shadow-lg shadow-[var(--primary-gold)]/30">
                                        Activer mon Pass VIP - 2000 FCFA
                                    </Link>
                                </div>
                            )}

                            {/* Liste des Cours de l'étudiant */}
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Vos modules - {grade_level}</h3>

                            {courses.length === 0 ? (
                                <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl">
                                    <span className="text-4xl">📭</span>
                                    <p className="text-gray-500 font-medium mt-4">Aucun cours n'a encore été ajouté pour votre classe.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {courses.map((course: any) => (
                                        <Link
                                            href={isPremium ? `/dashboard/cours/${course._id}` : '/paiement'}
                                            key={course._id}
                                            className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all flex flex-col ${isPremium ? 'hover:-translate-y-1 hover:shadow-lg' : 'opacity-80 scale-[0.98] hover:opacity-100'}`}
                                        >
                                            <div className="aspect-[4/3] bg-gradient-to-br from-[var(--primary-dark)] to-[#2c4b5c] relative flex items-center justify-center">
                                                {course.imageUrl ? (
                                                    <Image src={course.imageUrl} alt={course.title} fill className="object-cover opacity-90" />
                                                ) : (
                                                    <span className="text-5xl opacity-50">📘</span>
                                                )}
                                                {!isPremium && (
                                                    <div className="absolute inset-0 bg-[var(--primary-dark)]/60 backdrop-blur-sm flex items-center justify-center">
                                                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 text-white text-xl">🔒</div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-5 flex-1 flex flex-col">
                                                <h4 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{course.title}</h4>
                                                <p className="text-gray-500 text-sm line-clamp-2 flex-grow">{course.description}</p>

                                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                                    {isPremium ? (
                                                        <span className="text-[var(--primary-gold-hover)] font-bold text-sm flex items-center gap-1">
                                                            Commencer <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 font-medium text-sm flex items-center gap-1">
                                                            Verrouillé
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        // Vue spécifique pour les Ambassadeurs (Affiliés)
                        <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center sm:p-12 shadow-sm animate-in fade-in zoom-in duration-500">
                            <span className="text-6xl mb-6 block">💼</span>
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Bienvenue dans votre Pôle Partenaire</h2>
                            <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-8">
                                En tant qu'Ambassadeur SmartLearn, vous n'avez pas de modules de cours. Votre mission est de partager l'excellence éducative et d'être rémunéré pour chaque élève inscrit via votre lien.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/dashboard/profil" className="px-8 py-3 bg-[var(--primary-dark)] text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-colors">
                                    Récupérer mon Code d'Affiliation
                                </Link>
                                <Link href="/dashboard/profil" className="px-8 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors">
                                    Consulter mes Gains
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
