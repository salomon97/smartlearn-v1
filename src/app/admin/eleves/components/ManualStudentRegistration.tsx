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
        school: "Lycée Leclerc",
        email: "",
        phone: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/admin/eleves/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const data = await res.json();
                const noticeEmail = data.isSyntheticEmail
                    ? `Identifiant de connexion (généré, NON-fonctionnel pour le courrier) : ${data.generatedEmail}`
                    : `Email réel (relances envoyées ici) : ${data.generatedEmail}`;
                alert(`Succès! L'élève a été inscrit.\n\n${noticeEmail}\nMot de passe par défaut : ${data.generatedPassword}\n\nTransmettez ces informations à l'élève.`);
                setFormData({ name: "", grade: classesDisponibles[0], school: "Lycée Leclerc", email: "", phone: "" });
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
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-orange outline-none bg-gray-50 focus:bg-white transition-colors"
                            placeholder="Ex: Jean Dupont"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Téléphone <span className="text-red-500">*</span></label>
                        <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-orange outline-none bg-gray-50 focus:bg-white transition-colors"
                            placeholder="+237 6 XX XX XX XX"
                        />
                        <p className="text-[11px] text-gray-500 mt-1">Canal de relance principal (SMS à venir).</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email réel <span className="text-gray-400 font-normal">(optionnel)</span></label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-orange outline-none bg-gray-50 focus:bg-white transition-colors"
                            placeholder="prenom.nom@gmail.com"
                        />
                        <p className="text-[11px] text-gray-500 mt-1">Si renseigné, l'élève reçoit les emails de relance. Sinon un identifiant synthétique est généré pour le login.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Classe</label>
                        <select
                            aria-label="Classe"
                            value={formData.grade}
                            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
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
                            onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none bg-gray-50 focus:bg-white transition-colors"
                            placeholder="Ex: Collège Laval"
                        />
                    </div>
                </div>

                <div className="mt-6 p-4 bg-brand-orange/5 border border-brand-orange/20 rounded-xl text-xs text-brand-orange-dark">
                    <strong>Note :</strong> sans email réel, un identifiant de connexion synthétique est généré (l'élève peut se connecter mais ne recevra pas d'email de relance). Le téléphone reste le canal de contact.
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full py-3 px-4 bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-50 text-white rounded-xl font-bold transition-colors shadow-lg shadow-brand-orange/20"
            >
                {loading ? "Création en cours..." : "Créer le compte Premium"}
            </button>
        </form>
    );
}
