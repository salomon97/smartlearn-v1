import Link from "next/link";
import Image from "next/image";
import connectToDatabase from "@/lib/mongoose";
import Course from "@/models/Course";

// Next.js Server Component pour récupérer les données directement depuis la DB
async function getCourses() {
    await connectToDatabase();
    // On récupère uniquement les cours publiés
    const courses = await Course.find({ isPublished: true }).sort({ createdAt: -1 });
    // Mongoose documents need to be serialized to plain objects for Server Components
    return JSON.parse(JSON.stringify(courses));
}

export default async function CataloguePage() {
    const courses = await getCourses();

    return (
        <div className="min-h-screen bg-[var(--background)]">
            {/* Navbar Minimaliste (sans hero) */}
            <header className="bg-[var(--primary-dark)] border-b border-white/10 sticky top-0 z-50">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/logo.jpg" alt="Logo" width={32} height={32} className="rounded-full" />
                        <span className="text-xl font-bold text-white">
                            Smart<span className="text-[var(--primary-gold)]">Learn</span>
                        </span>
                    </Link>
                    <nav className="flex items-center gap-4 text-sm font-medium">
                        <Link href="/auth/connexion" className="text-white hover:text-white/80 transition-colors">Connexion</Link>
                        <Link href="/auth/inscription" className="bg-[var(--primary-gold)] text-[var(--primary-dark)] px-4 py-1.5 rounded-full font-bold hover:bg-[var(--primary-gold-hover)] transition-all">
                            S'inscrire
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-[var(--foreground)] mb-4">Le Catalogue des Cours</h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Explorez notre bibliothèque de cours premiums. Accédez à l'ensemble du contenu en rejoignant SmartLearn dès aujourd'hui.
                    </p>
                </div>

                {courses.length === 0 ? (
                    <div className="text-center py-20 bg-white shadow-sm border border-gray-100 rounded-2xl">
                        <div className="text-5xl mb-4">📚</div>
                        <h3 className="text-2xl font-bold mb-2">Aucun cours disponible</h3>
                        <p className="text-gray-500">De nouveaux cours seront ajoutés très bientôt !</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course: any) => (
                            <div key={course._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                                {/* Image Placeholder if no true image */}
                                <div className="aspect-video bg-[var(--primary-dark)] relative overflow-hidden flex items-center justify-center">
                                    {course.imageUrl ? (
                                        <Image src={course.imageUrl} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <span className="text-white/50 font-bold text-xl">{course.grade_level}</span>
                                    )}
                                    {/* Badge de Classe */}
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[var(--primary-dark)] px-3 py-1 text-xs font-bold rounded-full shadow-md">
                                        {course.grade_level}
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                                    <p className="text-gray-500 text-sm mb-6 line-clamp-3">{course.description}</p>

                                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-[var(--primary-gold-hover)] uppercase tracking-wider">
                                            Premium Exclusif
                                        </span>
                                        <Link href="/auth/inscription" className="text-sm font-bold text-[var(--primary-dark)] hover:text-[var(--primary-gold)] transition-colors flex items-center gap-1 group-hover:translate-x-1 duration-300">
                                            Débloquer Accès →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
