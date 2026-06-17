import { describe, it, expect } from 'vitest';
import { isFreeChapterPath, isAnnalePath, canAccessContent, grantTrialIfEligible, TRIAL_DURATION_MS } from './freemium';
import type { TrialEligibleUser } from './freemium';

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

describe('grantTrialIfEligible', () => {
  const baseUser = (): TrialEligibleUser & { isPremium: boolean } => ({
    email: 'eleve@example.com',
    role: 'student' as const,
    isPremium: false,
    premiumUntil: null,
    welcomeTrialGrantedAt: null,
  });

  it("octroi l'essai à un nouveau student éligible", () => {
    const u = baseUser();
    const now = new Date('2026-06-10T10:00:00Z');
    const granted = grantTrialIfEligible(u, now);

    expect(granted).toBe(true);
    expect(u.isPremium).toBe(true);
    expect(u.premiumUntil).toEqual(new Date(now.getTime() + TRIAL_DURATION_MS));
    expect(u.welcomeTrialGrantedAt).toEqual(now);
  });

  it("ne ré-octroie pas si welcomeTrialGrantedAt déjà set (idempotence)", () => {
    const u = baseUser();
    u.welcomeTrialGrantedAt = new Date('2026-01-01T00:00:00Z');
    const granted = grantTrialIfEligible(u, new Date());
    expect(granted).toBe(false);
  });

  it("ne ré-octroie pas si l'user a déjà payé (premiumUntil set)", () => {
    const u = baseUser();
    u.premiumUntil = new Date('2026-12-31T00:00:00Z');
    const granted = grantTrialIfEligible(u, new Date());
    expect(granted).toBe(false);
  });

  it("ne ré-octroie pas si Premium expiré (anti-abus)", () => {
    const u = baseUser();
    u.premiumUntil = new Date('2025-01-01T00:00:00Z'); // past
    const granted = grantTrialIfEligible(u, new Date('2026-06-10T00:00:00Z'));
    expect(granted).toBe(false);
  });

  it("refuse les emails synthétiques", () => {
    const u = baseUser();
    u.email = 'eleve-123@eleve.smartlearn-edu.org';
    const granted = grantTrialIfEligible(u, new Date());
    expect(granted).toBe(false);
  });

  it("refuse les admins", () => {
    const u = baseUser();
    u.role = 'admin';
    const granted = grantTrialIfEligible(u, new Date());
    expect(granted).toBe(false);
  });

  it("accepte les affiliates (parrains) comme les students", () => {
    const u = baseUser();
    u.role = 'affiliate';
    const granted = grantTrialIfEligible(u, new Date('2026-06-10T00:00:00Z'));
    expect(granted).toBe(true);
  });

  it("ne mute pas isPremium quand le refus", () => {
    const u = baseUser();
    u.welcomeTrialGrantedAt = new Date('2026-01-01T00:00:00Z');
    grantTrialIfEligible(u, new Date());
    expect(u.isPremium).toBe(false);  // pas touché
    expect(u.premiumUntil).toBe(null);  // pas touché
  });
});
