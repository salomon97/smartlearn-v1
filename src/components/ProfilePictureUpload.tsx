"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface ProfilePictureUploadProps {
    currentImage?: string;
    userName: string;
}

export default function ProfilePictureUpload({ currentImage, userName }: ProfilePictureUploadProps) {
    const [image, setImage] = useState<string | null>(currentImage || null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Prévisualisation immédiate
        const objectUrl = URL.createObjectURL(file);
        setImage(objectUrl);
        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/user/profile-picture", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Erreur lors du téléchargement");
            }

            const data = await res.json();
            setImage(data.imageUrl); // Utiliser la vraie URL retournée
            router.refresh(); // Rafraîchir la page pour update la session
        } catch (err: any) {
            setError(err.message);
            setImage(currentImage || null); // Revenir à l'image précédente
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-orange to-red-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-brand-orange/20 overflow-hidden border-2 border-transparent group-hover:border-white transition-all">
                {image ? (
                    <Image src={image} alt={userName} fill className="object-cover" />
                ) : (
                    userName?.charAt(0).toUpperCase()
                )}
            </div>

            {/* Overlay d'édition */}
            <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </div>

            {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
            {error && <p className="text-red-500 text-xs mt-2 absolute -bottom-6 w-max">{error}</p>}
        </div>
    );
}
