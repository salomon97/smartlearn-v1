# 03 — Rappel d'expiration Premium J-7

## Objectif

Prévenir un utilisateur Premium 7 jours avant l'expiration de son abonnement
pour maximiser le taux de renouvellement avant churn.

## Trigger

**Cron daily** à 10h CAT (Africa/Douala) :

- Cron expression : `0 10 * * *`
- Fuseau : `Africa/Douala` (configurable dans n8n Settings)

## Logique métier

Pour chaque utilisateur dont `premiumUntil` tombe entre **demain à 00:00** et
**dans 8 jours à 00:00** (= fenêtre J+7), envoyer un email de rappel.

## Requête MongoDB (lecture seule)

```js
db.users.find({
  role: 'student',
  isPremium: true,
  premiumUntil: {
    $gte: ISODate('<now+7d>'),
    $lt:  ISODate('<now+8d>')
  }
}, {
  email: 1, name: 1, premiumUntil: 1, grade_level: 1
})
```

## Garde-fous (avant tout envoi)

1. ❌ `email` synthétique → SKIP
2. ❌ `role === 'admin'` (filtre déjà dans la requête, mais double-check)
3. ❌ `isPremium === false` (filtre déjà dans la requête, mais double-check)
4. ❌ Email déjà envoyé pour cette expiration (idempotence — cf. section ci-dessous)

## Idempotence

Sans contrôle, le cron daily enverrait potentiellement plusieurs emails dans la
fenêtre J+7 → J+8. Mitigation :

- Ajouter un champ `User.lastExpirationReminderAt: Date`
- Au début du workflow, filtrer aussi sur `lastExpirationReminderAt < premiumUntil - 8d`
- Après envoi réussi, mettre à jour ce champ via un PATCH sur l'API SmartLearn
  (endpoint à créer : `/api/internal/user/{id}/reminder-sent`)

⚠️ Cette mitigation requiert :
1. Ajout du champ `lastExpirationReminderAt` au modèle `User`
2. Endpoint `/api/internal/user/[id]/reminder-sent` (PATCH, auth via Bearer secret)

## Séquence des nodes n8n

```
[Cron Trigger: 0 10 * * * Africa/Douala]
   ↓
[MongoDB Query: users premiumUntil ∈ [J+7, J+8]]
   ↓
[Loop par utilisateur]
   ↓
[IF: email synthétique ? OU lastReminderAt récent ?] —— OUI ——→ [Skip + log]
   ↓ NON
[Send Email rappel (Resend)]
   ↓
[HTTP PATCH /api/internal/user/{id}/reminder-sent (Bearer auth)]
   ↓
[Continue Loop]
```

## Contenu de l'email (à produire par `marketing-ecoles`)

- **Objet** : « {name}, ton Premium expire dans 7 jours »
- **Corps** :
  - Rappel du bénéfice (« tu progresses bien sur {grade_level} »)
  - Tarifs : 2 500 / 5 000 / 10 000 FCFA (mensuel / trimestriel / annuel)
  - Ton chaleureux, pas culpabilisant
- **CTA** : « Renouveler maintenant » → `${SMARTLEARN_BASE_URL}/paiement`

## Variables d'environnement n8n

| Variable | Usage |
|---|---|
| `MONGODB_URI` | Connexion MongoDB Atlas (idéalement read-only) |
| `RESEND_API_KEY` | Provider email |
| `SMARTLEARN_BASE_URL` | Liens CTA |
| `SMARTLEARN_WEBHOOK_SECRET` | Bearer pour le PATCH idempotence |

## Métriques de succès

- Taux d'ouverture (cible : > 60% — utilisateur engagé, donc plus haut que welcome)
- Taux de renouvellement à J+0 (cible : > 30%)
- Taux de renouvellement à J+14 (cible : > 50%, cumul avec autres rappels)

## Évolutions futures

- Ajouter un rappel J-3 et J-1 (plus agressif si pas de réponse à J-7)
- Personnaliser le CTA selon le plan actuel (proposer un upgrade à l'annuel pour
  les mensuels)
- Couponner les renouvellements précoces (réduction de 10% si renouvellement
  avant expiration)
