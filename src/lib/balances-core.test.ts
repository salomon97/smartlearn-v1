import { describe, it, expect } from 'vitest';
import { reduceBalances } from './balances-core';

describe('reduceBalances', () => {
  it('additionne les commissions pending dans pending', () => {
    const r = reduceBalances(
      [{ commission: 200, status: 'pending' }, { commission: 300, status: 'pending' }],
      [],
    );
    expect(r).toEqual({ pending: 500, available: 0 });
  });

  it('les commissions cleared vont dans available', () => {
    const r = reduceBalances([{ commission: 200, status: 'cleared' }], []);
    expect(r).toEqual({ pending: 0, available: 200 });
  });

  it('exclut fraud_suspected (commission 0) et failed', () => {
    const r = reduceBalances(
      [{ commission: 0, status: 'fraud_suspected' }, { commission: 200, status: 'failed' }],
      [],
    );
    expect(r).toEqual({ pending: 0, available: 0 });
  });

  it('soustrait les retraits pending et paid du disponible', () => {
    const r = reduceBalances(
      [{ commission: 1000, status: 'cleared' }],
      [{ amount: 300, status: 'pending' }, { amount: 200, status: 'paid' }],
    );
    expect(r.available).toBe(500);
  });

  it("ignore les retraits failed (l'argent revient)", () => {
    const r = reduceBalances(
      [{ commission: 1000, status: 'cleared' }],
      [{ amount: 400, status: 'failed' }],
    );
    expect(r.available).toBe(1000);
  });

  it('laisse remonter un available négatif (pas de troncature)', () => {
    const r = reduceBalances(
      [{ commission: 100, status: 'cleared' }],
      [{ amount: 300, status: 'paid' }],
    );
    expect(r.available).toBe(-200);
  });

  it('retourne 0/0 pour des entrées vides', () => {
    expect(reduceBalances([], [])).toEqual({ pending: 0, available: 0 });
  });
});
