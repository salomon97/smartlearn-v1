import { describe, it, expect } from 'vitest';
import { parseCustomData, parseChariowSale } from './chariow';

describe('parseCustomData', () => {
  it('décode le nouveau format userId__planCode', () => {
    expect(parseCustomData('abc123__vip_avie')).toEqual({ userId: 'abc123', planCode: 'vip_avie' });
  });

  it('traite une valeur sans délimiteur comme un userId hérité', () => {
    expect(parseCustomData('abc123')).toEqual({ userId: 'abc123', planCode: null });
  });

  it('retourne des nulls pour null/undefined/vide', () => {
    expect(parseCustomData(null)).toEqual({ userId: null, planCode: null });
    expect(parseCustomData(undefined)).toEqual({ userId: null, planCode: null });
    expect(parseCustomData('')).toEqual({ userId: null, planCode: null });
  });
});

describe('parseChariowSale', () => {
  it('extrait sale.id, customer.email et product.id du payload réel Chariow', () => {
    // Sample réel anonymisé (capture webhook_logs production, event successful.sale)
    const body = {
      event: 'successful.sale',
      sale: {
        id: 'SALESMCKJA553NM4RJQ',
        amount: { value: 564, currency: 'XAF' },
        status: 'completed',
        custom_fields: null,
        custom_metadata: null,
      },
      product: { id: 'prd_uypgpgkq', name: 'VIP ANNUEL' },
      customer: { email: 'buyer@example.com', name: 'Jane Doe' },
    };
    expect(parseChariowSale(body)).toEqual({
      referenceId: 'SALESMCKJA553NM4RJQ',
      customerEmail: 'buyer@example.com',
      chariowProductId: 'prd_uypgpgkq',
      rawCustomData: null,
    });
  });

  it('lit custom_data depuis sale.custom_metadata si présent (string)', () => {
    const body = {
      sale: { id: 'S1', custom_metadata: 'uid123__vip_monthly' },
      product: { id: 'prd_x' },
      customer: { email: 'a@b.c' },
    };
    expect(parseChariowSale(body).rawCustomData).toBe('uid123__vip_monthly');
  });

  it('lit custom_data depuis sale.custom_fields[name=custom_data].value', () => {
    const body = {
      sale: {
        id: 'S1',
        custom_fields: [
          { name: 'other', value: 'ignored' },
          { name: 'custom_data', value: 'uid456__vip_annual' },
        ],
      },
      product: { id: 'prd_y' },
      customer: { email: 'a@b.c' },
    };
    expect(parseChariowSale(body).rawCustomData).toBe('uid456__vip_annual');
  });

  it('supporte le fallback body.data.* (autres providers / future schema)', () => {
    const body = {
      data: { id: 'REF_OLD', customer: { email: 'legacy@x.com' } },
      product: { id: 'prd_z' },
    };
    expect(parseChariowSale(body)).toEqual({
      referenceId: 'REF_OLD',
      customerEmail: 'legacy@x.com',
      chariowProductId: 'prd_z',
      rawCustomData: null,
    });
  });

  it('retourne tous les champs à null pour un body vide', () => {
    expect(parseChariowSale({})).toEqual({
      referenceId: null,
      customerEmail: null,
      chariowProductId: null,
      rawCustomData: null,
    });
    expect(parseChariowSale(null)).toEqual({
      referenceId: null,
      customerEmail: null,
      chariowProductId: null,
      rawCustomData: null,
    });
  });
});
