import crypto from 'crypto';

/**
 * Génération d'URLs signées pour Bunny.net CDN (Token Authentication).
 *
 * Doc Bunny : https://docs.bunny.net/docs/cdn-token-authentication
 *
 * Comment ça marche :
 *   - L'admin active "Token Authentication" sur la Pull Zone Bunny côté dashboard
 *   - On configure un BUNNY_TOKEN_AUTH_KEY (la même clé que côté Bunny)
 *   - Pour chaque URL servie au client, on génère un hash SHA-256 + base64
 *   - Bunny refuse les requêtes sans token valide ou expirées
 *
 * Sans BUNNY_TOKEN_AUTH_KEY configuré, la fonction retourne l'URL inchangée
 * (mode dégradé compatible avec le comportement actuel — les vidéos restent
 * accessibles, mais sans protection signature).
 *
 * Activation côté Bunny.net (à faire manuellement par l'admin) :
 *   1. Bunny dashboard → Pull Zone → ta zone → Security
 *   2. "URL Tokens" → enable
 *   3. Copier la "Security Key" générée → la coller dans la var
 *      BUNNY_TOKEN_AUTH_KEY côté Vercel
 *   4. Redéployer
 *
 * Pour Bunny Stream (vidéos library), la même mécanique s'applique mais la
 * Security Key est sur Library Settings → Security → "Player Security Key".
 */

const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 heure de validité

/**
 * Signe une URL Bunny.net avec token + expiration.
 * Si la clé de signature n'est pas configurée, retourne l'URL inchangée
 * (mode legacy, à activer progressivement).
 *
 * @param rawUrl URL Bunny brute, ex. https://my.b-cdn.net/path/file.mp4
 * @param securityKey Clé de signature (BUNNY_TOKEN_AUTH_KEY)
 * @param ttlSec Durée de validité en secondes (défaut 1h)
 * @returns URL signée OU URL brute si pas de clé
 */
export function signBunnyUrl(
  rawUrl: string,
  securityKey: string | undefined | null,
  ttlSec: number = SIGNED_URL_TTL_SECONDS,
  now: Date = new Date(),
): string {
  if (!securityKey) return rawUrl;

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return rawUrl; // URL invalide → on retourne tel quel
  }

  const expires = Math.floor(now.getTime() / 1000) + ttlSec;
  const pathOnly = parsed.pathname;

  // Format Bunny : sha256(security_key + signed_path + expires) → base64url-safe
  const raw = `${securityKey}${pathOnly}${expires}`;
  const hash = crypto.createHash('sha256').update(raw).digest('base64');
  // Bunny veut un format base64 URL-safe : remplace +/= par -_ et retire les =
  const token = hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  parsed.searchParams.set('token', token);
  parsed.searchParams.set('expires', String(expires));
  return parsed.toString();
}
