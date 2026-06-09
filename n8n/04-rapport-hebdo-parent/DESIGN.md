# 04 — Rapport hebdomadaire de progression au parent

## ⚠️ Statut : workflow bloqué — dépendances modèle requises

**Ce workflow NE PEUT PAS être activé tant que les champs suivants n'existent pas
sur `User`** :

| Champ | Type | Description |
|---|---|---|
| `parentEmail` | `string` (optionnel) | Email du parent pour notification |
| `parentOptIn` | `boolean` (default false) | Consentement explicite du parent |
| `parentOptInAt` | `Date` | Date du consentement (traçabilité RGPD) |
| `lastWeeklyReportSentAt` | `Date` (optionnel) | Idempotence anti-doublon |

**Avant activation** :
1. Ajouter ces champs au schéma `src/models/User.ts`
2. Créer une UI dans `/dashboard/parametres` pour que l'élève (mineur) demande
   à associer l'email d'un parent — confirmation par email double opt-in
3. Mettre en place une politique de confidentialité explicite pour les parents
4. Tester ce workflow en `active: false` avec un compte test avant ouverture

**Sans ces prérequis, ce workflow est de la documentation prospective.**

## Objectif

Tenir les parents informés (de façon opt-in) de la progression hebdomadaire
de leur enfant sur SmartLearn — sans révéler de données pédagogiques détaillées
qui pourraient mettre l'élève en porte-à-faux.

## Trigger

**Cron weekly** dimanche 19h CAT (heure familiale, soirée tranquille) :

- Cron expression : `0 19 * * 0`
- Fuseau : `Africa/Douala`

## Logique métier

Pour chaque utilisateur avec `parentOptIn === true`, générer un résumé de la
semaine écoulée et l'envoyer à `parentEmail`.

## Requête MongoDB (lecture seule)

```js
db.users.find({
  role: 'student',
  parentEmail: { $exists: true, $ne: null },
  parentOptIn: true,
  // anti-doublon : pas envoyé dans les 6 derniers jours
  $or: [
    { lastWeeklyReportSentAt: { $exists: false } },
    { lastWeeklyReportSentAt: { $lt: ISODate('<now-6d>') } }
  ]
}, {
  email: 1, name: 1, grade_level: 1,
  parentEmail: 1, parentOptIn: 1,
  isPremium: 1, premiumUntil: 1
})
```

## Garde-fous (critiques car données de mineur transmises à un tiers)

1. ❌ `parentOptIn !== true` → SKIP
2. ❌ `parentEmail` vide ou invalide → SKIP + log + alerter Salomon
3. ❌ Email parent === email élève → SKIP (anomalie suspecte)
4. ❌ Compte synthétique → SKIP (cas géré par admin/enseignant directement)
5. ❌ Idempotence stricte : si rapport envoyé dans les 6 derniers jours → SKIP

## Contenu de l'email (à produire par `marketing-ecoles`)

- **Objet** : « SmartLearn — Cette semaine avec {prénom de l'élève} »
- **Corps** : ton respectueux, factuel, NON intrusif :
  - Activité de la semaine (temps de connexion estimé : `lastLoginAt` ou agrégat)
  - Matières travaillées (haut niveau : « Mathématiques, Français »)
  - **PAS** de notes ni d'évaluations détaillées (cf. règle ci-dessous)
  - Encouragement général
- **CTA opt-out** : « Si vous ne souhaitez plus recevoir ces emails, désabonnement
  ici » → lien `/parent/unsubscribe?token=XXX` (à implémenter)
- **CTA opt-in renforcement** : aucun. Pas d'incitation à l'achat dans un email
  parent (anti-intrusion).

## Règle anti-intrusion pédagogique (importante)

Ce rapport ne doit JAMAIS contenir :
- ❌ Une note précise (« Awa a eu 8/20 en Maths »)
- ❌ Le détail des erreurs (« Awa a raté l'exercice sur les fonctions »)
- ❌ Une comparaison avec d'autres élèves
- ❌ Une suggestion de sanction

Il PEUT contenir :
- ✅ Un volume d'activité (« 4 sessions cette semaine »)
- ✅ Les matières travaillées (sans détail)
- ✅ Un encouragement (« beau travail de régularité »)
- ✅ Une suggestion neutre (« pour la semaine prochaine, l'épreuve de
  Probatoire blanc est disponible »)

**Le rapport parent est un signal de présence et d'engagement, pas un outil
de surveillance.**

## Séquence des nodes n8n

```
[Cron Trigger: 0 19 * * 0 Africa/Douala]
   ↓
[MongoDB Query: élèves avec parent opt-in]
   ↓
[Loop par utilisateur]
   ↓
[Garde-fous : parentEmail valide ? Idempotence OK ?]
   ↓ OK
[Compute activité semaine (requête supplémentaire ou champs déjà sur User)]
   ↓
[Format email rapport]
   ↓
[Send Email to parentEmail]
   ↓
[HTTP PATCH /api/internal/user/{id}/parent-report-sent (Bearer auth)]
   ↓
[Continue Loop]
```

## Variables d'environnement n8n

| Variable | Usage |
|---|---|
| `MONGODB_URI` | Connexion MongoDB Atlas |
| `RESEND_API_KEY` | Provider email |
| `SMARTLEARN_BASE_URL` | Lien unsubscribe |
| `SMARTLEARN_WEBHOOK_SECRET` | Bearer pour PATCH |

## Métriques de succès

- Taux de delivery (cible : > 95%)
- Taux d'ouverture parent (cible : > 60% — public engagé)
- Taux d'unsubscribe (cible : < 5%/an — sinon revoir le contenu)
- Aucune plainte RGPD / aucune intrusion signalée

## Risques connus & mitigations

| Risque | Mitigation |
|---|---|
| Parent reçoit le rapport sans avoir donné un vrai consentement (élève qui a coché à sa place) | Double opt-in obligatoire (email de confirmation au parent avant activation) |
| Données de mineur exposées à un tiers non autorisé | `parentEmail` validé par confirmation + politique unsubscribe stricte |
| Élève qui ne veut PAS que son parent soit informé | Bouton « retirer mon parent » dans `/dashboard/parametres` côté élève |
| Conflit d'autorité parentale (parents séparés) | Limiter à 1 seul `parentEmail` par compte pour v1 |

## Évolutions futures

- Multi-parents (jusqu'à 2 emails, ex. parents séparés ou tuteur)
- Personnalisation de la fréquence (hebdo / bi-mensuel / mensuel) côté parent
- Inclure un score de progression abstrait (sur 5 étoiles) sans note chiffrée
- Coupler avec `analyste-academique` pour des rapports plus riches (mais
  toujours dans le cadre anti-intrusion ci-dessus)
