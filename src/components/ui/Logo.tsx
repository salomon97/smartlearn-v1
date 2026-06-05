import React from 'react';
import Image from 'next/image';

/**
 * SmartLearn Logo — composant unique pour toutes les surfaces.
 * Documentation : docs/DESIGN.md §5 (Logo) + docs/brand-assets/ (chartes officielles).
 *
 * Le monogramme utilise le PNG officiel public/brand/logo.png (S plein bicolore
 * navy + teal). Sur fond sombre, un badge blanc cassé respecte la zone de
 * protection définie dans la charte (App icon style).
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
  // Sur fonds sombres (header navy), on enveloppe le PNG bicolore dans un badge
  // blanc cassé pour préserver le contraste — c'est exactement le motif "App icon"
  // de la charte officielle (docs/brand-assets/charte-logo-architecture.jpeg).
  const needsBadge = theme === 'dark' || theme === 'mono-white';
  const innerSize = needsBadge ? Math.round(size * 0.78) : size;

  const img = (
    <Image
      src="/brand/logo.png"
      alt="SmartLearn"
      width={innerSize}
      height={innerSize}
      priority
      style={{ width: innerSize, height: innerSize, objectFit: 'contain' }}
    />
  );

  if (needsBadge) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-2xl bg-[#F7F8FA] shadow-sm"
        style={{ width: size, height: size }}
      >
        {img}
      </span>
    );
  }
  return <span className="inline-flex items-center justify-center">{img}</span>;
}

export function Logo({
  variant = 'compact',
  theme = 'light',
  size = 40,
  className = '',
  showTagline = false,
}: LogoProps) {
  const smartColor = theme === 'dark' || theme === 'mono-white' ? 'text-white' : 'text-navy';
  const learnColor = theme === 'mono-navy' ? 'text-navy' : theme === 'mono-white' ? 'text-white' : 'text-teal';
  const taglineColor = theme === 'dark' || theme === 'mono-white' ? 'text-slate-300' : 'text-slate-500';

  if (variant === 'monogram') {
    return (
      <span className={`inline-flex items-center ${className}`}>
        <Monogram size={size} theme={theme} />
      </span>
    );
  }

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
