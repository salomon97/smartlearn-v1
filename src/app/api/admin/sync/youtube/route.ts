import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from '@/lib/mongoose';
import DriveMapping from '@/models/DriveMapping';
import { getGoogleAuth } from '@/lib/googleAuth';

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
                // Créer ou mettre à jour un mapping DÉDIÉ aux vidéos
                await DriveMapping.findOneAndUpdate(
                    { 
                        grade_level: detectedGrade, 
                        subject: detectedSubject, 
                        contentType: 'videos' 
                    },
                    { 
                        playlistId: id,
                        path: `YouTube Playlist: ${playlist.snippet?.title}`
                    },
                    { upsert: true, new: true }
                );

                // --- NOUVEAUTÉ : Peupler directement la collection Lesson pour éviter l'appel API Youtube en Front ---
                try {
                    const Course = (await import('@/models/Course')).default;
                    const Lesson = (await import('@/models/Lesson')).default;

                    // Chercher le cours correspondant (ex: '6e' au lieu de '6ème')
                    const gradeAlternatives = 
                        detectedGrade === '6ème' ? ['6e', '6ème'] :
                        detectedGrade === '5ème' ? ['5e', '5ème'] :
                        detectedGrade === '4ème' ? ['4e', '4ème'] :
                        detectedGrade === '3ème' ? ['3e', '3ème'] :
                        detectedGrade === 'Seconde' ? ['2nde', 'seconde', 'Seconde'] :
                        detectedGrade === 'Première' ? ['1ère', 'première', 'Première'] :
                        detectedGrade === 'Terminale' ? ['terminale', 'tle', 'Terminale'] : [detectedGrade];
                    
                    const subjectAlternatives = 
                        detectedSubject === 'Mathématiques' ? ['Mathématiques', 'maths', 'mathématiques'] :
                        detectedSubject === 'Informatique' ? ['Informatique', 'info', 'informatique'] : [detectedSubject];

                    const course = await Course.findOne({
                        grade_level: { $in: gradeAlternatives },
                        subject: { $in: subjectAlternatives }
                    });

                    if (course) {
                        const pItems = await youtube.playlistItems.list({
                            playlistId: id,
                            part: ['snippet', 'contentDetails'],
                            maxResults: 50
                        });
                        
                        const videos = pItems.data.items || [];
                        if (videos.length > 0) {
                            // Nettoyer les anciennes leçons vidéos pour ce cours si on re-synchronise
                            await Lesson.deleteMany({ courseId: course._id });

                            const lessonsToInsert = videos.map((v, i) => ({
                                courseId: course._id,
                                title: v.snippet?.title || `Vidéo ${i+1}`,
                                videoUrl: `https://www.youtube.com/watch?v=${v.contentDetails?.videoId}`,
                                pdfUrl: '',
                                order: i + 1,
                                isFreePreview: i === 0,
                            }));

                            await Lesson.insertMany(lessonsToInsert);
                        }
                    }
                } catch (err: any) {
                    console.error("Erreur insertion leçons BDD lors du sync YouTube:", err.message);
                }

                count++;
            }

        }

        return NextResponse.json({ success: true, count });

    } catch (error: any) {
        console.error("❌ [SYNC YOUTUBE ERROR]:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
