"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, LayoutDashboard, CreditCard, Users, BookOpen, Handshake, ShieldAlert, RefreshCw, Activity, LogOut, Wrench } from "lucide-react";
import { signOut } from "next-auth/react";
import { Logo } from "@/components/ui/Logo";


export default function AdminNavigation() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const links = [
        { href: "/admin", label: "Vue Globale", icon: <LayoutDashboard size={20} /> },
        { href: "/admin/finances", label: "Finances & Retraits", icon: <CreditCard size={20} /> },
        { href: "/admin/eleves", label: "Gestion des Élèves", icon: <Users size={20} /> },
        { href: "/admin/retention", label: "Rétention", icon: <Activity size={20} /> },
        { href: "/admin/affilies", label: "Affiliations", icon: <Handshake size={20} /> },
        { href: "/admin/cours", label: "Contenu Pédagogique", icon: <BookOpen size={20} /> },
        { href: "/admin/reconcile", label: "Réconcilier paiement", icon: <Wrench size={20} /> },
        { href: "/admin/sync", label: "Synchronisation", icon: <RefreshCw size={20} /> },
        { href: "/admin/fraudes", label: "Surveillance Fraudes", icon: <ShieldAlert size={20} /> },
    ];

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Bouton Mobile Toggle (Fixé en haut à droite pour être accessible) */}
            <button
                type="button"
                onClick={toggleMenu}
                aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
                className="md:hidden fixed top-3 right-4 z-[70] p-2 bg-slate-800 text-white rounded-lg shadow-lg border border-slate-700 active:scale-95 transition-all"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay pour mobile */}
            {isOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[55] animate-in fade-in duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar (Responsive Overlay on mobile, Side-fixed on desktop) */}
            <aside className={`
                fixed left-0 top-0 h-screen w-64 bg-navy border-r border-white/5 p-6 flex flex-col z-[60]
                transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
                md:translate-x-0
            `}>
                <div className="mb-10">
                    <Link href="/" className="block" aria-label="SmartLearn — Accueil">
                        <Logo variant="compact" theme="dark" size={32} />
                    </Link>
                    <span className="inline-block mt-3 text-[10px] font-bold text-red-400 uppercase tracking-[0.2em] bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                        Plateforme Admin
                    </span>
                </div>

                <nav className="flex-1 space-y-1.5">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all text-sm ${
                                    isActive
                                        ? "bg-teal/15 text-teal border border-teal/30"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                <span className={isActive ? "text-teal" : "text-slate-500"}>{link.icon}</span>
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto pt-6 border-t border-white/5 space-y-2">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white transition-all font-medium text-xs bg-white/5 rounded-xl hover:bg-white/10"
                    >
                        <LayoutDashboard size={14} />
                        Retour au tableau de bord
                    </Link>
                    <button
                        type="button"
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all font-semibold text-sm rounded-2xl border border-transparent hover:border-red-500/20"
                    >
                        <LogOut size={18} />
                        Déconnexion
                    </button>
                </div>
            </aside>
        </>
    );
}
