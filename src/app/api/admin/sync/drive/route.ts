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

// Naming Mapper for Grade Levels (Must match lib/constants.ts)
const GRADE_MAP: Record<string, string> = {
    '6e': '6ème', '6eme': '6ème', '6ème': '6ème', 'sixième': '6ème',
    '5e': '5ème', '5eme': '5ème', '5ème': '5ème', 'cinquième': '5ème',
    '4e': '4ème', '4eme': '4ème', '4ème': '4ème', 'quatrième': '4ème',
    '3e': '3ème', '3eme': '3ème', '3ème': '3ème', 'troisième': '3ème',
    '2ndeA': 'Seconde A', '2ndeA4': 'Seconde A', 'secondea': 'Seconde A',
    '2ndec': 'Seconde C', 'secondec': 'Seconde C',
    '2nded': 'Seconde D', 'seconded': 'Seconde D',
    '2ndeti': 'Seconde TI', 'secondeti': 'Seconde TI',
    '1erea': 'Première A', '1èrea': 'Première A',
    '1erec': 'Première C', '1èrec': 'Première C',
    '1ered': 'Première D', '1èred': 'Première D',
    '1ereti': 'Première TI', '1èreti': 'Première TI',
    'tlea': 'Terminale A', 'terminalea': 'Terminale A',
    'tlec': 'Terminale C', 'terminalec': 'Terminale C',
    'tled': 'Terminale D', 'terminaled': 'Terminale D',
    'tleti': 'Terminale TI', 'terminaleti': 'Terminale TI',
    'tlee': 'Terminale E'
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
