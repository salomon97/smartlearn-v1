import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import UserProgress from "@/models/UserProgress";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get("courseId");

        if (!courseId) {
            return NextResponse.json({ error: "courseId manquant" }, { status: 400 });
        }

        await connectToDatabase();

        const progress = await UserProgress.find({ 
            userId: (session.user as any).id, 
            courseId: courseId,
            isCompleted: true 
        }).select("lessonId");

        return NextResponse.json({ 
            completedLessonIds: progress.map(p => p.lessonId) 
        });
    } catch (error) {
        console.error("Erreur Progress GET:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await req.json();
        const { courseId, lessonId, isCompleted } = body;

        if (!courseId || !lessonId) {
            return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
        }

        await connectToDatabase();

        const userId = (session.user as any).id;

        const updateData: any = {
            lastWatchedAt: new Date(),
        };

        if (isCompleted !== undefined) {
            updateData.isCompleted = isCompleted;
            if (isCompleted) {
                updateData.completedAt = new Date();
            } else {
                updateData.completedAt = null;
            }
        }

        const progress = await UserProgress.findOneAndUpdate(
            { userId, lessonId },
            { 
                $set: { 
                    ...updateData,
                    courseId // On s'assure que le courseId est là à la création
                } 
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, progress });
    } catch (error) {
        console.error("Erreur Progress POST:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
