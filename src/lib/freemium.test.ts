import { describe, it, expect } from 'vitest';
import { isFreeChapterPath, isAnnalePath, canAccessContent } from './freemium';

describe('isFreeChapterPath', () => {
  it('accepte un chapitre 1 dans une matière (premier cycle)', () => {
    expect(isFreeChapterPath('/6e/Mathematiques/chapters/01-nombres-rationnels/')).toBe(true);
  });

  it('accepte un chapitre 1 en informatique terminale', () => {
    expect(isFreeChapterPath('/Terminale-C/Informatique/chapters/01-binaire/')).toBe(true);
  });

  it('refuse un chapitre 2', () => {
    expect(isFreeChapterPath('/6e/Mathematiques/chapters/02-calcul-litteral/')).toBe(false);
  });

  it("refuse une variante de nommage non conforme (chapitre-01-)", () => {
    expect(isFreeChapterPath('/6e/Mathematiques/chapters/chapitre-01-nombres/')).toBe(false);
  });

  it('refuse un chapitre 10 (anti faux positif sur substring "01")', () => {
    expect(isFreeChapterPath('/6e/Mathematiques/chapters/10-statistiques/')).toBe(false);
  });

  it('refuse un path vide', () => {
    expect(isFreeChapterPath('')).toBe(false);
  });

  it('refuse null / undefined', () => {
    expect(isFreeChapterPath(null as any)).toBe(false);
    expect(isFreeChapterPath(undefined as any)).toBe(false);
  });
});

describe('isAnnalePath', () => {
  it('accepte un path annale BEPC', () => {
    expect(isAnnalePath('/annales/BEPC/2024-mathematiques/')).toBe(true);
  });

  it('accepte un path annale Bac C', () => {
    expect(isAnnalePath('/annales/Bac-C/2023-physique/')).toBe(true);
  });

  it('accepte un path annale en racine', () => {
    expect(isAnnalePath('annales/Probatoire/2022-svt/')).toBe(true);
  });

  it("refuse un chapitre régulier", () => {
    expect(isAnnalePath('/6e/Mathematiques/chapters/01-nombres/')).toBe(false);
  });

  it('refuse path vide ou null', () => {
    expect(isAnnalePath('')).toBe(false);
    expect(isAnnalePath(null as any)).toBe(false);
  });
});

describe('canAccessContent', () => {
  const FREE_CHAPTER = '/6e/Mathematiques/chapters/01-nombres/file.mp4';
  const PREMIUM_CHAPTER = '/6e/Mathematiques/chapters/02-calcul/file.mp4';
  const ANNALE = '/annales/BEPC/2024-maths/file.pdf';

  it('admin → accès à tout (chapitre 1)', () => {
    expect(canAccessContent({ isPremium: false, role: 'admin' }, FREE_CHAPTER))
      .toEqual({ ok: true, reason: 'admin' });
  });

  it("admin → accès à tout (chapitre Premium)", () => {
    expect(canAccessContent({ isPremium: false, role: 'admin' }, PREMIUM_CHAPTER))
      .toEqual({ ok: true, reason: 'admin' });
  });

  it("admin → accès aux annales", () => {
    expect(canAccessContent({ isPremium: false, role: 'admin' }, ANNALE))
      .toEqual({ ok: true, reason: 'admin' });
  });

  it("user premium → accès à tout", () => {
    expect(canAccessContent({ isPremium: true, role: 'student' }, PREMIUM_CHAPTER))
      .toEqual({ ok: true, reason: 'premium' });
    expect(canAccessContent({ isPremium: true, role: 'student' }, ANNALE))
      .toEqual({ ok: true, reason: 'premium' });
  });

  it("user free → accès au chapitre 1", () => {
    expect(canAccessContent({ isPremium: false, role: 'student' }, FREE_CHAPTER))
      .toEqual({ ok: true, reason: 'free-chapter' });
  });

  it("user free → refus chapitre 2+", () => {
    expect(canAccessContent({ isPremium: false, role: 'student' }, PREMIUM_CHAPTER))
      .toEqual({ ok: false, reason: 'premium-required-content' });
  });

  it("user free → refus annale", () => {
    expect(canAccessContent({ isPremium: false, role: 'student' }, ANNALE))
      .toEqual({ ok: false, reason: 'premium-required-annale' });
  });

  it("affiliate non premium → traité comme student", () => {
    expect(canAccessContent({ isPremium: false, role: 'affiliate' }, PREMIUM_CHAPTER))
      .toEqual({ ok: false, reason: 'premium-required-content' });
  });
});
