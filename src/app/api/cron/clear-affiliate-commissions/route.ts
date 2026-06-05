import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { clearMatureCommissions } from '@/lib/affiliate-clearing';

/**
 * Cron quotidien Vercel : libère les commissions affiliés dont le délai de 72h
 * est passé. Protégé par CRON_SECRET (Vercel Cron envoie automatiquement
 * `Authorization: Bearer <CRON_SECRET>`).
 *
 * Sans ce cron, les commissions restent "pending" indéfiniment tant qu'un admin
 * ne clique pas sur "libérer" — ce qui bloque les retraits ambassadeurs.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization');
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const { count } = await clearMatureCommissions();
    return NextResponse.json({
      success: true,
      count,
      message: count === 0
        ? 'Aucune commission mature à libérer.'
        : `${count} commission(s) libérée(s).`,
    });
  } catch (error) {
    console.error('Erreur cron clear-affiliate-commissions:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
