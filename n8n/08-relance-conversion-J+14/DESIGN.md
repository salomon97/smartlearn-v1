# 08 — Relance conversion J+14 après bascule

## Objectif

14 jours après la bascule en Free, rappeler l'option Premium avec un témoignage anonymisé
si l'élève est toujours Free.

## Trigger

Cron daily 10h CAT : `0 10 * * *`

## Requête MongoDB

Cibler les users dont l'essai a expiré il y a 14 jours et qui sont toujours Free :

```js
db.users.find({
  role: { $in: ['student', 'affiliate'] },
  welcomeTrialGrantedAt: { $exists: true, $ne: null },
  premiumUntil: {
    $gte: ISODate('<now-15d>'),
    $lt:  ISODate('<now-14d>')
  }
}, {
  email: 1, name: 1, grade_level: 1
})
```

## Email à envoyer

- **Objet** : « {name}, tu nous manques sur SmartLearn »
- **Corps** : témoignage anonymisé court (Marie/Awa/Junior fictif) + rappel des bénéfices
  Premium + CTA

## Garde-fous

1. ❌ email synthétique → SKIP
2. ❌ admin → SKIP
3. ❌ Premium payé entre-temps → SKIP (déjà filtré par le range premiumUntil)
