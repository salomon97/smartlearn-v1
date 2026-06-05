import { describe, it, expect } from 'vitest';
import { signBunnyUrl } from './bunny-signed-url';

describe('signBunnyUrl', () => {
  const FIXED_NOW = new Date('2026-01-01T00:00:00Z');

  it('retourne l\'URL inchangée si pas de clé (mode legacy)', () => {
    const url = 'https://my.b-cdn.net/path/file.mp4';
    expect(signBunnyUrl(url, undefined)).toBe(url);
    expect(signBunnyUrl(url, null)).toBe(url);
    expect(signBunnyUrl(url, '')).toBe(url);
  });

  it('ajoute token + expires sur une URL Bunny brute', () => {
    const url = 'https://my.b-cdn.net/secret/video.mp4';
    const signed = signBunnyUrl(url, 'test-key-123', 3600, FIXED_NOW);
    const parsed = new URL(signed);

    expect(parsed.searchParams.has('token')).toBe(true);
    expect(parsed.searchParams.has('expires')).toBe(true);

    // Expires = epoch(2026-01-01) + ttl 3600s = 1767225600 + 3600 = 1767229200
    expect(parsed.searchParams.get('expires')).toBe('1767229200');

    // Token doit être base64 URL-safe (pas de +, /, =)
    const token = parsed.searchParams.get('token')!;
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('produit un token déterministe pour des entrées identiques', () => {
    const url = 'https://my.b-cdn.net/x/y.pdf';
    const a = signBunnyUrl(url, 'key', 3600, FIXED_NOW);
    const b = signBunnyUrl(url, 'key', 3600, FIXED_NOW);
    expect(a).toBe(b);
  });

  it('produit un token différent si la clé change', () => {
    const url = 'https://my.b-cdn.net/x/y.pdf';
    const a = signBunnyUrl(url, 'keyA', 3600, FIXED_NOW);
    const b = signBunnyUrl(url, 'keyB', 3600, FIXED_NOW);
    expect(a).not.toBe(b);
  });

  it('produit un token différent si le path change', () => {
    const a = signBunnyUrl('https://my.b-cdn.net/a/file.mp4', 'key', 3600, FIXED_NOW);
    const b = signBunnyUrl('https://my.b-cdn.net/b/file.mp4', 'key', 3600, FIXED_NOW);
    expect(a).not.toBe(b);
  });

  it('retourne l\'URL inchangée si elle est invalide', () => {
    expect(signBunnyUrl('not a url', 'key')).toBe('not a url');
  });
});
