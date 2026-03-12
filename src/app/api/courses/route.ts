import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Course from "@/models/Course";

export async function GET(request: Request) {
    try {
        await connectToDatabase();

        // Get query params
        const { searchParams } = new URL(request.url);
        const grade_level = searchParams.get("grade_level");
        const isPublished = searchParams.get("isPublished");

        // Build query object
        const query: any = {};
        if (grade_level) query.grade_level = grade_level;
        if (isPublished !== null) query.isPublished = isPublished === 'true';

        // Fetch courses based on query
        const courses = await Course.find(query).sort({ createdAt: -1 });

        return NextResponse.json(courses, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching courses:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectToDatabase();

        // In a real app we would check if user is admin here
        // using getServerSession(authOptions)

        const body = await request.json();
        const { title, description, grade_level, imageUrl } = body;

        // Validation
        if (!title || !description || !grade_level) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Create course
        const newCourse = await Course.create({
            title,
            description,
            grade_level,
            imageUrl,
            isPublished: false // default false
        });

        return NextResponse.json(newCourse, { status: 201 });
    } catch (error: any) {
        console.error("Error creating course:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
