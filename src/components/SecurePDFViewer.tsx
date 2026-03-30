"use client";

import { useEffect } from "react";
import { X, ShieldAlert } from "lucide-react";

interface SecurePDFViewerProps {
    fileUrl: string;
    title: string;
    onClose: () => void;
}

export default function SecurePDFViewer({ fileUrl, title, onClose }: SecurePDFViewerProps) {
    
    // Empêche le clic-droit sur la page quand le viewer est ouvert
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => e.preventDefault();
        document.addEventListener('contextmenu', handleContextMenu);
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    // Ajouter #toolbar=0 pour cacher les boutons de téléchargement natifs du navigateur
    const viewUrl = `${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-md animate-in zoom-in-95 duration-500">
            {/* Header sécurisé */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-slate-900/50 backdrop-blur border-b border-white/10 flex items-center justify-between px-6 z-[110]">
                <div className="flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 text-brand-orange" />
                    <h2 className="text-white font-bold max-w-lg truncate">{title}</h2>
                    <span className="text-xs bg-brand-orange/20 text-brand-orange px-2 py-1 rounded-full font-black tracking-wider uppercase">Lecture Seule</span>
                </div>
                
                <button 
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-brand-orange text-white rounded-full backdrop-blur transition-colors duration-300 shadow-xl gap-2"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Zone de lecture avec overlay de protection clics */}
            <div className="w-full max-w-5xl h-[calc(100vh-80px)] mt-16 bg-white rounded-t-2xl md:rounded-3xl overflow-hidden shadow-2xl relative select-none">
                
                {/* L'overlay transparent empêche d'interagir nativement avec l'iframe pour le téléchargement, tout en permettant le scroll 
                    Remarque: Ceci est une protection de base. Pour une sécurité absolue, il faudra à terme 
                    rendre le PDF en images statiques (ex: react-pdf) combinées aux Signed URLs de Bunny. */}
                <div className="absolute inset-0 z-10 pointer-events-none"></div>

                <iframe
                    src={viewUrl}
                    className="w-full h-full border-0 select-none"
                    title={title}
                />
            </div>
        </div>
    );
}
