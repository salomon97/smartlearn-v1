"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import Link from "next/link";

interface YouTubePlayerProps {
    videoUrl: string;
    isLocked?: boolean; // Si true, affiche le paywall au lieu de la vidéo
}

export default function YouTubePlayer({ videoUrl, isLocked = false }: YouTubePlayerProps) {
    const [videoId, setVideoId] = useState<string | null>(null);

    useEffect(() => {
        if (!videoUrl || isLocked) return;

        // Extract YouTube ID from various formats
        // ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ
        // ex: https://youtu.be/dQw4w9WgXcQ
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = videoUrl.match(regExp);

        if (match && match[2].length === 11) {
            setVideoId(match[2]);
        }
    }, [videoUrl, isLocked]);

    if (isLocked) {
        return (
            <div className="w-full aspect-video bg-gray-900 rounded-3xl overflow-hidden relative flex flex-col items-center justify-center text-center p-6 border-4 border-gray-800 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-0"></div>
                
                <div className="relative z-10 space-y-6 max-w-md mx-auto">
                    <div className="w-20 h-20 bg-gray-800/80 backdrop-blur-md rounded-full flex items-center justify-center mx-auto border border-gray-700 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                        <Lock className="w-10 h-10 text-yellow-500" />
                    </div>
                    
                    <div>
                        <h2 className="text-2xl font-black text-white mb-2">Contenu Exclusif VIP</h2>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Cette vidéo fait partie du programme Premium. Débloquez l'accès complet à ce cours et à toute la plateforme.
                        </p>
                    </div>

                    <Link 
                        href="/dashboard/vip" 
                        className="inline-block bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-gray-900 font-black py-4 px-8 rounded-full transition-all hover:scale-105 shadow-[0_0_40px_rgba(234,179,8,0.3)]"
                    >
                        Devenir VIP Maintenant
                    </Link>
                </div>
            </div>
        );
    }

    if (!videoId) {
        return (
            <div className="w-full aspect-video bg-gray-100 rounded-3xl flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-200">
                <p className="font-bold mb-1">Vidéo Introuvable</p>
                <p className="text-sm">Le lien de la vidéo semble invalide ou manquant.</p>
            </div>
        );
    }

    return (
        <div className="w-full aspect-video bg-black rounded-3xl overflow-hidden relative shadow-lg">
            {/* L'iframe YouTube avec les paramètres de sécurité (modestbranding, rel=0, etc.) */}
            <iframe
                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&controls=1&fs=1`}
                title="SmartLearn Video Player"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>

            {/* Couche de protection transparente pour empêcher le clic droit facile sur la vidéo */}
            {/* On la laisse un peu plus petite en bas pour permettre de cliquer sur les contrôles YouTube standards */}
            <div 
                className="absolute inset-x-0 top-0 bottom-[15%] z-10" 
                onContextMenu={(e) => e.preventDefault()}
                onClick={(e) => {
                    // Cette div intercepte les clics normaux sur la vidéo (ce qui empêche pause/play en cliquant au centre)
                    // Mais on la garde pour empêcher le menu contextuel.
                    // Si on veut permettre le clic gauche pour pause/play, il vaut mieux laisser le clic passer
                    // et juste gérer onContextMenu, mais YouTube iframe bloque souvent les events custom au-dessus.
                    // Pour le MVP, le bottom-[15%] laisse la Control Bar cliquable en bas.
                }}
            ></div>
        </div>
    );
}
