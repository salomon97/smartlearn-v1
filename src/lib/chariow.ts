import { CUSTOM_DATA_DELIMITER } from './constants';

// Décode le champ custom_data renvoyé par Chariow.
// Nouveau format : "{userId}__{planCode}". Ancien format : "{userId}" (planCode null).
export function parseCustomData(
  raw: string | null | undefined,
): { userId: string | null; planCode: string | null } {
  if (!raw) return { userId: null, planCode: null };

  const idx = raw.indexOf(CUSTOM_DATA_DELIMITER);
  if (idx === -1) {
    return { userId: raw, planCode: null };
  }

  const userId = raw.slice(0, idx);
  const planCode = raw.slice(idx + CUSTOM_DATA_DELIMITER.length);
  return { userId: userId || null, planCode: planCode || null };
}
