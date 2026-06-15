import { describe, it, expect } from 'vitest';
import { isFreeChapterPath, isAnnalePath } from './freemium';

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
