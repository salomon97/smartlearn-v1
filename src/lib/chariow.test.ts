import { describe, it, expect } from 'vitest';
import { parseCustomData } from './chariow';

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
