"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { classesDisponibles } from "@/lib/constants";

export default function ManualStudentRegistration() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        grade: classesDisponibles[0],
        school: "Lycée Leclerc"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/admin/eleves/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const data = await res.json();
                alert(`Succès! L'élève a été inscrit.\n\nIdentifiant de connexion généré : ${data.generatedEmail}\nMot de passe par défaut : ${data.generatedPassword}\n\nVeuillez noter ces informations pour les transmettre à l'élève.`);
                setFormData({ name: "", grade: classesDisponibles[0], school: "Lycée Leclerc" });
                router.refresh();
            } else {
                const data = await res.json();
                alert(`Erreur: ${data.message}`);
            }
        } catch (error) {
            console.error("Erreur réseau:", error);
            alert("Une erreur de connexion est survenue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm h-full flex flex-col justify-between">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Inscription Manuelle</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nom Complet</label>
                        <input 
                            type="text" 
                            required 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-orange outline-none bg-gray-50 focus:bg-white transition-colors" 
                            placeholder="Ex: Jean Dupont" 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Classe</label>
                        <select 
                            value={formData.grade}
                            onChange={(e) => setFormData({...formData, grade: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none bg-gray-50 focus:bg-white transition-colors"
                        >
                            {classesDisponibles.map(classe => (
                                <option key={classe} value={classe}>{classe}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Établissement</label>
                        <input 
                            type="text" 
                            value={formData.school}
                            onChange={(e) => setFormData({...formData, school: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none bg-gray-50 focus:bg-white transition-colors" 
                            placeholder="Ex: Collège Laval" 
                        />
                    </div>
                </div>

                <div className="mt-6 p-4 bg-brand-orange/5 border border-brand-orange/20 rounded-xl text-xs text-brand-orange-dark">
                    <strong>Note :</strong> L'élève n'ayant potentiellement pas d'adresse e-mail, le système va générer un identifiant unique (ex: jean.dupont.123@smartlearn-edu.org) et un mot de passe par défaut. L'élève aura instantanément le statut VIP.
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="mt-6 w-full py-3 px-4 bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-50 text-white rounded-xl font-bold transition-colors shadow-lg shadow-brand-orange/20"
            >
                {loading ? "Création en cours..." : "Créer le compte VIP"}
            </button>
        </form>
    );
}
