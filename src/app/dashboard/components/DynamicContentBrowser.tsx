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
            <div className="bg-slate-50/80 p-6 md:p-10 rounded-[3rem] shadow-sm border border-slate-100/50 animate-in fade-in duration-700">
                <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4">
                    <h2 className="text-3xl font-black text-slate-800">Ressources VIP</h2>
                    <p className="text-slate-500 mt-2">Choisissez une matière pour explorer le contenu premium</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {["Mathématiques", "Informatique"].map((subject, idx) => (
                        <button
                            key={subject}
                            onClick={() => setSelectedSubject(subject)}
                            style={{ animationDelay: `${idx * 150}ms` }}
                            className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-md hover:shadow-2xl hover:shadow-brand-orange/10 hover:border-brand-orange/30 transition-all duration-500 ease-out text-left relative overflow-hidden hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8 fill-mode-backwards"
                        >
                            <div className="absolute -right-4 -top-4 w-32 h-32 bg-orange-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 ease-out"></div>
                            <div className="w-16 h-16 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300">
                                {subject === "Mathématiques" ? <Award className="w-8 h-8" /> : <BookOpen className="w-8 h-8" />}
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2 relative z-10">{subject}</h3>
                            <p className="text-gray-500 font-medium relative z-10">Accédez à vos cours, exercices et vidéos de {gradeLevel}.</p>
                            <div className="mt-8 flex items-center gap-2 text-brand-orange font-bold relative z-10">
                                Explorer le module <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 bg-slate-50/60 p-6 md:p-8 rounded-[3rem] border border-slate-100/80 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button 
                    onClick={() => setSelectedSubject(null)}
                    className="text-sm font-bold text-gray-500 hover:text-brand-orange flex items-center gap-2 transition-colors bg-white px-4 py-2 w-max rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-300"
                >
                    ← Retour
                </button>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                    {selectedSubject} <span className="text-slate-300">|</span> <span className="text-brand-orange">{gradeLevel}</span>
                </h2>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Lateral Menu */}
                <div className="w-full md:w-72 shrink-0 flex flex-col gap-2 p-4 bg-white/80 backdrop-blur-md rounded-[2rem] border border-white shadow-lg shadow-slate-200/50">
                    <h3 className="px-4 py-2 text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Ressources</h3>
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
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 text-left ${
                                selectedType === tab.id 
                                    ? "bg-brand-orange text-white shadow-md shadow-brand-orange/20 scale-[1.02]" 
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80"
                            }`}
                        >
                            <tab.icon className={`w-5 h-5 transition-colors ${selectedType === tab.id ? "text-white" : "text-slate-400"}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 w-full min-h-[400px]">
                    {itemsLoading ? (
                        <div className="flex justify-center py-32"><Loader2 className="w-10 h-10 animate-spin text-brand-orange" /></div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-24 bg-white/60 backdrop-blur border-2 border-dashed border-slate-200 rounded-[2.5rem] animate-in zoom-in-95 duration-500">
                            <Library className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-bold text-lg">Aucun contenu disponible</p>
                            <p className="text-slate-400 text-sm mt-1">Les professeurs mettront cette section à jour très bientôt.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {selectedType === "videos" ? (
                                items.map((video: any, idx: number) => (
                                    <a 
                                        key={video.id} 
                                        href={`https://www.youtube.com/watch?v=${video.id}`} 
                                        target="_blank"
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                        className="group bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-brand-orange/10 hover:border-brand-orange/40 transition-all duration-500 ease-out hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8 fill-mode-backwards"
                                    >
                                        <div className="aspect-video relative bg-slate-100 overflow-hidden">
                                            <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 group-hover:bg-slate-900/40 transition-colors duration-500">
                                                <div className="w-14 h-14 bg-brand-orange/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:bg-brand-orange transition-all duration-300">
                                                    <Video className="w-6 h-6 fill-current translate-x-0.5" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-5 bg-white">
                                            <h4 className="font-bold text-slate-800 line-clamp-2 group-hover:text-brand-orange transition-colors">{video.title}</h4>
                                        </div>
                                    </a>
                                ))
                            ) : (
                                items.map((file: any, idx: number) => (
                                    <a 
                                        key={file.id} 
                                        href={file.webViewLink} 
                                        target="_blank"
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                        className="flex items-center gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-brand-orange/10 hover:border-brand-orange/30 transition-all duration-300 ease-out hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards group"
                                    >
                                        <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-brand-orange shrink-0 group-hover:scale-110 group-hover:bg-brand-orange group-hover:text-white transition-all duration-300">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-800 truncate group-hover:text-brand-orange transition-colors">{file.name}</h4>
                                            <p className="text-[11px] text-slate-400 uppercase font-black tracking-wider mt-0.5">Document PDF</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-orange group-hover:translate-x-1 transition-all" />
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
