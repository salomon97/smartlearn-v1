// Validations pures — aucun import, testables seules.
// Source unique de vérité pour les formats acceptés (frontend + backend).

/**
 * Détecte les emails synthétiques générés en interne pour les élèves inscrits
 * par un admin sans email réel (format : <id>@eleve.smartlearn-edu.org).
 * Utilisé pour skip l'envoi d'emails transactionnels.
 */
export function isSyntheticEmail(email: string): boolean {
  return /@eleve\.smartlearn-edu\.org$/i.test(email);
}

/**
 * Valide un numéro Mobile Money camerounais.
 * Formats acceptés (après nettoyage des séparateurs) :
 *   - +2376XXXXXXXX (E.164, 12 chiffres après le +)
 *   - 2376XXXXXXXX  (sans +)
 *   - 6XXXXXXXX     (national, 9 chiffres avec préfixe 6)
 *
 * Refuse explicitement les numéros démarrant par autre chose que 6 — au Cameroun,
 * les mobiles MTN et Orange commencent tous par 6. Pas de fixe (préfixe 2) ni de
 * numéros étrangers (qui ne sont pas servis par MoMo/OM).
 */
export function isValidCameroonMobileMoney(raw: string): boolean {
  if (!raw) return false;
  const cleaned = raw.replace(/[\s\-().]/g, '');
  return /^(\+?237)?6\d{8}$/.test(cleaned);
}
