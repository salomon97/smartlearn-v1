import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import Lesson from "@/models/Lesson";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ lessonId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        await connectToDatabase();

        // Resolve params explicitly for Next.js 15
        const resolvedParams = await params;
        const lessonId = resolvedParams.lessonId;

        if (!lessonId) {
            return NextResponse.json({ error: "Missing lessonId" }, { status: 400 });
        }

        const lesson = await Lesson.findById(lessonId);

        if (!lesson) {
            return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
        }

        // Check if lesson is free preview or if user is premium
        if (!lesson.isFreePreview && !session.user.isPremium) {
            // Return the lesson metadata, but hide the video and PDF URLs
            return NextResponse.json({
                _id: lesson._id,
                title: lesson.title,
                courseId: lesson.courseId,
                order: lesson.order,
                isFreePreview: lesson.isFreePreview,
                error: "Accès Premium requis"
            }, { status: 403 });
        }

        // Return full lesson if authorized
        return NextResponse.json(lesson, { status: 200 });

    } catch (error: any) {
        console.error("Error fetching secure lesson:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
