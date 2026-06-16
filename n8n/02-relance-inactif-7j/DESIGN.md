# 02 — Relance élève inactif 7 jours

## Objectif

Réengager un élève (Free ou Premium) qui ne s'est pas connecté à SmartLearn
depuis 7 jours avec un email de relance contextualisé.

## ⚠️ Dépendance technique préalable

Requiert l'ajout du champ `User.lastLoginAt: Date` dans le modèle Mongoose.

- Mise à jour côté NextAuth callbacks (signIn callback) :
  ```ts
  // src/app/api/auth/[...nextauth]/route.ts
  events: {
    async signIn({ user }) {
      await User.findByIdAndUpdate(user.id, { lastLoginAt: new Date() });
    }
  }
  ```
- Index MongoDB recommandé : `{ lastLoginAt: 1, role: 1 }`

**Tant que ce champ n'est pas en place, ce workflow doit rester `active: false`.**

## Trigger

**Cron daily** à 18h CAT (heure plus engageante pour les notifications) :

- Cron expression : `0 18 * * *`
- Fuseau : `Africa/Douala`

## Logique métier

Pour chaque utilisateur dont `lastLoginAt` est entre **il y a 8 jours** et
**il y a 7 jours** (fenêtre étroite pour éviter les répétitions), envoyer un
email de réengagement adapté à son statut Premium.

## Requête MongoDB (lecture seule)

```js
db.users.find({
  role: 'student',
  lastLoginAt: {
    $gte: ISODate('<now-8d>'),
    $lt:  ISODate('<now-7d>')
  },
  // SKIP les users en trial actif ou Premium payé (sinon on les relance alors qu'ils ont accès complet)
  $or: [
    { premiumUntil: { $exists: false } },
    { premiumUntil: null },
    { premiumUntil: { $lt: ISODate('<now>') } }   // expiré uniquement
  ]
}, {
  email: 1, name: 1, isPremium: 1, grade_level: 1, lastLoginAt: 1
})
```

## Garde-fous (avant tout envoi)

1. ❌ `email` synthétique → SKIP
2. ❌ `role === 'admin'` (filtre dans la requête, double-check)
3. ❌ `lastReminderInactiveAt > now - 14d` (idempotence — pas plus d'1 relance
   inactif par 14 jours pour ne pas spammer)
4. ❌ Élève qui s'est désinscrit / supprimé entre-temps → SKIP
5. ❌ user en TRIAL actif OU Premium payé (`premiumUntil > now`) → SKIP (déjà couvert par la requête, double-check)

## Idempotence

Ajouter `User.lastReminderInactiveAt: Date`. Mêmes principes que workflow 03 :
filtrage avant envoi + PATCH après envoi via endpoint interne.

## Séquence des nodes n8n

```
[Cron Trigger: 0 18 * * * Africa/Douala]
   ↓
[MongoDB Query: users inactif fenêtre J-8 → J-7]
   ↓
[Loop par utilisateur]
   ↓
[IF: email synthétique OU déjà relancé < 14j ?] —— OUI ——→ [Skip + log]
   ↓ NON
[IF: isPremium ?] ——┬── OUI ──→ [Email "valoriser ton accès Premium"]
                    │
                    └── NON ──→ [Email "passe en Premium pour aller plus loin"]
   ↓ (les deux branches convergent)
[HTTP PATCH /api/internal/user/{id}/inactif-reminder-sent]
   ↓
[Continue Loop]
```

## Contenu des 2 variantes d'email (à produire par `marketing-ecoles`)

### Variante A — Élève Premium inactif

- **Objet** : « {name}, on t'a pas vu depuis une semaine »
- **Corps** :
  - Rappel de son accès Premium toujours actif (durée restante)
  - Une suggestion concrète selon `grade_level` (ex. « la fiche sur les suites
    numériques cartonne en ce moment en Terminale C »)
  - Ton chaleureux, pas culpabilisant
- **CTA** : « Reprendre ma progression » → `${SMARTLEARN_BASE_URL}/dashboard`

### Variante B — Élève Free inactif

- **Objet** : « {name}, on a préparé un contenu pour toi »
- **Corps** :
  - Mention d'une nouveauté (vidéo, exercice) ouverte en accès Free
  - Soft mention du Premium (sans pression)
- **CTA** : « Découvrir » → `${SMARTLEARN_BASE_URL}/catalogue`

## Variables d'environnement n8n

| Variable | Usage |
|---|---|
| `MONGODB_URI` | Connexion MongoDB Atlas |
| `RESEND_API_KEY` | Provider email |
| `SMARTLEARN_BASE_URL` | Liens CTA |
| `SMARTLEARN_WEBHOOK_SECRET` | Bearer pour PATCH idempotence |

## Métriques de succès

- Taux d'ouverture (cible : > 30%)
- Taux de retour à l'app dans les 48h (cible : > 15%)
- Conversion Free → Premium sur cohorte relancée (cible : > 3% sur 14 jours)

## Risques connus

- Sur-relance perçue comme spam → respect strict de l'idempotence 14 jours
- Élève qui a abandonné définitivement → ne pas s'acharner. Après 3 relances
  inactif sans retour, arrêter la séquence (à implémenter en évolution future :
  compteur `User.reminderInactiveCount`).
