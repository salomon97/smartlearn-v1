# SmartLearn Freemium Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mettre en place le freemium SmartLearn (essai Premium 7 jours à l'inscription + Free permanent chapitre 1 + annales toujours Premium) sans casser les paiements Chariow existants, derrière un feature flag pour rollback simple.

**Architecture:** Pure-function helper `src/lib/freemium.ts` source unique de vérité (path → verdict). Octroi essai dans NextAuth `authorize()` (nouveaux + legacy au login). Gating Bunny avec retour de tous les items + flag `isLocked` par item. UI conditionnelle (bannières + modal + badges) gated par `NEXT_PUBLIC_FREEMIUM_ENABLED`.

**Tech Stack:** Next.js 16 (App Router) · React 19 · TypeScript · MongoDB Atlas + Mongoose · NextAuth 4 (JWT) · Bunny.net Storage + Stream · Vitest · Tailwind 4 (palette navy/teal/orange Palier 2)

**Spec source:** `docs/superpowers/specs/2026-06-10-freemium-design.md` (commit b51cddb)

---

## File Structure

### Files to CREATE

| Fichier | Rôle |
|---|---|
| `src/lib/freemium.ts` | Pure helpers : `isFreeChapterPath`, `isAnnalePath`, `canAccessContent`, `grantTrialIfEligible` |
| `src/lib/freemium.test.ts` | Tests Vitest unitaires (couverture 100% sur freemium.ts) |
| `src/components/FreemiumBanner.tsx` | Bannière conditionnelle TRIAL / FREE selon `session.user` |
| `src/components/PaywallModal.tsx` | Modal au clic sur un item verrouillé |
| `n8n/06-fin-essai-J-2/DESIGN.md` | Spec workflow email J-2 fin d'essai |
| `n8n/06-fin-essai-J-2/workflow.json` | Squelette n8n importable |
| `n8n/07-bascule-free/DESIGN.md` | Spec workflow email jour de bascule trial→free |
| `n8n/07-bascule-free/workflow.json` | Squelette n8n |
| `n8n/08-relance-conversion-J+14/DESIGN.md` | Spec workflow relance 14j après bascule |
| `n8n/08-relance-conversion-J+14/workflow.json` | Squelette n8n |

### Files to MODIFY

| Fichier | Changement |
|---|---|
| `src/models/User.ts` | + `welcomeTrialGrantedAt`, `registrationFraudFlag`, `lastLoginAt` |
| `src/app/api/auth/register/route.ts` | Octroi essai 7j à la création (sauf admin / synthétique) |
| `src/app/api/auth/[...nextauth]/route.ts` | `authorize()` : `grantTrialIfEligible` + `lastLoginAt`. Le `session` callback expose `welcomeTrialGrantedAt`. |
| `src/app/api/user/content/bunny/route.ts` | Utilise `canAccessContent`, retourne `isLocked` par item, gated par `FREEMIUM_ENABLED` |
| `src/components/UserNav.tsx` | Liens state-aware selon role/Premium/Trial |
| `src/app/catalogue/page.tsx` | Badge `★ Chapitre 1 gratuit` sur chaque card programme |
| `src/app/dashboard/page.tsx` | Render `<FreemiumBanner />` en haut |
| `src/app/dashboard/cours/page.tsx` | Render `<FreemiumBanner />` en haut |
| `src/app/dashboard/components/DynamicContentBrowser.tsx` | Affiche le cadenas + badge sur les items `isLocked`. Ouvre `<PaywallModal />` au clic. |
| `.claude/skills/architecture-smartlearn/SKILL.md` | Documenter convention `chap-01-` + `/annales/` + nouveaux champs User |
| `.claude/agents/admin-abonnements.md` | Mentionner `welcomeTrialGrantedAt`, `registrationFraudFlag` |
| `n8n/02-relance-inactif-7j/DESIGN.md` | Ajouter condition skip si `premiumUntil > now` |
| `n8n/02-relance-inactif-7j/workflow.json` | Idem (filtre MongoDB query) |
| **Vercel env vars** | `FREEMIUM_ENABLED=false` + `NEXT_PUBLIC_FREEMIUM_ENABLED=false` (Production), `=true` (Preview) |

---

## Stage 1 — Préprod : tout coder, FREEMIUM_ENABLED=false en prod

Tâches T1 → T15. Le code est déployé sur main mais le flag éteint le gating dans la prod.

---

### Task T1: Add fields to User model

**Files:**
- Modify: `src/models/User.ts`

- [ ] **Step 1: Open `src/models/User.ts`**

- [ ] **Step 2: Add fields to `IUser` interface**

Insérer après la ligne `registrationIp?: string;` (avant `createdAt`) :

```typescript
welcomeTrialGrantedAt?: Date | null;
registrationFraudFlag?: {
    ipCount24h: number;
    flaggedAt: Date;
} | null;
lastLoginAt?: Date | null;
```

- [ ] **Step 3: Add fields to `UserSchema`**

Insérer après la ligne `registrationIp: { type: String },` (avant la fermeture `}`) :

```typescript
welcomeTrialGrantedAt: { type: Date, default: null },
registrationFraudFlag: {
    type: {
        ipCount24h: { type: Number },
        flaggedAt: { type: Date },
    },
    default: null,
    _id: false,
},
lastLoginAt: { type: Date, default: null },
```

- [ ] **Step 4: Vérifier la compilation TypeScript**

```bash
cd /home/salomonlamemoire/.gemini/antigravity/scratch/smartlearn && npx tsc --noEmit 2>&1 | grep -E "User\.ts" | head -5
```

Expected: aucun output (zéro erreur sur User.ts).

- [ ] **Step 5: Commit**

```bash
git add src/models/User.ts
git commit -m "feat(user): add welcomeTrialGrantedAt + registrationFraudFlag + lastLoginAt fields"
```

---

### Task T2: Create freemium.ts — isFreeChapterPath helper (TDD)

**Files:**
- Create: `src/lib/freemium.ts`
- Create: `src/lib/freemium.test.ts`

- [ ] **Step 1: Write the failing tests**

Créer `src/lib/freemium.test.ts` :

```typescript
import { describe, it, expect } from 'vitest';
import { isFreeChapterPath } from './freemium';

describe('isFreeChapterPath', () => {
  it('accepte un chapitre 1 dans une matière (premier cycle)', () => {
    expect(isFreeChapterPath('/6e/Mathematiques/chapters/01-nombres-rationnels/')).toBe(true);
  });

  it('accepte un chapitre 1 en informatique terminale', () => {
    expect(isFreeChapterPath('/Terminale-C/Informatique/chapters/01-binaire/')).toBe(true);
  });

  it('refuse un chapitre 2', () => {
    expect(isFreeChapterPath('/6e/Mathematiques/chapters/02-calcul-litteral/')).toBe(false);
  });

  it("refuse une variante de nommage non conforme (chapitre-01-)", () => {
    expect(isFreeChapterPath('/6e/Mathematiques/chapters/chapitre-01-nombres/')).toBe(false);
  });

  it('refuse un chapitre 10 (anti faux positif sur substring "01")', () => {
    expect(isFreeChapterPath('/6e/Mathematiques/chapters/10-statistiques/')).toBe(false);
  });

  it('refuse un path vide', () => {
    expect(isFreeChapterPath('')).toBe(false);
  });

  it('refuse null / undefined', () => {
    expect(isFreeChapterPath(null as any)).toBe(false);
    expect(isFreeChapterPath(undefined as any)).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /home/salomonlamemoire/.gemini/antigravity/scratch/smartlearn && npx vitest run src/lib/freemium.test.ts 2>&1 | tail -15
```

Expected: FAIL avec "Cannot find module './freemium'".

- [ ] **Step 3: Create the module with minimal implementation**

Créer `src/lib/freemium.ts` :

```typescript
/**
 * SmartLearn Unified — Logique freemium (gating Free vs Premium).
 *
 * Source unique de vérité : pure functions, zéro IO, zéro DB.
 * Tous les call sites de gating (route bunny, frontend pour badges) appellent
 * canAccessContent() pour décider de l'accès.
 *
 * Convention de nommage Bunny (cf. spec §6) :
 *   - Free chapter : path contient /chapters/01-<slug>/
 *   - Annale       : path contient /annales/ (toujours Premium)
 */

/**
 * Vrai si le path Bunny correspond au chapitre 1 d'une matière
 * (le seul accessible aux utilisateurs Free).
 *
 * Regex stricte : /chapters\/01-/i — empêche faux positifs comme "10-" ou "chapitre-01-".
 */
export function isFreeChapterPath(path: string | null | undefined): boolean {
    if (!path) return false;
    return /\/chapters\/01-/i.test(path);
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /home/salomonlamemoire/.gemini/antigravity/scratch/smartlearn && npx vitest run src/lib/freemium.test.ts 2>&1 | tail -10
```

Expected: 7 tests passent.

- [ ] **Step 5: Commit**

```bash
git add src/lib/freemium.ts src/lib/freemium.test.ts
git commit -m "feat(freemium): add isFreeChapterPath helper with tests"
```

---

### Task T3: freemium.ts — isAnnalePath helper (TDD)

**Files:**
- Modify: `src/lib/freemium.ts`
- Modify: `src/lib/freemium.test.ts`

- [ ] **Step 1: Add failing tests**

Ajouter à `src/lib/freemium.test.ts` après le bloc `describe('isFreeChapterPath', ...)` :

```typescript
import { isAnnalePath } from './freemium';

describe('isAnnalePath', () => {
  it('accepte un path annale BEPC', () => {
    expect(isAnnalePath('/annales/BEPC/2024-mathematiques/')).toBe(true);
  });

  it('accepte un path annale Bac C', () => {
    expect(isAnnalePath('/annales/Bac-C/2023-physique/')).toBe(true);
  });

  it('accepte un path annale en racine', () => {
    expect(isAnnalePath('annales/Probatoire/2022-svt/')).toBe(true);
  });

  it("refuse un chapitre régulier", () => {
    expect(isAnnalePath('/6e/Mathematiques/chapters/01-nombres/')).toBe(false);
  });

  it('refuse path vide ou null', () => {
    expect(isAnnalePath('')).toBe(false);
    expect(isAnnalePath(null as any)).toBe(false);
  });
});
```

Note : un seul `import` global au début du fichier — fusionner avec l'import existant `import { isFreeChapterPath, isAnnalePath } from './freemium';`.

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /home/salomonlamemoire/.gemini/antigravity/scratch/smartlearn && npx vitest run src/lib/freemium.test.ts 2>&1 | tail -10
```

Expected: FAIL avec "isAnnalePath is not exported".

- [ ] **Step 3: Add implementation to freemium.ts**

Ajouter après `isFreeChapterPath` :

```typescript
/**
 * Vrai si le path Bunny est une annale corrigée MINESEC.
 * Les annales sont TOUJOURS Premium, quel que soit le numéro (anti hook côté Free).
 *
 * Convention : path contient "/annales/" ou commence par "annales/".
 */
export function isAnnalePath(path: string | null | undefined): boolean {
    if (!path) return false;
    return /(^|\/)annales\//i.test(path);
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /home/salomonlamemoire/.gemini/antigravity/scratch/smartlearn && npx vitest run src/lib/freemium.test.ts 2>&1 | tail -10
```

Expected: 12 tests passent (7 isFreeChapterPath + 5 isAnnalePath).

- [ ] **Step 5: Commit**

```bash
git add src/lib/freemium.ts src/lib/freemium.test.ts
git commit -m "feat(freemium): add isAnnalePath helper with tests"
```

---

### Task T4: freemium.ts — canAccessContent verdict (TDD)

**Files:**
- Modify: `src/lib/freemium.ts`
- Modify: `src/lib/freemium.test.ts`

- [ ] **Step 1: Add failing tests**

Ajouter à `src/lib/freemium.test.ts` :

```typescript
import { canAccessContent } from './freemium';

describe('canAccessContent', () => {
  const FREE_CHAPTER = '/6e/Mathematiques/chapters/01-nombres/file.mp4';
  const PREMIUM_CHAPTER = '/6e/Mathematiques/chapters/02-calcul/file.mp4';
  const ANNALE = '/annales/BEPC/2024-maths/file.pdf';

  it('admin → accès à tout (chapitre 1)', () => {
    expect(canAccessContent({ isPremium: false, role: 'admin' }, FREE_CHAPTER))
      .toEqual({ ok: true, reason: 'admin' });
  });

  it("admin → accès à tout (chapitre Premium)", () => {
    expect(canAccessContent({ isPremium: false, role: 'admin' }, PREMIUM_CHAPTER))
      .toEqual({ ok: true, reason: 'admin' });
  });

  it("admin → accès aux annales", () => {
    expect(canAccessContent({ isPremium: false, role: 'admin' }, ANNALE))
      .toEqual({ ok: true, reason: 'admin' });
  });

  it("user premium → accès à tout", () => {
    expect(canAccessContent({ isPremium: true, role: 'student' }, PREMIUM_CHAPTER))
      .toEqual({ ok: true, reason: 'premium' });
    expect(canAccessContent({ isPremium: true, role: 'student' }, ANNALE))
      .toEqual({ ok: true, reason: 'premium' });
  });

  it("user free → accès au chapitre 1", () => {
    expect(canAccessContent({ isPremium: false, role: 'student' }, FREE_CHAPTER))
      .toEqual({ ok: true, reason: 'free-chapter' });
  });

  it("user free → refus chapitre 2+", () => {
    expect(canAccessContent({ isPremium: false, role: 'student' }, PREMIUM_CHAPTER))
      .toEqual({ ok: false, reason: 'premium-required-content' });
  });

  it("user free → refus annale", () => {
    expect(canAccessContent({ isPremium: false, role: 'student' }, ANNALE))
      .toEqual({ ok: false, reason: 'premium-required-annale' });
  });

  it("affiliate non premium → traité comme student", () => {
    expect(canAccessContent({ isPremium: false, role: 'affiliate' }, PREMIUM_CHAPTER))
      .toEqual({ ok: false, reason: 'premium-required-content' });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /home/salomonlamemoire/.gemini/antigravity/scratch/smartlearn && npx vitest run src/lib/freemium.test.ts 2>&1 | tail -10
```

Expected: FAIL.

- [ ] **Step 3: Add types and implementation**

Ajouter à `src/lib/freemium.ts` :

```typescript
export type AccessUser = {
    isPremium: boolean;
    role?: 'student' | 'affiliate' | 'admin';
};

export type AccessVerdict =
    | { ok: true; reason: 'admin' | 'premium' | 'free-chapter' }
    | { ok: false; reason: 'premium-required-content' | 'premium-required-annale' };

/**
 * Verdict d'accès à un contenu Bunny pour un utilisateur donné.
 *
 * Ordre des règles (premier qui matche gagne) :
 *   1. role === 'admin'         → ok admin (sans aucun check)
 *   2. isPremium === true       → ok premium
 *   3. path = annale            → ko premium-required-annale (annales toujours Premium)
 *   4. path = chapitre 1        → ok free-chapter
 *   5. par défaut               → ko premium-required-content
 */
export function canAccessContent(user: AccessUser, path: string): AccessVerdict {
    if (user.role === 'admin') {
        return { ok: true, reason: 'admin' };
    }
    if (user.isPremium) {
        return { ok: true, reason: 'premium' };
    }
    if (isAnnalePath(path)) {
        return { ok: false, reason: 'premium-required-annale' };
    }
    if (isFreeChapterPath(path)) {
        return { ok: true, reason: 'free-chapter' };
    }
    return { ok: false, reason: 'premium-required-content' };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /home/salomonlamemoire/.gemini/antigravity/scratch/smartlearn && npx vitest run src/lib/freemium.test.ts 2>&1 | tail -10
```

Expected: 20 tests passent (7 + 5 + 8).

- [ ] **Step 5: Commit**

```bash
git add src/lib/freemium.ts src/lib/freemium.test.ts
git commit -m "feat(freemium): add canAccessContent verdict function with tests"
```

---

### Task T5: freemium.ts — grantTrialIfEligible helper (TDD)

**Files:**
- Modify: `src/lib/freemium.ts`
- Modify: `src/lib/freemium.test.ts`

- [ ] **Step 1: Add failing tests**

Ajouter à `src/lib/freemium.test.ts` :

```typescript
import { grantTrialIfEligible, TRIAL_DURATION_MS } from './freemium';

describe('grantTrialIfEligible', () => {
  const baseUser = () => ({
    email: 'eleve@example.com',
    role: 'student' as const,
    isPremium: false,
    premiumUntil: null,
    welcomeTrialGrantedAt: null,
  });

  it("octroi l'essai à un nouveau student éligible", () => {
    const u = baseUser();
    const now = new Date('2026-06-10T10:00:00Z');
    const granted = grantTrialIfEligible(u, now);

    expect(granted).toBe(true);
    expect(u.premiumUntil).toEqual(new Date(now.getTime() + TRIAL_DURATION_MS));
    expect(u.welcomeTrialGrantedAt).toEqual(now);
  });

  it("ne ré-octroie pas si welcomeTrialGrantedAt déjà set (idempotence)", () => {
    const u = baseUser();
    u.welcomeTrialGrantedAt = new Date('2026-01-01T00:00:00Z');
    const granted = grantTrialIfEligible(u, new Date());
    expect(granted).toBe(false);
  });

  it("ne ré-octroie pas si l'user a déjà payé (premiumUntil set)", () => {
    const u = baseUser();
    u.premiumUntil = new Date('2026-12-31T00:00:00Z');
    const granted = grantTrialIfEligible(u, new Date());
    expect(granted).toBe(false);
  });

  it("ne ré-octroie pas si Premium expiré (anti-abus)", () => {
    const u = baseUser();
    u.premiumUntil = new Date('2025-01-01T00:00:00Z'); // past
    const granted = grantTrialIfEligible(u, new Date('2026-06-10T00:00:00Z'));
    expect(granted).toBe(false);
  });

  it("refuse les emails synthétiques", () => {
    const u = baseUser();
    u.email = 'eleve-123@eleve.smartlearn-edu.org';
    const granted = grantTrialIfEligible(u, new Date());
    expect(granted).toBe(false);
  });

  it("refuse les admins", () => {
    const u = baseUser();
    (u as any).role = 'admin';
    const granted = grantTrialIfEligible(u, new Date());
    expect(granted).toBe(false);
  });

  it("accepte les affiliates (parrains) comme les students", () => {
    const u = baseUser();
    (u as any).role = 'affiliate';
    const granted = grantTrialIfEligible(u, new Date('2026-06-10T00:00:00Z'));
    expect(granted).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /home/salomonlamemoire/.gemini/antigravity/scratch/smartlearn && npx vitest run src/lib/freemium.test.ts 2>&1 | tail -10
```

Expected: FAIL.

- [ ] **Step 3: Add implementation**

Ajouter à `src/lib/freemium.ts` (en haut, après les imports / commentaire de module) :

```typescript
import { isSyntheticEmail } from './constants';
```

Puis à la fin du fichier :

```typescript
export const TRIAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

export type TrialEligibleUser = {
    email: string;
    role?: 'student' | 'affiliate' | 'admin';
    premiumUntil?: Date | null;
    welcomeTrialGrantedAt?: Date | null;
};

/**
 * Octroi l'essai Premium 7 jours à l'utilisateur s'il est éligible.
 * Mute l'objet `user` en place et retourne true si l'octroi a eu lieu.
 *
 * Critères d'éligibilité (TOUS doivent être vrais) :
 *   - Pas d'email synthétique (@eleve.smartlearn-edu.org)
 *   - role !== 'admin'
 *   - welcomeTrialGrantedAt absent (jamais reçu d'essai)
 *   - premiumUntil absent (jamais payé)
 *
 * @returns true si octroi effectif, false sinon (idempotent — safe à appeler à chaque login).
 */
export function grantTrialIfEligible(user: TrialEligibleUser, now: Date = new Date()): boolean {
    if (isSyntheticEmail(user.email)) return false;
    if (user.role === 'admin') return false;
    if (user.welcomeTrialGrantedAt) return false;
    if (user.premiumUntil) return false;

    user.premiumUntil = new Date(now.getTime() + TRIAL_DURATION_MS);
    user.welcomeTrialGrantedAt = now;
    return true;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /home/salomonlamemoire/.gemini/antigravity/scratch/smartlearn && npx vitest run src/lib/freemium.test.ts 2>&1 | tail -10
```

Expected: 27 tests passent (20 + 7).

- [ ] **Step 5: Commit**

```bash
git add src/lib/freemium.ts src/lib/freemium.test.ts
git commit -m "feat(freemium): add grantTrialIfEligible helper with tests"
```

---

### Task T6: Update register route to grant trial at signup

**Files:**
- Modify: `src/app/api/auth/register/route.ts`

- [ ] **Step 1: Import the helper**

Ajouter en haut du fichier après les imports existants :

```typescript
import { grantTrialIfEligible } from "@/lib/freemium";
```

- [ ] **Step 2: Grant trial during user creation**

Remplacer le bloc `User.create({...})` (lignes 85-97 actuelles) par :

```typescript
        // Préparer les données utilisateur — octroi de l'essai 7j si éligible
        const userData: any = {
            name,
            email,
            password: hashedPassword,
            role: finalRole,
            grade_level: finalRole === 'student' ? grade_level : undefined,
            isPremium: false,
            isVerified: false,
            codeAffiliation: newCodeAffiliation,
            parrainId: parrainId || undefined,
            registrationIp: ip,
            phone: phoneNormalized,
        };

        // Mute userData.premiumUntil + welcomeTrialGrantedAt si éligible
        grantTrialIfEligible(userData);

        // Créer l'utilisateur (non vérifié par défaut)
        const user = await User.create(userData);
```

- [ ] **Step 3: Vérifier la compilation TypeScript**

```bash
cd /home/salomonlamemoire/.gemini/antigravity/scratch/smartlearn && npx tsc --noEmit 2>&1 | grep -E "register/route" | head -5
```

Expected: aucun output.

- [ ] **Step 4: Run all tests**

```bash
cd /home/salomonlamemoire/.gemini/antigravity/scratch/smartlearn && npx vitest run 2>&1 | tail -5
```

Expected: tous les tests passent (27 freemium + 44 existants = 71+ verts).

- [ ] **Step 5: Commit**

```bash
git add src/app/api/auth/register/route.ts
git commit -m "feat(auth): grant 7-day Premium trial at student/affiliate signup"
```

---

### Task T7: NextAuth authorize() — legacy migration + lastLoginAt

**Files:**
- Modify: `src/app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Import the helper**

Ajouter dans les imports en haut :

```typescript
import { grantTrialIfEligible } from "@/lib/freemium";
```

- [ ] **Step 2: Grant trial in credentials authorize() before save**

Dans le bloc `// === LOGIQUE 2 : CONNEXION CLASSIQUE ===` (autour de la ligne 96, juste avant `const sessionId = crypto.randomUUID();`), insérer :

```typescript
                // Migration lazy : octroi essai 7j si éligible (legacy users sans welcomeTrialGrantedAt)
                // Idempotent : safe à appeler à chaque login.
                grantTrialIfEligible(user);

                // Tracking last login (pour n8n 02-relance-inactif-7j)
                user.lastLoginAt = new Date();
```

- [ ] **Step 3: Update the return object to expose welcomeTrialGrantedAt**

Modifier le `return` à la fin de `authorize()` (logique 2, ligne 104-114 actuelle) :

```typescript
                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    isPremium: user.isPremium,
                    premiumUntil: user.premiumUntil,
                    welcomeTrialGrantedAt: user.welcomeTrialGrantedAt,
                    grade_level: user.grade_level,
                    sessionId: sessionId,
                    role: user.role,
                    image: user.image
                };
```

- [ ] **Step 4: Propager welcomeTrialGrantedAt dans jwt callback**

Dans le `jwt` callback (autour de la ligne 122), dans le bloc `if (user)`, ajouter :

```typescript
                token.welcomeTrialGrantedAt = user.welcomeTrialGrantedAt;
```

Et dans le bloc `if (trigger === 'update' && token?.id)`, modifier le `.select(...)` pour inclure le nouveau champ :

```typescript
                    const fresh = await User.findById(token.id).select('isPremium premiumUntil welcomeTrialGrantedAt role grade_level image');
                    if (fresh) {
                        token.isPremium = fresh.isPremium;
                        token.premiumUntil = fresh.premiumUntil;
                        token.welcomeTrialGrantedAt = fresh.welcomeTrialGrantedAt;
                        token.role = fresh.role;
                        token.grade_level = fresh.grade_level;
                        token.image = fresh.image;
                    }
```

- [ ] **Step 5: Exposer welcomeTrialGrantedAt dans le session callback**

Dans le `session` callback (autour de la ligne 152), ajouter après `session.user.premiumDaysRemaining` :

```typescript
                session.user.welcomeTrialGrantedAt = token.welcomeTrialGrantedAt;

                // isOnTrial : vrai si l'user est Premium grâce à son essai initial (pas un Premium payé)
                // Heuristique : welcomeTrialGrantedAt set + premiumUntil = welcomeTrialGrantedAt + 7d (à la minute près)
                const trialEnd = token.welcomeTrialGrantedAt
                    ? new Date(new Date(token.welcomeTrialGrantedAt).getTime() + 7 * 24 * 60 * 60 * 1000)
                    : null;
                const premiumUntilDate = token.premiumUntil ? new Date(token.premiumUntil) : null;
                session.user.isOnTrial = !!(
                    access.isPremium &&
                    trialEnd && premiumUntilDate &&
                    Math.abs(trialEnd.getTime() - premiumUntilDate.getTime()) < 60_000
                );
```

- [ ] **Step 6: Verify TypeScript**

```bash
cd /home/salomonlamemoire/.gemini/antigravity/scratch/smartlearn && npx tsc --noEmit 2>&1 | grep -E "nextauth" | head -5
```

Expected: aucun output.

- [ ] **Step 7: Run all tests**

```bash
cd /home/salomonlamemoire/.gemini/antigravity/scratch/smartlearn && npx vitest run 2>&1 | tail -5
```

Expected: tous les tests passent.

- [ ] **Step 8: Commit**

```bash
git add src/app/api/auth/[...nextauth]/route.ts
git commit -m "feat(auth): grant trial in authorize() for legacy users + expose isOnTrial/welcomeTrialGrantedAt to session"
```

---

### Task T8: Bunny route — use canAccessContent (FREEMIUM_ENABLED gated)

**Files:**
- Modify: `src/app/api/user/content/bunny/route.ts`

- [ ] **Step 1: Import the helper**

Ajouter dans les imports :

```typescript
import { canAccessContent, isFreeChapterPath } from "@/lib/freemium";
```

- [ ] **Step 2: Replace the binary Premium check**

Trouver la section actuelle :

```typescript
if (!access.isPremium && dbUser.role !== 'admin') {
    return NextResponse.json({
        message: access.status === 'expired'
            ? "Abonnement expiré — renouvelez pour reprendre l'accès aux vidéos."
            : "Accès Premium requis pour voir ce contenu",
        status: access.status,
    }, { status: 403 });
}
```

La REMPLACER par :

```typescript
// Si FREEMIUM_ENABLED=false, on garde le comportement binaire historique (rollback safe).
// Sinon, la décision per-item est faite plus bas via canAccessContent.
const freemiumEnabled = process.env.FREEMIUM_ENABLED === 'true';

if (!freemiumEnabled) {
    if (!access.isPremium && dbUser.role !== 'admin') {
        return NextResponse.json({
            message: access.status === 'expired'
                ? "Abonnement expiré — renouvelez pour reprendre l'accès aux vidéos."
                : "Accès Premium requis pour voir ce contenu",
            status: access.status,
        }, { status: 403 });
    }
}
```

- [ ] **Step 3: Mark items with isLocked in the files branch**

Trouver le bloc qui construit `files` (autour de la ligne 84 dans la version actuelle) :

```typescript
const files = data
    .filter((item: any) => !item.IsDirectory)
    .map((item: any) => {
        const encodedFilePath = `${encodedPath}/${encodeURIComponent(item.ObjectName)}`;
        const rawUrl = `https://${process.env.BUNNY_STORAGE_HOSTNAME}/${encodedFilePath}`;
        return {
            id: item.Guid || item.ObjectName,
            name: item.ObjectName,
            cdnUrl: signBunnyUrl(rawUrl, bunnyKey),
            contentType: 'file'
        };
    });
```

Le REMPLACER par :

```typescript
const files = data
    .filter((item: any) => !item.IsDirectory)
    .map((item: any) => {
        const encodedFilePath = `${encodedPath}/${encodeURIComponent(item.ObjectName)}`;
        const rawUrl = `https://${process.env.BUNNY_STORAGE_HOSTNAME}/${encodedFilePath}`;
        const itemPath = `/${cleanPath}/${item.ObjectName}`;
        const verdict = canAccessContent(
            { isPremium: access.isPremium, role: dbUser.role as any },
            itemPath
        );
        return {
            id: item.Guid || item.ObjectName,
            name: item.ObjectName,
            cdnUrl: verdict.ok ? signBunnyUrl(rawUrl, bunnyKey) : null,
            contentType: 'file',
            isFree: isFreeChapterPath(itemPath),
            isLocked: !verdict.ok,
            lockReason: verdict.ok ? null : verdict.reason,
        };
    });
```

- [ ] **Step 4: Mark videos with isLocked too**

Trouver le bloc `const videos = data.items.map(...)` :

```typescript
const videos = data.items.map((v: any) => {
    const rawThumb = `https://vz-e1000817-6ad.b-cdn.net/${v.guid}/thumbnail.jpg`;
    return {
        id: v.guid,
        name: v.title,
        libraryId: libraryId,
        thumbnailUrl: signBunnyUrl(rawThumb, bunnyKey),
        contentType: 'video'
    };
});
```

Le REMPLACER par :

```typescript
const videos = data.items.map((v: any) => {
    const rawThumb = `https://vz-e1000817-6ad.b-cdn.net/${v.guid}/thumbnail.jpg`;
    // Pour les vidéos Bunny Stream, le path Bunny n'est pas directement disponible.
    // On utilise le nom de la vidéo (titre) comme proxy pour détecter le chapitre 1.
    // Convention admin : titrer les vidéos chapitre 1 avec un préfixe "01 - " ou "Chapitre 01".
    const titleForVerdict = `/chapters/${v.title || ''}/`;
    const verdict = canAccessContent(
        { isPremium: access.isPremium, role: dbUser.role as any },
        titleForVerdict
    );
    return {
        id: v.guid,
        name: v.title,
        libraryId: libraryId,
        thumbnailUrl: verdict.ok ? signBunnyUrl(rawThumb, bunnyKey) : null,
        contentType: 'video',
        isFree: isFreeChapterPath(titleForVerdict),
        isLocked: !verdict.ok,
        lockReason: verdict.ok ? null : verdict.reason,
    };
});
```

- [ ] **Step 5: Verify TypeScript**

```bash
cd /home/salomonlamemoire/.gemini/antigravity/scratch/smartlearn && npx tsc --noEmit 2>&1 | grep -E "bunny/route" | head -5
```

Expected: aucun output.

- [ ] **Step 6: Run all tests**

```bash
cd /home/salomonlamemoire/.gemini/antigravity/scratch/smartlearn && npx vitest run 2>&1 | tail -5
```

Expected: tous verts.

- [ ] **Step 7: Commit**

```bash
git add src/app/api/user/content/bunny/route.ts
git commit -m "feat(content): per-item gating via canAccessContent (gated by FREEMIUM_ENABLED flag)"
```

---

### Task T9: Create FreemiumBanner component

**Files:**
- Create: `src/components/FreemiumBanner.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

/**
 * Bannière conditionnelle affichée en haut du dashboard et du catalogue
 * pour pousser à la conversion freemium.
 *
 * Trois états mutuellement exclusifs :
 *   - TRIAL  : essai Premium actif (isOnTrial=true, isPremium=true)
 *   - FREE   : compte non-Premium hors essai (isPremium=false)
 *   - aucun  : Premium payé OU admin → bannière masquée
 *
 * La bannière est gated par NEXT_PUBLIC_FREEMIUM_ENABLED. Si =false, rien ne s'affiche
 * (le freemium n'est pas encore activé en prod).
 */
export default function FreemiumBanner() {
    const { data: session } = useSession();
    const [dismissed, setDismissed] = useState(false);

    if (process.env.NEXT_PUBLIC_FREEMIUM_ENABLED !== 'true') return null;
    if (!session?.user) return null;

    const user = session.user as any;

    // Admin → jamais de bannière
    if (user.role === 'admin') return null;

    // Premium payé (pas trial) → jamais de bannière
    if (user.isPremium && !user.isOnTrial) return null;

    // TRIAL ACTIF
    if (user.isOnTrial) {
        if (dismissed) return null;
        const days = user.premiumDaysRemaining ?? 0;
        return (
            <div className="bg-teal/10 border-b border-teal/30 px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-sm">
                    <span className="text-teal">✨</span>
                    <span className="text-white/90">
                        <strong className="text-teal">Essai Premium gratuit · J-{days} restants</strong>
                        {" — "}Profite de tous les chapitres et annales.
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/paiement"
                        className="bg-orange hover:bg-orange/90 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors whitespace-nowrap"
                    >
                        Conserver mon accès — 3 000 FCFA/mois →
                    </Link>
                    <button
                        type="button"
                        onClick={() => setDismissed(true)}
                        aria-label="Masquer la bannière"
                        className="text-white/50 hover:text-white/80 transition-colors w-7 h-7 flex items-center justify-center"
                    >
                        ✕
                    </button>
                </div>
            </div>
        );
    }

    // FREE (post-trial ou jamais payé)
    return (
        <div className="bg-orange/10 border-b border-orange/30 px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm">
                <span className="text-orange">🔒</span>
                <span className="text-white/90">
                    Tu as accès au <strong className="text-white">chapitre 1 de chaque matière</strong>.
                    Continue avec l'intégralité de ton programme MINESEC + toutes les annales corrigées.
                </span>
            </div>
            <Link
                href="/paiement"
                className="bg-orange hover:bg-orange/90 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors whitespace-nowrap"
            >
                Voir les tarifs →
            </Link>
        </div>
    );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /home/salomonlamemoire/.gemini/antigravity/scratch/smartlearn && npx tsc --noEmit 2>&1 | grep -E "FreemiumBanner" | head -5
```

Expected: aucun output.

- [ ] **Step 3: Commit**

```bash
git add src/components/FreemiumBanner.tsx
git commit -m "feat(ui): add FreemiumBanner component (TRIAL / FREE states, gated by NEXT_PUBLIC_FREEMIUM_ENABLED)"
```

---

### Task T10: Create PaywallModal component

**Files:**
- Create: `src/components/PaywallModal.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import Link from "next/link";

type PaywallReason = 'premium-required-content' | 'premium-required-annale';

interface PaywallModalProps {
    open: boolean;
    onClose: () => void;
    reason?: PaywallReason | null;
    /** Nom du chapitre / annale verrouillé (pour le message) */
    itemName?: string;
}

/**
 * Modal affiché au clic sur un item verrouillé (chapitre Premium ou annale).
 * Le message s'adapte au reason — annale ou contenu standard.
 *
 * Ne s'affiche que si open=true. Pas de friction sur "Plus tard" (close sans pression).
 */
export default function PaywallModal({ open, onClose, reason, itemName }: PaywallModalProps) {
    if (!open) return null;

    const isAnnale = reason === 'premium-required-annale';

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="paywall-title"
        >
            {/* Backdrop */}
            <button
                type="button"
                aria-label="Fermer"
                onClick={onClose}
                className="absolute inset-0 bg-navy-deep/80 backdrop-blur-sm"
            />

            {/* Panel */}
            <div className="relative bg-navy border border-white/10 rounded-3xl max-w-md w-full p-8 shadow-2xl">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-orange/15 border border-orange/30 flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🔒</span>
                    </div>
                    <h2 id="paywall-title" className="font-heading text-2xl font-bold text-white mb-2">
                        {isAnnale ? 'Annale Premium' : 'Chapitre Premium'}
                    </h2>
                    {itemName && (
                        <p className="text-sm text-white/60">{itemName}</p>
                    )}
                </div>

                <p className="text-white/80 text-sm leading-relaxed mb-6">
                    {isAnnale
                        ? "Les annales corrigées MINESEC (BEPC, Probatoire, Bac) sont exclusivement réservées aux membres Premium."
                        : "Tu as déjà découvert SmartLearn avec le chapitre 1 gratuit. Le reste de ton programme officiel MINESEC est derrière Premium."}
                </p>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
                    <p className="text-xs font-semibold uppercase tracking-widest text-teal mb-3">
                        Avec Premium, tu débloques :
                    </p>
                    <ul className="space-y-2 text-sm text-white/90">
                        <li className="flex items-start gap-2">
                            <span className="text-teal mt-0.5">✓</span>
                            <span>Tous les chapitres en Mathématiques et Informatique</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-teal mt-0.5">✓</span>
                            <span>Toutes les annales corrigées MINESEC (BEPC, Probatoire, Bac)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-teal mt-0.5">✓</span>
                            <span>Accès illimité — vidéos HD, PDFs, exercices avec corrigés</span>
                        </li>
                    </ul>
                    <p className="text-xs text-white/50 mt-4">
                        À partir de <strong className="text-white">3 000 FCFA / mois</strong>
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <Link
                        href="/paiement"
                        className="w-full text-center bg-orange hover:bg-orange/90 text-white font-semibold py-3 rounded-full transition-colors"
                    >
                        Voir les formules →
                    </Link>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full text-center text-white/60 hover:text-white/90 font-semibold py-2 transition-colors"
                    >
                        Plus tard
                    </button>
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /home/salomonlamemoire/.gemini/antigravity/scratch/smartlearn && npx tsc --noEmit 2>&1 | grep -E "PaywallModal" | head -5
```

Expected: aucun output.

- [ ] **Step 3: Commit**

```bash
git add src/components/PaywallModal.tsx
git commit -m "feat(ui): add PaywallModal component (adaptive message for content vs annale)"
```

---

### Task T11: Mount FreemiumBanner on dashboard pages

**Files:**
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/app/dashboard/cours/page.tsx`

- [ ] **Step 1: Add import to `src/app/dashboard/page.tsx`**

Lire le fichier d'abord (Read), puis ajouter en haut :

```typescript
import FreemiumBanner from "@/components/FreemiumBanner";
```

- [ ] **Step 2: Render the banner at the top of the page**

Insérer `<FreemiumBanner />` juste au début du `return (...)`, avant tout autre élément.

- [ ] **Step 3: Same for `src/app/dashboard/cours/page.tsx`**

Lire le fichier d'abord (Read), puis ajouter en haut :

```typescript
import FreemiumBanner from "@/components/FreemiumBanner";
```

Insérer `<FreemiumBanner />` au début du `return (...)`.

- [ ] **Step 4: Verify TypeScript**

```bash
cd /home/salomonlamemoire/.gemini/antigravity/scratch/smartlearn && npx tsc --noEmit 2>&1 | grep -E "dashboard/(page|cours/page)" | head -5
```

Expected: aucun output.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/page.tsx src/app/dashboard/cours/page.tsx
git commit -m "feat(ui): mount FreemiumBanner on dashboard and dashboard/cours pages"
```

---

### Task T12: DynamicContentBrowser — show lock icon + open PaywallModal on locked items

**Files:**
- Modify: `src/app/dashboard/components/DynamicContentBrowser.tsx`

- [ ] **Step 1: Read the file to understand current structure**

```bash
cd /home/salomonlamemoire/.gemini/antigravity/scratch/smartlearn && wc -l src/app/dashboard/components/DynamicContentBrowser.tsx
```

(Tâche d'investigation : lire le fichier pour identifier les blocs qui rendent files et vidéos.)

- [ ] **Step 2: Import PaywallModal at top**

```typescript
import PaywallModal from "@/components/PaywallModal";
```

- [ ] **Step 3: Add paywall state**

Au début du composant (après les autres `useState`) :

```typescript
const [paywall, setPaywall] = useState<{
    open: boolean;
    reason: 'premium-required-content' | 'premium-required-annale' | null;
    itemName: string;
}>({ open: false, reason: null, itemName: '' });
```

- [ ] **Step 4: Add helper to handle click on item**

Avant le `return`, ajouter :

```typescript
const handleItemClick = (item: any) => {
    if (item.isLocked) {
        setPaywall({
            open: true,
            reason: item.lockReason,
            itemName: item.name,
        });
        return;
    }
    // Comportement existant (lire le fichier / vidéo) — réutiliser la logique en place
    if (item.contentType === 'file') {
        setSelectedMedia({ type: 'pdf', url: item.cdnUrl, title: item.name });
    } else if (item.contentType === 'video') {
        // selon la logique existante du composant
    }
};
```

(Adapter aux noms de variables existants comme `setSelectedMedia` après lecture du fichier.)

- [ ] **Step 5: Update the file render to show lock + use handleItemClick**

Trouver le bloc qui mappe `files.map(...)`. Modifier le `onClick` pour appeler `handleItemClick(file)` à la place de l'ouverture directe, ET ajouter un cadenas + badge si `file.isLocked`.

Exemple de pattern :

```tsx
<div
    key={file.id}
    onClick={() => handleItemClick(file)}
    className={`... ${file.isLocked ? 'cursor-pointer' : 'cursor-pointer'}`}
>
    {file.isLocked && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-orange/15 border border-orange/40 px-2 py-0.5 rounded-full">
            <span className="text-orange text-[10px]">🔒</span>
            <span className="text-orange text-[10px] font-semibold uppercase tracking-widest">Premium</span>
        </div>
    )}
    {file.isFree && (
        <div className="absolute top-2 right-2 bg-teal/15 border border-teal/40 px-2 py-0.5 rounded-full">
            <span className="text-teal text-[10px] font-semibold uppercase tracking-widest">Gratuit</span>
        </div>
    )}
    {/* contenu existant */}
</div>
```

- [ ] **Step 6: Same for videos block**

Appliquer le même pattern au bloc qui rend les vidéos.

- [ ] **Step 7: Mount the PaywallModal at the end of the JSX return**

Avant la fermeture du composant :

```tsx
<PaywallModal
    open={paywall.open}
    onClose={() => setPaywall({ open: false, reason: null, itemName: '' })}
    reason={paywall.reason}
    itemName={paywall.itemName}
/>
```

- [ ] **Step 8: Verify TypeScript**

```bash
cd /home/salomonlamemoire/.gemini/antigravity/scratch/smartlearn && npx tsc --noEmit 2>&1 | grep -E "DynamicContentBrowser" | head -5
```

Expected: aucun output.

- [ ] **Step 9: Commit**

```bash
git add src/app/dashboard/components/DynamicContentBrowser.tsx
git commit -m "feat(ui): DynamicContentBrowser shows lock badge + PaywallModal on locked items"
```

---

### Task T13: UserNav — state-aware links

**Files:**
- Modify: `src/components/UserNav.tsx`

- [ ] **Step 1: Read the file to verify current state**

(Le composant a été récemment réécrit avec le burger mobile. On adapte les liens selon `session.user`.)

- [ ] **Step 2: Replace the link computation logic**

Trouver le bloc actuel qui calcule `links`. Le REMPLACER par :

```typescript
const u = session?.user as any;
const isAdmin = u?.role === 'admin';
const isOnTrial = !!u?.isOnTrial;
const isPremiumPaid = !!u?.isPremium && !isOnTrial;
const isFree = !!session && !u?.isPremium && !isAdmin;

const links: Array<{ href: string; label: string; variant: 'text' | 'text-strong' | 'cta' | 'trial-badge' }> = [];

if (!session) {
    links.push({ href: '/catalogue', label: 'Catalogue', variant: 'text' });
    links.push({ href: '/auth/connexion', label: 'Connexion', variant: 'text' });
    links.push({ href: '/auth/inscription', label: 'Créer un compte', variant: 'cta' });
} else {
    links.push({ href: '/catalogue', label: 'Catalogue', variant: 'text' });
    links.push({ href: '/dashboard', label: 'Tableau de bord', variant: 'text-strong' });
    if (isOnTrial) {
        const days = u?.premiumDaysRemaining ?? 0;
        links.push({ href: '/paiement', label: `J-${days} essai Premium`, variant: 'trial-badge' });
    } else if (isFree) {
        links.push({ href: '/paiement', label: 'Passer Premium', variant: 'cta' });
    }
}
```

- [ ] **Step 3: Add rendering for trial-badge variant in DESKTOP nav**

Dans la boucle `links.map(...)` de la version desktop, ajouter un cas pour `variant === 'trial-badge'` :

```tsx
if (l.variant === 'trial-badge') {
    return (
        <Link
            key={l.href}
            href={l.href}
            className="bg-teal/15 border border-teal/40 text-teal text-xs font-bold px-3 py-2 rounded-full uppercase tracking-widest hover:bg-teal/25 transition-colors"
        >
            {l.label}
        </Link>
    );
}
```

- [ ] **Step 4: Same for MOBILE drawer**

Dans la boucle `links.map(...)` de la version mobile drawer, ajouter le même cas (avec classes adaptées à `w-full`/`text-center`) :

```tsx
if (l.variant === 'trial-badge') {
    return (
        <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className="w-full text-center bg-teal/15 border border-teal/40 text-teal font-bold px-6 py-3 rounded-full uppercase tracking-widest text-sm"
        >
            {l.label}
        </Link>
    );
}
```

- [ ] **Step 5: Verify TypeScript**

```bash
cd /home/salomonlamemoire/.gemini/antigravity/scratch/smartlearn && npx tsc --noEmit 2>&1 | grep -E "UserNav" | head -5
```

Expected: aucun output.

- [ ] **Step 6: Commit**

```bash
git add src/components/UserNav.tsx
git commit -m "feat(ui): UserNav state-aware — trial badge / passer-premium CTA / admin masquage"
```

---

### Task T14: Catalogue page — badge "Chapitre 1 gratuit" on program cards

**Files:**
- Modify: `src/app/catalogue/page.tsx`

- [ ] **Step 1: Locate the card render**

Le fichier rend chaque `program` via `filteredPrograms.map(...)`. Identifier le bloc.

- [ ] **Step 2: Insert the free badge on each card**

À l'intérieur de chaque card, juste avant ou après l'en-tête de la card, insérer :

```tsx
<div className="px-6 pt-4">
    <span className="inline-flex items-center gap-1.5 bg-teal/15 border border-teal/40 text-teal px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
        ★ Chapitre 1 gratuit
    </span>
</div>
```

(Adapter le placement au layout actuel.)

- [ ] **Step 3: Verify TypeScript**

```bash
cd /home/salomonlamemoire/.gemini/antigravity/scratch/smartlearn && npx tsc --noEmit 2>&1 | grep -E "catalogue/page" | head -5
```

Expected: aucun output.

- [ ] **Step 4: Commit**

```bash
git add src/app/catalogue/page.tsx
git commit -m "feat(catalogue): add 'Chapitre 1 gratuit' badge on program cards"
```

---

### Task T15: Documentation — update architecture-smartlearn skill + admin-abonnements agent

**Files:**
- Modify: `.claude/skills/architecture-smartlearn/SKILL.md`
- Modify: `.claude/agents/admin-abonnements.md`

- [ ] **Step 1: Update architecture-smartlearn**

Dans `.claude/skills/architecture-smartlearn/SKILL.md`, ajouter une section après "Codes Plan actifs" :

```markdown
## Convention de nommage Bunny (freemium)

Source de vérité du gating Free vs Premium (cf. `src/lib/freemium.ts`).

| Type de contenu | Convention path | Statut |
|---|---|---|
| Chapitre 1 d'une matière (gratuit) | `/{niveau}/{matiere}/chapters/01-<slug>/...` | Free + Trial + Premium |
| Chapitres 2+ | `/{niveau}/{matiere}/chapters/02-<slug>/`, `03-...` | Premium uniquement |
| Annales corrigées | `/annales/BEPC/...`, `/annales/Bac-C/...` | Premium uniquement |

Regex de détection (dans `src/lib/freemium.ts`) :
- Free chapter : `/chapters\/01-/i`
- Annale : `/(^|\/)annales\//i`

**Discipline admin** : tout chapitre uploadé doit suivre cette convention. Un dossier
mal nommé devient automatiquement Premium (fail-safe, pas de perte de sécurité).
```

Et dans la section "Modèles Mongoose principaux", ajouter les nouveaux champs User :

```markdown
| `User` | …, welcomeTrialGrantedAt, registrationFraudFlag, lastLoginAt | `src/models/User.ts` |
```

- [ ] **Step 2: Update admin-abonnements agent**

Dans `.claude/agents/admin-abonnements.md`, ajouter dans la section "Failures fréquentes" :

```markdown
7. Essai Premium en cours (`welcomeTrialGrantedAt` set + `premiumUntil > now`) →
   user a accès complet, ne pas confondre avec un paiement réel. Si l'user signale
   "Premium pas activé alors que j'ai payé", vérifier que ce n'est pas l'essai
   initial qui se termine bientôt.
8. `welcomeTrialGrantedAt` absent → user éligible à l'essai 7j, qui sera octroyé
   au prochain login (mécanisme migration lazy).
```

- [ ] **Step 3: Verify no TS impact**

```bash
cd /home/salomonlamemoire/.gemini/antigravity/scratch/smartlearn && npx tsc --noEmit 2>&1 | tail -3
```

Expected: aucune erreur nouvelle.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/architecture-smartlearn/SKILL.md .claude/agents/admin-abonnements.md
git commit -m "docs(claude): document Bunny naming convention + new User fields for freemium"
```

---

### Task T16: n8n — update workflow 02 to skip trial users

**Files:**
- Modify: `n8n/02-relance-inactif-7j/DESIGN.md`
- Modify: `n8n/02-relance-inactif-7j/workflow.json`

- [ ] **Step 1: Update DESIGN.md**

Dans `n8n/02-relance-inactif-7j/DESIGN.md`, dans la section "Requête MongoDB", remplacer la query par :

```js
db.users.find({
  role: 'student',
  lastLoginAt: {
    $gte: ISODate('<now-8d>'),
    $lt:  ISODate('<now-7d>')
  },
  // SKIP les users en trial actif (sinon on les relance alors qu'ils ont accès complet)
  $or: [
    { premiumUntil: { $exists: false } },
    { premiumUntil: null },
    { premiumUntil: { $lt: ISODate('<now>') } }   // expiré uniquement
  ]
}, ...)
```

Dans "Garde-fous (avant tout envoi)", ajouter :

```markdown
5. ❌ user en TRIAL actif (`premiumUntil > now`) → SKIP (déjà couvert par la requête, double-check)
```

- [ ] **Step 2: Update workflow.json query**

Dans `n8n/02-relance-inactif-7j/workflow.json`, modifier la query du node `mongo-find-inactive` pour intégrer le filtre `premiumUntil`. Remplacer :

```json
"query": "={\n  \"role\": \"student\",\n  \"lastLoginAt\": {\n    \"$gte\": { \"$date\": \"{{ $now.minus({ days: 8 }).toISO() }}\" },\n    \"$lt\": { \"$date\": \"{{ $now.minus({ days: 7 }).toISO() }}\" }\n  }\n}"
```

Par :

```json
"query": "={\n  \"role\": \"student\",\n  \"lastLoginAt\": {\n    \"$gte\": { \"$date\": \"{{ $now.minus({ days: 8 }).toISO() }}\" },\n    \"$lt\": { \"$date\": \"{{ $now.minus({ days: 7 }).toISO() }}\" }\n  },\n  \"$or\": [\n    { \"premiumUntil\": null },\n    { \"premiumUntil\": { \"$lt\": { \"$date\": \"{{ $now.toISO() }}\" } } }\n  ]\n}"
```

- [ ] **Step 3: Commit**

```bash
git add n8n/02-relance-inactif-7j/
git commit -m "fix(n8n): workflow 02 skips users in active Premium trial or paid Premium"
```

---

### Task T17: n8n workflow 06 — Fin d'essai J-2

**Files:**
- Create: `n8n/06-fin-essai-J-2/DESIGN.md`
- Create: `n8n/06-fin-essai-J-2/workflow.json`

- [ ] **Step 1: Create DESIGN.md**

```markdown
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
```

- [ ] **Step 2: Create workflow.json**

```json
{
  "name": "06 - Fin d'essai Premium J-2",
  "nodes": [
    {
      "parameters": {
        "rule": { "interval": [{ "field": "cronExpression", "expression": "0 10 * * *" }] }
      },
      "id": "cron-daily-10h",
      "name": "Cron daily 10h Africa/Douala",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.2,
      "position": [240, 300]
    },
    {
      "parameters": {
        "operation": "find",
        "collection": "users",
        "query": "={\n  \"role\": { \"$in\": [\"student\", \"affiliate\"] },\n  \"welcomeTrialGrantedAt\": { \"$exists\": true, \"$ne\": null },\n  \"premiumUntil\": {\n    \"$gte\": { \"$date\": \"{{ $now.plus({ days: 2 }).toISO() }}\" },\n    \"$lt\": { \"$date\": \"{{ $now.plus({ days: 3 }).toISO() }}\" }\n  }\n}",
        "options": { "projection": "{\"email\":1,\"name\":1,\"grade_level\":1,\"premiumUntil\":1}" }
      },
      "id": "mongo-find-trial-ending",
      "name": "MongoDB: find trials J+2",
      "type": "n8n-nodes-base.mongoDb",
      "typeVersion": 1.1,
      "position": [460, 300]
    },
    {
      "parameters": {
        "conditions": {
          "options": { "caseSensitive": false, "leftValue": "", "typeValidation": "loose" },
          "conditions": [
            {
              "leftValue": "={{ $json.email }}",
              "rightValue": "@eleve.smartlearn-edu.org",
              "operator": { "type": "string", "operation": "notContains" }
            }
          ],
          "combinator": "and"
        }
      },
      "id": "if-not-synthetic",
      "name": "Skip si synthétique",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [680, 300]
    },
    {
      "parameters": {
        "fromEmail": "noreply@smartlearn-edu.org",
        "toEmail": "={{ $json.email }}",
        "subject": "{{ $json.name }}, ton essai Premium se termine dans 2 jours",
        "html": "<p>À compléter dans n8n UI — voir DESIGN.md</p>",
        "options": {}
      },
      "id": "email-j2",
      "name": "Email J-2 fin d'essai",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 2.1,
      "position": [900, 200]
    }
  ],
  "connections": {
    "Cron daily 10h Africa/Douala": {
      "main": [[{ "node": "MongoDB: find trials J+2", "type": "main", "index": 0 }]]
    },
    "MongoDB: find trials J+2": {
      "main": [[{ "node": "Skip si synthétique", "type": "main", "index": 0 }]]
    },
    "Skip si synthétique": {
      "main": [
        [{ "node": "Email J-2 fin d'essai", "type": "main", "index": 0 }],
        []
      ]
    }
  },
  "settings": { "executionOrder": "v1", "timezone": "Africa/Douala" },
  "active": false,
  "tags": ["smartlearn", "freemium", "trial-ending", "non-critique"]
}
```

- [ ] **Step 3: Commit**

```bash
git add n8n/06-fin-essai-J-2/
git commit -m "feat(n8n): add workflow 06 fin d'essai J-2"
```

---

### Task T18: n8n workflow 07 — Jour de bascule trial→free

**Files:**
- Create: `n8n/07-bascule-free/DESIGN.md`
- Create: `n8n/07-bascule-free/workflow.json`

- [ ] **Step 1: Create DESIGN.md**

```markdown
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
```

- [ ] **Step 2: Create workflow.json**

```json
{
  "name": "07 - Jour de bascule trial → free",
  "nodes": [
    {
      "parameters": {
        "rule": { "interval": [{ "field": "cronExpression", "expression": "0 10 * * *" }] }
      },
      "id": "cron-daily-10h",
      "name": "Cron daily 10h Africa/Douala",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.2,
      "position": [240, 300]
    },
    {
      "parameters": {
        "operation": "find",
        "collection": "users",
        "query": "={\n  \"role\": { \"$in\": [\"student\", \"affiliate\"] },\n  \"welcomeTrialGrantedAt\": { \"$exists\": true, \"$ne\": null },\n  \"premiumUntil\": {\n    \"$gte\": { \"$date\": \"{{ $now.minus({ days: 1 }).toISO() }}\" },\n    \"$lt\": { \"$date\": \"{{ $now.toISO() }}\" }\n  }\n}",
        "options": { "projection": "{\"email\":1,\"name\":1,\"grade_level\":1}" }
      },
      "id": "mongo-find-just-expired",
      "name": "MongoDB: find trials just expired",
      "type": "n8n-nodes-base.mongoDb",
      "typeVersion": 1.1,
      "position": [460, 300]
    },
    {
      "parameters": {
        "conditions": {
          "options": { "caseSensitive": false, "leftValue": "", "typeValidation": "loose" },
          "conditions": [
            {
              "leftValue": "={{ $json.email }}",
              "rightValue": "@eleve.smartlearn-edu.org",
              "operator": { "type": "string", "operation": "notContains" }
            }
          ],
          "combinator": "and"
        }
      },
      "id": "if-not-synthetic",
      "name": "Skip si synthétique",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [680, 300]
    },
    {
      "parameters": {
        "fromEmail": "noreply@smartlearn-edu.org",
        "toEmail": "={{ $json.email }}",
        "subject": "{{ $json.name }}, voici ce que tu as exploré pendant ton essai",
        "html": "<p>À compléter dans n8n UI — voir DESIGN.md</p>",
        "options": {}
      },
      "id": "email-bascule",
      "name": "Email récap bascule",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 2.1,
      "position": [900, 200]
    }
  ],
  "connections": {
    "Cron daily 10h Africa/Douala": {
      "main": [[{ "node": "MongoDB: find trials just expired", "type": "main", "index": 0 }]]
    },
    "MongoDB: find trials just expired": {
      "main": [[{ "node": "Skip si synthétique", "type": "main", "index": 0 }]]
    },
    "Skip si synthétique": {
      "main": [
        [{ "node": "Email récap bascule", "type": "main", "index": 0 }],
        []
      ]
    }
  },
  "settings": { "executionOrder": "v1", "timezone": "Africa/Douala" },
  "active": false,
  "tags": ["smartlearn", "freemium", "trial-end", "non-critique"]
}
```

- [ ] **Step 3: Commit**

```bash
git add n8n/07-bascule-free/
git commit -m "feat(n8n): add workflow 07 jour de bascule trial → free"
```

---

### Task T19: n8n workflow 08 — Relance conversion J+14

**Files:**
- Create: `n8n/08-relance-conversion-J+14/DESIGN.md`
- Create: `n8n/08-relance-conversion-J+14/workflow.json`

- [ ] **Step 1: Create DESIGN.md**

```markdown
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
```

- [ ] **Step 2: Create workflow.json**

```json
{
  "name": "08 - Relance conversion J+14",
  "nodes": [
    {
      "parameters": {
        "rule": { "interval": [{ "field": "cronExpression", "expression": "0 10 * * *" }] }
      },
      "id": "cron-daily-10h",
      "name": "Cron daily 10h Africa/Douala",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.2,
      "position": [240, 300]
    },
    {
      "parameters": {
        "operation": "find",
        "collection": "users",
        "query": "={\n  \"role\": { \"$in\": [\"student\", \"affiliate\"] },\n  \"welcomeTrialGrantedAt\": { \"$exists\": true, \"$ne\": null },\n  \"premiumUntil\": {\n    \"$gte\": { \"$date\": \"{{ $now.minus({ days: 15 }).toISO() }}\" },\n    \"$lt\": { \"$date\": \"{{ $now.minus({ days: 14 }).toISO() }}\" }\n  }\n}",
        "options": { "projection": "{\"email\":1,\"name\":1,\"grade_level\":1}" }
      },
      "id": "mongo-find-d14",
      "name": "MongoDB: find expired J-14",
      "type": "n8n-nodes-base.mongoDb",
      "typeVersion": 1.1,
      "position": [460, 300]
    },
    {
      "parameters": {
        "conditions": {
          "options": { "caseSensitive": false, "leftValue": "", "typeValidation": "loose" },
          "conditions": [
            {
              "leftValue": "={{ $json.email }}",
              "rightValue": "@eleve.smartlearn-edu.org",
              "operator": { "type": "string", "operation": "notContains" }
            }
          ],
          "combinator": "and"
        }
      },
      "id": "if-not-synthetic",
      "name": "Skip si synthétique",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [680, 300]
    },
    {
      "parameters": {
        "fromEmail": "noreply@smartlearn-edu.org",
        "toEmail": "={{ $json.email }}",
        "subject": "{{ $json.name }}, tu nous manques sur SmartLearn",
        "html": "<p>À compléter dans n8n UI — voir DESIGN.md (témoignage anonymisé)</p>",
        "options": {}
      },
      "id": "email-d14",
      "name": "Email relance J+14",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 2.1,
      "position": [900, 200]
    }
  ],
  "connections": {
    "Cron daily 10h Africa/Douala": {
      "main": [[{ "node": "MongoDB: find expired J-14", "type": "main", "index": 0 }]]
    },
    "MongoDB: find expired J-14": {
      "main": [[{ "node": "Skip si synthétique", "type": "main", "index": 0 }]]
    },
    "Skip si synthétique": {
      "main": [
        [{ "node": "Email relance J+14", "type": "main", "index": 0 }],
        []
      ]
    }
  },
  "settings": { "executionOrder": "v1", "timezone": "Africa/Douala" },
  "active": false,
  "tags": ["smartlearn", "freemium", "relance-conversion", "non-critique"]
}
```

- [ ] **Step 3: Commit**

```bash
git add n8n/08-relance-conversion-J+14/
git commit -m "feat(n8n): add workflow 08 relance conversion J+14"
```

---

### Task T19b: Observability events for freemium funnel

Spec §11 — logger 5 events dans la collection `retention_events` via le helper existant
`trackEvent` (`src/lib/retention.ts`). Permet à `analyste-academique` de calculer le funnel
`trial_granted → paywall_shown → paywall_clicked_cta → payment_succeeded`.

**Files:**
- Modify: `src/lib/freemium.ts` (helper de log)
- Modify: `src/app/api/auth/register/route.ts` (event `trial_granted` source=register)
- Modify: `src/app/api/auth/[...nextauth]/route.ts` (event `trial_granted` source=migration)
- Modify: `src/app/api/user/content/bunny/route.ts` (event `free_content_accessed`)
- Modify: `src/components/PaywallModal.tsx` (events `paywall_shown` + `paywall_clicked_cta`)

- [ ] **Step 1: Add a logging helper in freemium.ts**

Ajouter à la fin de `src/lib/freemium.ts` :

```typescript
import { trackEvent } from './retention';

/**
 * Log un event freemium dans retention_events (best-effort, non bloquant).
 * Centralise pour éviter de dupliquer trackEvent dans 5 fichiers.
 */
export async function logFreemiumEvent(
    userId: string,
    eventType: 'trial_granted' | 'trial_expired' | 'free_content_accessed' | 'paywall_shown' | 'paywall_clicked_cta',
    metadata: Record<string, any> = {},
): Promise<void> {
    try {
        await trackEvent(userId, eventType as any, metadata);
    } catch (err) {
        console.warn(`[freemium] logFreemiumEvent ${eventType} failed:`, err);
    }
}
```

Note : `trackEvent` accepte un nom d'event. Les 5 nouveaux noms ne sont pas blocants
(`as any` pour bypasser la typing si la signature est stricte).

- [ ] **Step 2: Log trial_granted dans register/route.ts**

Après le `User.create(userData)`, ajouter :

```typescript
if (userData.welcomeTrialGrantedAt) {
    await logFreemiumEvent(user._id.toString(), 'trial_granted', { source: 'register' });
}
```

(Et importer `logFreemiumEvent` en haut.)

- [ ] **Step 3: Log trial_granted dans nextauth/route.ts (authorize)**

Dans `authorize()`, après `grantTrialIfEligible(user)`, ajouter :

```typescript
const wasGranted = !!user.welcomeTrialGrantedAt &&
    Math.abs(user.welcomeTrialGrantedAt.getTime() - Date.now()) < 60_000;
if (wasGranted) {
    // best-effort, ne bloque pas l'authentification
    logFreemiumEvent(user._id.toString(), 'trial_granted', { source: 'migration' }).catch(() => {});
}
```

(Et importer `logFreemiumEvent`.)

- [ ] **Step 4: Log free_content_accessed dans bunny/route.ts**

Dans la branche `files` (et `videos`), pour chaque item dont `verdict.ok && verdict.reason === 'free-chapter'`, logger une fois (idempotent par session). Approche simple : logger UN event par requête route si l'utilisateur consulte un dossier avec au moins un free chapter :

Après le `.map(...)` qui produit `files`, ajouter :

```typescript
const hasFreeAccess = files.some((f: any) => !f.isLocked && f.isFree);
if (hasFreeAccess && !access.isPremium && dbUser.role !== 'admin') {
    logFreemiumEvent(dbUser._id.toString(), 'free_content_accessed', { path: cleanPath }).catch(() => {});
}
```

Idem côté videos avec son propre `hasFreeAccess`.

- [ ] **Step 5: Log paywall_shown + paywall_clicked_cta dans PaywallModal**

Modifier `src/components/PaywallModal.tsx` :

Ajouter en haut :

```tsx
import { useEffect } from "react";
import { useSession } from "next-auth/react";
```

Dans le composant, après les guards `if (!open) return null;` :

```tsx
const { data: session } = useSession();
const userId = (session?.user as any)?.id;

useEffect(() => {
    if (open && userId) {
        // Fire-and-forget, ne bloque pas le rendu
        fetch('/api/user/freemium/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event: 'paywall_shown', metadata: { itemName, reason } }),
        }).catch(() => {});
    }
}, [open, userId, itemName, reason]);
```

Et sur le CTA `Voir les formules` :

```tsx
<Link
    href="/paiement"
    onClick={() => {
        if (userId) {
            fetch('/api/user/freemium/event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event: 'paywall_clicked_cta', metadata: { itemName, reason } }),
            }).catch(() => {});
        }
    }}
    className="..."
>
    Voir les formules →
</Link>
```

- [ ] **Step 6: Create endpoint /api/user/freemium/event**

Créer `src/app/api/user/freemium/event/route.ts` :

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { logFreemiumEvent } from '@/lib/freemium';

/**
 * Réception des events freemium côté client (paywall_shown, paywall_clicked_cta).
 * Best-effort : ne bloque jamais l'UX, retourne 204 systématiquement.
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id;
        if (!userId) {
            return new NextResponse(null, { status: 204 }); // anonymous, on ignore silencieusement
        }
        const body = await req.json().catch(() => ({}));
        const { event, metadata } = body;
        if (event === 'paywall_shown' || event === 'paywall_clicked_cta') {
            await logFreemiumEvent(userId, event, metadata || {});
        }
        return new NextResponse(null, { status: 204 });
    } catch (err) {
        console.warn('[freemium event] error:', err);
        return new NextResponse(null, { status: 204 });
    }
}
```

- [ ] **Step 7: Run tests + typecheck**

```bash
cd /home/salomonlamemoire/.gemini/antigravity/scratch/smartlearn && npx vitest run 2>&1 | tail -5 && npx tsc --noEmit 2>&1 | grep -E "(freemium|PaywallModal|register|nextauth|bunny|event/route)" | head -10
```

Expected: tous tests verts, aucune erreur TS sur les fichiers modifiés.

- [ ] **Step 8: Commit**

```bash
git add src/lib/freemium.ts src/app/api/auth/register/route.ts src/app/api/auth/[...nextauth]/route.ts src/app/api/user/content/bunny/route.ts src/components/PaywallModal.tsx src/app/api/user/freemium/event/route.ts
git commit -m "feat(observability): log 5 freemium events for funnel analytics (trial_granted, free_content_accessed, paywall_shown, paywall_clicked_cta)"
```

---

### Task T20: Final verification — full test suite + typecheck

**Files:**
- N/A (verification only)

- [ ] **Step 1: Run full Vitest suite**

```bash
cd /home/salomonlamemoire/.gemini/antigravity/scratch/smartlearn && npx vitest run 2>&1 | tail -10
```

Expected: tous les tests passent. Compte total = 71+ (44 existants + 27 freemium).

- [ ] **Step 2: Run full TypeScript check**

```bash
cd /home/salomonlamemoire/.gemini/antigravity/scratch/smartlearn && npx tsc --noEmit 2>&1 | grep -vE "^(.next/types|scripts/(activate|check|search)_)" | head -20
```

Expected: aucune erreur sur les fichiers modifiés (ignorer les bruits .next/types et scripts standalone existants).

- [ ] **Step 3: Push to GitHub**

```bash
cd /home/salomonlamemoire/.gemini/antigravity/scratch/smartlearn && git push origin main
```

Expected: push successful, Vercel auto-deploy triggers.

---

## Stage 2 — Migration lazy activée (FREEMIUM_ENABLED toujours false en prod, true en preview)

Cette étape ne modifie pas le code. Elle consiste à :
1. Vérifier sur preview Vercel que l'essai 7j est bien octroyé aux nouveaux + legacy au login
2. Laisser tourner 24h en prod sans activer `FREEMIUM_ENABLED` (les comptes legacy reçoivent silencieusement leur trial)

### Task T21: Stage 2 verification checklist

- [ ] **Step 1: Vérifier les variables d'env Vercel**

Sur le dashboard Vercel → Settings → Environment Variables :
- Production : `FREEMIUM_ENABLED=false`, `NEXT_PUBLIC_FREEMIUM_ENABLED=false`
- Preview : `FREEMIUM_ENABLED=true`, `NEXT_PUBLIC_FREEMIUM_ENABLED=true`

- [ ] **Step 2: Test inscription sur preview**

Sur l'URL preview Vercel :
1. Créer un compte test avec email réel
2. Vérifier réception OTP, valider
3. Se connecter
4. Vérifier en BD via MongoDB Atlas : `welcomeTrialGrantedAt` set + `premiumUntil` = signup + 7j

- [ ] **Step 3: Test legacy migration sur preview**

1. Identifier un user legacy non-Premium en BD (via Mongo)
2. Manuellement effacer `welcomeTrialGrantedAt` et `premiumUntil` (`{ $unset: ... }`)
3. Se reconnecter avec ce compte
4. Vérifier que `welcomeTrialGrantedAt` est set et `premiumUntil = +7d`

- [ ] **Step 4: Test cas spéciaux sur preview**

- Compte avec email `@eleve.smartlearn-edu.org` → vérifier pas d'octroi
- Compte admin → vérifier pas d'octroi
- Compte avec `premiumUntil` dans le passé → vérifier pas d'octroi (anti-abus)

- [ ] **Step 5: Laisser tourner 24h en prod (lazy migration silencieuse)**

Pendant 24h, surveiller :
- Vercel logs : pas d'erreur sur `authorize()` ni `register`
- MongoDB : compteur de users avec `welcomeTrialGrantedAt` set qui monte au fur et à mesure des logins

---

## Stage 3 — Free gate activée en prod

### Task T22: Flip FREEMIUM_ENABLED in prod

- [ ] **Step 1: Vercel env vars production**

Production :
- `FREEMIUM_ENABLED=true`
- `NEXT_PUBLIC_FREEMIUM_ENABLED=true`

- [ ] **Step 2: Redeploy production**

Sur Vercel dashboard → Deployments → Redeploy latest avec les nouvelles env vars.

- [ ] **Step 3: Smoke test prod**

1. Visiter `https://www.smartlearn-edu.org` (anonyme) → bannière catalogue badge `Chapitre 1 gratuit`
2. Se connecter avec un compte test en TRIAL → bannière teal `J-X restants` visible
3. Naviguer sur dashboard/cours/{id} → cadenas sur les chapitres 2+, modal au clic
4. Tester un paiement Chariow réduit (564 FCFA) → flow paiement → retour avec Premium activé
5. Vérifier qu'un compte admin connecté ne voit AUCUNE bannière

- [ ] **Step 4: Activer les workflows n8n 06, 07, 08**

Sur n8n cloud : importer les 3 nouveaux workflow.json, configurer credentials Mongo + Resend, activer.

- [ ] **Step 5: Monitoring 7 jours**

Surveiller via Vercel logs + MongoDB :
- Nombre de paywall_shown (à logger via trackEvent dans la route bunny — extension future)
- Taux de conversion TRIAL → PAID
- Erreurs 5xx sur la route bunny

- [ ] **Step 6: Rollback plan (si KO)**

Si problème majeur :
```
Vercel → Settings → Environment Variables → FREEMIUM_ENABLED=false + NEXT_PUBLIC_FREEMIUM_ENABLED=false
Redeploy production
```

→ Retour comportement binaire historique. Pas de perte de données (`welcomeTrialGrantedAt`
reste en BD, juste ignoré).

---

## Récap commits attendus

| Task | Commit |
|---|---|
| T1 | `feat(user): add welcomeTrialGrantedAt + registrationFraudFlag + lastLoginAt fields` |
| T2 | `feat(freemium): add isFreeChapterPath helper with tests` |
| T3 | `feat(freemium): add isAnnalePath helper with tests` |
| T4 | `feat(freemium): add canAccessContent verdict function with tests` |
| T5 | `feat(freemium): add grantTrialIfEligible helper with tests` |
| T6 | `feat(auth): grant 7-day Premium trial at student/affiliate signup` |
| T7 | `feat(auth): grant trial in authorize() for legacy users + expose isOnTrial/welcomeTrialGrantedAt to session` |
| T8 | `feat(content): per-item gating via canAccessContent (gated by FREEMIUM_ENABLED flag)` |
| T9 | `feat(ui): add FreemiumBanner component (TRIAL / FREE states, gated by NEXT_PUBLIC_FREEMIUM_ENABLED)` |
| T10 | `feat(ui): add PaywallModal component (adaptive message for content vs annale)` |
| T11 | `feat(ui): mount FreemiumBanner on dashboard and dashboard/cours pages` |
| T12 | `feat(ui): DynamicContentBrowser shows lock badge + PaywallModal on locked items` |
| T13 | `feat(ui): UserNav state-aware — trial badge / passer-premium CTA / admin masquage` |
| T14 | `feat(catalogue): add 'Chapitre 1 gratuit' badge on program cards` |
| T15 | `docs(claude): document Bunny naming convention + new User fields for freemium` |
| T16 | `fix(n8n): workflow 02 skips users in active Premium trial or paid Premium` |
| T17 | `feat(n8n): add workflow 06 fin d'essai J-2` |
| T18 | `feat(n8n): add workflow 07 jour de bascule trial → free` |
| T19 | `feat(n8n): add workflow 08 relance conversion J+14` |
| T19b | `feat(observability): log 5 freemium events for funnel analytics (trial_granted, free_content_accessed, paywall_shown, paywall_clicked_cta)` |

20 commits sur la branche `main` au total pour Stage 1. Stages 2 et 3 = config Vercel + n8n, pas de commit.
