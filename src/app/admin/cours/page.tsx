import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import Link from "next/link";

export default async function AdminContentPage() {
    const session = await getServerSession(authOptions);
    await connectToDatabase();

    // Récupérer les cours
    const courses = await Course.find().sort({ createdAt: -1 }).lean();

    // Pour chaque cours, compter le nombre de leçons de manière asynchrone AVANT de rendre le JSX
    const coursesWithStats = await Promise.all(
        courses.map(async (course) => {
            const lessonCount = await Lesson.countDocuments({ courseId: course._id });
            return {
                ...course,
                _id: course._id.toString(),
                lessonCount
            };
        })
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Gestion du Contenu</h1>
                    <p className="text-gray-500">Ajoutez des cours, des vidéos YouTube et des supports PDF.</p>
                </div>
                
                <Link 
                    href="/admin/cours/nouveau" 
                    className="inline-flex items-center justify-center bg-brand-orange hover:bg-brand-orange-dark text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-brand-orange/20 hover:-translate-y-0.5"
                >
                    + Nouvelle Formation
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coursesWithStats.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-3xl">
                        Aucun cours créé pour le moment. Cliquez sur "Nouveau Cours" pour commencer.
                    </div>
                ) : coursesWithStats.map(course => (
                    <div key={course._id} className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow">
                        <div className="h-40 bg-gray-100 relative">
                            {course.imageUrl ? (
                                <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                                    Aperçu Indisponible
                                </div>
                            )}
                            <div className="absolute top-4 right-4">
                                {course.isPublished ? (
                                    <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">Publié</span>
                                ) : (
                                    <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">Brouillon</span>
                                )}
                            </div>
                        </div>
                        
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="text-xs font-bold text-brand-orange mb-2">{course.grade_level}</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                            <p className="text-sm text-gray-500 mb-6 line-clamp-2 flex-1">{course.description}</p>
                            
                            <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                                <span className="text-sm font-bold text-gray-600">
                                    {course.lessonCount} leçon(s)
                                </span>
                                <Link 
                                    href={`/admin/cours/${course._id}`}
                                    className="text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
                                >
                                    Gérer les vidéos
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
