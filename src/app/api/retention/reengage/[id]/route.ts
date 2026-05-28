import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongoose';
import Reengagement from '@/models/Reengagement';
import { sendReengagement } from '@/lib/retention';

// Relance manuelle d'un élève par l'admin (bouton "Relancer" du dashboard).
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { id: userId } = await params;
    await connectToDatabase();

    const active = await Reengagement.findOne({ userId, status: 'active' });
    const step = active ? Math.min(active.sequenceStep, 3) : 1;

    await sendReengagement(userId, step);

    if (!active) {
      await Reengagement.create({
        userId,
        sequenceStep: 1,
        status: 'active',
        triggeredAt: new Date(),
        lastStepAt: new Date(),
      });
    }

    return NextResponse.json({ success: true, message: `Relance étape ${step} envoyée.` });
  } catch (e) {
    console.error('Erreur POST /api/retention/reengage/[id]:', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
