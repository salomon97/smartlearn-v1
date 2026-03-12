"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteLessonButton({ lessonId }: { lessonId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Voulez-vous vraiment supprimer cette leçon ? Cette action est irréversible.")) return;
        
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/lessons/${lessonId}`, {
                method: "DELETE"
            });

            if (res.ok) {
                router.refresh(); // Rafraîchit la liste
            } else {
                const data = await res.json();
                alert(`Erreur: ${data.message}`);
            }
        } catch (error) {
            console.error("Erreur réseau:", error);
            alert("Erreur de connexion");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            type="button" 
            onClick={handleDelete}
            disabled={loading}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50"
        >
            {loading ? "Suppression..." : "Supprimer"}
        </button>
    );
}
