# SmartLearn Unified — Spec Freemium

> **Date** : 2026-06-10
> **Auteur** : Salomon FOE + Claude (brainstorming session)
> **Statut** : Validé pour implémentation
> **Prochain step** : invocation de `writing-plans` pour générer le plan technique

---

## 1. Contexte & objectif

Aujourd'hui SmartLearn Unified est en mode **tout-ou-rien** : l'utilisateur paie via Chariow
(3 000 FCFA/mois, 5 000 FCFA/trimestre, 10 000 FCFA/an) et obtient `User.isPremium = true` qui débloque
l'intégralité du contenu Bunny.net (vidéos + PDFs + exercices). Aucun élève ne peut **expérimenter**
la qualité du produit avant de payer.

**Objectif #1 (verrouillé)** : ouvrir une porte gratuite qui maximise la **démonstration de valeur**
(l'élève utilise vraiment le produit), pas l'acquisition de volume ni la conversion forcée par essai
court. La défense de la conversion repose sur **2 piliers** :

1. **Contenu Free limité au chapitre 1 par matière** — l'élève voit la qualité APC, comprend qu'il
   manque les chapitres suivants.
2. **Annales corrigées MINESEC = signal Premium exclusif** — c'est le hook le plus motivé pour un
   élève préparant BEPC, Probatoire, Bac.

## 2. Mécanique en 1 phrase

> **À l'inscription, l'élève obtient 7 jours d'essai Premium gratuit. À l'expiration, il bascule en
> Free permanent (accès au chapitre 1 de chaque matière de son niveau).** Pour aller plus loin →
> paiement Chariow (mensuel / trimestriel / annuel).

## 3. États utilisateur

```
INSCRIPTION (J+0)
       │
       ▼
┌──────────────────────┐
│  TRIAL (7 jours)     │  isPremium=true · premiumUntil=J+7
│                      │  Accès TOUT (chapitres + annales)
└──────────────────────┘
       │
       ▼ (sans paiement à J+7)
┌──────────────────────┐
│  FREE (permanent)    │  isPremium=false · premiumUntil dans le passé
│                      │  Accès chapitre 1 de chaque matière du niveau
└──────────────────────┘
       │
       ▼ (paiement Chariow)
┌──────────────────────┐
│  PREMIUM             │  isPremium=true · premiumUntil=+30/90/365j
│                      │  Accès TOUT à nouveau
└──────────────────────┘
```

Le passage **FREE → PREMIUM** est traité par le webhook Chariow existant
(`/api/webhooks/chariow/route.ts`). Aucune modification de ce code.

## 4. Cas spéciaux (verrouillés)

| Cas | Comportement |
|---|---|
| `role === 'admin'` | Accès illimité, jamais concerné par freemium. Bannières trial/free **masquées**. |
| Email synthétique (`@eleve.smartlearn-edu.org`) | Pas d'essai Premium auto. Direct en Free. Premium s'active uniquement via paiement Chariow géré par admin/enseignant. |
| Comptes existants au déploiement (non-Premium) | Reçoivent l'essai 7j **au prochain login** via callback NextAuth `signIn` (migration lazy, pas de batch). |
| Premium expiré (déjà payé puis fini) | Bascule en Free, **pas de nouvel essai** (anti-abus). `welcomeTrialGrantedAt` déjà set garantit cette règle. |
| Multi-comptes même IP (cyber-café) | Soft limit 3 inscriptions/IP/24h : flag `User.registrationFraudFlag` set pour détection a posteriori. Pas de blocage strict. |
| Ambassadeurs (parrains avec commissions) | Aucun privilège freemium spécifique. Hors scope v1. |

Notes :
- Paiement pendant l'essai → `premiumUntil = max(now, premiumUntil) + durationDays` (l'élève ne
  perd pas les jours d'essai restants — comportement déjà en place dans le webhook).
- Pas d'essai pour les comptes admin.

## 5. Modèle de données

### Modifications `src/models/User.ts`

```typescript
welcomeTrialGrantedAt?: Date;       // marque l'octroi UNIQUE de l'essai 7j
                                    // set une fois, jamais reset, même après expiration Premium payé
registrationFraudFlag?: {
  ipCount24h: number;
  flaggedAt: Date;
};
```

Champs optionnels (rétro-compat avec les comptes existants).

### Pas de nouveau modèle pour le contenu

Le contenu vit dans Bunny.net. L'identification Free/Premium se fait par **convention de nommage**
sur le path Bunny (cf. §6), pas via un nouveau schéma MongoDB.

## 6. Convention de nommage Bunny (source de vérité Free/Premium)

| Type | Path exemple | Statut |
|---|---|---|
| Chapitre 1 d'une matière | `/6e/Mathematiques/chapters/01-nombres-rationnels/` | **Gratuit** (Free + Trial + Premium) |
| Chapitres 2+ | `/6e/Mathematiques/chapters/02-calcul-litteral/` | **Premium uniquement** |
| Annales corrigées | `/annales/BEPC/2024-maths/`, `/annales/Bac-C/2023-physique/` | **Premium uniquement** |

**Regex** :
- Free chapter : `/chapters\/01-/i`
- Annale : `/(^|\/)annales\//i` ou `/(^|\/)exam-/i`

**Discipline** :
- Documenter dans `.claude/skills/architecture-smartlearn/SKILL.md`
- Tests Vitest sur la regex (`freemium.test.ts`)
- Warning log côté API si un dossier ressemble à un chapitre mais ne matche pas

## 7. Module helper `src/lib/freemium.ts` (NEW)

```typescript
// Pure functions, zéro IO, testables en isolation

export function isFreeChapterPath(path: string): boolean;
export function isAnnalePath(path: string): boolean;
export function isContentPathAlwaysPremium(path: string): boolean;

export type AccessUser = {
  isPremium: boolean;
  role?: 'student' | 'admin';
};

export type AccessVerdict =
  | { ok: true; reason: 'admin' | 'premium' | 'trial' | 'free-chapter' }
  | { ok: false; reason: 'premium-required-content' | 'premium-required-annale' };

export function canAccessContent(user: AccessUser, path: string): AccessVerdict;
```

Tous les call sites du gating (route bunny, futurs endpoints, frontend pour badges) passent par
`canAccessContent`. **Source unique de vérité**, testable, DRY.

## 8. Modifications API & auth

### 8.1 `/api/auth/register/route.ts` — octroi essai à l'inscription

Après `User.create()`, si **pas synthétique et pas admin** :

```typescript
user.premiumUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
user.welcomeTrialGrantedAt = new Date();
await user.save();
```

### 8.2 NextAuth `signIn` callback — migration lazy

```typescript
events: {
  async signIn({ user }) {
    const dbUser = await User.findById(user.id);
    const isEligibleForTrial =
      !dbUser.welcomeTrialGrantedAt &&
      !isSyntheticEmail(dbUser.email) &&
      dbUser.role !== 'admin' &&
      !dbUser.premiumUntil;   // jamais payé avant

    if (isEligibleForTrial) {
      dbUser.premiumUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      dbUser.welcomeTrialGrantedAt = new Date();
    }

    dbUser.lastLoginAt = new Date();
    await dbUser.save();
  }
}
```

Note : `lastLoginAt` est aussi mis à jour ici, ce qui débloque le workflow n8n `02-relance-inactif-7j`.

### 8.3 `/api/user/content/bunny/route.ts` — gating granulaire

Au lieu du check binaire actuel, retourner **tous les items** avec un flag `isLocked` :

```typescript
const items = data.filter(...).map(item => {
  const fullPath = `${cleanPath}/${item.ObjectName}`;
  const verdict = canAccessContent(
    { isPremium: access.isPremium, role: dbUser.role },
    fullPath
  );
  return {
    id: item.Guid || item.ObjectName,
    name: item.ObjectName,
    cdnUrl: verdict.ok ? signBunnyUrl(rawUrl, bunnyKey) : null,   // null si verrouillé
    contentType: 'file',
    isFree: isFreeChapterPath(fullPath),
    isLocked: !verdict.ok,
    lockReason: verdict.ok ? null : verdict.reason,
  };
});
```

Idem pour les vidéos Bunny Stream.

## 9. UX flow

### 9.1 Bannière TRIAL (J+0 à J+7)

Position : haut du dashboard + haut du catalogue. Style teal.

```
✨ Essai Premium gratuit · J-5 restants — Profite de tous les chapitres et annales.
[ Conserver mon accès pour 3 000 FCFA/mois → ]                                ✕
```

Comportement :
- Fermable mais réapparaît à chaque session tant que `daysRemaining > 0`
- CTA → `/paiement?plan=monthly`

### 9.2 Bannière FREE (permanent après expiration trial)

Position : même que bannière trial. Style orange doux.

```
🔒 Tu as accès au chapitre 1 de chaque matière.
Continue avec l'intégralité de ton programme MINESEC + toutes les annales corrigées.
[ Voir les tarifs → ]
```

Comportement : non fermable tant que `!isPremium`.

### 9.3 Liste de chapitres (Option B — Lock & Visible)

À l'intérieur d'un programme :

```
PROGRAMME · Mathématiques · 3e

▶  01  Nombres rationnels                       [Gratuit ●]
🔒 02  Calcul littéral                           [Premium ●]
🔒 03  Racines carrées                           [Premium ●]
🔒 04  Théorème de Thalès                        [Premium ●]
🔒 05  Statistiques                              [Premium ●]

──────────────────────────────────────────────────────────────
📑 ANNALES CORRIGÉES                             [Premium ●]
🔒 BEPC 2024 · Mathématiques · Zone 1            [Premium ●]
🔒 BEPC 2023 · Mathématiques · Zone 1            [Premium ●]
🔒 BEPC 2022 · Mathématiques · Zone 1            [Premium ●]
──────────────────────────────────────────────────────────────

[ Débloquer tout — 3 000 FCFA/mois → ]
```

- Chapitres Premium gardent une **opacité 100%** (Lock & Visible validé Q5)
- Section annales séparée visuellement
- Clic sur item verrouillé → modal paywall (§9.4)

### 9.4 Paywall modal

```
┌──────────────────────────────────────────────┐
│  🔒  Ce chapitre est Premium                 │
│                                              │
│  Tu as déjà découvert SmartLearn avec        │
│  le chapitre 1 gratuit.                      │
│                                              │
│  Avec Premium, débloque :                    │
│   ✓  4 autres chapitres en Mathématiques     │
│   ✓  5 chapitres en Informatique             │
│   ✓  Toutes les annales BEPC corrigées       │
│                                              │
│  À partir de 3 000 FCFA / mois               │
│                                              │
│  [ Voir les formules → ]    [ Plus tard ]    │
└──────────────────────────────────────────────┘
```

- Nombre exact de chapitres restants par matière calculé depuis `curriculum.ts`
  (`program.modules.length - 1`)
- CTA → `/paiement`
- Pas de friction sur « Plus tard »

### 9.5 Catalogue `/catalogue` — badge

Chaque card de programme ajoute un badge teal : `★ Chapitre 1 gratuit` (réduit la friction
d'inscription pour les visiteurs anonymes).

### 9.6 Navbar `UserNav`

| État user | Liens affichés |
|---|---|
| Anonyme | Catalogue · Connexion · **Créer un compte** (CTA orange) |
| Trial actif | Catalogue · Dashboard · **Badge teal `J-3 essai Premium`** (cliquable) · Déconnexion |
| Free | Catalogue · Dashboard · **Passer Premium** (CTA orange) · Déconnexion |
| Premium payé | Catalogue · Dashboard · Déconnexion |
| Admin | Catalogue · Dashboard · (badge admin) · Déconnexion |

### 9.7 Email lifecycle (3 nouveaux workflows n8n)

À ajouter dans `n8n/` selon les conventions du `n8n/README.md` :

| Workflow | Trigger | Contenu |
|---|---|---|
| `06-fin-essai-J-2/` | Cron daily 10h CAT | Email à J-2 de la fin d'essai : « il te reste 2 jours pour conserver ton accès » |
| `07-bascule-free/` | Cron daily 10h CAT | Le jour de la bascule trial→free : « voici ce que tu as exploré » + CTA |
| `08-relance-conversion-J+14/` | Cron daily 10h CAT | 14 jours après la bascule free : rappel + témoignage anonymisé |

Tous les 3 héritent des garde-fous globaux (skip synthétique, skip admin, idempotence via
champ User dédié, etc.).

## 10. Tests

### 10.1 Unitaires (Vitest) — couverture cible 100% sur `freemium.ts`

```
src/lib/freemium.test.ts
├── isFreeChapterPath
│   ✓ accepte /6e/Maths/chapters/01-nombres/
│   ✓ accepte /Terminale-C/Info/chapters/01-binaire/
│   ✓ refuse /6e/Maths/chapters/02-X/
│   ✓ refuse /6e/Maths/chapters/chapitre-01-X/  (convention violée)
│   ✓ refuse path vide ou null
├── isAnnalePath
│   ✓ accepte /annales/BEPC/2024-maths/
│   ✓ accepte /annales/Bac-C/2023-physique/
│   ✓ refuse /6e/Maths/chapters/01-/  (chapitre, pas annale)
├── canAccessContent
│   ✓ admin → ok admin (any path)
│   ✓ premium=true → ok premium (any path)
│   ✓ free + chapitre 1 → ok free-chapter
│   ✓ free + chapitre 2 → ko premium-required-content
│   ✓ free + annale → ko premium-required-annale
│   ✓ trial actif → ok premium (via computePremiumStatus)
```

### 10.2 Intégration

- `signIn` callback : trial octroyé une seule fois (idempotence vérifiée)
- `/api/auth/register` : trial octroyé sauf synthétique
- `/api/user/content/bunny` : items retournés avec `isLocked` correct selon user et path

### 10.3 E2E (à automatiser plus tard si besoin)

Parcours manuel à valider avant déploiement prod :
1. Inscription → bannière trial visible + accès complet
2. Forcer `premiumUntil` à hier en BD → bannière free + chapter 1 visible + autres verrouillés
3. Compte admin → aucune bannière, accès normal
4. Email synthétique → pas de bannière trial
5. Paiement Chariow durant trial → conservation des jours d'essai restants

## 11. Observabilité

Logging dans la collection MongoDB `retention_events` (déjà utilisée par `trackEvent`) :

| Event | Quand | Champs |
|---|---|---|
| `trial_granted` | Octroi (register ou signIn) | userId, source (`register`/`migration`), grantedAt |
| `trial_expired` | Calculé lazy au check `/api/user/payment/verify` | userId, expiredAt |
| `free_content_accessed` | Consultation chapitre 1 par user Free | userId, path, accessedAt |
| `paywall_shown` | Modal affiché | userId, blockedPath, paywallShownAt |
| `paywall_clicked_cta` | Clic « Voir les formules » | userId, paywallShownAt |

→ Funnel calculable par `analyste-academique` :
`trial_granted → paywall_shown → paywall_clicked_cta → payment_succeeded`

## 12. Rollout en 3 étapes (feature flag `FREEMIUM_ENABLED`)

| Étape | Description | Critère validation |
|---|---|---|
| **1. Préprod** | Tout déployé, `FREEMIUM_ENABLED=false` en prod, `=true` sur preview Vercel. | Tests Vitest verts, vérif manuelle sur preview |
| **2. Migration lazy ON, Free gate OFF** | `signIn` callback actif (octroi trial), route bunny encore en check binaire | 24h en prod : comptes existants reçoivent trial au login |
| **3. Free gate ON** | Bascule complète : route bunny utilise `canAccessContent`, bannières actives, modal paywall actif | Monitoring funnel sur 7 jours |

**Rollback** : flip `FREEMIUM_ENABLED=false` sur Vercel → route bunny revient au check binaire.

## 13. Risques résiduels & mitigations

| Risque | Mitigation |
|---|---|
| Élève Premium expirant pendant la transition, perdant l'accès sans avoir vu le filet free | Workflow n8n `03-rappel-expiration-7j` (existant) + paywall qui mentionne le filet « tu gardes le chapitre 1 » |
| Convention de nommage Bunny non appliquée | Warning log côté API + procédure documentée dans `architecture-smartlearn` |
| Abus multi-comptes massif | `User.registrationFraudFlag` + revue manuelle hebdo via synthèse n8n `05-synthese-mensuelle-admin` |
| Workflow n8n `02-relance-inactif-7j` envoyant des relances aux élèves en trial actif | Ajouter condition `premiumUntil < now` dans la requête MongoDB du workflow |

## 14. Fichiers impactés (récap technique)

| Fichier | Action |
|---|---|
| `src/models/User.ts` | + `welcomeTrialGrantedAt`, `registrationFraudFlag` |
| `src/lib/freemium.ts` | **NEW** — helpers de gating (pure functions) |
| `src/lib/freemium.test.ts` | **NEW** — tests Vitest |
| `src/app/api/auth/[...nextauth]/route.ts` | callback `signIn` : trial lazy + `lastLoginAt` |
| `src/app/api/auth/register/route.ts` | octroi essai 7j à l'inscription (sauf synthétique) |
| `src/app/api/user/content/bunny/route.ts` | utilise `canAccessContent`, retourne `isLocked` par item |
| `src/components/FreemiumBanner.tsx` | **NEW** — bannière TRIAL / FREE conditionnelle |
| `src/components/PaywallModal.tsx` | **NEW** — modal au clic verrouillé |
| `src/app/catalogue/page.tsx` | + badge `★ Chapitre 1 gratuit` sur les cards |
| `src/app/dashboard/**/page.tsx` (à identifier) | affichage liste chapitres avec cadenas |
| `src/components/UserNav.tsx` | adapter les liens selon état utilisateur |
| `.claude/skills/architecture-smartlearn/SKILL.md` | documenter convention `chap-01-` + `/annales/` + nouveaux champs User |
| `.claude/agents/admin-abonnements.md` | mentionner `welcomeTrialGrantedAt`, `registrationFraudFlag` |
| `n8n/02-relance-inactif-7j/DESIGN.md` + workflow.json | ajouter condition skip si `premiumUntil > now` |
| `n8n/06-fin-essai-J-2/` | **NEW** — workflow + DESIGN.md |
| `n8n/07-bascule-free/` | **NEW** |
| `n8n/08-relance-conversion-J+14/` | **NEW** |
| Variable env Vercel | `FREEMIUM_ENABLED=false` par défaut |

## 15. Hors scope (v1) — pour itérations futures

- Privilèges Premium gratuit pour ambassadeurs performants
- Téléchargement offline des PDFs/vidéos (Token Auth Bunny avancé)
- Tutorat IA in-app (en conception, cf. `tuteur-pedagogique` agent)
- Rapports parents (`parentEmail`, workflow n8n 04) — bloqué par champs manquants
- Quotas granulaires (N vidéos/mois)
- Périodes d'essai personnalisées (3j vs 14j selon segment)
- A/B testing des copies du paywall
