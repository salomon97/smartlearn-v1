import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddLessonForm from "./components/AddLessonForm";
import DeleteLessonButton from "./components/DeleteLessonButton";
import ReorderLessonButtons from "./components/ReorderLessonButtons";

export default async function AdminCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    await connectToDatabase();

    const resolvedParams = await params;
    const courseId = resolvedParams.id;

    const course = await Course.findById(courseId).lean();
    if (!course) {
        return notFound();
    }

    const lessonsRaw = await Lesson.find({ courseId: courseId })
                                .sort({ order: 1 })
                                .lean();
                                
    const lessons = lessonsRaw.map((l: any) => ({
        ...l, 
        _id: l._id.toString(),
        courseId: l.courseId.toString()
    }));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Header + Breadcrumb */}
            <div>
                <Link href="/admin/cours" className="text-gray-500 hover:text-brand-orange text-sm font-bold flex items-center gap-1 mb-4 w-fit transition-colors">
                    ← Retour aux cours
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                            <span className="bg-gray-100 text-gray-700 font-bold px-3 py-1 rounded-full text-xs">
                                {course.grade_level}
                            </span>
                        </div>
                        <p className="text-gray-500 max-w-2xl">{course.description}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Colonne de gauche : Formulaire d'ajout rapide (Client Component) */}
                <div className="lg:col-span-1">
                    <AddLessonForm courseId={course._id.toString()} nextOrder={lessons.length + 1} />
                </div>

                {/* Colonne de droite : Liste des vidéos existantes */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm min-h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Leçons du cours</h2>
                            <span className="bg-brand-orange/10 text-brand-orange font-bold px-3 py-1 rounded-full text-sm">
                                {lessons.length} leçon(s)
                            </span>
                        </div>

                        {lessons.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-2xl">
                                Aucune leçon ajoutée. Utilisez le formulaire à gauche pour ajouter votre première vidéo YouTube.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {lessons.map(lesson => (
                                    <div key={lesson._id} className="border border-gray-100 bg-gray-50 hover:bg-white p-4 rounded-xl flex gap-4 transition-all">
                                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center font-bold text-gray-600 flex-shrink-0">
                                            {lesson.order}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-gray-900">{lesson.title}</h3>
                                                {lesson.isFreePreview && (
                                                    <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase font-black px-2 py-0.5 rounded">Aperçu Gratuit</span>
                                                )}
                                            </div>
                                            
                                            <div className="mt-2 space-y-1">
                                                {lesson.videoUrl && (
                                                    <div className="text-xs flex items-center gap-2">
                                                        <span className="font-semibold text-gray-500">Vidéo:</span>
                                                        <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate max-w-[250px] inline-block">
                                                            {lesson.videoUrl}
                                                        </a>
                                                    </div>
                                                )}
                                                {lesson.pdfUrl && (
                                                    <div className="text-xs flex items-center gap-2">
                                                        <span className="font-semibold text-gray-500">PDF:</span>
                                                        <a href={lesson.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate max-w-[250px] inline-block">
                                                            {lesson.pdfUrl}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 flex-shrink-0 pt-1">
                                            <ReorderLessonButtons 
                                                lessonId={lesson._id} 
                                                currentOrder={lesson.order} 
                                                totalLessons={lessons.length}
                                            />
                                            <div className="border-t border-gray-200 mt-1 pt-1 text-center">
                                                <DeleteLessonButton lessonId={lesson._id} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
