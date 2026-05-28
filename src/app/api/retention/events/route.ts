import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';
import { trackEvent } from '@/lib/retention';

const EventSchema = z.object({
  type: z.enum(['login', 'lesson_started', 'lesson_completed', 'quiz_submitted', 'payment_succeeded']),
  courseId: z.string().optional(),
  lessonId: z.string().optional(),
  value: z.number().optional(),
});

// Ingestion d'un événement d'apprentissage pour l'utilisateur connecté (lui-même).
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const parsed = EventSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Entrée invalide', details: parsed.error.flatten() }, { status: 400 });
    }

    await trackEvent(userId, parsed.data.type, {
      courseId: parsed.data.courseId,
      lessonId: parsed.data.lessonId,
      value: parsed.data.value,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Erreur POST /api/retention/events:', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
