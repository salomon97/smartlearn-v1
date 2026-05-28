import { NextResponse } from 'next/server';
import { recomputeAllHealth } from '@/lib/retention';

// Cron quotidien (Vercel Cron). Recalcule tous les scores de santé et avance les
// séquences de ré-engagement. Protégé par CRON_SECRET — Vercel Cron envoie
// automatiquement l'en-tête "Authorization: Bearer <CRON_SECRET>" si la variable est définie.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization');
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const result = await recomputeAllHealth();
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    console.error('Erreur cron rétention:', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
