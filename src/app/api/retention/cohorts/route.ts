import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { computeCohorts } from '@/lib/retention-queries';

// Rétention W1 & W4 par cohorte hebdomadaire (admin).
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const data = await computeCohorts(6);
    return NextResponse.json(data);
  } catch (e) {
    console.error('Erreur GET /api/retention/cohorts:', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
