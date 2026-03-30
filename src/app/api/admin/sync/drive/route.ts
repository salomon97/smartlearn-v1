import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from '@/lib/mongoose';
import DriveMapping from '@/models/DriveMapping';
import { getGoogleAuth } from '@/lib/googleAuth';

// Naming Mapper for Grade Levels (Must match lib/constants.ts)
const GRADE_MAP: Record<string, string> = {
    '6e': '6ème', '6eme': '6ème', '6ème': '6ème', 'sixième': '6ème',
    '5e': '5ème', '5eme': '5ème', '5ème': '5ème', 'cinquième': '5ème',
    '4e': '4ème', '4eme': '4ème', '4ème': '4ème', 'quatrième': '4ème',
    '3e': '3ème', '3eme': '3ème', '3ème': '3ème', 'troisième': '3ème',
    '2ndea': '2nde A', '2nde-a': '2nde A', 'secondea': '2nde A',
    '2ndec': '2nde C', '2nde-c': '2nde C', 'secondec': '2nde C',
    '2ndee': '2nde E', '2nde-e': '2nde E', 'secondee': '2nde E',
    '2ndeti': '2nde TI', '2nde-ti': '2nde TI', 'secondeti': '2nde TI',
    '1erea': '1ère A', '1èrea': '1ère A', '1ere a': '1ère A',
    '1erec': '1ère C', '1èrec': '1ère C', '1ere c': '1ère C',
    '1ered': '1ère D', '1èred': '1ère D', '1ere d': '1ère D',
    '1eree': '1ère E', '1èree': '1ère E', '1ere e': '1ère E',
    '1ereti': '1ère TI', '1èreti': '1ère TI', '1ere ti': '1ère TI',
    'tlea': 'Terminale A', 'terminalea': 'Terminale A', 'tle a': 'Terminale A',
    'tlec': 'Terminale C', 'terminalec': 'Terminale C', 'tle c': 'Terminale C',
    'tled': 'Terminale D', 'terminaled': 'Terminale D', 'tle d': 'Terminale D',
    'tlee': 'Terminale E', 'terminalee': 'Terminale E', 'tle e': 'Terminale E',
    'tleti': 'Terminale TI', 'terminaleti': 'Terminale TI', 'tle ti': 'Terminale TI',
};

// Naming Mapper for Subjects
const SUBJECT_MAP: Record<string, string> = {
    'maths': 'Mathématiques', 'mathématiques': 'Mathématiques', 'mathematiques': 'Mathématiques',
    'info': 'Informatique', 'informatique': 'Informatique'
};

const TYPE_MAP: Record<string, string> = {
    'chapitres': 'chapters', 'cours': 'chapters', 'chapters': 'chapters',
    'evaluations': 'evaluations', 'évaluations': 'evaluations', 'td': 'evaluations', 'exercices': 'evaluations',
    'annales_officiels': 'annales_officiels', 'officiels': 'annales_officiels', 'bac': 'annales_officiels', 'bepc': 'annales_officiels',
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
