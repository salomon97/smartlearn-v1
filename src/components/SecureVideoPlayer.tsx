"use client";

import { X } from "lucide-react";

interface SecureVideoPlayerProps {
    videoId: string;
    libraryId: string;
    title: string;
    onClose: () => void;
}

export default function SecureVideoPlayer({ videoId, libraryId, title, onClose }: SecureVideoPlayerProps) {
    // URL d'intégration standard de Bunny Stream
    const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-md animate-in fade-in duration-500">
            <div className="absolute top-6 right-6 z-[110]">
                <button 
                    onClick={onClose}
                    className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-brand-orange text-white rounded-full backdrop-blur transition-all duration-300 hover:scale-110 shadow-2xl"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="w-full max-w-6xl mx-auto p-4 flex flex-col items-center">
                <h2 className="text-white font-black text-2xl md:text-3xl mb-6 text-center shadow-sm drop-shadow-md">
                    {title}
                </h2>
                
                <div className="w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/5 relative">
                    {/* Le lecteur iframe sécurisé de Bunny */}
                    <iframe
                        src={embedUrl}
                        loading="lazy"
                        className="border-0 w-full h-full absolute inset-0"
                        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                        allowFullScreen={true}
                    ></iframe>
                </div>
                
                <p className="mt-8 text-slate-400 text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Lecture sécurisée active
                </p>
            </div>
        </div>
    );
}
