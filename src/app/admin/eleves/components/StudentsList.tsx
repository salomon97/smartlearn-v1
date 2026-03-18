"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2, CheckCircle, XCircle, Search, Filter } from "lucide-react";

interface Student {
    _id: string;
    name: string;
    email: string;
    grade_level?: string;
    school?: string;
    isPremium: boolean;
    createdAt: string;
}

export default function StudentsList({ initialStudents }: { initialStudents: Student[] }) {
    const router = useRouter();
    const [students, setStudents] = useState(initialStudents);
    const [filterVIP, setFilterVIP] = useState<"all" | "vip" | "free">("all");
    const [filterSchool, setFilterSchool] = useState("all");
    const [filterGrade, setFilterGrade] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [groupByRoom, setGroupByRoom] = useState(false);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    // Extraire les écoles uniques pour le filtre
    const schools = Array.from(new Set(students.map(s => s.school).filter(Boolean)));
    const grades = Array.from(new Set(students.map(s => s.grade_level).filter(Boolean)));

    const handleDelete = async (id: string) => {
        if (!confirm("⚠️ ATTENTION : Voulez-vous vraiment supprimer cet élève ?\nCette opération effacera son compte et son accès VIP définitivement.")) return;
        
        try {
            const res = await fetch(`/api/admin/eleves/${id}`, { method: "DELETE" });
            if (res.ok) {
                setStudents(students.filter(s => s._id !== id));
            } else {
                alert("Erreur lors de la suppression");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const togglePremium = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/admin/eleves/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isPremium: !currentStatus })
            });
            if (res.ok) {
                setStudents(students.map(s => s._id === id ? { ...s, isPremium: !currentStatus } : s));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredStudents = students.filter(s => {
        const matchesVIP = filterVIP === "all" ? true : filterVIP === "vip" ? s.isPremium : !s.isPremium;
        const matchesSchool = filterSchool === "all" ? true : s.school === filterSchool;
        const matchesGrade = filterGrade === "all" ? true : s.grade_level === filterGrade;
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             s.email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesVIP && matchesSchool && matchesGrade && matchesSearch;
    }).sort((a, b) => {
        if (sortOrder === "asc") return a.name.localeCompare(b.name);
        return b.name.localeCompare(a.name);
    });

    const groupedStudents = groupByRoom 
        ? filteredStudents.reduce((acc, curr) => {
            const room = curr.grade_level || "Non assigné";
            if (!acc[room]) acc[room] = [];
            acc[room].push(curr);
            return acc;
        }, {} as Record<string, Student[]>)
        : { "Résultats": filteredStudents };

    return (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm min-h-[600px]">
            {/* Header / Filtres */}
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Base de données élèves</h2>
                        <p className="text-sm text-gray-400 mt-1">{filteredStudents.length} élèves affichés</p>
                    </div>
                    
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold flex items-center gap-2 hover:border-brand-orange transition-all"
                        >
                            Nom {sortOrder === "asc" ? "A-Z ↑" : "Z-A ↓"}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Nom, email..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-orange w-full"
                        />
                    </div>

                    <select 
                        value={filterSchool}
                        onChange={(e) => setFilterSchool(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none cursor-pointer focus:border-brand-orange"
                    >
                        <option value="all">Tous Établissements</option>
                        {schools.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <select 
                        value={filterGrade}
                        onChange={(e) => setFilterGrade(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none cursor-pointer focus:border-brand-orange"
                    >
                        <option value="all">Toutes les classes</option>
                        {grades.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>

                    <select 
                        value={filterVIP}
                        onChange={(e) => setFilterVIP(e.target.value as any)}
                        className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none cursor-pointer focus:border-brand-orange"
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="vip">VIP Uniquement</option>
                        <option value="free">Gratuits Uniquement</option>
                    </select>
                </div>
                
                <div className="flex justify-end border-t border-gray-50 pt-4">
                    <button 
                        onClick={() => setGroupByRoom(!groupByRoom)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all flex items-center gap-2 ${groupByRoom ? 'bg-brand-orange text-white border-brand-orange shadow-lg shadow-brand-orange/20' : 'bg-white text-gray-400 border-gray-100 hover:border-brand-orange'}`}
                    >
                        <Filter className="w-3.5 h-3.5" />
                        {groupByRoom ? "Grouper par Classe : Activé" : "Grouper par Classe : Désactivé"}
                    </button>
                </div>
            </div>

            {/* Affichage par groupe ou liste */}
            <div className="space-y-8">
                {Object.entries(groupedStudents).sort().map(([room, list]) => (
                    <div key={room}>
                        {(groupByRoom || room !== "Résultats") && (
                            <div className="bg-gray-50 px-4 py-2 rounded-lg mb-4 flex items-center justify-between border-l-4 border-brand-orange">
                                <span className="font-bold text-gray-700">{room}</span>
                                <span className="text-xs bg-white px-2 py-1 rounded-full text-gray-500 shadow-sm">{list.length}</span>
                            </div>
                        )}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                                        <th className="pb-3 px-2">Élève</th>
                                        <th className="pb-3">Établissement</th>
                                        <th className="pb-3">Classe</th>
                                        <th className="pb-3 text-center">Accès</th>
                                        <th className="pb-3 text-right pr-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {list.map(student => (
                                        <tr key={student._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                                            <td className="py-3 px-2">
                                                <div className="font-bold text-gray-900">{student.name}</div>
                                                <div className="text-[10px] text-gray-400">{student.email}</div>
                                            </td>
                                            <td className="py-3 text-sm text-gray-600 font-medium">
                                                {student.school || '-'}
                                            </td>
                                            <td className="py-3 text-sm text-gray-600">
                                                {student.grade_level || '-'}
                                            </td>
                                            <td className="py-3 text-center">
                                                <button 
                                                    onClick={() => togglePremium(student._id, student.isPremium)}
                                                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${student.isPremium ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-400 border border-transparent hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600'}`}
                                                >
                                                    {student.isPremium ? 'VIP' : 'Gratuit'}
                                                </button>
                                            </td>
                                            <td className="py-3 text-right pr-4">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => handleDelete(student._id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Supprimer définitivement"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {list.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-gray-400 text-sm italic">
                                                Aucun élève ne correspond à votre recherche
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
