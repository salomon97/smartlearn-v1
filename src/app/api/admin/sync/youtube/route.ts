import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from '@/lib/mongoose';
import DriveMapping from '@/models/DriveMapping';
import fs from 'fs';
import path from 'path';

// Helper to get Google Auth
async function getGoogleAuth() {
    let credentials, token;

    // 1. Try Environment Variables (Vercel/Production)
    if (process.env.GOOGLE_CREDENTIALS_JSON && process.env.GOOGLE_TOKEN_JSON) {
        credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
        token = JSON.parse(process.env.GOOGLE_TOKEN_JSON);
    } 
    // 2. Fallback to Local Files (Development)
    else {
        const credentialsPath = path.join(process.cwd(), 'credentials.json');
        const tokenPath = path.join(process.cwd(), 'token.json');

        if (!fs.existsSync(credentialsPath) || !fs.existsSync(tokenPath)) {
            throw new Error("Identifiants Google manquants (Vérifiez les variables d'env ou les fichiers .json)");
        }

        credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
        token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    }

    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(token);

    return oAuth2Client;
}

// Naming Mapper for Grade Levels & Subjects (YouTube Titles)
const GRADE_MAP: Record<string, string> = {
    '6e': '6ème', '6ème': '6ème', '5e': '5ème', '5ème': '5ème', '4e': '4ème', '4ème': '4ème', '3e': '3ème', '3ème': '3ème',
    '2nde': 'Seconde', '1ère': 'Première', 'terminale': 'Terminale', 'tle': 'Terminale'
};

const SUBJECT_MAP: Record<string, string> = {
    'maths': 'Mathématiques', 'mathématiques': 'Mathématiques',
    'info': 'Informatique', 'informatique': 'Informatique'
};

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
        }

        await connectToDatabase();
        const auth = await getGoogleAuth();
        const youtube = google.youtube({ version: 'v3', auth });

        // List Playlists
        const response = await youtube.playlists.list({
            part: ['snippet'],
            mine: true,
            maxResults: 50
        });

        const playlists = response.data.items || [];
        let count = 0;

        for (const playlist of playlists) {
            const title = playlist.snippet?.title?.toLowerCase() || "";
            const id = playlist.id!;

            let detectedGrade = "";
            let detectedSubject = "";

            // Simple title matching
            for (const [key, val] of Object.entries(GRADE_MAP)) {
                if (title.includes(key.toLowerCase())) detectedGrade = val;
            }
            for (const [key, val] of Object.entries(SUBJECT_MAP)) {
                if (title.includes(key.toLowerCase())) detectedSubject = val;
            }

            if (detectedGrade && detectedSubject) {
                // For YouTube, we usually map to 'chapters' as default video content type
                // But we can update all contentType mappings that don't have a playlist yet
                await DriveMapping.updateMany(
                    { grade_level: { $regex: detectedGrade, $options: 'i' }, subject: detectedSubject },
                    { playlistId: id }
                );
                count++;
            }
        }

        return NextResponse.json({ success: true, count });

    } catch (error: any) {
        console.error("❌ [SYNC YOUTUBE ERROR]:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
