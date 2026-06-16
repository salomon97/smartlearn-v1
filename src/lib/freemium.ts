import { isSyntheticEmail } from './validation';

/**
 * SmartLearn Unified — Logique freemium (gating Free vs Premium).
 *
 * Source unique de vérité : 3 pure helpers (isFreeChapterPath, isAnnalePath,
 * canAccessContent) + 1 mutator (grantTrialIfEligible) qui mute le user en
 * place pour octroyer l'essai 7j. Zéro IO, zéro DB.
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

export const TRIAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

export type TrialEligibleUser = {
  email: string;
  role?: 'student' | 'affiliate' | 'admin';
  isPremium?: boolean;
  premiumUntil?: Date | null;
  welcomeTrialGrantedAt?: Date | null;
};

/**
 * Octroi l'essai Premium 7 jours à l'utilisateur s'il est éligible.
 * Mute l'objet `user` en place (set isPremium=true, premiumUntil, welcomeTrialGrantedAt)
 * et retourne true si l'octroi a eu lieu.
 *
 * isPremium=true est REQUIS pour que computePremiumStatus (cf. premium-core.ts) traite
 * l'utilisateur comme actif — sans lui, premiumUntil est ignoré et le statut est 'never'.
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

  user.isPremium = true;
  user.premiumUntil = new Date(now.getTime() + TRIAL_DURATION_MS);
  user.welcomeTrialGrantedAt = now;
  return true;
}
