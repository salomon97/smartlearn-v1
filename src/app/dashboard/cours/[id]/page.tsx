import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CourseViewerClient from "./components/CourseViewerClient";

export default async function StudentCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    await connectToDatabase();

    const resolvedParams = await params;
    const courseId = resolvedParams.id;

    // 1. Fetch du cours
    const course = await Course.findOne({ _id: courseId, isPublished: true }).lean();
    
    if (!course) {
        return notFound();
    }

    // 2. Fetch des leçons
    const lessonsRaw = await Lesson.find({ courseId: courseId })
                                .sort({ order: 1 })
                                .lean();
                                
    const lessons = lessonsRaw.map((l: any) => ({
        _id: l._id.toString(),
        title: l.title,
        videoUrl: l.videoUrl, // On passe l'URL, le client gère le paywall
        pdfUrl: l.pdfUrl,
        order: l.order,
        isFreePreview: !!l.isFreePreview
    }));

    // 3. Déterminer si l'utilisateur est Premium (VIP)
    const isPremium = session?.user?.isPremium || false;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Bouton Retour minimaliste */}
            <div>
                <Link 
                    href="/dashboard/cours" 
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-orange font-bold text-sm transition-colors bg-white hover:bg-orange-50 px-4 py-2 rounded-xl border border-gray-100 shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Retour aux formations
                </Link>
            </div>

            {/* Titre du haut */}
            <div className="flex items-center gap-3">
                <span className="bg-brand-orange/10 text-brand-orange font-black px-3 py-1 rounded-lg text-xs tracking-wider uppercase">
                    {course.grade_level}
                </span>
                <h1 className="text-2xl font-black text-gray-900 truncate">
                    {course.title}
                </h1>
            </div>

            {/* Le Composant Client qui gère tout l'état de la playlist */}
            <CourseViewerClient 
                course={{ description: course.description }}
                lessons={lessons} 
                isPremium={isPremium} 
            />
        </div>
    );
}
