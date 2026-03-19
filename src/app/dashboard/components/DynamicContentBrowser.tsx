"use client";

import { useState, useEffect } from "react";
import { BookOpen, Video, FileText, Award, Library, Loader2, ChevronRight, Lock } from "lucide-react";

interface Mapping {
    subject: string;
    contentType: string;
    folderId: string;
    playlistId?: string;
}

export default function DynamicContentBrowser({ gradeLevel }: { gradeLevel: string }) {
    const [mappings, setMappings] = useState<Mapping[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<string>("chapters");
    const [items, setItems] = useState<any[]>([]);
    const [itemsLoading, setItemsLoading] = useState(false);

    // 1. Charger les mappings au montage
    useEffect(() => {
        async function fetchMappings() {
            try {
                const res = await fetch("/api/user/content");
                const data = await res.json();
                if (res.ok) {
                    setMappings(data.mappings);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchMappings();
    }, []);

    // 2. Charger le contenu (Drive ou YouTube) quand le sujet ou le type change
    useEffect(() => {
        if (!selectedSubject) return;

        async function fetchContent() {
            setItemsLoading(true);
            try {
                const mapping = mappings.find(m => m.subject === selectedSubject && m.contentType === selectedType);
                
                if (!mapping) {
                    setItems([]);
                    return;
                }

                let url = "";
                if (selectedType === "videos") {
                    // Logique YouTube (à implémenter si on ajoute des playlists au mapping)
                    if (mapping.playlistId) {
                        url = `/api/user/content/youtube?playlistId=${mapping.playlistId}`;
                    } else {
                        setItems([]);
                        return;
                    }
                } else {
                    // Logique Drive
                    url = `/api/user/content/drive?folderId=${mapping.folderId}`;
                }

                if (url) {
                    const res = await fetch(url);
                    const data = await res.json();
                    setItems(selectedType === "videos" ? data.videos : data.files);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setItemsLoading(false);
            }
        }
        fetchContent();
    }, [selectedSubject, selectedType, mappings]);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-orange" /></div>;

    if (!selectedSubject) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {["Mathématiques", "Informatique"].map(subject => (
                    <button
                        key={subject}
                        onClick={() => setSelectedSubject(subject)}
                        className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand-orange transition-all text-left relative overflow-hidden"
                    >
                        <div className="absolute -right-4 -top-4 w-32 h-32 bg-orange-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
                        <div className="w-16 h-16 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange mb-6 relative z-10">
                            {subject === "Mathématiques" ? <Award className="w-8 h-8" /> : <BookOpen className="w-8 h-8" />}
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2 relative z-10">{subject}</h3>
                        <p className="text-gray-500 font-medium relative z-10">Accédez à vos cours, exercices et vidéos de {gradeLevel}.</p>
                        <div className="mt-8 flex items-center gap-2 text-brand-orange font-bold relative z-10">
                            Explorer le module <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button 
                    onClick={() => setSelectedSubject(null)}
                    className="text-sm font-bold text-gray-500 hover:text-brand-orange flex items-center gap-2 transition-colors bg-white px-4 py-2 w-max rounded-xl border border-gray-100 shadow-sm"
                >
                    ← Retour
                </button>
                <h2 className="text-2xl font-black text-gray-900">{selectedSubject} <span className="text-brand-orange">|</span> {gradeLevel}</h2>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Lateral Menu */}
                <div className="w-full md:w-72 shrink-0 flex flex-col gap-2 p-4 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                    <h3 className="px-4 py-2 text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Ressources</h3>
                    {[
                        { id: 'chapters', label: 'Chapitres', icon: FileText },
                        { id: 'evaluations', label: 'Évaluations', icon: Award },
                        { id: 'annales_officiels', label: 'Examens Officiels', icon: Library },
                        { id: 'annales_blancs', label: 'Examens Blancs', icon: Library },
                        { id: 'videos', label: 'Vidéos', icon: Video },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedType(tab.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left ${
                                selectedType === tab.id 
                                    ? "bg-orange-50 text-brand-orange" 
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                        >
                            <tab.icon className={`w-5 h-5 ${selectedType === tab.id ? "text-brand-orange" : "text-gray-400"}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 w-full min-h-[400px]">
                    {itemsLoading ? (
                        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-orange" /></div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-20 bg-white border-2 border-dashed border-gray-100 rounded-[2.5rem]">
                            <p className="text-gray-400 font-bold">Aucun contenu disponible dans cette section pour le moment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {selectedType === "videos" ? (
                                items.map((video: any) => (
                                    <a 
                                        key={video.id} 
                                        href={`https://www.youtube.com/watch?v=${video.id}`} 
                                        target="_blank"
                                        className="group bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl hover:border-brand-orange/50 transition-all"
                                    >
                                        <div className="aspect-video relative bg-gray-200">
                                            <img src={video.thumbnail} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                                <div className="w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                                    <Video className="w-6 h-6 fill-current translate-x-0.5" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <h4 className="font-bold text-gray-900 line-clamp-2">{video.title}</h4>
                                        </div>
                                    </a>
                                ))
                            ) : (
                                items.map((file: any) => (
                                    <a 
                                        key={file.id} 
                                        href={file.webViewLink} 
                                        target="_blank"
                                        className="flex items-center gap-4 bg-white p-5 rounded-3xl border border-gray-100 hover:border-brand-orange hover:shadow-lg transition-all"
                                    >
                                        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-brand-orange shrink-0">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 truncate">{file.name}</h4>
                                            <p className="text-xs text-gray-400 uppercase font-black">Document PDF</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-300" />
                                    </a>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
