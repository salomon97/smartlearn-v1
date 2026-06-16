# 06 — Fin d'essai Premium J-2

## Objectif

Avertir l'élève en essai Premium 2 jours avant la fin pour maximiser la conversion
avant la bascule en Free permanent.

## Trigger

Cron daily 10h CAT : `0 10 * * *`

## Requête MongoDB (lecture seule)

Cibler les users en trial dont la fin tombe entre J+2 et J+3 :

```js
db.users.find({
  role: { $in: ['student', 'affiliate'] },
  welcomeTrialGrantedAt: { $exists: true, $ne: null },
  premiumUntil: {
    $gte: ISODate('<now+2d>'),
    $lt:  ISODate('<now+3d>')
  }
}, {
  email: 1, name: 1, grade_level: 1, premiumUntil: 1
})
```

## Garde-fous

1. ❌ email synthétique → SKIP
2. ❌ admin → SKIP (filtre via role)
3. ❌ Email déjà envoyé pour cette fin d'essai (idempotence — utiliser `User.lastTrialEndReminderAt`,
   à ajouter au modèle si on veut le tracking fin)

## Email à envoyer

- **Objet** : « {name}, ton essai Premium se termine dans 2 jours »
- **Corps** : récap de ce qui sera perdu (annales, autres chapitres), CTA `/paiement`

## Variables d'env n8n

| Variable | Usage |
|---|---|
| `MONGODB_URI` | Connexion |
| `RESEND_API_KEY` | Provider email |
| `SMARTLEARN_BASE_URL` | Lien CTA |
