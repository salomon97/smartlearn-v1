# SmartLearn Unified — Règles du projet (CLAUDE.md)

> Chargé automatiquement par Claude Code à chaque session.
> Rôle : **orchestrateur**. Lit, route, consolide — ne produit **aucun livrable lui-même**.

---

## 1. Le projet

**SmartLearn Unified** (smartlearn-edu.org) est une plateforme EdTech SaaS camerounaise
ciblant le programme **MINESEC** : BEPC, Probatoire, Baccalauréat (toutes séries A/C/D/E/TI,
sous-systèmes francophone et anglophone).

**Fondateur** : Salomon FOE.
**Cible** : élèves du secondaire en Afrique francophone, en priorité Cameroun.
**Modèle** : freemium (en cours de construction) → Premium 30/90/365 jours via Chariow.

**Stack technique en production** :
- Front : Next.js 16 (App Router) + React 19 + TypeScript + Tailwind 4
- Auth : NextAuth 4 (JWT, Credentials provider)
- BDD : MongoDB Atlas via Mongoose 9
- Vidéo/PDF : Bunny.net (Storage + Stream, Token Auth activable)
- Paiement : Chariow → webhook `/api/webhooks/chariow` (token URL) → activation Premium
- Email : Resend / SMTP (templates centralisés `src/lib/email-templates/`)
- Hébergement : Vercel (Hobby plan, contrainte cron daily max)
- Tests : Vitest (44 tests verts en juin 2026)

**Charte graphique Palier 2** (ne pas confondre avec l'ancien "or" Palier 1) :
- Navy `#0A1628` (institutionnel), Navy-deep `#050D1A`
- Teal `#0FB69C` (progression, succès), Teal-dark `#0A8A75`
- Orange `#F97316` (action, CTA), Orange-dark `#EA580C`
- Typo : Playfair Display (titres), DM Sans / Manrope (corps), Bricolage Grotesque (accents)
- Tokens CSS exposés dans `src/app/globals.css` (`--color-navy`, `--color-teal`, …)

---

## 2. Deux mondes à NE JAMAIS confondre (règle d'architecture critique)

| Monde | Lieu | Rôle |
|---|---|---|
| **Conception/test (ce dépôt, via Claude Code)** | `.claude/agents/` + `.claude/skills/` | Créer du contenu pédagogique, concevoir et **tester** les comportements de tutorat, corriger des copies-types, prototyper des emails marketing. |
| **Production temps réel (côté élève dans l'app)** | `src/app/api/**` + backend Node + MongoDB + RAG curriculum | Le tuteur IA branché sur les données élève passe par **l'API Claude appelée depuis le backend Next.js**, PAS par Claude Code. |

→ Les agents `.claude/agents/` servent à **concevoir et tester** ces interactions, jamais à
les exécuter en production.

---

## 3. Source de vérité

**MongoDB Atlas est la source de vérité unique** pour : élèves, paiements (`Transaction`),
statut Premium (`User.isPremium` + `User.premiumUntil`), affiliation, contenus admin.

**Le markdown/PDF est un format de SORTIE**, jamais un état partagé. Ne pas réimplémenter
une "mémoire fichiers markdown" parallèle (anti-pattern de NAIOM Multi-Agent).

**Outils d'inspection** :
- MCP MongoDB en **lecture seule par défaut** pour `analyste-academique` et `admin-abonnements`.
- MCP Sentry pour la consultation des erreurs de production.
- Scripts de diagnostic existants dans `scripts/` : `diagnose_payment.js`,
  `check_webhook_logs.js`, `check_user_status.js`, `check_recent_transactions.js`.

---

## 4. Règles d'or non négociables (valables pour TOUS les agents)

### Anti-hallucination
Aucun agent n'invente une réponse, un barème, une référence de programme, une statistique
ou un identifiant élève. **Donnée manquante = répondre littéralement** :
> ⚠️ donnée manquante — fournir : <ce-qui-manque>

C'est critique : nous nous adressons à des **élèves, souvent mineurs**.

### Protection des mineurs (fondation, pas réflexion après-coup)
- Jamais de données personnelles réelles d'élèves dans un contenu généré.
- Exemples anonymisés uniquement (prénoms fictifs : Awa, Junior, Marie, Eric…).
- Pas de capture/transmission de PII vers un outil tiers non listé dans la stack.
- Les emails synthétiques `@eleve.smartlearn-edu.org` ne reçoivent jamais de communication
  externe (logique `isSyntheticEmail` dans `src/lib/validation.ts`).

### Alignement MINESEC
Tout contenu pédagogique cite :
- la **matière** (Mathématiques, Physique-Chimie, Français, Anglais, SVT, Histoire-Géo…)
- le **niveau** (6e, 5e, 4e, 3e, 2nde A/C/E/TI, 1ère A/C/D/E/TI, Terminale A/C/D/E/TI)
- si connue, la **référence du programme officiel MINESEC** correspondant (chapitre, OG/OS)

Liste des classes : voir `src/lib/constants.ts` → `classesDisponibles`.

### Langue
Français par défaut. Anglais **uniquement** si la matière relève du sous-système
anglophone camerounais (English, Literature, Maths anglophone). Pas de mélange dans
un même livrable.

### Charte
Respect strict de la palette navy/teal/orange (cf. §1). Le "or" est banni — c'est un
héritage Palier 1 archivé.

### Traçabilité
Tout livrable dans `contenu/` porte un en-tête YAML obligatoire (cf. §8).
Un livrable = un auteur identifié.

---

## 5. Skills (`.claude/skills/`)

Les skills sont des **savoirs réutilisables** invocables par n'importe quel agent. Ils
évitent de dupliquer la connaissance entre agents.

| Skill | Invocable par | Contenu |
|---|---|---|
| `programme-minesec` | concepteur-contenu, correcteur-copies, tuteur-pedagogique | Référentiel programmes officiels par matière × niveau |
| `bareme-minesec` | correcteur-copies | Barèmes officiels BEPC/Probatoire/Bac par épreuve |
| `charte-smartlearn` | marketing-ecoles, concepteur-contenu | Palette, typo, ton de marque, vocabulaire interdit |
| `architecture-smartlearn` | admin-abonnements, analyste-academique | Modèles Mongoose, routes API, flux Chariow, scripts de diagnostic |
| `anti-hallucination` | TOUS | Procédure stricte de refus quand une donnée manque |

Les skills démarrent en **squelette vide** (procédure anti-hallucination active) ; ils seront
remplis manuellement avec les contenus officiels au fur et à mesure.

---

## 6. Agents (`.claude/agents/`) — table de délégation

Choix de modèle : **Opus** = raisonnement / correction / tutorat. **Sonnet** = volume.

| Besoin | Agent | Modèle |
|---|---|---|
| Créer fiches, QCM, annales alignés MINESEC | `concepteur-contenu` | Sonnet |
| Corriger une copie selon barème (texte ou photo via vision) | `correcteur-copies` | Opus |
| Concevoir/tester un parcours ou une explication de tutorat in-app | `tuteur-pedagogique` | Opus |
| Analyser progression élève (MongoDB) + plan de révision 30j | `analyste-academique` | Opus |
| Pitchs écoles partenaires, conventions, posts charte navy/teal/orange | `marketing-ecoles` | Sonnet |
| Diagnostic activation Premium, support Chariow, relances paiement | `admin-abonnements` | Sonnet |

Exemple d'appel explicite :
> « Utilise le sous-agent `concepteur-contenu` pour une fiche sur les suites
> numériques, Terminale C. »

Claude peut aussi déléguer automatiquement selon le champ `description` de chaque agent.

---

## 7. n8n & automatisations — règle de séparation

**Principe** : tout flux **payant ou transactionnel critique** reste en **code Next.js**
(testable, observable via Vercel Logs + Sentry). n8n **uniquement** pour les flux non
critiques, faciles à reconfigurer par un non-dev.

| Flux | Implémentation | Pourquoi |
|---|---|---|
| Webhook Chariow → activation Premium | **Next.js** (`/api/webhooks/chariow/route.ts`) | Critique paiement, idempotence stricte requise |
| Refresh JWT après paiement | **Next.js** (NextAuth jwt callback) | Critique session |
| Cron clearing commissions affilié | **Vercel cron** (`/api/cron/clear-affiliate-commissions`) | Daily, Hobby-friendly |
| Email bienvenue nouvel inscrit | **n8n** | Non critique, contenu éditable sans déploiement |
| Relance élève inactif 7 jours | **n8n** | Itération marketing fréquente |
| Rappel expiration Premium J-7 | **n8n** | Itération marketing |
| Rapport hebdo de progression aux parents | **n8n** | Opt-in, non bloquant |
| Synthèse mensuelle KPI admin | **n8n** | Reporting interne |

**Interdictions formelles** (héritées de l'audit NAIOM, hors périmètre EdTech mineurs) :
- ❌ Aucun cold-emailing
- ❌ Aucun scraping LinkedIn (Apify, Pappers, Sales Navigator)
- ❌ Aucune rotation multi-comptes Gmail
- ❌ Aucune collecte massive de contacts sans opt-in

Les workflows n8n vivent dans `n8n/*.json` (exports versionnés, ré-importables).

---

## 8. Convention de sortie — en-tête YAML obligatoire

Tout fichier déposé dans `contenu/` commence par :

```yaml
---
matiere: Mathématiques
niveau: Terminale C
type: fiche        # fiche | qcm | annale | corrige | parcours | email | post
date: 2026-06-08
version: 1
statut: brouillon  # brouillon | valide
auteur: concepteur-contenu
---
```

Arborescence : `contenu/{niveau}/{matiere}/{type}-{slug}.md`

Exemple : `contenu/Terminale-C/Mathematiques/fiche-suites-numeriques.md`

---

## 9. Slash commands (`.claude/commands/`)

| Commande | Action |
|---|---|
| `/contenu-cours <matiere> <niveau> <chapitre>` | Déroule la chaîne fiche + QCM via `concepteur-contenu` |

Slash commands additionnelles à venir (Phase ultérieure, ne pas créer maintenant) :
`/plan-revision`, `/corriger-copie`, `/diagnostic-vip`.

---

## 10. Ce qu'il NE FAUT PAS faire

- ❌ Faire exécuter le tutorat temps réel par Claude Code (passe par l'API Claude
  côté backend Node, cf. §2).
- ❌ Stocker un état partagé dans des fichiers markdown (la source de vérité est MongoDB).
- ❌ Inventer une donnée manquante (cf. §4 anti-hallucination).
- ❌ Empiler des agents ou MCP au-delà du roster actuel sans justification — chaque
  ajout coûte du contexte et dégrade la sélection d'outils.
- ❌ Inclure des données personnelles réelles d'élèves dans un contenu généré.
- ❌ Réintroduire le "or" Palier 1 dans la charte.
- ❌ Construire un outil de prospection à froid (hors périmètre EdTech, juridiquement
  fragile en zone UE/RGPD pour les écoles partenaires).
