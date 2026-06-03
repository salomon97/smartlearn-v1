// Source de vérité unique de l'accès VIP — PURE (aucun import, testable seule).
// Combine isPremium (drapeau "a déjà payé un jour", jamais reset) et premiumUntil
// (horloge d'expiration). Le résultat .isPremium retourné est l'accès EFFECTIF
// (différent du champ stocké : un abonné expiré a isPremium=true en base mais
// isPremium=false en accès).

export type PremiumStatus = 'never' | 'lifetime' | 'active' | 'expired';

export type PremiumStatusResult = {
  isPremium: boolean;
  status: PremiumStatus;
  expiresAt: Date | null;
  daysRemaining: number | null;
};

const DAY = 24 * 60 * 60 * 1000;

export function computePremiumStatus(
  user: { isPremium?: boolean | null; premiumUntil?: Date | string | null },
  now: Date = new Date(),
): PremiumStatusResult {
  // isPremium est l'autorité du "a déjà payé". Sans lui → never (peu importe premiumUntil).
  if (!user.isPremium) {
    return { isPremium: false, status: 'never', expiresAt: null, daysRemaining: null };
  }

  // isPremium=true + pas de premiumUntil → grandfather à vie (toi + les payants à vie historiques).
  if (user.premiumUntil == null) {
    return { isPremium: true, status: 'lifetime', expiresAt: null, daysRemaining: null };
  }

  const expiresAt = user.premiumUntil instanceof Date
    ? user.premiumUntil
    : new Date(user.premiumUntil);

  const diff = expiresAt.getTime() - now.getTime();

  if (diff <= 0) {
    // Strictement <=0 : à la seconde de l'expiration, l'accès est déjà fermé.
    return { isPremium: false, status: 'expired', expiresAt, daysRemaining: 0 };
  }

  // Arrondi vers le haut : 12h restantes = 1 jour affiché (psychologiquement correct).
  return {
    isPremium: true,
    status: 'active',
    expiresAt,
    daysRemaining: Math.ceil(diff / DAY),
  };
}
