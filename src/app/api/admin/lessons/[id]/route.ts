import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from '@/lib/mongoose';
import Lesson from '@/models/Lesson';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ message: "Non autorisé" }, { status: 403 });
        }

        const resolvedParams = await params;
        const lessonId = resolvedParams.id;

        await connectToDatabase();

        const deleted = await Lesson.findByIdAndDelete(lessonId);
        if (!deleted) {
            return NextResponse.json({ message: "Leçon introuvable" }, { status: 404 });
        }

        return NextResponse.json({ 
            message: "Leçon supprimée avec succès", 
            success: true 
        });

    } catch (error) {
        console.error("❌ Erreur lors de la suppression de la leçon:", error);
        return NextResponse.json({ message: "Erreur interne" }, { status: 500 });
    }
}
