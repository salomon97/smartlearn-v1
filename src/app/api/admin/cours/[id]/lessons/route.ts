import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from '@/lib/mongoose';
import Lesson from '@/models/Lesson';
import Course from '@/models/Course';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ message: "Non autorisé" }, { status: 403 });
        }

        const body = await req.json();
        const { title, videoUrl, pdfUrl, order, isFreePreview } = body;
        
        // Next 15: params is a promise
        const resolvedParams = await params;
        const courseId = resolvedParams.id;

        if (!title) {
            return NextResponse.json({ message: "Le titre est obligatoire" }, { status: 400 });
        }

        await connectToDatabase();

        const course = await Course.findById(courseId);
        if (!course) {
            return NextResponse.json({ message: "Cours introuvable" }, { status: 404 });
        }

        const newLesson = await Lesson.create({
            courseId,
            title,
            videoUrl,
            pdfUrl,
            order: order || 1,
            isFreePreview: !!isFreePreview
        });

        return NextResponse.json({ 
            message: "Leçon ajoutée avec succès", 
            lesson: newLesson,
            success: true 
        });

    } catch (error) {
        console.error("❌ Erreur lors de l'ajout de la leçon:", error);
        return NextResponse.json({ message: "Erreur interne" }, { status: 500 });
    }
}
