"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowUpDown, ExternalLink, Trash2, Filter } from "lucide-react";
import EditRateForm from "./EditRateForm";
import Link from "next/link";

interface Affiliate {
    _id: string;
    name: string;
    email: string;
    codeAffiliation?: string;
    commission_rate?: number;
    balance_available?: number;
    balance_pending?: number;
}

export default function AffiliatesList({ initialAffiliates }: { initialAffiliates: Affiliate[] }) {
    const router = useRouter();
    const [affiliates, setAffiliates] = useState(initialAffiliates);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const handleDelete = async (id: string) => {
        if (!confirm("⚠️ ATTENTION : Voulez-vous vraiment supprimer ce compte ambassadeur ?\nTOUTES les données (solde, parrainages) seront perdues définitivement.")) return;
        
        try {
            const res = await fetch(`/api/admin/affilies/${id}`, { method: "DELETE" });
            if (res.ok) {
                setAffiliates(affiliates.filter(a => a._id !== id));
                router.refresh();
            } else {
                alert("Erreur lors de la suppression");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredAffiliates = affiliates.filter(a => 
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.codeAffiliation?.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => {
        if (sortOrder === "asc") return a.name.localeCompare(b.name);
        return b.name.localeCompare(a.name);
    });

    return (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Liste des Ambassadeurs</h2>
                    <p className="text-sm text-gray-400 mt-1">{filteredAffiliates.length} affiliés actifs</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Rechercher..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-orange w-64"
                        />
                    </div>

                    <button 
                        onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold flex items-center gap-2 hover:border-brand-orange transition-all"
                    >
                        <ArrowUpDown className="w-4 h-4" />
                        A-Z {sortOrder === "asc" ? "↑" : "↓"}
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                            <th className="pb-3 px-2">Nom / E-mail</th>
                            <th className="pb-3">Code Promo</th>
                            <th className="pb-3 text-center">Taux</th>
                            <th className="pb-3 text-center">Solde (Dispo / Attente)</th>
                            <th className="pb-3 text-right pr-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAffiliates.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-gray-400 font-medium italic">
                                    Aucun ambassadeur trouvé
                                </td>
                            </tr>
                        ) : filteredAffiliates.map(affiliate => (
                            <tr key={affiliate._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                                <td className="py-4 px-2">
                                    <div className="font-bold text-gray-900">{affiliate.name}</div>
                                    <div className="text-[10px] text-gray-500">{affiliate.email}</div>
                                </td>
                                <td className="py-4 font-mono text-sm">
                                    <span className="bg-slate-50 text-slate-600 px-2 py-1 rounded border border-slate-100">
                                        {affiliate.codeAffiliation || '-'}
                                    </span>
                                </td>
                                <td className="py-4 text-center">
                                    <span className="bg-brand-orange/5 text-brand-orange font-bold px-2 py-1 rounded text-xs">
                                        {affiliate.commission_rate || 10}%
                                    </span>
                                </td>
                                <td className="py-4 text-center">
                                    <div className="text-sm font-black text-emerald-600">{affiliate.balance_available || 0} F</div>
                                    <div className="text-[10px] font-bold text-amber-500">+{affiliate.balance_pending || 0} F</div>
                                </td>
                                <td className="py-4 text-right pr-4">
                                    <div className="flex items-center justify-end gap-3 translate-x-2 group-hover:translate-x-0 transition-transform">
                                        <Link 
                                            href={`/admin/affilies/${affiliate._id}`}
                                            className="p-2 text-gray-400 hover:text-blue-500 rounded-lg transition-colors"
                                            title="Détails complets"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </Link>
                                        <EditRateForm affiliateId={affiliate._id} currentRate={affiliate.commission_rate || 10} />
                                        <button 
                                            onClick={() => handleDelete(affiliate._id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Supprimer définitivement"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
