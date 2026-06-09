# n8n — Automatisations non critiques SmartLearn Unified

> Stratégie : voir **CLAUDE.md §7**. n8n traite UNIQUEMENT les flux **non critiques**
> (cycle de vie élève, marketing). Les flux **payants/transactionnels** restent en
> code Next.js (testable, observable Vercel Logs + Sentry).

## Périmètre n8n

| ✅ Autorisé | ❌ Interdit |
|---|---|
| Email bienvenue, relance inactif, rappel expiration | Activation Premium (webhook Chariow → Next.js) |
| Rapports parents, synthèses admin | Refresh JWT après paiement (NextAuth → Next.js) |
| Onboarding séquentiel | Réconciliation manuelle de paiement (`/admin/reconcile` → Next.js) |
| Notifications opt-in | Cold-emailing, scraping LinkedIn, rotation Gmail |

## Conventions de ce dossier

- **Numérotation** : `01-`, `02-`, … pour préserver l'ordre logique.
- **Chaque workflow** = 1 sous-dossier avec :
  - `DESIGN.md` → la **source de vérité** : trigger, nodes, env vars, garde-fous,
    métriques. Si le JSON n8n casse, on reconstruit à partir du DESIGN.md.
  - `workflow.json` → un **squelette importable minimal** (trigger + 1-2 nodes
    structure). À compléter dans l'UI n8n avec les credentials et la logique
    métier précise.

## Variables d'environnement n8n (à configurer une fois)

| Variable | Source | Usage |
|---|---|---|
| `MONGODB_URI` | `.env.local` SmartLearn | Connexion MongoDB Atlas (read-only de préférence) |
| `RESEND_API_KEY` | Compte Resend | Provider email |
| `SMARTLEARN_BASE_URL` | `https://www.smartlearn-edu.org` | Liens CTA dans les emails |
| `SMARTLEARN_WEBHOOK_SECRET` | Généré (32 octets hex) | Authentifier les webhooks Next.js → n8n |
| `ADMIN_EMAIL` | `foesalomon65@gmail.com` | Destinataire des synthèses mensuelles |
| `WEBHOOK_AUTH_HEADER` | `Bearer <SMARTLEARN_WEBHOOK_SECRET>` | Header attendu sur les webhooks entrants |

## Garde-fous globaux (TOUS les workflows DOIVENT vérifier)

1. **Email synthétique** : skipper si `email` match `/@eleve\.smartlearn-edu\.org$/i`
2. **Rôle admin** : skipper si `user.role === 'admin'`
3. **Opt-in obligatoire** pour les communications parents/élèves non transactionnelles
4. **Idempotence** : pas d'envoi d'email en double pour un même événement (utiliser
   un champ `lastEmailSentAt` côté User ou une table `email_log` en BD)
5. **Anti-hallucination** (cf. CLAUDE.md §4) : si un champ critique manque (email,
   nom), skipper plutôt qu'inventer

## Liste des workflows

| # | Workflow | Trigger | Statut |
|---|---|---|---|
| 01 | welcome-eleve | Webhook au signup | ✅ Prêt à implémenter |
| 02 | relance-inactif-7j | Cron daily 18h CAT | ⚠️ requiert ajout du champ `User.lastLoginAt` |
| 03 | rappel-expiration-7j | Cron daily 10h CAT | ✅ Prêt à implémenter |
| 04 | rapport-hebdo-parent | Cron weekly dimanche 19h CAT | ⚠️ requiert ajout des champs `User.parentEmail` + `User.parentOptIn` |
| 05 | synthese-mensuelle-admin | Cron monthly 1er 08h CAT | ✅ Prêt à implémenter |

## Import dans n8n

1. **n8n cloud ou self-hosted** : Settings → Workflows → Import from File
2. Sélectionne le `workflow.json` du sous-dossier
3. Le squelette s'ouvre dans l'éditeur → ajoute tes credentials (MongoDB, Resend, etc.)
4. Complète la logique métier selon le `DESIGN.md`
5. Active le workflow uniquement après test manuel

## Observabilité

- n8n Executions log = source primaire (succès/échec par run)
- Pour les erreurs récurrentes : logger dans MongoDB collection `n8n_failures`
  (champ libre : workflow_id, timestamp, error_message, payload anonymisé)
- Email d'alerte à `ADMIN_EMAIL` si > 5 échecs consécutifs sur un workflow

## Mise à jour de ces docs

À chaque évolution du modèle `User` ou des champs critiques côté SmartLearn,
mettre à jour les DESIGN.md concernés. Ce dossier est versionné dans git, pas
seulement dans n8n.
