import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getGoogleAuth } from '@/lib/googleAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const auth = await getGoogleAuth();
        const youtube = google.youtube({ version: 'v3', auth });
        
        const response = await youtube.playlistItems.list({
            playlistId: 'PL8wYNxz_ge2irxT-O3MsenJ5MNzyjolRn',
            part: ['snippet', 'contentDetails'],
            maxResults: 50
        });

        return NextResponse.json({ 
            success: true, 
            count: response.data.items?.length,
            items: response.data.items
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message, stack: e.stack });
    }
}
