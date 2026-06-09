# 05 — Synthèse mensuelle KPI admin

## Objectif

Le 1er de chaque mois, envoyer à Salomon FOE un rapport synthétique des KPIs
du mois écoulé : croissance, conversions, churn, chiffre d'affaires.

## Trigger

**Cron monthly** à 08h CAT le 1er :

- Cron expression : `0 8 1 * *`
- Fuseau : `Africa/Douala`

## Logique métier

Calculer les KPIs sur la période **[1er du mois précédent → fin du mois précédent]**
et formater un email synthétique.

## Requêtes MongoDB (lecture seule)

### KPI 1 — Nouveaux inscrits

```js
db.users.countDocuments({
  role: 'student',
  createdAt: { $gte: ISODate('<prev_month_start>'), $lt: ISODate('<this_month_start>') }
})
```

### KPI 2 — Conversions Premium (passage Free → Premium ce mois-ci)

```js
db.transactions.countDocuments({
  status: { $in: ['pending', 'cleared'] },
  createdAt: { $gte: ISODate('<prev_month_start>'), $lt: ISODate('<this_month_start>') }
})
```

### KPI 3 — Chiffre d'affaires brut

```js
db.transactions.aggregate([
  { $match: {
      createdAt: { $gte: ISODate('<prev_month_start>'), $lt: ISODate('<this_month_start>') },
      status: { $in: ['pending', 'cleared'] }
    }},
  { $group: { _id: null, total: { $sum: '$amount' } } }
])
```

### KPI 4 — Répartition par plan

```js
db.transactions.aggregate([
  { $match: { createdAt: { $gte: ISODate('<prev_month_start>'), $lt: ISODate('<this_month_start>') } } },
  { $group: { _id: '$planCode', count: { $sum: 1 }, total: { $sum: '$amount' } } }
])
```

### KPI 5 — Churn (Premium expirés non renouvelés ce mois)

```js
db.users.countDocuments({
  role: 'student',
  premiumUntil: { $gte: ISODate('<prev_month_start>'), $lt: ISODate('<this_month_start>') },
  isPremium: false  // état actuel : déjà retombé
})
```

### KPI 6 — Total Premium actifs en fin de mois

```js
db.users.countDocuments({
  role: 'student',
  isPremium: true,
  premiumUntil: { $gte: ISODate('<this_month_start>') }
})
```

## Séquence des nodes n8n

```
[Cron Trigger: 0 8 1 * * Africa/Douala]
   ↓
[Compute date ranges (prev_month_start, this_month_start)]
   ↓
[MongoDB Aggregate × 6 (parallèle ou séquentiel)]
   ↓
[Merge results]
   ↓
[Format HTML email avec template]
   ↓
[Send Email to ADMIN_EMAIL]
```

## Contenu de l'email (template HTML simple)

- **Objet** : « SmartLearn — Synthèse {mois précédent} »
- **Corps** : tableau récap des 6 KPIs + comparaison vs mois M-2 si dispo
- **Pas de CTA** (rapport interne)
- **Pied** : « Cette synthèse est générée automatiquement chaque 1er du mois.
  Pour un détail granulaire, lance `/diagnostic-vip` ou consulte le dashboard admin. »

## Anti-hallucination (cf. CLAUDE.md §4)

- Toute valeur affichée = sortie d'une requête MongoDB. Pas de "approximation".
- Si une requête échoue → afficher `⚠️ donnée manquante (requête KPI {n} en échec)`
  dans le rapport au lieu de mettre 0.
- Comparaison vs M-2 : ne l'afficher QUE si M-2 a effectivement un rapport stocké
  ou peut être recalculé. Sinon, masquer la colonne.

## Variables d'environnement n8n

| Variable | Usage |
|---|---|
| `MONGODB_URI` | Connexion MongoDB Atlas |
| `RESEND_API_KEY` | Provider email |
| `ADMIN_EMAIL` | Destinataire (`foesalomon65@gmail.com`) |

## Métriques de succès (du workflow lui-même)

- Taux de succès du run (cible : 100% — c'est critique pour Salomon)
- Latence d'envoi (cible : < 2 min)
- Pas de faux chiffres : zéro alerte de Salomon "ce KPI est faux"

## Évolutions futures

- Stocker chaque rapport mensuel dans `contenu/admin/syntheses/{YYYY-MM}.md`
  via un node "Write File" pour avoir un historique consultable
- Ajouter graphes visuels (via export PDF avec Puppeteer ou export PNG via
  un service externe) — overkill pour v1
- KPI par cohorte (BEPC vs Probatoire vs Bac) pour identifier les segments
  les plus rentables
- Comparaison MoM (Month-over-Month) automatique
