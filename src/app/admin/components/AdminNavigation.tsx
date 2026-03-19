"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, LayoutDashboard, CreditCard, Users, BookOpen, Handshake, ShieldAlert, LogOut } from "lucide-react";
import { Menu, X, LayoutDashboard, CreditCard, Users, BookOpen, Handshake, ShieldAlert, RefreshCw, LogOut } from "lucide-react";

export default function AdminNavigation() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const links = [
        { href: "/admin", label: "Vue Globale", icon: <LayoutDashboard size={20} /> },
        { href: "/admin/finances", label: "Finances & Retraits", icon: <CreditCard size={20} /> },
        { href: "/admin/eleves", label: "Gestion des Élèves", icon: <Users size={20} /> },
        { href: "/admin/affilies", label: "Affiliations", icon: <Handshake size={20} /> },
        { href: "/admin/cours", label: "Contenu Pédagogique", icon: <BookOpen size={20} /> },
        { href: "/admin/sync", label: "Synchronisation", icon: <RefreshCw size={20} /> },
        { href: "/admin/fraudes", label: "Surveillance Fraudes", icon: <ShieldAlert size={20} /> },
    ];

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Bouton Mobile Toggle (Fixé en haut à droite pour être accessible) */}
            <button 
                onClick={toggleMenu}
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
                fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 p-8 flex flex-col z-[60]
                transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
                md:translate-x-0
            `}>
                <div className="mb-12">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-orange rounded-2xl flex items-center justify-center shadow-lg shadow-brand-orange/20">
                            <span className="text-white font-black text-xl">S</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black text-white leading-none">Smart<span className="text-brand-orange">Learn</span></span>
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1">Plateforme Admin</span>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 space-y-3">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all text-sm ${
                                    isActive
                                        ? "bg-brand-orange text-white shadow-xl shadow-brand-orange/20 scale-[1.02]"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                }`}
                            >
                                <span className={isActive ? "text-white" : "text-slate-500"}>{link.icon}</span>
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto pt-8 border-t border-slate-800">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-4 px-5 py-4 text-slate-400 hover:text-white transition-all font-bold text-sm bg-slate-800/30 rounded-2xl hover:bg-slate-800/50"
                    >
                        <LogOut size={18} />
                        Retour au site
                    </Link>
                </div>
            </aside>
        </>
    );
}
