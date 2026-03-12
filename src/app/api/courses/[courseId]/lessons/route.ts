import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Lesson from "@/models/Lesson";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        await connectToDatabase();

        // Resolve params explicitly as expected in Next.js 15
        const resolvedParams = await params;
        const courseId = resolvedParams.courseId;

        if (!courseId) {
            return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
        }

        // Fetch lessons for course, sorted by order
        const lessons = await Lesson.find({ courseId }).sort({ order: 1 });

        return NextResponse.json(lessons, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching lessons:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        await connectToDatabase();

        // Resolve params explicitly as expected in Next.js 15
        const resolvedParams = await params;
        const courseId = resolvedParams.courseId;

        if (!courseId) {
            return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
        }

        const body = await request.json();
        const { title, videoUrl, pdfUrl, order, isFreePreview } = body;

        if (!title) {
            return NextResponse.json({ error: "Missing required field: title" }, { status: 400 });
        }

        // Create new lesson
        const newLesson = await Lesson.create({
            title,
            courseId,
            videoUrl,
            pdfUrl,
            order: order || 0,
            isFreePreview: isFreePreview || false
        });

        return NextResponse.json(newLesson, { status: 201 });
    } catch (error: any) {
        console.error("Error creating lesson:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
