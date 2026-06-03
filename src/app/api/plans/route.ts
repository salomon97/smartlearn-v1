import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Plan from '@/models/Plan';

export async function GET() {
  try {
    await connectToDatabase();
    const plans = await Plan.find({ isActive: true })
      .select('code name price chariowUrl period durationDays')
      .sort({ price: 1 })
      .lean();
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Erreur GET /api/plans:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
