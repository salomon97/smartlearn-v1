import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import DriveMapping from '@/models/DriveMapping';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        const docs = await DriveMapping.find({
            grade_level: '6e',
            subject: 'Informatique',
            contentType: 'videos'
        });
        
        return NextResponse.json({ success: true, count: docs.length, docs });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message, stack: e.stack });
    }
}
