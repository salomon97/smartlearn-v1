import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transaction from '../src/models/Transaction';
import WithdrawalHistory from '../src/models/WithdrawalHistory';
import { reduceBalances } from '../src/lib/balances-core';

dotenv.config({ path: '.env.local' });

/**
 * Rapport de réconciliation des soldes affiliés.
 * Compare le solde STOCKÉ (ancien champ balance_*, lu en RAW dans la collection
 * `users` car il n'est plus dans le schéma) au solde CALCULÉ (Transaction +
 * WithdrawalHistory). À lancer AVANT de fusionner la branche. Lecture seule.
 */
async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI manquant dans .env.local');
  await mongoose.connect(uri);

  const db = mongoose.connection.db;
  if (!db) throw new Error('Connexion DB indisponible');
  const usersCol = db.collection('users');

  // Population : parrains référencés dans une Transaction + utilisateurs ayant un
  // solde stocké non nul (lecture RAW : les champs balance_* ne sont plus au schéma).
  const parrainIds = await Transaction.distinct('parrainId', { parrainId: { $ne: null } });
  const usersWithStored = await usersCol
    .find({ $or: [{ balance_pending: { $gt: 0 } }, { balance_available: { $gt: 0 } }] })
    .project({ _id: 1 })
    .toArray();

  const ids = new Set<string>([
    ...parrainIds.map((x: any) => String(x)),
    ...usersWithStored.map((u: any) => String(u._id)),
  ]);

  console.log(`\n=== Réconciliation de ${ids.size} utilisateur(s) ===`);
  console.log('email | stocké_pending | calc_pending | Δ | stocké_available | calc_available | Δ');

  let anomalies = 0;
  for (const id of ids) {
    let oid: mongoose.Types.ObjectId;
    try { oid = new mongoose.Types.ObjectId(id); } catch { continue; }

    const userDoc: any = await usersCol.findOne({ _id: oid });
    if (!userDoc) continue;

    const txs = await Transaction.find({ parrainId: id }).select('commission status').lean();
    const wds = await WithdrawalHistory.find({ affiliateId: oid }).select('amount status').lean();

    const { pending, available } = reduceBalances(txs as any[], wds as any[]);
    const sp = userDoc.balance_pending ?? 0;
    const sa = userDoc.balance_available ?? 0;
    const dp = sp - pending;
    const da = sa - available;
    if (dp !== 0 || da !== 0) anomalies++;
    const flag = (dp !== 0 || da !== 0) ? '  ⚠️ ÉCART' : '';
    console.log(`${userDoc.email} | ${sp} | ${pending} | ${dp} | ${sa} | ${available} | ${da}${flag}`);
  }

  console.log(`\n=== ${anomalies} écart(s) détecté(s) ===`);
  console.log('Tant que les écarts ne sont pas validés, NE PAS fusionner/déployer la branche.');
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error('❌ Réconciliation échouée :', e);
  process.exit(1);
});
