"use client";

import { useEffect, useState } from "react";
import { Lock, PlayCircle, Loader2 } from "lucide-react";

interface YouTubePlayerProps {
    videoUrl: string;
    isLocked?: boolean;
    onVideoEnd?: () => void;
}

export default function YouTubePlayer({ videoUrl, isLocked = false, onVideoEnd }: YouTubePlayerProps) {
    const [videoId, setVideoId] = useState<string | null>(null);

    useEffect(() => {
        if (!videoUrl) return;
        
        // Extract YouTube ID from various formats
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = videoUrl.match(regExp);
        
        if (match && match[2].length === 11) {
            setVideoId(match[2]);
        }
    }, [videoUrl]);

    if (isLocked) {
        return (
            <div className="w-full aspect-video bg-gray-900 rounded-3xl flex flex-col items-center justify-center p-8 text-center border-4 border-gray-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/10 to-transparent opacity-50" />
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500">
                    <Lock className="w-10 h-10 text-brand-orange animate-pulse" />
                </div>
                <h3 className="text-white text-2xl font-black mb-2 relative z-10">Contenu VIP</h3>
                <p className="text-gray-400 font-medium max-w-sm relative z-10">
                    Débloquez l'accès premium pour visionner cette leçon exclusive.
                </p>
            </div>
        );
    }

    if (!videoId) {
        return (
            <div className="w-full aspect-video bg-gray-900 rounded-3xl flex items-center justify-center text-gray-500 border-4 border-gray-800">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
                    <span className="font-bold">Chargement de la vidéo...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/5 relative group">
            <iframe
                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=0`}
                title="YouTube video player"
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
        </div>
    );
}
