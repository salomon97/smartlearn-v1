"use client";

import { useState } from "react";
import { RefreshCw, Search, CheckCircle2, AlertCircle, Database, Youtube, Cloud, Loader2 } from "lucide-react";

export default function SyncCenterPage() {
    const [rootFolderId, setRootFolderId] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [logs, setLogs] = useState<{ type: 'info' | 'success' | 'error', message: string }[]>([]);
    const [stats, setStats] = useState({ driveFolders: 0, youtubePlaylists: 0, mappingsUpdated: 0 });

    const addLog = (type: 'info' | 'success' | 'error', message: string) => {
        setLogs(prev => [{ type, message }, ...prev].slice(0, 50));
    };

    const handleSync = async () => {
        if (!rootFolderId) {
            addLog('error', "Veuillez entrer l'ID du dossier racine Google Drive.");
            return;
        }

        setIsScanning(true);
        setLogs([]);
        addLog('info', "Initialisation de la synchronisation...");

        try {
            // 1. Sync Drive Folders
            addLog('info', "Scan du Google Drive en cours...");
            const driveRes = await fetch("/api/admin/sync/drive", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rootFolderId })
            });
            const driveData = await driveRes.json();
            
            if (driveRes.ok) {
                addLog('success', `${driveData.count} dossiers Drive synchronisés avec succès.`);
                setStats(prev => ({ ...prev, driveFolders: driveData.count }));
            } else {
                addLog('error', `Erreur Drive: ${driveData.message}`);
            }

            // 2. Sync YouTube Playlists
            addLog('info', "Scan de la chaîne YouTube en cours...");
            const ytRes = await fetch("/api/admin/sync/youtube", { method: "POST" });
            const ytData = await ytRes.json();

            if (ytRes.ok) {
                addLog('success', `${ytData.count} playlists YouTube liées.`);
                setStats(prev => ({ ...prev, youtubePlaylists: ytData.count }));
            } else {
                addLog('error', `Erreur YouTube: ${ytData.message}`);
            }

            addLog('success', "Synchronisation globale terminée !");

        } catch (error) {
            addLog('error', "Une erreur imprévue est survenue lors de la synchronisation.");
            console.error(error);
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-slate-900 mb-2">Centre de Synchronisation</h1>
                <p className="text-slate-500 font-medium">Automatisez le lien entre vos contenus cloud et le catalogue SmartLearn.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Cloud className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-900">{stats.driveFolders}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dossiers Drive</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                        <Youtube className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-900">{stats.youtubePlaylists}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Playlists YouTube</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-900">{stats.driveFolders + stats.youtubePlaylists}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mappings Actifs</div>
                    </div>
                </div>
            </div>

            {/* Configuration Card */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/10 blur-[100px]"></div>
                
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                        <RefreshCw className={`w-6 h-6 ${isScanning ? 'animate-spin' : ''}`} />
                        Lancement de la Synchronisation
                    </h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        Entrez l'ID du dossier racine Google Drive (le dossier qui contient "6ème", "5ème", etc.). L'algorithme scannera récursivement toute l'arborescence pour lier les PDF et les Playlists YouTube par nom de dossier.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                <Search className="w-5 h-5" />
                            </div>
                            <input 
                                type="text"
                                placeholder="ID du dossier racine (ex: 1z...)"
                                value={rootFolderId}
                                onChange={(e) => setRootFolderId(e.target.value)}
                                className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-brand-orange outline-none transition-all"
                            />
                        </div>
                        <button 
                            onClick={handleSync}
                            disabled={isScanning}
                            className="px-8 py-4 bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-all shadow-lg shadow-brand-orange/20 flex items-center justify-center gap-2"
                        >
                            {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : "Lancer le Scan"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Status Logs */}
            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col h-[400px]">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-black text-slate-900 flex items-center gap-2">
                        <Database className="w-4 h-4 text-slate-400" />
                        Journal d'exécution
                    </h3>
                    {isScanning && <span className="text-xs font-bold text-brand-orange animate-pulse uppercase tracking-widest">Opération en cours...</span>}
                </div>
                <div className="flex-1 p-6 overflow-y-auto font-mono text-sm space-y-3 bg-slate-50">
                    {logs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center italic">
                            Les logs s'afficheront ici lors de la synchronisation.
                        </div>
                    ) : (
                        logs.map((log, i) => (
                            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${
                                log.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                                log.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' :
                                'bg-white border-slate-200 text-slate-600 shadow-sm'
                            }`}>
                                {log.type === 'success' && <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />}
                                {log.type === 'error' && <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                                {log.type === 'info' && <RefreshCw className="w-4 h-4 mt-0.5 shrink-0 animate-spin" />}
                                <span className="font-bold">[{new Date().toLocaleTimeString()}]</span>
                                <span>{log.message}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
