# SmartLearn — Design System

> **Source de vérité unique** pour l'identité visuelle et les composants UI de SmartLearn.
> Toute évolution se fait via ce document, jamais en éditant directement les composants.

---

## 1. ADN de marque (5 attributs cardinaux)

| Attribut | Définition opérationnelle |
|---|---|
| **Rigoureux** | Chaque chiffre, chaque promesse est mesurable. Pas de superlatif vide. |
| **Africa-first** | Construit pour Android 7 + 2G en premier, pas adapté ensuite. |
| **Humain** | Salomon FOE, enseignant, est visible. Pas de fondateur anonyme. |
| **Continu** | Le suivi ne s'arrête jamais (6ème → Terminale, parents inclus). |
| **Sobre** | Aucune surenchère visuelle, aucune promesse non tenue. |

## 2. Positionnement

> Pour les familles d'élèves du secondaire en Afrique francophone qui veulent un accompagnement scolaire fiable même sans connexion stable, SmartLearn est la plateforme éducative fédérée qui connecte école, parent et élève en une boucle de suivi continue.

## 3. Architecture de marque

```
                  SMARTLEARN
                  (marque mère)
                        │
              ┌─────────┴─────────┐
              │                   │
      SmartLearn edu      SmartLearn School
        (B2C élèves)        (B2B écoles)
              │                   │
              └────── ↔ ─────────┘
                Bridge pédagogique
```

**Règle critique** : « SmartLearn Unified » est le **nom de l'écosystème** pour la communication institutionnelle (investisseurs, MINESEC, bailleurs). En usage utilisateur, seuls existent **SmartLearn edu** et **SmartLearn School**.

## 4. Tagline / Voice

- **Headline marketing principal** : *« L'école qui suit votre enfant. »*
- **Signature visuelle sous le logo** : *« Connecter · Suivre · Réussir »*
- **Voice** : tu/tutoiement pour les élèves, vous pour les parents et institutionnels.

### Vocabulaire interdit
| Bannir | Utiliser à la place |
|---|---|
| « VIP », « Pass VIP », « Membre VIP » | **Premium**, « Accès Premium », « Membre Premium » |
| « 100% réussite », « +500 élèves » | Chiffres réels et sourcés |
| « Super-app », « Tout-en-un » | « Plateforme éducative fédérée » |

## 5. Logo

### Variantes officielles
- **Logo principal** : monogramme S bicolore + wordmark + tagline
- **Logo compact** : monogramme + wordmark (sans tagline)
- **Logo vertical empilé** : monogramme au-dessus, wordmark en dessous
- **Monogramme bicolore** : S seul (favicon ≥32px, app icon)
- **Monogramme monochrome navy** : S seul plein navy (favicon ≤16px, N&B)
- **Monogramme inversé** : S blanc + teal (sur fond navy)

### Fonds officiels
| Nom | Hex | Usage |
|---|---|---|
| Fond primaire | `#F7F8FA` | Site web, app — fond principal |
| Fond signature | `#0A1628` | Hero sections, documents institutionnels, splash |
| Fond accent | `#EAF3F3` | Sections de respiration, cards apaisées |
| Fond print | `#FFFFFF` | Documents imprimés |

### Règles d'usage du logo
- ✅ Toujours respecter la zone de protection = hauteur du S × 1
- ❌ Ne jamais modifier les proportions
- ❌ Ne jamais inverser navy/teal du monogramme
- ❌ Ne jamais utiliser le logo sur photo sans plaque solide derrière
- ❌ Ne jamais animer le logo (rotation, bounce)
- ❌ Ne jamais utiliser le logo bicolore en taille <24px — passer au monochrome navy

## 6. Couleurs

### Palette principale
| Token | Hex | Variable CSS | Tailwind | Usage |
|---|---|---|---|---|
| **Navy** | `#0A1628` | `--navy` | `bg-navy` `text-navy` | Texte titres, fonds signature, headers |
| **Teal** | `#0FB69C` | `--teal` | `bg-teal` `text-teal` | Mark, badges Premium, indicateurs, liens |
| **Orange** | `#F97316` | `--orange` | `bg-orange` `text-orange` | **CTA primaires uniquement (1 max par écran)** |

### Variantes brand
| Token | Hex | Usage |
|---|---|---|
| Navy deep | `#050D1A` | Hover sur fond navy |
| Teal dark | `#0A8A75` | Hover sur teal |
| Teal light | `#EAF3F3` | Backgrounds doux, cards apaisées |
| Orange dark | `#EA580C` | Hover sur CTA orange |
| Orange light | `#FFB279` | Variantes douces, badges |

### Palette sémantique
| Token | Hex | Usage |
|---|---|---|
| `--success` | `#10B981` | Validation, leçon complétée |
| `--warning` | `#F59E0B` | Expiration proche, solde en attente |
| `--error` | `#EF4444` | Échecs, abonnement expiré |
| `--info` | `#3B82F6` | Tooltips, infobulles |

### Échelle de neutres (slate Tailwind)
`slate-50` → `slate-900` — utiliser systématiquement la slate de Tailwind, jamais des hex custom pour les neutres.

### Accessibilité WCAG
| Combinaison | Ratio | Niveau | Usage texte |
|---|---|---|---|
| Navy sur Blanc | 18.4:1 | AAA | ✅ Tout texte |
| Slate-900 sur Blanc | 17.4:1 | AAA | ✅ Tout texte |
| Slate-600 sur Blanc | 5.7:1 | AA | ✅ Body |
| Teal sur Blanc | 3.2:1 | échec AA texte normal | ⚠️ Uniquement texte ≥18px gras, ou badges/icônes |
| Orange sur Blanc | 3.6:1 | échec AA texte normal | ⚠️ Uniquement boutons avec texte BLANC dessus + ≥14px gras |

**Règle** : pour les CTA orange et badges teal, le texte doit être blanc et le composant entier doit avoir un focus ring visible.

## 7. Typographie

### Famille
- **Body & UI** : `var(--font-geist-sans)` (déjà chargée via Next.js) → fallback Inter, system-ui
- **Headings** : même famille, `letter-spacing: -0.02em`, `font-weight: 700`. Classe utilitaire : `.font-heading`

### Échelle (ratio 1.25)
| Token Tailwind | Taille | Line-height | Usage |
|---|---|---|---|
| `text-6xl` | 60px | 1.1 | Hero homepage display uniquement |
| `text-5xl` | 48px | 1.15 | Titre de page |
| `text-4xl` | 36px | 1.2 | Section principale |
| `text-3xl` | 28px | 1.25 | Sous-section |
| `text-2xl` | 22px | 1.3 | Card title |
| `text-xl` | 20px | 1.5 | Lead paragraph |
| `text-base` | 16px | 1.6 | Body standard |
| `text-sm` | 14px | 1.5 | Légendes |
| `text-xs` | 12px | 1.5 | Métadonnées (toujours en `font-medium` ou `font-semibold` pour lisibilité) |

### Poids autorisés
- 400 Regular — corps
- 500 Medium — labels, navigation
- 600 Semibold — accents body
- 700 Bold — titres
- 800 Extrabold — display hero uniquement

**Interdits** : 300 (trop fragile Android low-DPI), 900, italique sauf citation littérale.

## 8. Espacements, radius, shadows

### Espacement (multiples de 4px)
Tailwind standard : `0.5` `1` `1.5` `2` `3` `4` `5` `6` `8` `10` `12` `16` `20` `24` `32` `40` `48`.

### Radius (tokens custom)
| Token | Valeur | Usage |
|---|---|---|
| `rounded-sm` | 4px | Badges, micro-boutons |
| `rounded-md` | 8px | Inputs, boutons standard |
| `rounded-lg` | 16px | Cards, modales |
| `rounded-xl` | 24px | Cards proéminentes, hero |
| `rounded-2xl` | 32px | Hero cards spéciales |
| `rounded-full` | 9999px | Avatars, pilules |

### Shadows
| Token | Usage |
|---|---|
| `shadow-sm` | Cards passives |
| `shadow-md` | Cards interactives au hover |
| `shadow-lg` | Modales, dropdowns |
| `shadow-xl` | Surfaces flottantes premium |
| `shadow-orange` | **CTA primaires orange uniquement** — signature visuelle |
| `shadow-teal` | Badges Premium, éléments d'accroche teal |

## 9. Composants signatures

### Bouton primaire (CTA d'action)
```tsx
<button className="bg-orange hover:bg-orange-dark text-white font-semibold px-6 py-3 rounded-md shadow-orange transition-all">
  Devenir Premium
</button>
```
**Règle** : 1 seul bouton orange visible par écran. Sinon perte de hiérarchie.

### Bouton secondaire
```tsx
<button className="bg-white hover:bg-slate-50 text-navy font-medium px-6 py-3 rounded-md border border-slate-200 transition-all">
  En savoir plus
</button>
```

### Bouton tertiaire (link-style)
```tsx
<button className="text-teal hover:text-teal-dark font-medium underline underline-offset-2">
  Voir tous les cours
</button>
```

### Card standard
```tsx
<div className="bg-white rounded-lg border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
  ...
</div>
```

### Input standard
```tsx
<input className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal focus:ring-2 focus:ring-teal/20 rounded-md px-4 py-3 text-slate-900 placeholder:text-slate-400 transition-all" />
```

### Badge Premium
```tsx
<span className="inline-flex items-center gap-1 bg-teal/10 text-teal-dark border border-teal/20 text-xs font-semibold px-2 py-1 rounded-full">
  ✦ Premium
</span>
```

## 10. Iconographie

- **Bibliothèque unique** : Lucide React (déjà installé)
- **Stroke** : 1.5px par défaut. Jamais 1px (illisible Android 7), jamais 2px+ (heavy)
- **Tailles autorisées** : `w-4` (16px), `w-5` (20px), `w-6` (24px), `w-8` (32px), `w-12` (48px)
- **Couleurs par défaut** : `text-slate-600` ; `text-navy` en hover ; `text-teal` pour states positifs ; `text-orange` pour actions critiques
- **Interdit** : utiliser des emojis 🎓📚 comme glyphes UI (autorisés en headers marketing uniquement)

## 11. Photographie

- **Sujets** : élèves camerounais réels, enseignants en classe, parents avec téléphone
- **Lumière** : golden hour préférée, naturelle de classe acceptée
- **Action** : candid, jamais posé / sourire forcé
- **Post-prod** : tonalité chaude légère, contraste modéré, **aucun filtre Instagram**
- **Interdit** : stock photo, sourires plaqués, photos posées d'agence
- **RGPD** : décharge écrite signée par les parents pour chaque mineur photographié

## 12. Accessibilité (non-négociable)

- Tous textes critiques en ratio ≥ 4.5:1 (AA) ou ≥ 7:1 (AAA pour MINESEC)
- Tous les `<input>` avec un `<label>` associé ou `aria-label`
- Tous les boutons icône-seule avec `aria-label`
- États focus visibles : `focus:ring-2 focus:ring-teal/40 focus:ring-offset-2`
- Pas de couleur seule pour transmettre l'info (toujours redondé icône OU texte)
- Police minimum 14px (sauf métadonnées 12px en font-semibold)

## 13. Migration progressive depuis le legacy

L'ancienne palette (gold `#E6B956`, navy `#1A3644`) est encore référencée dans certains composants. Migration :

| Ancien | Nouveau | Statut |
|---|---|---|
| `--primary-dark` (#1A3644) | `--navy` (#0A1628) | Alias en place dans globals.css. Les usages basculent automatiquement. |
| `--primary-gold` (#E6B956) | `--teal` (#0FB69C) | Alias en place. Les classes `.text-gold` / `.bg-gold` pointent désormais vers teal. |
| `bg-brand-orange` (#f97316) | `bg-orange` ou inchangé | Alias en place. `bg-brand-orange` continue à fonctionner. |
| Hex hardcodés (`#E6B956`, `#F3D98A`, etc.) | Tokens CSS | À nettoyer fichier par fichier au gré des refactors |

**Stratégie** : ne pas chercher à remplacer tous les hex d'un coup. Les alias garantissent la rétro-compat. Migration nettoyée au fur et à mesure que les composants sont retravaillés.

## 14. Erreurs à éviter (DO NOT)

1. ❌ Modifier les proportions du logo
2. ❌ Inverser navy/teal du monogramme
3. ❌ Utiliser le logo sur photo sans plaque solide derrière
4. ❌ Étirer / compresser le wordmark
5. ❌ Logo en taille <24px sans passer en monochrome
6. ❌ Mélanger orange ET teal dans un même bouton
7. ❌ Utiliser teal pour du texte body (échec WCAG)
8. ❌ Plus d'1 CTA orange par écran
9. ❌ Hex de couleur hardcodés dans les composants (toujours via tokens)
10. ❌ Animer le logo
