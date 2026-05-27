import mongoose from 'mongoose';
import Transaction from '@/models/Transaction';
import WithdrawalHistory from '@/models/WithdrawalHistory';
import { reduceBalances } from './balances-core';

// Soldes affiliés calculés à la lecture, autorité unique.
// ⚠️ Transaction.parrainId est un String, WithdrawalHistory.affiliateId un ObjectId :
//    le cast ObjectId ci-dessous est OBLIGATOIRE, sinon le total retiré = 0 silencieusement.
export async function computeBalances(
  userId: string,
): Promise<{ pending: number; available: number }> {
  const transactions = await Transaction.find({ parrainId: userId })
    .select('commission status')
    .lean();

  const withdrawals = await WithdrawalHistory.find({
    affiliateId: new mongoose.Types.ObjectId(userId),
  })
    .select('amount status')
    .lean();

  return reduceBalances(transactions as any[], withdrawals as any[]);
}
