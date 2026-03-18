"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddLessonForm({ courseId, nextOrder }: { courseId: string, nextOrder: number }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // Au lieu de séparer les états, on groupe :
    const [formData, setFormData] = useState({
        title: "",
        videoUrl: "",
        pdfUrl: "",
        order: nextOrder,
        isFreePreview: false
    });
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            const res = await fetch(`/api/admin/cours/${courseId}/lessons`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setSuccess(true);
                // Reset form on success but increment order
                setFormData({
                    title: "",
                    videoUrl: "",
                    pdfUrl: "",
                    order: formData.order + 1,
                    isFreePreview: false
                });
                router.refresh();
                // Hide success message after 3 seconds
                setTimeout(() => setSuccess(false), 3000);
            } else {
                const data = await res.json();
                alert(`Erreur: ${data.message}`);
            }
        } catch (error) {
            console.error(error);
            alert("Erreur réseau");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm sticky top-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Ajouter une Leçon</h2>
            
            {success && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                    ✅ Leçon ajoutée avec succès !
                </div>
            )}
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Titre de la leçon</label>
                    <input 
                        type="text" 
                        required 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-orange outline-none bg-gray-50 focus:bg-white transition-colors" 
                        placeholder="Ex: Chapitre 1 - Introduction" 
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">URL YouTube (Optionnel)</label>
                    <input 
                        type="url" 
                        value={formData.videoUrl}
                        onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-orange outline-none bg-gray-50 focus:bg-white transition-colors" 
                        placeholder="https://youtube.com/watch?v=..." 
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">URL PDF (Optionnel)</label>
                    <input 
                        type="url" 
                        value={formData.pdfUrl}
                        onChange={(e) => setFormData({...formData, pdfUrl: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-orange outline-none bg-gray-50 focus:bg-white transition-colors" 
                        placeholder="Lien Google Drive public" 
                    />
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-1/3">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Ordre</label>
                        <input 
                            type="number" 
                            min="1"
                            value={formData.order}
                            onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 1})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-orange outline-none bg-gray-50 focus:bg-white transition-colors" 
                        />
                    </div>
                    <div className="w-2/3 pt-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={formData.isFreePreview}
                                onChange={(e) => setFormData({...formData, isFreePreview: e.target.checked})}
                                className="w-5 h-5 rounded border-gray-300 text-brand-orange focus:ring-brand-orange" 
                            />
                            <span className="text-sm font-medium text-gray-700">Aperçu Gratuit</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1 ml-7">Les visiteurs non-inscrits pourront voir cette leçon.</p>
                    </div>
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="mt-6 w-full py-3 px-4 bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-50 text-white rounded-xl font-bold transition-colors shadow-lg shadow-brand-orange/20"
            >
                {loading ? "Ajout en cours..." : "Ajouter la leçon"}
            </button>
        </form>
    );
}
