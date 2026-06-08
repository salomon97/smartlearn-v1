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

/**
 * Extrait les champs essentiels du payload webhook Chariow (event "successful.sale").
 *
 * Structure réelle observée (vérifiée via webhook_logs en production) :
 *   {
 *     event: "successful.sale",
 *     sale: { id, amount, status, custom_metadata, custom_fields, ... },
 *     product: { id, name, ... },
 *     customer: { email, ... },
 *   }
 *
 * IMPORTANT : Chariow ne renvoie PAS le custom_data passé en query au checkout
 * (sale.custom_metadata et sale.custom_fields restent null pour les achats réels).
 * Le mapping fiable userId/planCode passe donc par :
 *   1. customer.email → User.findOne({ email })
 *   2. product.id → Plan.findOne({ chariowUrl: /productId/ })
 *
 * On garde quand même les fallbacks body.data.* et body.* pour robustesse au
 * cas où Chariow ajouterait/changerait la structure.
 */
export function parseChariowSale(body: any): {
  referenceId: string | null;
  customerEmail: string | null;
  chariowProductId: string | null;
  rawCustomData: string | null;
} {
  const safe = body || {};
  const sale = safe.sale || safe.data || safe;
  const product = safe.product || null;
  const customer = safe.customer || sale?.customer || null;

  const referenceId = sale?.id || safe.data?.id || safe.id || null;
  const customerEmail = customer?.email || null;
  const chariowProductId = product?.id || null;

  let rawCustomData: string | null = null;
  if (typeof sale?.custom_metadata === 'string') {
    rawCustomData = sale.custom_metadata;
  } else if (Array.isArray(sale?.custom_fields)) {
    const cd = sale.custom_fields.find((f: any) => f?.name === 'custom_data');
    if (cd && typeof cd.value === 'string') rawCustomData = cd.value;
  }
  if (!rawCustomData) {
    rawCustomData = safe.custom_data || safe.metadata?.custom_data || null;
  }

  return { referenceId, customerEmail, chariowProductId, rawCustomData };
}
