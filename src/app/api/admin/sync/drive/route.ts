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

// Naming Mapper for Grade Levels
const GRADE_MAP: Record<string, string> = {
    '6e': '6e', '6eme': '6e', '6ème': '6e', 'sixième': '6e',
    '5e': '5e', '5eme': '5e', '5ème': '5e', 'cinquième': '5e',
    '4e': '4e', '4eme': '4e', '4ème': '4e', 'quatrième': '4e',
    '3e': '3e', '3eme': '3e', '3ème': '3e', 'troisième': '3e',
    '2ndeA': '2ndeA4', '2ndeA4': '2ndeA4', 'secondeA': '2ndeA4',
    '2ndeC': '2ndeC', 'secondeC': '2ndeC',
    '2ndeD': '2ndeC', // Matching common cycle
    '2ndeTI': '2ndeTI',
    '1ereA': '1ère_A4', '1èreA': '1ère_A4', 'premièreA': '1ère_A4',
    '1ereC': '1ère_C', '1èreC': '1ère_C', 'premièreC': '1ère_C',
    '1ereD': '1ère_D', '1èreD': '1ère_D', 'premièreD': '1ère_D',
    '1ereTI': '1ère_TI', '1èreTI': '1ère_TI',
    'TleA': 'TleA4', 'TerminaleA': 'TleA4',
    'TleC': 'TleC', 'TerminaleC': 'TleC',
    'TleD': 'TleD', 'TerminaleD': 'TleD',
    'TleTI': 'TleTI', 'TerminaleTI': 'TleTI'
};

// Naming Mapper for Subjects
const SUBJECT_MAP: Record<string, string> = {
    'maths': 'Mathématiques', 'mathématiques': 'Mathématiques', 'mathematiques': 'Mathématiques',
    'info': 'Informatique', 'informatique': 'Informatique'
};

// Naming Mapper for Content Types
const TYPE_MAP: Record<string, string> = {
    'chapitres': 'chapters', 'cours': 'chapters', 'chapters': 'chapters',
    'evaluations': 'evaluations', 'évaluations': 'evaluations', 'td': 'evaluations', 'exercices': 'evaluations',
    'annales_officiels': 'annales_officiels', 'bac': 'annales_officiels', 'bepc': 'annales_officiels',
    'annales_blancs': 'annales_blancs', 'blancs': 'annales_blancs'
};

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
        }

        const { rootFolderId } = await req.json();
        if (!rootFolderId) return NextResponse.json({ message: "Root Folder ID requis" }, { status: 400 });

        await connectToDatabase();
        const auth = await getGoogleAuth();
        const drive = google.drive({ version: 'v3', auth });

        let count = 0;

        // Recursive Scanner
        async function scanFolder(folderId: string, currentPath: string = "") {
            const response = await drive.files.list({
                q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
                fields: 'files(id, name)',
            });

            const folders = response.data.files || [];

            for (const folder of folders) {
                const name = folder.name.toLowerCase().trim();
                const newPath = currentPath ? `${currentPath} > ${folder.name}` : folder.name;

                // Try to detect Mappings
                // Pattern detected : Grade -> Subject -> Type
                
                // Let's check if the parent or grandparent gives us info
                const pathParts = newPath.split(' > ').map(p => p.toLowerCase().trim());
                
                let detectedGrade = "";
                let detectedSubject = "";
                let detectedType = "";

                // Match Logic
                for (const part of pathParts) {
                    for (const [key, val] of Object.entries(GRADE_MAP)) {
                        if (part.includes(key.toLowerCase())) detectedGrade = val;
                    }
                    for (const [key, val] of Object.entries(SUBJECT_MAP)) {
                        if (part.includes(key.toLowerCase())) detectedSubject = val;
                    }
                    for (const [key, val] of Object.entries(TYPE_MAP)) {
                        if (part.includes(key.toLowerCase())) detectedType = val;
                    }
                }

                // If we found essential info, save Mapping
                if (detectedGrade && detectedSubject && detectedType) {
                    await DriveMapping.findOneAndUpdate(
                        { grade_level: detectedGrade, subject: detectedSubject, contentType: detectedType },
                        { 
                            folderId: folder.id, 
                            path: newPath,
                            updatedAt: new Date()
                        },
                        { upsert: true, new: true }
                    );
                    count++;
                }

                // Limit recursion depth or keep it simple for now (DFS)
                if (pathParts.length < 5) {
                    await scanFolder(folder.id, newPath);
                }
            }
        }

        await scanFolder(rootFolderId);

        return NextResponse.json({ success: true, count });

    } catch (error: any) {
        console.error("❌ [SYNC DRIVE ERROR]:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
