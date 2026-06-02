export const classesDisponibles = [
    "6ème",
    "5ème",
    "4ème",
    "3ème",
    "2nde A",
    "2nde C",
    "2nde E",
    "2nde TI",
    "1ère A",
    "1ère C",
    "1ère D",
    "1ère E",
    "1ère TI",
    "Terminale A",
    "Terminale C",
    "Terminale D",
    "Terminale E",
    "Terminale TI"
];

// Code du plan par défaut (rétro-compatibilité de l'ancien custom_data = userId seul).
export const DEFAULT_PLAN_CODE = 'vip_avie';

// Délimiteur encodant userId + planCode dans le custom_data Chariow.
// Un code de plan ne doit JAMAIS contenir cette séquence.
export const CUSTOM_DATA_DELIMITER = '__';

// Domaine "synthétique" pour les emails générés lors d'une inscription manuelle
// (élève sans email réel, identifiants transmis en main propre). Le moteur de
// rétention saute l'envoi vers ces adresses (le domaine ne résout pas).
export const SYNTHETIC_EMAIL_DOMAIN = 'eleve.smartlearn-edu.org';

export function isSyntheticEmail(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase().endsWith('@' + SYNTHETIC_EMAIL_DOMAIN);
}
