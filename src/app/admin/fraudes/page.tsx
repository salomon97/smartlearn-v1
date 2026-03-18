import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { ShieldAlert, User as UserIcon, Globe, Mail, Ban, AlertTriangle, Handshake } from "lucide-react";

export default async function AdminFraudsPage() {
    await connectToDatabase();

    // Récupérer les transactions suspectes
    const transactions = await Transaction.find({ status: 'fraud_suspected' })
                                        .sort({ createdAt: -1 })
                                        .lean();

    // Enrichir avec les données utilisateurs
    const fraudReports = await Promise.all(transactions.map(async (t: any) => {
        const buyer = await User.findById(t.userId).select("name email role").lean();
        const parrain = t.parrainId ? await User.findById(t.parrainId).select("name email role").lean() : null;
        
        return {
            ...t,
            buyer,
            parrain
        };
    }));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
                    <ShieldAlert className="w-8 h-8 text-red-500" />
                    Surveillance des Fraudes
                </h1>
                <p className="text-gray-500">Liste des tentatives d'auto-affiliation et anomalies de connexions détectées.</p>
            </div>

            {fraudReports.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-[2.5rem] py-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-400 font-medium">Aucune tentative de fraude détectée pour le moment. Félicitations !</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {fraudReports.map((report: any) => (
                        <div key={report._id.toString()} className="bg-white border border-red-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all">
                            <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
                                <div className="flex items-center gap-2 text-red-700 font-bold">
                                    <AlertTriangle className="w-5 h-5" />
                                    <span>#{report._id.toString().substring(0, 8)} - {report.metadata?.fraudReason || "Anomalie détectée"}</span>
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-red-400 bg-white px-3 py-1 rounded-full">
                                    {new Date(report.createdAt).toLocaleString('fr-FR')}
                                </span>
                            </div>

                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {/* Acheteur */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                        <UserIcon className="w-4 h-4" /> Acheteur (Élève)
                                    </h3>
                                    <div className="bg-gray-50 p-4 rounded-2xl">
                                        <p className="font-bold text-gray-900">{report.buyer?.name || "Inconnu"}</p>
                                        <p className="text-sm text-gray-500 flex items-center gap-2"><Mail className="w-3 h-3" /> {report.buyer?.email}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded uppercase">{report.buyer?.role}</span>
                                            <span className="text-xs text-gray-400 flex items-center gap-1"><Globe className="w-3 h-3" /> {report.metadata?.buyerIp}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Parrain */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                        <Handshake className="w-4 h-4" /> Parrain (Affilié)
                                    </h3>
                                    <div className="bg-gray-50 p-4 rounded-2xl">
                                        <p className="font-bold text-gray-900">{report.parrain?.name || "Inconnu"}</p>
                                        <p className="text-sm text-gray-500 flex items-center gap-2"><Mail className="w-3 h-3" /> {report.parrain?.email}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-[10px] font-black bg-amber-100 text-amber-600 px-2 py-0.5 rounded uppercase">{report.parrain?.role}</span>
                                            <span className="text-xs text-gray-400 flex items-center gap-1"><Globe className="w-3 h-3" /> {report.metadata?.parrainIp}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Verdict / Action */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                        <Ban className="w-4 h-4" /> Statut & Impact
                                    </h3>
                                    <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100">
                                        <p className="text-sm font-bold text-red-600 mb-2">Commission Bloquée : 0 FCFA</p>
                                        <p className="text-[11px] text-gray-500 leading-relaxed uppercase font-bold tracking-tight">
                                            L'acheteur a bien été activé VIP (paiement reçu de {report.amount}F), mais le parrain n'a pas reçu sa commission car ils partagent la même IP ou le même email.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Icon non défini dans lucide-react (Handshake est Handshake - déjà importé en haut)
