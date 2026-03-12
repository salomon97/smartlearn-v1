import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import Link from "next/link";
import { BookOpen, GraduationCap, PlayCircle, Lock } from "lucide-react";

export default async function StudentCoursesCatalog() {
    const session = await getServerSession(authOptions);
    await connectToDatabase();

    // Récupérer uniquement les cours publiés
    const courses = await Course.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
    const isPremium = session?.user?.isPremium || false;

    // Pour chaque cours, compter le nombre de leçons
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
            {/* Header */}
            <div className="bg-gradient-to-br from-brand-orange to-brand-orange-dark rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl shadow-brand-orange/20">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
                        Catalogue des formations
                    </h1>
                    <p className="text-orange-100 text-lg md:text-xl font-medium mb-8">
                        Développe tes compétences avec nos cours interactifs et nos vidéos détaillées.
                    </p>
                </div>
                {/* Décoration de fond */}
                <div className="absolute right-0 top-0 w-64 h-64 md:w-96 md:h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <BookOpen className="absolute -right-8 -bottom-8 w-64 h-64 text-white/5 -rotate-12" />
            </div>

            {/* Liste des cours */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                {coursesWithStats.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Aucun cours disponible</h3>
                        <p className="text-gray-500 mt-1">Revenez un peu plus tard pour découvrir nos nouvelles formations.</p>
                    </div>
                ) : (
                    coursesWithStats.map((course) => (
                        <Link 
                            href={`/dashboard/cours/${course._id}`} 
                            key={course._id}
                            className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-brand-orange/10 transition-all duration-300 flex flex-col hover:-translate-y-1"
                        >
                            {/* Image du cours */}
                            <div className="h-48 bg-gray-100 relative overflow-hidden">
                                {course.imageUrl ? (
                                    <img 
                                        src={course.imageUrl} 
                                        alt={course.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                                        <BookOpen className="w-12 h-12 opacity-50" />
                                    </div>
                                )}
                                
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className="bg-white/95 backdrop-blur-sm text-brand-orange text-xs font-black px-3 py-1.5 rounded-full shadow-sm">
                                        {course.grade_level}
                                    </span>
                                </div>
                                
                                {!isPremium && (
                                    <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-sm text-yellow-400 text-xs font-black px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                                        <Lock className="w-3 h-3" /> VIP
                                    </div>
                                )}
                            </div>
                            
                            {/* Contenu de la carte */}
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-orange transition-colors line-clamp-2">
                                    {course.title}
                                </h3>
                                
                                <p className="text-sm text-gray-500 mb-6 line-clamp-2 flex-1 leading-relaxed">
                                    {course.description}
                                </p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex items-center text-gray-500 text-sm font-medium gap-1.5">
                                        <PlayCircle className="w-4 h-4 text-brand-orange" />
                                        <span>{course.lessonCount} {course.lessonCount > 1 ? 'leçons' : 'leçon'}</span>
                                    </div>
                                    <div className="bg-gray-50 group-hover:bg-brand-orange text-gray-600 group-hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                                        Explorer →
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
