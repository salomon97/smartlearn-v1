import Transaction from '@/models/Transaction';

/**
 * Libère toutes les commissions affiliés dont le délai de 72h est passé.
 * Logique partagée entre :
 *   - cron quotidien (`/api/cron/clear-affiliate-commissions`)
 *   - bouton admin manuel (`/api/admin/transactions/clear-auto`)
 *
 * Bascule pending → cleared. Aucun transfert de solde (les soldes sont calculés à la lecture).
 *
 * @returns le nombre de transactions libérées.
 */
export async function clearMatureCommissions(): Promise<{ count: number }> {
  const now = new Date();
  const result = await Transaction.updateMany(
    { status: 'pending', clearingDate: { $lte: now } },
    { $set: { status: 'cleared' } }
  );
  return { count: result.modifiedCount ?? 0 };
}
