"use client";

import { useEffect, useRef, useState } from "react";
import { Lock } from "lucide-react";
import Link from "next/link";

interface YouTubePlayerProps {
    videoUrl: string;
    isLocked?: boolean;
    onVideoEnd?: () => void; // Nouvelle prop pour détecter la fin
}

declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
        YT: any;
    }
}

export default function YouTubePlayer({ videoUrl, isLocked = false, onVideoEnd }: YouTubePlayerProps) {
    const [videoId, setVideoId] = useState<string | null>(null);
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!videoUrl || isLocked) return;

        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = videoUrl.match(regExp);

        if (match && match[2].length === 11) {
            setVideoId(match[2]);
        }
    }, [videoUrl, isLocked]);

    useEffect(() => {
        if (!videoId || isLocked) return;

        // Charger l'API YouTube si pas déjà là
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }

        const createPlayer = () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }

            if (!containerRef.current) return;

            // Créer un div enfant que YouTube pourra remplacer (sans détruire le div géré par React)
            const playerDiv = document.createElement('div');
            containerRef.current.innerHTML = '';
            containerRef.current.appendChild(playerDiv);

            playerRef.current = new window.YT.Player(playerDiv, {
                videoId: videoId,
                playerVars: {
                    rel: 0,
                    modestbranding: 1,
                    autoplay: 0,
                    controls: 1,
                },
                events: {
                    onStateChange: (event: any) => {
                        // YT.PlayerState.ENDED = 0
                        if (event.data === 0 && onVideoEnd) {
                            onVideoEnd();
                        }
                    },
                },
            });
        };

        if (window.YT && window.YT.Player) {
            createPlayer();
        } else {
            window.onYouTubeIframeAPIReady = createPlayer;
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, [videoId, isLocked, onVideoEnd]);

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
            <div ref={containerRef} className="w-full h-full"></div>
            <div className="absolute inset-x-0 top-0 bottom-[15%] z-10" onContextMenu={(e) => e.preventDefault()}></div>
        </div>
    );
}
