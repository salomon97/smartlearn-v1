import { describe, it, expect } from 'vitest';
import { isSyntheticEmail, isValidCameroonMobileMoney } from './validation';

describe('isSyntheticEmail', () => {
  it('détecte les emails synthétiques @eleve.smartlearn-edu.org', () => {
    expect(isSyntheticEmail('abc123@eleve.smartlearn-edu.org')).toBe(true);
    expect(isSyntheticEmail('test@ELEVE.SMARTLEARN-EDU.ORG')).toBe(true); // case-insensitive
  });

  it('laisse passer les emails réels', () => {
    expect(isSyntheticEmail('foesalomon65@gmail.com')).toBe(false);
    expect(isSyntheticEmail('salomonfoe97@smartlearn-edu.org')).toBe(false);
    expect(isSyntheticEmail('admin@school.cm')).toBe(false);
  });
});

describe('isValidCameroonMobileMoney', () => {
  it('accepte le format E.164 avec +237', () => {
    expect(isValidCameroonMobileMoney('+237671719124')).toBe(true);
    expect(isValidCameroonMobileMoney('+237 671 71 91 24')).toBe(true);
    expect(isValidCameroonMobileMoney('+237-691-27-63-34')).toBe(true);
  });

  it('accepte le format 237 sans plus', () => {
    expect(isValidCameroonMobileMoney('237671719124')).toBe(true);
    expect(isValidCameroonMobileMoney('237 671 719 124')).toBe(true);
  });

  it('accepte le format national 9 chiffres', () => {
    expect(isValidCameroonMobileMoney('671719124')).toBe(true);
    expect(isValidCameroonMobileMoney('6 71 71 91 24')).toBe(true);
  });

  it('refuse les numéros trop courts ou trop longs', () => {
    expect(isValidCameroonMobileMoney('67171912')).toBe(false); // 8 chiffres
    expect(isValidCameroonMobileMoney('6717191240')).toBe(false); // 10 chiffres
    expect(isValidCameroonMobileMoney('+2376717191')).toBe(false); // tronqué
  });

  it('refuse les numéros ne commençant pas par 6', () => {
    expect(isValidCameroonMobileMoney('771719124')).toBe(false); // commence par 7
    expect(isValidCameroonMobileMoney('271719124')).toBe(false); // fixe
    expect(isValidCameroonMobileMoney('+237271719124')).toBe(false);
  });

  it('refuse les numéros étrangers', () => {
    expect(isValidCameroonMobileMoney('+33612345678')).toBe(false); // FR
    expect(isValidCameroonMobileMoney('+2348012345678')).toBe(false); // NG
  });

  it('refuse les entrées vides ou non numériques', () => {
    expect(isValidCameroonMobileMoney('')).toBe(false);
    expect(isValidCameroonMobileMoney('abc')).toBe(false);
    expect(isValidCameroonMobileMoney('671abc124')).toBe(false);
  });
});
