"use client";

import { useState } from "react";
import YouTubePlayer from "@/components/YouTubePlayer";
import { PlayCircle, Lock, FileText, CheckCircle2 } from "lucide-react";

interface Lesson {
    _id: string;
    title: string;
    videoUrl?: string;
    pdfUrl?: string;
    order: number;
    isFreePreview: boolean;
}

interface CourseViewerClientProps {
    course: any;
    lessons: Lesson[];
    isPremium: boolean;
}

export default function CourseViewerClient({ course, lessons, isPremium }: CourseViewerClientProps) {
    // Si la liste est vide, activeLesson reste null. Sinon, on prend la première leçon.
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(lessons.length > 0 ? lessons[0] : null);

    if (lessons.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PlayCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Module en préparation</h3>
                <p className="text-gray-500 mt-2">Le contenu de cette formation arrive très prochainement.</p>
            </div>
        );
    }

    // Calculer si la leçon active actuelle est verrouillée pour cet utilisateur
    const isCurrentLessonLocked = Boolean(!isPremium && activeLesson && !activeLesson.isFreePreview);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative">
            
            {/* Colonne de gauche : Lecteur Vidéo (Prend 2 colonnes sur grand écran) */}
            <div className="lg:col-span-2 space-y-6">
                
                {activeLesson ? (
                    <YouTubePlayer 
                        videoUrl={activeLesson.videoUrl || ""} 
                        isLocked={isCurrentLessonLocked} 
                    />
                ) : (
                    <div className="w-full aspect-video bg-gray-900 rounded-3xl" />
                )}

                {/* Description de la leçon sous la vidéo */}
                {activeLesson && (
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                                <span className="text-sm font-bold text-brand-orange mb-1 tracking-wide uppercase block">
                                    Leçon {activeLesson.order}
                                </span>
                                <h1 className="text-2xl font-black text-gray-900">{activeLesson.title}</h1>
                            </div>
                            
                            {/* Bouton PDF si disponible et non verrouillé */}
                            {activeLesson.pdfUrl && !isCurrentLessonLocked && (
                                <a 
                                    href={activeLesson.pdfUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-5 py-3 rounded-xl font-bold transition-all"
                                >
                                    <FileText className="w-5 h-5" />
                                    Support PDF
                                </a>
                            )}
                        </div>

                        {/* Description globale du cours */}
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">À propos de ce cours</h3>
                            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                                {course.description}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Colonne de droite : Playlist / Sommaire (Sticky sur Desktop) */}
            <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden lg:sticky lg:top-8">
                <div className="p-6 bg-gray-50 border-b border-gray-100">
                    <h2 className="text-lg font-black text-gray-900">Sommaire</h2>
                    <p className="text-sm text-gray-500 font-medium">{lessons.length} {lessons.length > 1 ? 'chapitres' : 'chapitre'}</p>
                </div>
                
                <div className="max-h-[600px] overflow-y-auto w-full custom-scrollbar">
                    {lessons.map((lesson) => {
                        const isActive = activeLesson?._id === lesson._id;
                        const isLocked = !isPremium && !lesson.isFreePreview;

                        return (
                            <button
                                key={lesson._id}
                                onClick={() => setActiveLesson(lesson)}
                                className={`w-full text-left p-4 md:p-5 flex items-start gap-4 transition-all border-b border-gray-50 last:border-b-0
                                    ${isActive ? 'bg-orange-50/50' : 'hover:bg-gray-50'}
                                `}
                            >
                                {/* Icône de status */}
                                <div className="mt-0.5 flex-shrink-0">
                                    {isActive ? (
                                        <div className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center animate-in zoom-in">
                                            <PlayCircle className="w-5 h-5" />
                                        </div>
                                    ) : isLocked ? (
                                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center group-hover:bg-brand-orange/10 group-hover:text-brand-orange transition-colors">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>

                                {/* Titre de la leçon */}
                                <div className="flex-1 pr-2">
                                    <div className="flex items-center flex-wrap gap-2 mb-1">
                                        <span className={`text-sm font-bold ${isActive ? 'text-brand-orange' : 'text-gray-900'}`}>
                                            {lesson.order}. {lesson.title}
                                        </span>
                                        {!isPremium && lesson.isFreePreview && (
                                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase px-2 py-[1px] rounded">Gratuit</span>
                                        )}
                                    </div>
                                    <div className="flex gap-3 text-xs font-medium text-gray-400">
                                        {lesson.videoUrl && <span>Vidéo</span>}
                                        {lesson.pdfUrl && <span>• PDF</span>}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
            
        </div>
    );
}
