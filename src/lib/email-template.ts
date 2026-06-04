/**
 * Layout email partagé SmartLearn — utilisé par tous les emails transactionnels.
 *
 * Le rendu HTML email est restrictif (pas de <link>, pas de styles inline-modernes,
 * compatibilité Gmail/Outlook). On utilise donc des couleurs HEX littérales et des
 * styles inline. Les tokens sont synchronisés avec docs/DESIGN.md.
 *
 * Couleurs (synchro avec globals.css) :
 *   --navy   : #0A1628
 *   --teal   : #0FB69C
 *   --orange : #F97316
 */

const NAVY = '#0A1628';
const TEAL = '#0FB69C';
const ORANGE = '#F97316';
const SLATE_50 = '#F8FAFC';
const SLATE_500 = '#64748B';
const SLATE_700 = '#334155';

interface EmailLayoutOptions {
  /** Titre principal du bloc body (ex. "Vérification de votre compte"). */
  title: string;
  /** Contenu HTML du body (déjà mis en forme). */
  bodyHtml: string;
  /** Couleur accent pour la barre d'entête : 'teal' (par défaut) | 'orange' (admin/alertes). */
  accent?: 'teal' | 'orange';
  /** Footer minimaliste si true (pour emails très transactionnels). */
  minimalFooter?: boolean;
}

/**
 * Génère le HTML complet d'un email SmartLearn, prêt à être passé à nodemailer.
 */
export function renderEmailLayout({
  title,
  bodyHtml,
  accent = 'teal',
  minimalFooter = false,
}: EmailLayoutOptions): string {
  const accentColor = accent === 'orange' ? ORANGE : TEAL;
  const year = new Date().getFullYear();

  // Monogramme S en SVG inline (placeholder identique au composant Logo.tsx).
  // SVG est généralement bien rendu par Gmail/Outlook quand inliné.
  const monogramSvg = `
    <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;">
      <defs>
        <linearGradient id="m" x1="0" y1="0" x2="0" y2="1">
          <stop offset="49.9%" stop-color="#FFFFFF" />
          <stop offset="50.1%" stop-color="${TEAL}" />
        </linearGradient>
      </defs>
      <path d="M 78,28 C 78,12 65,5 50,5 C 30,5 18,16 18,32 C 18,52 82,48 82,68 C 82,84 65,95 50,95 C 30,95 18,84 18,68"
        stroke="url(#m)" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;

  const footerHtml = minimalFooter
    ? `
      <div style="background-color:${SLATE_50}; padding:16px 24px; text-align:center; color:${SLATE_500}; font-size:12px; line-height:1.5;">
        © ${year} SmartLearn — Douala, Cameroun
      </div>
    `
    : `
      <div style="background-color:${SLATE_50}; padding:24px; text-align:center; color:${SLATE_500}; font-size:12px; line-height:1.6;">
        <p style="margin:0 0 8px 0; color:${SLATE_700}; font-weight:600;">SmartLearn — L'école qui suit votre enfant.</p>
        <p style="margin:0 0 6px 0;">Douala, Cameroun · +237 671 71 91 24 / +237 691 27 63 34</p>
        <p style="margin:0 0 12px 0;">
          <a href="mailto:salomonfoe97@smartlearn-edu.org" style="color:${TEAL}; text-decoration:none;">salomonfoe97@smartlearn-edu.org</a>
        </p>
        <p style="margin:0; color:${SLATE_500};">© ${year} SmartLearn. Tous droits réservés.</p>
      </div>
    `;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0; padding:0; background-color:${SLATE_50}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
  <div style="max-width:600px; margin:0 auto; padding:32px 16px;">
    <div style="background-color:#FFFFFF; border:1px solid #E2E8F0; border-radius:16px; overflow:hidden; box-shadow:0 1px 3px rgba(10,22,40,0.04);">

      <!-- Bandeau navy + monogramme + barre accent -->
      <div style="background-color:${NAVY}; padding:28px 32px; text-align:center;">
        <div style="margin-bottom:8px;">${monogramSvg}</div>
        <h1 style="color:#FFFFFF; margin:0; font-size:20px; font-weight:700; letter-spacing:-0.01em;">
          Smart<span style="color:${TEAL};">Learn</span>
        </h1>
        <p style="color:#94A3B8; margin:6px 0 0 0; font-size:11px; letter-spacing:0.15em; text-transform:uppercase;">
          Connecter · Suivre · Réussir
        </p>
      </div>

      <!-- Barre accent (4px) -->
      <div style="height:4px; background-color:${accentColor};"></div>

      <!-- Body -->
      <div style="padding:32px; background-color:#FFFFFF;">
        <h2 style="color:${NAVY}; margin:0 0 16px 0; font-size:20px; font-weight:700;">${title}</h2>
        ${bodyHtml}
      </div>

      ${footerHtml}
    </div>
  </div>
</body>
</html>
`.trim();
}

/**
 * Helper pour rendre un bloc OTP/code stylisé (encadré teal).
 */
export function renderOtpBlock(code: string): string {
  return `
    <div style="background-color:#F0FDFA; border:1px solid #99F6E4; padding:20px; border-radius:12px; text-align:center; margin:24px 0;">
      <span style="font-size:32px; font-weight:700; letter-spacing:8px; color:${NAVY}; font-family:'Courier New', monospace;">${code}</span>
    </div>
  `;
}

/**
 * Helper pour rendre un bouton CTA primaire (orange).
 */
export function renderPrimaryButton(label: string, href: string): string {
  return `
    <div style="text-align:center; margin:28px 0;">
      <a href="${href}" style="display:inline-block; background-color:${ORANGE}; color:#FFFFFF; padding:14px 32px; text-decoration:none; border-radius:9999px; font-weight:600; font-size:15px;">
        ${label}
      </a>
    </div>
  `;
}
