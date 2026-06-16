"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function UserNav({ session }: { session: any }) {
    const [open, setOpen] = useState(false);

    // Ferme le menu mobile dès que l'utilisateur navigue ou redimensionne au-dessus de md
    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth >= 768) setOpen(false);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Empêche le scroll du body quand le drawer mobile est ouvert
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    const u = session?.user as any;
    const isAdmin = u?.role === 'admin';
    const isOnTrial = !!u?.isOnTrial;
    const isPremiumPaid = !!u?.isPremium && !isOnTrial;
    const isFree = !!session && !u?.isPremium && !isAdmin;

    const links: Array<{ href: string; label: string; variant: 'text' | 'text-strong' | 'cta' | 'trial-badge' }> = [];

    if (!session) {
        links.push({ href: '/catalogue', label: 'Catalogue', variant: 'text' });
        links.push({ href: '/auth/connexion', label: 'Connexion', variant: 'text' });
        links.push({ href: '/auth/inscription', label: 'Créer un compte', variant: 'cta' });
    } else {
        links.push({ href: '/catalogue', label: 'Catalogue', variant: 'text' });
        links.push({ href: '/dashboard', label: 'Tableau de bord', variant: 'text-strong' });
        if (isOnTrial) {
            const days = u?.premiumDaysRemaining ?? 0;
            links.push({ href: '/paiement', label: `J-${days} essai Premium`, variant: 'trial-badge' });
        } else if (isFree) {
            links.push({ href: '/paiement', label: 'Passer Premium', variant: 'cta' });
        }
    }

    return (
        <>
            {/* === DESKTOP NAV === */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                {links.map((l) => {
                    if (l.variant === 'cta') {
                        return (
                            <Link
                                key={l.href}
                                href={l.href}
                                className="bg-orange hover:bg-orange/90 text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-md hover:shadow-lg hover:shadow-orange/30"
                            >
                                {l.label}
                            </Link>
                        );
                    }
                    if (l.variant === 'trial-badge') {
                        return (
                            <Link
                                key={l.href}
                                href={l.href}
                                className="bg-teal/15 border border-teal/40 text-teal text-xs font-bold px-3 py-2 rounded-full uppercase tracking-widest hover:bg-teal/25 transition-colors"
                            >
                                {l.label}
                            </Link>
                        );
                    }
                    return (
                        <Link
                            key={l.href}
                            href={l.href}
                            className={l.variant === 'text-strong'
                                ? "text-white hover:text-teal font-semibold transition-colors"
                                : "text-white/80 hover:text-teal transition-colors"}
                        >
                            {l.label}
                        </Link>
                    );
                })}
                {session && (
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full font-semibold transition-all border border-white/10"
                    >
                        Déconnexion
                    </button>
                )}
            </nav>

            {/* === MOBILE BURGER BUTTON === */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={open}
                className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/10 transition-colors"
            >
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* === MOBILE DRAWER === */}
            {open && (
                <>
                    {/* Backdrop */}
                    <button
                        type="button"
                        aria-label="Fermer le menu"
                        onClick={() => setOpen(false)}
                        className="md:hidden fixed inset-0 top-20 bg-navy/80 backdrop-blur-sm z-40"
                    />
                    {/* Panel */}
                    <div
                        className="md:hidden fixed left-0 right-0 top-20 z-50 bg-navy border-b border-white/10 shadow-2xl"
                        role="dialog"
                        aria-modal="true"
                    >
                        <nav className="container mx-auto px-6 py-6 flex flex-col gap-3 text-base font-medium">
                            {links.map((l) => {
                                if (l.variant === 'cta') {
                                    return (
                                        <Link
                                            key={l.href}
                                            href={l.href}
                                            onClick={() => setOpen(false)}
                                            className="w-full text-center bg-orange hover:bg-orange/90 text-white px-6 py-3.5 rounded-full font-semibold transition-all shadow-md"
                                        >
                                            {l.label}
                                        </Link>
                                    );
                                }
                                if (l.variant === 'trial-badge') {
                                    return (
                                        <Link
                                            key={l.href}
                                            href={l.href}
                                            onClick={() => setOpen(false)}
                                            className="w-full text-center bg-teal/15 border border-teal/40 text-teal font-bold px-6 py-3 rounded-full uppercase tracking-widest text-sm"
                                        >
                                            {l.label}
                                        </Link>
                                    );
                                }
                                return (
                                    <Link
                                        key={l.href}
                                        href={l.href}
                                        onClick={() => setOpen(false)}
                                        className={l.variant === 'text-strong'
                                            ? "block px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors"
                                            : "block px-4 py-3 rounded-2xl text-white/85 hover:bg-white/5 hover:text-white transition-colors"}
                                    >
                                        {l.label}
                                    </Link>
                                );
                            })}
                            {session && (
                                <button
                                    onClick={() => { setOpen(false); signOut({ callbackUrl: '/' }); }}
                                    className="w-full text-center bg-white/10 hover:bg-white/20 text-white px-6 py-3.5 rounded-full font-semibold transition-all border border-white/10 mt-2"
                                >
                                    Déconnexion
                                </button>
                            )}
                        </nav>
                    </div>
                </>
            )}
        </>
    );
}
