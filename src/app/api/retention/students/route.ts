import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongoose';
import StudentHealth from '@/models/StudentHealth';

// Liste des élèves + santé (admin). Filtre optionnel ?status=at_risk.
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const query = status ? { status } : {};

    const rows = await StudentHealth.find(query).sort({ score: 1 }).limit(500).lean();
    return NextResponse.json(rows);
  } catch (e) {
    console.error('Erreur GET /api/retention/students:', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
