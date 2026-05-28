# Déploiement — Soldes calculés + Plan multi-paliers (ARCH-1/ARCH-3)

- **Branche** : `feat/soldes-calcules-plans`
- **Date** : 2026-05
- **Spec/plan d'origine** : dans le dépôt `smartlearn-v1` (`docs/superpowers/specs` et `/plans`)

## Ce qui a été implémenté

- Soldes affiliés **100 % calculés** depuis `Transaction` + `WithdrawalHistory` (`src/lib/balances.ts` → `computeBalances`, logique pure testée dans `src/lib/balances-core.ts`). Champs `balance_pending`/`balance_available` **retirés** du modèle `User`.
- Prix **externalisé** dans le modèle `Plan` (`src/models/Plan.ts`). Le webhook résout le plan via `planCode` du `custom_data` (`src/lib/chariow.ts`), avec repli sur le plan par défaut `vip_avie` (rétro-compat de l'ancien `custom_data = userId`).
- Page `/paiement` lit les plans via `GET /api/plans` (fin des constantes hardcodées).

### Consommateurs refactorés (périmètre élargi en cours de route)
Au-delà du spec initial (5 fichiers), découverts et traités : `transactions/clear-auto`, `affiliates/pay` (→ trace `WithdrawalHistory 'paid'`, + correction d'un `accountNumber` requis manquant), `dashboard/profil`, `admin/affilies` (liste + détail).

### État de vérification (local, branche)
- Tests unitaires : **10/10** (`npm test`)
- `tsc --noEmit` : **0 erreur introduite** (17 erreurs préexistantes, non liées)
- `npm run build` : **OK**

## ⚠️ GATE DE DÉPLOIEMENT (à faire avec données de PRODUCTION)

> Argent réel : ne pas fusionner la branche dans `main` avant d'avoir validé la réconciliation.

1. **Mettre `MONGODB_URI` de prod** dans `.env.local` (temporairement, en local).
2. **Seed des plans en prod** :
   ```bash
   npx ts-node scripts/seed-plans.ts
   ```
   (crée le plan `vip_avie` à 2000 FCFA s'il n'existe pas)
3. **Réconciliation (lecture seule)** :
   ```bash
   npx ts-node scripts/reconcile-balances.ts
   ```
   Lire le tableau. Pour chaque ligne `⚠️ ÉCART` (stocké ≠ calculé) :
   - écart nul partout → OK ;
   - stocké > calculé (en faveur de l'affilié) → soit créer une `Transaction` d'ajustement (`status:'cleared'`, `commission` = écart, `parrainId` = l'affilié) pour honorer, soit accepter le calculé. Documenter la décision.
4. **Ne fusionner/déployer que si les écarts sont tranchés.**
5. **Merge + déploiement** :
   ```bash
   git checkout main
   git merge --no-ff feat/soldes-calcules-plans
   git push
   ```
   Vercel redéploie. Restaurer ensuite `.env.local` local (retirer l'URI de prod).
6. **Parcours manuel post-deploy** : paiement filleul → Transaction `pending` créée (commission OK, `planCode` renseigné) ; `/api/user/affiliate-stats` parrain → pending ; admin `clear` → bascule en available ; demande de retrait → available baisse ; admin `failed`/`paid`.

## Dépendance opérationnelle Chariow
Chariow = produits à prix fixe (un lien par produit). Ajouter un palier ⇒ créer le produit côté Chariow, puis renseigner son `chariowUrl` dans un nouveau `Plan` (`isActive: true`). Le `code` du plan ne doit jamais contenir `__`.
