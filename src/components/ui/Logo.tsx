import React from 'react';

/**
 * SmartLearn Logo — composant unique pour toutes les surfaces.
 * Documentation : docs/DESIGN.md §5 (Logo).
 *
 * ⚠️ PLACEHOLDER : le monogramme S est une approximation SVG (stroke bicolore
 * navy→teal). Pour utiliser le SVG officiel du designer :
 *   1. Récupérer le fichier .svg fourni par l'agence
 *   2. Remplacer le contenu de <Monogram /> ci-dessous par les paths officiels
 *   3. Garder l'interface des props inchangée — toute l'app continuera de marcher
 */

export type LogoVariant = 'full' | 'compact' | 'monogram';
export type LogoTheme = 'light' | 'dark' | 'mono-navy' | 'mono-white';

export interface LogoProps {
  variant?: LogoVariant;
  theme?: LogoTheme;
  /** Taille du monogramme en pixels (carré). Le wordmark s'aligne automatiquement. */
  size?: number;
  className?: string;
  /** Force l'affichage de la tagline même en variant compact. */
  showTagline?: boolean;
}

function Monogram({ size, theme }: { size: number; theme: LogoTheme }) {
  // Couleurs selon le thème
  let topColor = '#0A1628';
  let bottomColor = '#0FB69C';
  if (theme === 'dark') {
    // Fond sombre : haut blanc, bas teal
    topColor = '#FFFFFF';
    bottomColor = '#0FB69C';
  } else if (theme === 'mono-navy') {
    topColor = bottomColor = '#0A1628';
  } else if (theme === 'mono-white') {
    topColor = bottomColor = '#FFFFFF';
  }

  // ID de gradient stable pour éviter les conflits SSR
  const id = `sl-mono-${theme}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="SmartLearn"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="49.9%" stopColor={topColor} />
          <stop offset="50.1%" stopColor={bottomColor} />
        </linearGradient>
      </defs>
      {/* S monogramme (placeholder). Stroke bicolore via gradient vertical. */}
      <path
        d="M 78,28 C 78,12 65,5 50,5 C 30,5 18,16 18,32 C 18,52 82,48 82,68 C 82,84 65,95 50,95 C 30,95 18,84 18,68"
        stroke={`url(#${id})`}
        strokeWidth="16"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({
  variant = 'compact',
  theme = 'light',
  size = 40,
  className = '',
  showTagline = false,
}: LogoProps) {
  // Couleurs du wordmark selon le thème
  const smartColor = theme === 'dark' || theme === 'mono-white' ? 'text-white' : 'text-navy';
  const learnColor = theme === 'mono-navy' ? 'text-navy' : theme === 'mono-white' ? 'text-white' : 'text-teal';
  const taglineColor = theme === 'dark' || theme === 'mono-white' ? 'text-slate-300' : 'text-slate-500';

  // Variant monogram = monogramme seul
  if (variant === 'monogram') {
    return (
      <span className={`inline-flex items-center ${className}`}>
        <Monogram size={size} theme={theme} />
      </span>
    );
  }

  // Variant full ou compact = monogramme + wordmark
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Monogram size={size} theme={theme} />
      <span className="inline-flex flex-col leading-none">
        <span className="font-heading text-2xl font-bold leading-none tracking-tight">
          <span className={smartColor}>Smart</span>
          <span className={learnColor}>Learn</span>
        </span>
        {(variant === 'full' || showTagline) && (
          <span className={`text-[10px] mt-1 tracking-wide ${taglineColor}`}>
            Connecter <span className="text-teal mx-0.5">·</span> Suivre{' '}
            <span className="text-teal mx-0.5">·</span> Réussir
          </span>
        )}
      </span>
    </span>
  );
}
