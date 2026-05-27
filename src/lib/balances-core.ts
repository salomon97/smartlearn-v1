// Logique financière PURE — aucun import, aucune dépendance Mongo.
// Source de vérité unique du calcul des soldes affiliés.

export type TxLike = { commission?: number | null; status?: string | null };
export type WithdrawalLike = { amount?: number | null; status?: string | null };

export function reduceBalances(
  transactions: TxLike[],
  withdrawals: WithdrawalLike[],
): { pending: number; available: number } {
  let pending = 0;
  let cleared = 0;

  for (const t of transactions) {
    if (t.status === 'pending') pending += t.commission || 0;
    else if (t.status === 'cleared') cleared += t.commission || 0;
  }

  let withdrawn = 0;
  for (const w of withdrawals) {
    if (w.status === 'pending' || w.status === 'paid') withdrawn += w.amount || 0;
  }

  // Pas de Math.max(0, …) : un négatif doit rester visible (signal d'incohérence).
  return { pending, available: cleared - withdrawn };
}
