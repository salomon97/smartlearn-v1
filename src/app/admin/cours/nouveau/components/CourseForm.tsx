"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Save, BookOpen, Image as ImageIcon } from "lucide-react";
import { classesDisponibles } from "@/lib/constants";

export default function CourseForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Champs du formulaire
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        grade_level: classesDisponibles[0], // Valeur par défaut dynamique
        imageUrl: "",
        isPublished: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        // Gestion spéciale pour la checkbox
        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/admin/cours", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Une erreur est survenue");
            }

            setSuccess(true);
            
            // Rediriger vers la page d'ajout des leçons du nouveau cours après 1 seconde
            setTimeout(() => {
                router.push(`/admin/cours/${data.courseId}`);
            }, 1000);

        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Messages de Statut */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl flex items-center gap-3 border border-emerald-100">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">Formation créée ! Redirection vers l'ajout des vidéos...</p>
                </div>
            )}

            {/* Bloc Paramètres Principaux */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-bold text-gray-900 mb-2">Titre de la Formation</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        required
                        placeholder="Ex: Mathématiques - Les Fonctions Affines"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all placeholder-gray-400 font-medium"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-bold text-gray-900 mb-2">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        required
                        rows={4}
                        placeholder="Que vont apprendre les élèves dans ce module ?"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all placeholder-gray-400 custom-scrollbar resize-none"
                    ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="grade_level" className="block text-sm font-bold text-gray-900 mb-2">Niveau de Classe</label>
                        <select
                            id="grade_level"
                            name="grade_level"
                            required
                            value={formData.grade_level}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all cursor-pointer font-medium appearance-none"
                        >
                            {classesDisponibles.map(classe => (
                                <option key={classe} value={classe}>{classe}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="imageUrl" className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-gray-400" /> Image de Couverture (Optionnel)
                        </label>
                        <input
                            type="url"
                            id="imageUrl"
                            name="imageUrl"
                            placeholder="Lien HTTPS de l'image"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition-all placeholder-gray-400"
                        />
                    </div>
                </div>
            </div>

            {/* Bloc Paramètres de Visibilité */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 border border-gray-200">
                <div className="flex items-start gap-4">
                    <div className="flex items-center h-5 mt-1">
                        <input
                            id="isPublished"
                            name="isPublished"
                            type="checkbox"
                            checked={formData.isPublished}
                            onChange={handleChange}
                            className="w-5 h-5 text-brand-orange bg-white border-gray-300 rounded focus:ring-brand-orange focus:ring-2 cursor-pointer transition-all"
                        />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="isPublished" className="text-base font-bold text-gray-900 cursor-pointer">
                            Publier immédiatement
                        </label>
                        <p className="text-sm text-gray-500 mt-1">
                            Si décoché, cette formation sera visible à l'état de "Brouillon" uniquement pour vous, le temps que vous prépariez les vidéos.
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                    disabled={isLoading}
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-3 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-orange/20 flex items-center gap-2 disabled:opacity-70"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    {isLoading ? "Création..." : "Créer la formation"}
                </button>
            </div>

        </form>
    );
}
