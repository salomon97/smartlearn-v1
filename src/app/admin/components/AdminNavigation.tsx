"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNavigation() {
    const pathname = usePathname();

    const links = [
        { href: "/admin", label: "Vue Globale", icon: "📊" },
        { href: "/admin/finances", label: "Finances & Retraits", icon: "💰" },
        { href: "/admin/eleves", label: "Gestion des Élèves", icon: "🎓" },
        { href: "/admin/affilies", label: "Affiliations", icon: "🤝" },
        { href: "/admin/cours", label: "Contenu Pédagogique", icon: "📚" },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col z-50">
            <div className="mb-10">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-2xl font-black text-brand-orange">Smart</span>
                    <span className="text-2xl font-black text-white">Learn</span>
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded ml-2">ADMIN</span>
                </Link>
            </div>

            <nav className="flex-1 space-y-2">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                                isActive
                                    ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                            }`}
                        >
                            <span className="text-xl">{link.icon}</span>
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-800">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition-colors"
                >
                    <span className="text-xl">🔙</span>
                    Retour au site
                </Link>
            </div>
        </aside>
    );
}
