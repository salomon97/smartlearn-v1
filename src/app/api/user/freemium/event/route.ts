import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { logFreemiumEvent } from '@/lib/freemium';

/**
 * Réception des events freemium côté client (paywall_shown, paywall_clicked_cta).
 * Best-effort : ne bloque jamais l'UX, retourne 204 systématiquement.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return new NextResponse(null, { status: 204 });
    }
    const body = await req.json().catch(() => ({}));
    const { event, metadata } = body;
    if (event === 'paywall_shown' || event === 'paywall_clicked_cta') {
      await logFreemiumEvent(userId, event, metadata || {});
    }
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.warn('[freemium event] error:', err);
    return new NextResponse(null, { status: 204 });
  }
}
