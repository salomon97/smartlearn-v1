"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function UserNav({ session }: { session: any }) {
    if (!session) {
        return (
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                <Link href="/catalogue" className="hover:text-[var(--primary-gold)] transition-colors">Le Catalogue</Link>
                <Link href="/auth/connexion" className="text-white hover:text-white/80 transition-colors">Connexion</Link>
                <Link href="/auth/inscription" className="bg-[var(--primary-gold)] hover:bg-[var(--primary-gold-hover)] text-[var(--primary-dark)] px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg shadow-[var(--primary-gold)]/20">
                    Rejoindre l'Excellence
                </Link>
            </nav>
        );
    }

    return (
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/catalogue" className="hover:text-[var(--primary-gold)] transition-colors">Le Catalogue</Link>
            <Link href="/dashboard" className="text-white hover:text-[var(--primary-gold)] font-bold transition-colors">Mon Dashboard</Link>
            <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full font-bold transition-all border border-white/10"
            >
                Déconnexion
            </button>
        </nav>
    );
}
