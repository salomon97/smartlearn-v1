"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function UserNav({ session }: { session: any }) {
    if (!session) {
        return (
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                <Link href="/catalogue" className="text-white/80 hover:text-teal transition-colors">
                    Catalogue
                </Link>
                <Link href="/auth/connexion" className="text-white/80 hover:text-white transition-colors">
                    Connexion
                </Link>
                <Link
                    href="/auth/inscription"
                    className="bg-orange hover:bg-orange/90 text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-md hover:shadow-lg hover:shadow-orange/30"
                >
                    Créer un compte
                </Link>
            </nav>
        );
    }

    return (
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/catalogue" className="text-white/80 hover:text-teal transition-colors">
                Catalogue
            </Link>
            <Link href="/dashboard" className="text-white hover:text-teal font-semibold transition-colors">
                Tableau de bord
            </Link>
            <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full font-semibold transition-all border border-white/10"
            >
                Déconnexion
            </button>
        </nav>
    );
}
