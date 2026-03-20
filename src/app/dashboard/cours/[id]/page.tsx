import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import DriveMapping from "@/models/DriveMapping";
import { getGoogleAuth } from "@/lib/googleAuth";
import { google } from "googleapis";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CourseViewerClient from "./components/CourseViewerClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    await connectToDatabase();
    const resolvedParams = await params;
    const course = await Course.findById(resolvedParams.id).lean();

    if (!course) return { title: "Cours non trouvé" };

    return {
        title: course.title,
        description: course.description?.substring(0, 160) || `Suivez le cours ${course.title} sur SmartLearn.`,
        openGraph: {
            title: course.title,
            description: course.description,
            type: "article",
        }
    };
}

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
                                
    let lessons = lessonsRaw.map((l: any) => ({
        _id: l._id.toString(),
        title: l.title,
        videoUrl: l.videoUrl, // On passe l'URL, le client gère le paywall
        pdfUrl: l.pdfUrl,
        order: l.order,
        isFreePreview: !!l.isFreePreview
    }));

    // Normalisation des noms pour correspondre au format DriveMapping
    const GRADE_MAP: Record<string, string> = {
        '6e': '6ème', '6ème': '6ème', '5e': '5ème', '5ème': '5ème', '4e': '4ème', '4ème': '4ème', '3e': '3ème', '3ème': '3ème',
        '2nde': 'Seconde', 'seconde': 'Seconde', '1ère': 'Première', 'première': 'Première', 'terminale': 'Terminale', 'tle': 'Terminale'
    };

    const SUBJECT_MAP: Record<string, string> = {
        'maths': 'Mathématiques', 'mathématiques': 'Mathématiques',
        'info': 'Informatique', 'informatique': 'Informatique'
    };

    const normalizedGrade = GRADE_MAP[course.grade_level?.toLowerCase()] || course.grade_level;
    const normalizedSubject = SUBJECT_MAP[course.subject?.toLowerCase()] || course.subject;

    // 2.5 Fetch dynamique depuis YouTube si un mapping existe
    const mapping = await DriveMapping.findOne({
        grade_level: normalizedGrade,
        subject: normalizedSubject,
        contentType: 'videos'
    });

    if (mapping && mapping.playlistId) {
        try {
            const auth = await getGoogleAuth();
            const yt = google.youtube({ version: 'v3', auth });

            const response = await yt.playlistItems.list({
                playlistId: mapping.playlistId,
                part: ['snippet', 'contentDetails'],
                maxResults: 50,
            });

            if (response.data.items && response.data.items.length > 0) {
                // Remplacer les leçons par le contenu dynamique YouTube
                lessons = response.data.items.map((item, index) => ({
                    _id: item.contentDetails?.videoId || `yt-${index}`,
                    title: item.snippet?.title || `Vidéo ${index + 1}`,
                    videoUrl: `https://www.youtube.com/watch?v=${item.contentDetails?.videoId}`,
                    pdfUrl: '', 
                    order: index + 1,
                    isFreePreview: index === 0, // 1ère vidéo gratuite
                }));
            }
        } catch (error) {
            console.error("Erreur récupération YouTube dynamique:", error);
        }
    }

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
                course={{ _id: course._id.toString(), description: course.description }}
                lessons={lessons} 
                isPremium={isPremium} 
            />
        </div>
    );
}
