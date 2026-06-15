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
