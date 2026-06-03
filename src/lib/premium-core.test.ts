import { describe, it, expect } from 'vitest';
import { computePremiumStatus } from './premium-core';

const REF = new Date('2026-06-03T12:00:00.000Z');

describe('computePremiumStatus', () => {
  it('jamais payé → never', () => {
    expect(computePremiumStatus({ isPremium: false, premiumUntil: null }, REF)).toEqual({
      isPremium: false,
      status: 'never',
      expiresAt: null,
      daysRemaining: null,
    });
  });

  it('grandfather à vie (isPremium=true sans premiumUntil) → lifetime', () => {
    expect(computePremiumStatus({ isPremium: true, premiumUntil: null }, REF)).toEqual({
      isPremium: true,
      status: 'lifetime',
      expiresAt: null,
      daysRemaining: null,
    });
  });

  it("abonné actif (premiumUntil > now) → active avec jours restants arrondis vers le haut", () => {
    const until = new Date('2026-06-26T12:00:00.000Z'); // +23 jours pile
    const r = computePremiumStatus({ isPremium: true, premiumUntil: until }, REF);
    expect(r.isPremium).toBe(true);
    expect(r.status).toBe('active');
    expect(r.expiresAt).toEqual(until);
    expect(r.daysRemaining).toBe(23);
  });

  it("expiration partielle (12h restantes) → daysRemaining = 1 (arrondi haut)", () => {
    const until = new Date('2026-06-04T00:00:00.000Z'); // +12h
    const r = computePremiumStatus({ isPremium: true, premiumUntil: until }, REF);
    expect(r.isPremium).toBe(true);
    expect(r.status).toBe('active');
    expect(r.daysRemaining).toBe(1);
  });

  it('abonné expiré (premiumUntil < now) → expired, isPremium effectif = false', () => {
    const until = new Date('2026-05-15T12:00:00.000Z'); // passé
    const r = computePremiumStatus({ isPremium: true, premiumUntil: until }, REF);
    expect(r).toEqual({
      isPremium: false,
      status: 'expired',
      expiresAt: until,
      daysRemaining: 0,
    });
  });

  it('expiration à la seconde près (premiumUntil == now) → expired (strict)', () => {
    const r = computePremiumStatus({ isPremium: true, premiumUntil: REF }, REF);
    expect(r.status).toBe('expired');
    expect(r.isPremium).toBe(false);
  });

  it('isPremium=false avec premiumUntil dans le futur (cas incohérent) → never (isPremium est l\'autorité du "a payé")', () => {
    // Politique : isPremium=false signifie n'a jamais payé. Un premiumUntil orphelin
    // (par exemple mis par erreur côté admin) ne donne PAS accès.
    const until = new Date('2026-07-01T12:00:00.000Z');
    const r = computePremiumStatus({ isPremium: false, premiumUntil: until }, REF);
    expect(r.isPremium).toBe(false);
    expect(r.status).toBe('never');
  });
});
