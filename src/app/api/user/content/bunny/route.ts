export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from 'next/server';
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import { computePremiumStatus } from "@/lib/premium-core";
import { signBunnyUrl } from "@/lib/bunny-signed-url";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
        }

        // Vérification Premium (Anti-fraude) — lecture DB pour que l'expiration prenne effet
        // immédiatement (vs session potentiellement périmée).
        await connectToDatabase();
        const sessionUser = session.user as any;
        const dbUser = await User.findById(sessionUser.id).select("isPremium premiumUntil role");
        if (!dbUser) {
            return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
        }
        const access = computePremiumStatus(dbUser);
        if (!access.isPremium && dbUser.role !== 'admin') {
            return NextResponse.json({
                message: access.status === 'expired'
                    ? "Abonnement expiré — renouvelez pour reprendre l'accès aux vidéos."
                    : "Accès Premium requis pour voir ce contenu",
                status: access.status,
            }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const folderPath = searchParams.get('path'); // ex: /6e/Mathematiques/chapters/
        const collectionId = searchParams.get('collectionId');

        // ==== LOGIQUE FICHIERS / PDF (STORAGE) ====
        if (folderPath) {
            const zoneName = process.env.BUNNY_STORAGE_ZONE_NAME;
            const password = process.env.BUNNY_STORAGE_PASSWORD;
            
            // Nettoyage: retirer le "/" initial et final s'il y a
            let cleanPath = folderPath.startsWith('/') ? folderPath.substring(1) : folderPath;
            if (cleanPath.endsWith('/')) {
                cleanPath = cleanPath.substring(0, cleanPath.length - 1);
            }

            // Encodage strict pour les accents et caractères spéciaux (ex: 6ème)
            const encodedPath = cleanPath.split('/').map((segment: string) => encodeURIComponent(segment)).join('/');

            const fetchUrl = `https://storage.bunnycdn.com/${zoneName}/${encodedPath}/`;
            const response = await fetch(fetchUrl, {
                headers: {
                    'AccessKey': password || '',
                    'accept': 'application/json'
                }
            });

            if (!response.ok) {
                // DEBUG: Provide exactly what Vercel sees
                console.error(`[Bunny Error] Status: ${response.status}, URL: ${fetchUrl}, ENV_ZONE: ${!!zoneName}, ENV_PASS: ${!!password}`);
                
                let errorMessage = "Dossier introuvable sur Bunny.net";
                if (response.status === 401 || response.status === 403) {
                    errorMessage = "Erreur d'authentification Bunny (Compte expiré ou clé invalide)";
                }

                return NextResponse.json({ 
                    message: errorMessage, 
                    error: `Bunny Http ${response.status}. Zone config: ${!!zoneName}, URL: ${fetchUrl}` 
                }, { status: response.status === 401 || response.status === 403 ? response.status : 404 });
            }

            const data = await response.json();
            
            // Si BUNNY_TOKEN_AUTH_KEY est configurée côté Vercel ET que Token Auth est
            // activée sur la Pull Zone Bunny, les URLs sont signées avec expiration 1h.
            // Sinon (legacy), les URLs sont servies non signées (comportement actuel).
            // Voir lib/bunny-signed-url.ts pour les étapes d'activation côté Bunny.
            const bunnyKey = process.env.BUNNY_TOKEN_AUTH_KEY;

            const files = data
                .filter((item: any) => !item.IsDirectory)
                .map((item: any) => {
                    const encodedFilePath = `${encodedPath}/${encodeURIComponent(item.ObjectName)}`;
                    const rawUrl = `https://${process.env.BUNNY_STORAGE_HOSTNAME}/${encodedFilePath}`;
                    return {
                        id: item.Guid || item.ObjectName,
                        name: item.ObjectName,
                        cdnUrl: signBunnyUrl(rawUrl, bunnyKey),
                        contentType: 'file'
                    };
                });

            return NextResponse.json({ items: files });
        }

        // ==== LOGIQUE VIDÉOS (STREAM) ====
        if (collectionId) {
             const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
             const apiKey = process.env.BUNNY_API_KEY; 

             const response = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos?collection=${collectionId}`, {
                 headers: {
                     'AccessKey': apiKey as string,
                     'accept': 'application/json'
                 }
             });

             if (!response.ok) {
                 return NextResponse.json({ message: "Collection vidéo introuvable" }, { status: 404 });
             }

             const data = await response.json();
             
             // Idem pour Bunny Stream : si BUNNY_TOKEN_AUTH_KEY (Player Security Key) est
             // configurée, les thumbnails sont signées. Sinon URL brute legacy.
             const bunnyKey = process.env.BUNNY_TOKEN_AUTH_KEY;

             const videos = data.items.map((v: any) => {
                 const rawThumb = `https://vz-e1000817-6ad.b-cdn.net/${v.guid}/thumbnail.jpg`;
                 return {
                     id: v.guid,
                     name: v.title,
                     libraryId: libraryId,
                     thumbnailUrl: signBunnyUrl(rawThumb, bunnyKey),
                     contentType: 'video'
                 };
             });

             return NextResponse.json({ items: videos });
        }

        return NextResponse.json({ message: "Paramètres path ou collectionId manquants" }, { status: 400 });

    } catch (error: any) {
        console.error("❌ [BUNNY API] Erreur :", error);
        return NextResponse.json({ message: "Erreur serveur de synchronisation", error: error.message }, { status: 500 });
    }
}
