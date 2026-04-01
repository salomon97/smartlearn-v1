export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
        }

        // Vérification Premium (Anti-fraude)
        const user = session.user as any;
        if (!user.isPremium && user.role !== 'admin') {
            return NextResponse.json({ message: "Accès Premium requis pour voir ce contenu" }, { status: 403 });
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

            const response = await fetch(`https://storage.bunnycdn.com/${zoneName}/${encodedPath}/`, {
                headers: {
                    'AccessKey': password as string,
                    'accept': 'application/json'
                }
            });

            if (!response.ok) {
                 return NextResponse.json({ message: "Dossier introuvable sur Bunny.net" }, { status: 404 });
            }

            const data = await response.json();
            
            const files = data
                .filter((item: any) => !item.IsDirectory)
                .map((item: any) => {
                    const encodedFilePath = `${encodedPath}/${encodeURIComponent(item.ObjectName)}`;
                    return {
                        id: item.Guid || item.ObjectName,
                        name: item.ObjectName,
                        // URL publique vers le fichier (pour l'iFrame ou le PDF Viewer)
                        cdnUrl: `https://${process.env.BUNNY_STORAGE_HOSTNAME}/${encodedFilePath}`,
                        contentType: 'file'
                    };
                });

            return NextResponse.json({ items: files });
        }

        // ==== LOGIQUE VIDÉOS (STREAM) ====
        if (collectionId) {
             const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
             const apiKey = process.env.BUNNY_API_KEY; 

             const response = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos?collectionId=${collectionId}`, {
                 headers: {
                     'AccessKey': apiKey as string,
                     'accept': 'application/json'
                 }
             });

             if (!response.ok) {
                 return NextResponse.json({ message: "Collection vidéo introuvable" }, { status: 404 });
             }

             const data = await response.json();
             
             const videos = data.items.map((v: any) => ({
                 id: v.guid,
                 name: v.title,
                 libraryId: libraryId,
                 // Utilisation du hostname CDN Stream fourni
                 thumbnailUrl: `https://vz-e1000817-6ad.b-cdn.net/${v.guid}/thumbnail.jpg`,
                 contentType: 'video'
             }));

             return NextResponse.json({ items: videos });
        }

        return NextResponse.json({ message: "Paramètres path ou collectionId manquants" }, { status: 400 });

    } catch (error: any) {
        console.error("❌ [BUNNY API] Erreur :", error);
        return NextResponse.json({ message: "Erreur serveur de synchronisation", error: error.message }, { status: 500 });
    }
}
