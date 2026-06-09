# 01 — Welcome élève (séquence d'onboarding J+0 / J+1 / J+3)

## Objectif

Accompagner un nouvel élève inscrit sur SmartLearn pendant ses 3 premiers jours
avec 3 emails séquencés pour maximiser l'activation (premier contenu consulté).

## Trigger

**Webhook entrant** depuis l'API SmartLearn après une inscription élève réussie.

- URL n8n : `https://<n8n-instance>/webhook/welcome-eleve`
- Méthode : POST
- Auth header : `Authorization: Bearer ${SMARTLEARN_WEBHOOK_SECRET}` (à vérifier
  dans le node Webhook → Options → Authentication → Header Auth)
- Payload attendu :

```json
{
  "userId": "6a228337a2d6e98fd13a285a",
  "email": "exemple@gmail.com",
  "name": "Marie K.",
  "grade_level": "3e",
  "lang": "fr"
}
```

## Côté SmartLearn (à brancher)

Dans `src/app/api/auth/register/route.ts`, après la création réussie du `User`,
ajouter un appel best-effort (non bloquant) :

```ts
// best-effort, ne pas bloquer la réponse signup si n8n est down
fetch(process.env.N8N_WEBHOOK_WELCOME_URL!, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.SMARTLEARN_WEBHOOK_SECRET}`,
  },
  body: JSON.stringify({ userId, email, name, grade_level, lang }),
}).catch(err => console.warn('[welcome-eleve] webhook failed:', err));
```

## Garde-fous (avant tout envoi)

1. ❌ Si `email` correspond à `/@eleve\.smartlearn-edu\.org$/i` → SKIP (compte synthétique)
2. ❌ Si `role === 'admin'` → SKIP (cas marginal mais possible)
3. ❌ Si l'email est manifestement invalide (regex basique) → SKIP + log
4. ✅ Si payload incomplet (`!email || !name`) → SKIP + log

## Séquence des nodes n8n

```
[Webhook]
   ↓
[IF: email synthétique ? OU role admin ?] —— OUI ——→ [No-op + log]
   ↓ NON
[Send Email J+0 (Welcome via Resend)]
   ↓
[Wait 1 day]
   ↓
[Send Email J+1 (Comment utiliser SmartLearn)]
   ↓
[Wait 2 days]
   ↓
[Send Email J+3 (Premier conseil pédagogique)]
   ↓
[Respond to Webhook: 200 OK]
```

## Contenu des 3 emails (à produire par `marketing-ecoles`)

### Email J+0 — Welcome

- **Objet** : « Bienvenue sur SmartLearn, {name} »
- **Corps** : présentation 3 lignes, lien vers le dashboard, ton chaleureux
- **CTA** : « Découvrir mon programme {grade_level} » → `${SMARTLEARN_BASE_URL}/dashboard`

### Email J+1 — Comment utiliser

- **Objet** : « {name}, voici comment tirer le maximum de SmartLearn »
- **Corps** : 3 conseils concrets (vidéo HD, exercices, suivi)
- **CTA** : « Commencer ma première leçon » → `${SMARTLEARN_BASE_URL}/catalogue`

### Email J+3 — Premier conseil pédagogique

- **Objet** : « 30 minutes par jour suffisent »
- **Corps** : conseil méthodologique court, témoignage anonymisé (Awa/Junior/Marie)
- **CTA** : « Voir mon tableau de progression » → `${SMARTLEARN_BASE_URL}/dashboard`

## Variables d'environnement n8n

| Variable | Usage |
|---|---|
| `RESEND_API_KEY` | Provider email |
| `SMARTLEARN_BASE_URL` | Liens CTA |
| `SMARTLEARN_WEBHOOK_SECRET` | Auth webhook entrant |

## Côté SmartLearn — variables à ajouter à `.env.local` et Vercel

| Variable | Exemple |
|---|---|
| `N8N_WEBHOOK_WELCOME_URL` | `https://<n8n-instance>/webhook/welcome-eleve` |
| `SMARTLEARN_WEBHOOK_SECRET` | (32 octets hex, généré local) |

## Idempotence

Risque : si le `/register` est rappelé deux fois (retry réseau), on enverrait
2 séquences welcome.

**Mitigation** : ajouter un champ `User.welcomeSequenceTriggeredAt: Date` (ou
similaire). Au début du webhook n8n, faire une requête MongoDB :
- Si `welcomeSequenceTriggeredAt` déjà set < 24h → SKIP
- Sinon → marquer puis continuer

⚠️ Cette mitigation requiert une légère modification du modèle `User` côté
SmartLearn. À ajouter dans une PR avant activation du workflow.

## Métriques de succès

- Taux de delivery email J+0 (cible : > 95%)
- Taux d'ouverture J+0 (cible : > 50%)
- Taux de clic CTA (cible : > 15%)
- Taux d'activation à J+7 (élève qui consulte au moins 1 contenu) — à mesurer
  via `analyste-academique`

## Risques connus

- Resend peut rate-limit si volume soudain (à vérifier selon plan)
- Si l'élève s'inscrit puis se désinscrit dans les 3 jours, on peut envoyer des
  emails à un compte supprimé → ajouter un check `User.exists()` avant chaque
  envoi (J+1 et J+3)
