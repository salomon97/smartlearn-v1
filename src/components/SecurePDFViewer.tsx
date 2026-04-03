"use client";

import { X, FileText, Download } from "lucide-react";

interface SecurePDFViewerProps {
    fileUrl: string;
    title: string;
    onClose: () => void;
}

export default function SecurePDFViewer({ fileUrl, title, onClose }: SecurePDFViewerProps) {
    // Utilisation directe de l'URL pour laisser le navigateur rendre son lecteur PDF complet  
    const viewUrl = fileUrl;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-md animate-in zoom-in-95 duration-500">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-slate-900/50 backdrop-blur border-b border-white/10 flex items-center justify-between px-4 sm:px-6 z-[110]">
                <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <h2 className="text-white font-bold max-w-lg truncate pr-4">{title}</h2>
                    <span className="hidden sm:inline-block text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full font-bold tracking-wider">
                        DOCUMENT OFFICIEL
                    </span>
                </div>
                
                <div className="flex items-center gap-4">
                    <a 
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="flex items-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-full transition-all"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Télécharger</span>
                    </a>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-red-500 text-white rounded-full backdrop-blur transition-colors duration-300 shadow-xl"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Zone de lecture : Iframe classique permettant les interactions natives (Scroll, Zoom, etc.) */}
            <div className="w-full h-full sm:h-[calc(100vh-80px)] sm:max-w-5xl sm:mt-16 bg-white sm:rounded-t-2xl md:rounded-3xl overflow-hidden shadow-2xl relative pt-16 sm:pt-0">
                <iframe
                    src={viewUrl}
                    className="w-full h-full border-0 bg-gray-100"
                    title={title}
                />
            </div>
        </div>
    );
}
