"use client";

import { useState, useEffect, useCallback } from "react";
import YouTubePlayer from "@/components/YouTubePlayer";
import { PlayCircle, Lock, FileText, CheckCircle2, Circle, Menu, X, BookOpen } from "lucide-react";

interface Lesson {
    _id: string;
    title: string;
    videoUrl?: string;
    pdfUrl?: string;
    order: number;
    isFreePreview: boolean;
}

interface CourseViewerClientProps {
    course: { _id: string, description: string };
    lessons: Lesson[];
    isPremium: boolean;
}

export default function CourseViewerClient({ course, lessons, isPremium }: CourseViewerClientProps) {
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(lessons.length > 0 ? lessons[0] : null);
    const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Charger la progression au montage
    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const res = await fetch(`/api/user/progress?courseId=${course._id}`);
                const data = await res.json();
                if (data.completedLessonIds) {
                    setCompletedLessonIds(data.completedLessonIds);
                }
            } catch (error) {
                console.error("Erreur chargement progression:", error);
            }
        };
        fetchProgress();
    }, [course._id]);

    const toggleComplete = useCallback(async (lessonId: string, isCompleted: boolean) => {
        try {
            const res = await fetch("/api/user/progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    courseId: course._id,
                    lessonId,
                    isCompleted
                })
            });
            if (res.ok) {
                setCompletedLessonIds(prev => 
                    isCompleted 
                        ? [...prev, lessonId] 
                        : prev.filter(id => id !== lessonId)
                );
            }
        } catch (error) {
            console.error("Erreur update progression:", error);
        }
    }, [course._id]);


    const handleVideoEnd = useCallback(() => {
        if (!activeLesson) return;
        
        if (!completedLessonIds.includes(activeLesson._id)) {
            toggleComplete(activeLesson._id, true);
        }
        
        const currentIndex = lessons.findIndex(l => l._id === activeLesson._id);
        if (currentIndex !== -1 && currentIndex < lessons.length - 1) {
            const nextLesson = lessons[currentIndex + 1];
            const isNextLocked = !isPremium && !nextLesson.isFreePreview;
            if (!isNextLocked) {
                setActiveLesson(nextLesson);
                const el = document.getElementById(`lesson-${nextLesson._id}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [activeLesson, completedLessonIds, lessons, isPremium, toggleComplete]);


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

    const isCurrentLessonLocked = Boolean(!isPremium && activeLesson && !activeLesson.isFreePreview);

    return (
        <div className="relative">
            {/* Bouton Toggle Menu (Mobile Uniquement) */}
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden fixed bottom-6 right-6 z-40 bg-brand-orange text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 font-bold"
            >
                <BookOpen className="w-6 h-6" />
                <span className="pr-1">Programme</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Colonne de gauche : Lecteur Vidéo */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {activeLesson ? (
                        <YouTubePlayer 
                            videoUrl={activeLesson.videoUrl || ""} 
                            isLocked={isCurrentLessonLocked}
                            onVideoEnd={handleVideoEnd} 
                        />
                    ) : (
                        <div className="w-full aspect-video bg-gray-900 rounded-3xl" />
                    )}

                    {activeLesson && (
                        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm transition-all animate-in fade-in zoom-in duration-300">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <div>
                                    <span className="text-sm font-bold text-brand-orange mb-1 tracking-wide uppercase block">
                                        Leçon {activeLesson.order}
                                    </span>
                                    <h1 className="text-2xl font-black text-gray-900">{activeLesson.title}</h1>
                                </div>
                                
                                <div className="flex flex-wrap gap-3">
                                    {activeLesson.pdfUrl && !isCurrentLessonLocked && (
                                        <a 
                                            href={activeLesson.pdfUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-5 py-3 rounded-xl font-bold transition-all shadow-sm"
                                        >
                                            <FileText className="w-5 h-5" />
                                            Support PDF
                                        </a>
                                    )}

                                    {!isCurrentLessonLocked && (
                                        <button
                                            onClick={() => toggleComplete(activeLesson._id, !completedLessonIds.includes(activeLesson._id))}
                                            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all shadow-sm
                                                ${completedLessonIds.includes(activeLesson._id) 
                                                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' 
                                                    : 'bg-gray-50 text-gray-600 hover:bg-emerald-600 hover:text-white'
                                                }
                                            `}
                                        >
                                            <CheckCircle2 className="w-5 h-5" />
                                            {completedLessonIds.includes(activeLesson._id) ? 'Terminée' : 'Marquer terminée'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">À propos de ce cours</h3>
                                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                                    {course.description}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Colonne de droite : Playlist (Desktop) & Overlay (Mobile) */}
                <>
                    {/* Overlay de fond pour mobile */}
                    {isSidebarOpen && (
                        <div 
                            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

                    <div className={`
                        lg:col-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden 
                        fixed lg:sticky lg:top-8 inset-y-0 right-0 z-50 w-[85%] max-w-sm lg:w-full lg:max-w-none
                        transform transition-transform duration-300 ease-in-out
                        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                    `}>
                        <div className="p-6 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-black text-gray-900">Sommaire</h2>
                                <p className="text-sm text-gray-500 font-medium">{lessons.length} {lessons.length > 1 ? 'chapitres' : 'chapitre'}</p>
                            </div>
                            <button 
                                onClick={() => setIsSidebarOpen(false)}
                                className="lg:hidden p-2 text-gray-400 hover:text-gray-900 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="h-full lg:max-h-[600px] overflow-y-auto w-full custom-scrollbar pb-24 lg:pb-0">
                            {lessons.map((lesson) => {
                                const isActive = activeLesson?._id === lesson._id;
                                const isLocked = !isPremium && !lesson.isFreePreview;
                                const isCompleted = completedLessonIds.includes(lesson._id);

                                return (
                                    <button
                                        key={lesson._id}
                                        id={`lesson-${lesson._id}`}
                                        onClick={() => {
                                            setActiveLesson(lesson);
                                            setIsSidebarOpen(false); // Fermer sur mobile après sélection
                                        }}
                                        className={`w-full text-left p-4 md:p-5 flex items-start gap-4 transition-all border-b border-gray-50 last:border-b-0
                                            ${isActive ? 'bg-orange-50/50' : 'hover:bg-gray-50'}
                                            ${isCompleted && !isActive ? 'bg-emerald-50/10' : ''}
                                        `}
                                    >
                                        <div className="mt-0.5 flex-shrink-0">
                                            {isActive ? (
                                                <div className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center animate-in zoom-in">
                                                    <PlayCircle className="w-5 h-5" />
                                                </div>
                                            ) : isLocked ? (
                                                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                                                    <Lock className="w-4 h-4" />
                                                </div>
                                            ) : isCompleted ? (
                                                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center animate-in zoom-in">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center group-hover:bg-brand-orange/10 group-hover:text-brand-orange transition-colors">
                                                    <Circle className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 pr-2">
                                            <div className="flex items-center flex-wrap gap-2 mb-1">
                                                <span className={`text-sm font-bold ${isActive ? 'text-brand-orange' : isCompleted ? 'text-emerald-700' : 'text-gray-900'}`}>
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
                </>
            </div>
        </div>
    );
}
