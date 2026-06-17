# 07 — Jour de bascule trial → free

## Objectif

Le jour où l'essai expire, envoyer un récap chaleureux à l'élève + CTA paiement.

## Trigger

Cron daily 10h CAT : `0 10 * * *`

## Requête MongoDB

Cibler les users dont l'essai vient d'expirer dans la dernière fenêtre 24h :

```js
db.users.find({
  role: { $in: ['student', 'affiliate'] },
  welcomeTrialGrantedAt: { $exists: true, $ne: null },
  premiumUntil: {
    $gte: ISODate('<now-1d>'),
    $lt:  ISODate('<now>')
  }
}, {
  email: 1, name: 1, grade_level: 1
})
```

## Email à envoyer

- **Objet** : « {name}, voici ce que tu as exploré pendant ton essai »
- **Corps** : récap ton chaleureux (« tu gardes l'accès au chapitre 1 ») + CTA vers tarifs

## Garde-fous

1. ❌ email synthétique → SKIP
2. ❌ admin → SKIP
3. ❌ Premium réactivé entre-temps (paiement Chariow) → SKIP (la requête sur `premiumUntil < now`
   exclut déjà les Premium actifs)
