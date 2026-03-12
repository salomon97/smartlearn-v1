"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function SessionGuardian() {
    const { data: session, status } = useSession();
    const pathname = usePathname();

    useEffect(() => {
        // On ne vérifie que si l'utilisateur est censé être connecté (et idéalement sur le dashboard)
        if (status === "authenticated" && session?.user?.id && pathname.startsWith("/dashboard")) {

            const verifySession = async () => {
                try {
                    const res = await fetch("/api/auth/verify-session");

                    if (res.status === 403) {
                        const data = await res.json();
                        if (data.reason === "session_mismatch") {
                            // Quelqu'un s'est connecté ailleurs
                            alert("⚠️ Déconnexion : Quelqu'un d'autre vient de se connecter avec votre compte. Le partage de compte n'est pas autorisé.");
                            await signOut({ callbackUrl: "/auth/connexion?error=session_mismatch" });
                        }
                    }
                } catch (error) {
                    console.error("Session verification failed", error);
                }
            };

            // Vérification immédiate
            verifySession();

            // Et toutes les 30 secondes en tâche de fond
            const interval = setInterval(verifySession, 30000);

            return () => clearInterval(interval);
        }
    }, [status, session, pathname]);

    // Ce composant ne rend rien (Headless)
    return null;
}
