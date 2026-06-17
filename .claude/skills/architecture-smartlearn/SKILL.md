---
name: architecture-smartlearn
description: Carte technique de SmartLearn Unified — modèles Mongoose, routes API critiques, flux Chariow webhook, structure du payload paiement, scripts de diagnostic existants, codes Plan actifs. Utilisé par admin-abonnements, analyste-academique, tuteur-pedagogique, marketing-ecoles pour ne PAS inventer un champ, une route ou un comportement. À tenir à jour à chaque évolution majeure du code (point de référence vivant).
---

# Architecture SmartLearn Unified — Référence vivante

## Modèles Mongoose principaux (`src/models/`)

| Modèle | Champs clés | Fichier |
|---|---|---|
| `User` | email, name, role (student/admin), isPremium, premiumUntil, grade_level, parrainId, registrationIp, sessionId, welcomeTrialGrantedAt, registrationFraudFlag, lastLoginAt | `src/models/User.ts` |
| `Plan` | code (vip_monthly/vip_quarterly/vip_annual), name, price, chariowUrl, isActive, period, durationDays | `src/models/Plan.ts` |
| `Transaction` | userId, parrainId, amount, commission, status, paymentMethod, planCode, referenceId, clearingDate, metadata | `src/models/Transaction.ts` |
| `AdminToken` | email, token, expiresAt | `src/models/AdminToken.ts` |

## Routes API critiques

| Route | Méthode | Rôle |
|---|---|---|
| `/api/webhooks/chariow` | POST | Active Premium sur paiement Chariow (token URL auth) |
| `/api/user/payment/verify` | GET | Vérifie l'état Premium en BD pour le polling /paiement |
| `/api/admin/reconcile-payment` | POST | Réconciliation manuelle (admin uniquement) |
| `/api/auth/[...nextauth]` | * | NextAuth credentials + JWT |
| `/api/user/content/bunny` | GET | Sert les URLs signées Bunny (Premium only) |

## Flux Chariow webhook (référence)

```
body = {
  event: "successful.sale",
  sale: { id: "SALEXXX", amount: { value, currency }, custom_metadata, custom_fields },
  product: { id: "prd_XXX", name, price },
  customer: { email, name, phone, country }
}
```

- `referenceId = body.sale.id` (extracteur : `src/lib/chariow.ts → parseChariowSale`)
- Plan résolu via mapping `body.product.id` → `Plan.chariowUrl` (regex)
- User résolu via `User.findOne({ email: body.customer.email })`
- ⚠️ Chariow n'echo PAS le `custom_data` passé en query — c'est l'email qui fait le lien
- Auth webhook : `?token=<CHARIOW_WEBHOOK_TOKEN>` (timingSafeEqual)

## Codes Plan actifs (à jour juin 2026)

| Code | Période | Prix | Durée |
|---|---|---|---|
| `vip_monthly` | mois | 2 500 FCFA | 30 j |
| `vip_quarterly` | trimestre | 5 000 FCFA | 90 j |
| `vip_annual` | an | 10 000 FCFA | 365 j |
| `vip_avie` (archivé) | — | — | ❌ ne plus jamais utiliser |

## Convention de nommage Bunny (freemium)

Source de vérité du gating Free vs Premium (cf. `src/lib/freemium.ts`).

| Type de contenu | Convention path | Statut |
|---|---|---|
| Chapitre 1 d'une matière (gratuit) | `/{niveau}/{matiere}/chapters/01-<slug>/...` | Free + Trial + Premium |
| Chapitres 2+ | `/{niveau}/{matiere}/chapters/02-<slug>/`, `03-...` | Premium uniquement |
| Annales corrigées | `/annales/BEPC/...`, `/annales/Bac-C/...` | Premium uniquement |

Regex de détection (dans `src/lib/freemium.ts`) :
- Free chapter : `/chapters\/01-/i`
- Annale : `/(^|\/)annales\//i`

Pour les vidéos Bunny Stream, le titre est utilisé comme proxy (normalisé : espaces → tirets,
lowercase). Convention admin pour les titres de chapitre 1 : commencer par `"01 - "` (avec
espaces) OU `"01-"` (sans espaces) — les deux sont acceptés grâce à la normalisation.

**Discipline admin** : tout chapitre uploadé doit suivre cette convention. Un dossier
mal nommé devient automatiquement Premium (fail-safe, pas de perte de sécurité).

## Scripts de diagnostic existants (`scripts/`)

| Script | Action |
|---|---|
| `diagnose_payment.js` | État de salomonfoe158 + foesalomon65 + transactions + 5 derniers webhook_logs |
| `check_webhook_logs.js` | 5 derniers POST `/api/webhooks/chariow` avec body complet |
| `check_user_status.js` | État Premium d'un user |
| `check_recent_transactions.js` | Dernières transactions |
| `check_today_transactions.js` | Transactions du jour |
| `reconcile-balances.ts` | Réconciliation des soldes affiliés |

## Bibliothèques internes (`src/lib/`)

| Fichier | Rôle |
|---|---|
| `chariow.ts` | parseCustomData, parseChariowSale |
| `premium-core.ts` | computePremiumStatus (utilisé par session, /verify, route Bunny) |
| `validation.ts` | isSyntheticEmail, isValidCameroonMobileMoney |
| `bunny-signed-url.ts` | signBunnyUrl (Token Auth Bunny CDN) |
| `email-templates/` | Templates centralisés des emails transactionnels |
| `retention.ts` | trackEvent (best-effort, non bloquant) |

## À tenir à jour

À chaque évolution majeure : ajouter / corriger ici la section concernée.
Ce skill est la **carte que les autres agents consultent** — son obsolescence
les fait halluciner.
