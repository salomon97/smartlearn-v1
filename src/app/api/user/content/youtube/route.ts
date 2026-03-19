export const dynamic = 'force-dynamic';
import { google } from 'googleapis';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from 'next/server';
import { getGoogleAuth } from '@/lib/googleAuth';


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
        const playlistId = searchParams.get('playlistId');

        if (!playlistId) {
            return NextResponse.json({ message: "Playlist ID requis" }, { status: 400 });
        }

        const auth = await getGoogleAuth();
        const youtube = google.youtube({ version: 'v3', auth });

        const response = await youtube.playlistItems.list({
            playlistId: playlistId,
            part: ['snippet', 'contentDetails'],
            maxResults: 50,
        });

        // Transformer pour un format plus simple
        const videos = response.data.items?.map(item => ({
            id: item.contentDetails?.videoId,
            title: item.snippet?.title,
            description: item.snippet?.description,
            thumbnail: item.snippet?.thumbnails?.high?.url,
            publishedAt: item.snippet?.publishedAt,
        })) || [];

        return NextResponse.json({ videos });

    } catch (error: any) {
        console.error("❌ [YOUTUBE API] Erreur :", error.message);
        return NextResponse.json({ message: "Erreur lors de la lecture YouTube", error: error.message }, { status: 500 });
    }
}
