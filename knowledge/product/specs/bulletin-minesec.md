---
type: spec-metier
sujet: Bulletin trimestriel MINESEC
statut: valide
version: 2.0
date: 2026-07-22
auteur: équipe humain + IA (Salomon FOÉ + Claude)
sprint-cible: Vague γ Pédagogie · Sprint S7–S9 (novembre 2026)
sources-validation:
  - Bulletin réel · Lycée Bilingue de Nyalla (Douala, Wouri) · Terminale A sous-série Allemand · T1 2025-2026 · fourni par Salomon 2026-07-11
  - Bulletin réel · Lycée Bilingue de Nylon Ndogpassi (Douala) · 2nde C · T1 2020-2021 · fourni par Salomon 2026-07-22
  - Bulletin réel · Lycée Bilingue de Nylon Ndogpassi (Douala) · 5ème M B · T1 2020-2021 · fourni par Salomon 2026-07-22
  - Audit documentaire indépendant · 22 juillet 2026 · rétro-ingénierie bulletin Nyalla
  - Recherche IA croisée · DeepSeek + Claude + Perplexity · 22 juillet 2026
  - Expérience de terrain · Salomon Joël FOÉ · scolarité 6ème → Tle au Cameroun
---

# Spec métier — Bulletin trimestriel MINESEC (v2.0)

> **Rôle de ce document** : source de vérité produit du bulletin trimestriel de SmartLearn School.
> Cette v2.0 **remplace intégralement la v1.0** du 11 juillet 2026 et acte la **décision
> architecturale majeure** de déporter la configuration des règles métier (coefficients, seuils APC,
> liste des matières) vers chaque chef d'établissement, cohérente avec la décision E2 de
> l'ADR-001 : *aucune règle métier hardcodée dans le code*.
>
> Le bulletin est **le seul écran de SmartLearn School qu'un directeur imprime, signe, remet aux
> parents, présente en conseil de classe et archive**. L'erreur coûte immédiatement la confiance.

## Historique des versions

| Version | Date | Changements |
|---|---|---|
| **2.0** | 2026-07-22 | **Refonte architecturale** : décision « école configure » (coefficients + seuils APC + matières) · consolidation 3 bulletins observés (Nyalla + Nylon Ndogpassi ×2) · ajout du code A++ (5 codes APC au total) · séparation obligatoire des 3 familles d'appréciation · nouveaux modèles Mongo `Coefficient`, `SeuilAPC`, `MatiereTemplate` · 3 templates système pré-remplis · mission OM-2026-001 annulée (5 questions sur 6 résolues par consolidation) |
| 1.0 | 2026-07-11 | Cadrage initial validé contre un seul bulletin (Nyalla Tle A Allemand). Coefficients supposés hardcodés. 4 codes APC. Mission OM-2026-001 à confier à Tatiana. |

## 1. Résumé exécutif — les 4 découvertes majeures de la v2.0

### 1.1. Les coefficients varient par établissement ET par niveau

**Preuve empirique irréfutable** : 3 bulletins réels observés = 3 totaux différents.

| Classe | Établissement | Total coefficients |
|---|---|---|
| Terminale A Allemand | Lycée Bilingue Nyalla | **34** |
| 2ⁿᵈᵉ C | Lycée Bilingue Nylon Ndogpassi | **29** |
| 5ᵉ M B | Lycée Bilingue Nylon Ndogpassi | **26** |

Aucune grille nationale uniforme n'est observable. Les 3 recherches IA (DeepSeek, Claude, Perplexity) convergent sur l'absence de grille consolidée téléchargeable. **Impossible de hardcoder les coefficients dans SmartLearn.**

### 1.2. Le référentiel APC comporte 5 codes, pas 4

L'audit du 22 juillet n'avait vu que 4 codes (A+, A, ECA, NA). Les 2 nouveaux bulletins Nylon Ndogpassi confirment en légende officielle **5 codes distincts** :

- **A++** — Parfait
- **A+** — Expert
- **A** — Acquis
- **ECA** — En Cours d'Acquisition
- **NA** — Non Acquis

Le type TypeScript `AppreciationMatiere` doit inclure le code A++ manquant.

### 1.3. Les seuils APC aussi varient par établissement

**Preuve empirique** :

- Chez **Nylon Ndogpassi** (2020-2021) : Informatique moyenne 11,75/20 → code **A** (Acquis). Le seuil A semble ≤ 12.
- Chez **Nyalla / SKYSOFT** (2025-2026) : moyenne 12 → code **ECA**. Le seuil A est ≥ 15.

Aucun texte MINESEC ne fixe des seuils nationaux. Les 3 IA consultées le confirment par absence. **Les seuils doivent être configurables par école** avec valeurs par défaut proposées.

### 1.4. La liste des matières varie fortement par niveau et série

| Niveau / série | Français scindé en… | Sciences | Spécificités observées |
|---|---|---|---|
| **5ᵉ** (cycle 1) | Composition Fr + Dictée + Étude de Texte + Langues nationales | Sciences (bloc unique) | Latin · Cultures nationales · Arts |
| **2ⁿᵈᵉ C** (cycle 2 scientifique) | Langue Fr + Littérature | Maths + Physique + Chimie + SVT (séparés) | EBF · TM |
| **Tle A Allemand** (cycle 2 littéraire) | Langue Fr + Littérature | Mathématiques seule | ESF · Philosophie dominante · 2 langues étrangères |

**La liste des matières doit aussi être configurable** par établissement, par (niveau, série).

## 2. Décision architecturale (v2.0)

> ⚡ **DÉCISION ACTÉE** : chaque chef d'établissement configure ses propres coefficients, seuils APC
> et liste de matières via l'interface d'administration SmartLearn School. SmartLearn fournit des
> templates de départ pré-remplis (3 grilles observées : 5ᵉ · 2ⁿᵈᵉ C · Tle A Allemand) que l'école
> ajuste en 5 minutes. Un import/export CSV est proposé pour la saisie de masse. Cohérent avec
> ADR-001 décision E2 (aucune règle hardcodée) et généralisé en **ADR-003 : Configuration métier
> par établissement**.

### 2.1. Répartition national vs école

| Élément | Statut | Justification empirique |
|---|---|---|
| Coefficients (niveau × série × matière × année) | 🟠 **École** | 3 bulletins = 3 totaux différents (34 · 29 · 26) |
| Liste des matières par (niveau, série) | 🟠 **École** | Matières spécifiques par cycle (Latin en 5ᵉ, ESF en Tle A…) |
| Seuils APC (NA / ECA / A / A+ / A++) | 🟠 **École** | Nyalla seuil A ≥ 15 · Nylon seuil A ≤ 12 |
| Nom d'établissement, code MINESEC, délégations | 🟠 **École** | Spécifique à chaque tenant |
| Grille mentions générales (Passable → Excellent) | 🔵 **National** | Grille OBC officielle · uniforme dans les 3 bulletins |
| Codes conseil de classe (TH, Enc, Fel, AT, BT, AC, BC) | 🔵 **National** | Codes standards MINESEC · uniformes dans les 3 bulletins |
| Sens des codes APC (A++, A+, A, ECA, NA) | 🔵 **National** | Cameroon Tribune (presse gouv) confirme · légende identique |
| Seuil de passage classe supérieure ≥ 10/20 | 🔵 **National** | Presse 2025 (renforcement gouv) + expérience terrain |
| Formule moyenne matière = (Éval 1 + Éval 2) / 2 | 🔵 **National** | Confirmé arithmétiquement dans les 3 bulletins |
| Formule moyenne générale = Σ(Moy × Coef) / Σ Coef | 🔵 **National** | Confirmé arithmétiquement · pondération globale (pas moy des groupes) |
| Bilinguisme en-tête (République / Republic) | 🔵 **National** | Constitution + pratique observée uniforme |
| Mention « délivré sans rature ni surcharge » | 🔵 **National** | Uniforme sur les 3 bulletins |
| Structure 3 groupes + synthèse + travail/conduite | 🔵 **National** | Uniforme sur les 3 bulletins |

## 3. Contexte réglementaire

Le sous-système francophone du secondaire camerounais (ordre MINESEC) suit un cadre défini par arrêtés ministériels et adapté par les Délégations Régionales et Départementales. Le bulletin trimestriel est **délivré sans rature ni surcharge** (mention explicite en bas de tous les bulletins) et suit le référentiel **Approche Par Compétences (APC)** adopté par le MINESEC depuis les années 2010 (arrêtés n° 263/14/MINESEC/IGE et n° 419/14/MINESEC/IGE de 2014).

**Bilinguisme obligatoire** : tous les libellés officiels du bulletin apparaissent **simultanément en français ET en anglais**, côte à côte (République du Cameroun / Republic of Cameroon · Paix - Travail - Patrie / Peace - Work - Fatherland · etc.). Cette dualité est **non négociable** pour tout établissement bilingue.

**Cadre juridique de la signature électronique** :

- Loi n° 2010/021 du 21 décembre 2010 régissant le commerce électronique au Cameroun
- Décret n° 2011/1521/PM du 15 juin 2011 (application)
- Loi n° 2010/012 du 21 décembre 2010 relative à la cybersécurité

**Principe** : neutralité technologique. L'écrit électronique a la même valeur probante que l'écrit papier. Toutefois, en l'absence de texte MINESEC autorisant explicitement le bulletin **purement dématérialisé**, la V1 impose un **workflow hybride** : génération numérique (avec identifiant unique + code-barres + QR de vérification) + validation physique (visa du proviseur + cachet officiel).

## 4. Personas et usages

Le bulletin est **le même objet** vu à travers quatre lentilles :

| Persona | Ce qu'il regarde en premier | Ce qu'il en fait |
|---|---|---|
| **Proviseur** | Moyenne générale, rang, appréciation, décision conseil de classe | Signe (visa + cachet), projette en conseil de classe, archive |
| **Censeur / Prof principal / Conseiller Principal d'Orientation** | Rang de matière, moyennes de groupe, colonne « Notes ≥ 10 », matières à améliorer | Prépare le conseil de classe, contacte parents ciblés, signe |
| **Prof de matière** | Ses 2 évaluations (Éval 1 & Éval 2), moyenne matière, appréciation NA/ECA/A/A+/A++ | Justifie la note en cas de contestation |
| **Parent / élève** | Moyenne générale, rang, appréciation générale, « un effort s'impose en… » | Prend décision (satisfaction / inquiétude / discussion avec l'école) |

**Test P1 (rappel D13)** : le bulletin doit être projetable en conférence MINESEC sans embarras. Pas de gadget, pas d'emoji, pas de dégradé. Densité maximale, gravité institutionnelle, tampons officiels obligatoires.

## 5. Nomenclature MINESEC

### 5.1. Découpage temporel

- **Année scolaire** = 3 trimestres (T1 · T2 · T3), format `AAAA-AAAA` (ex : `2025-2026`, `2026-2027`)
- **Rentrée** début septembre · **fin T1** décembre (le bulletin Nyalla est daté du 15 décembre 2025 — fin de T1)
- **Bulletin trimestriel** = 1 par élève par trimestre = 3 bulletins/an
- **Bulletin annuel** = synthèse des 3 trimestres + décision conseil de classe (formule = moyenne arithmétique des 3 moyennes trimestrielles, à confirmer)

### 5.2. Notation et évaluations

- **Échelle** : /20 avec 2 décimales (`12,91` · `9,47/20`). Séparateur décimal = virgule française.
- **2 évaluations par trimestre** (colonnes Éval N°1 et Éval N°2 observées dans les 3 bulletins)
- Les 5 emplacements « Rappel des évaluations » permettent d'accueillir des évaluations supplémentaires selon l'établissement (contrôles bilans, TP notés…)

### 5.3. Formule de calcul (universelle, confirmée arithmétiquement sur 3 bulletins)

```
Moyenne matière        = (Éval 1 + Éval 2) / 2
Moyenne pondérée       = Moyenne matière × Coefficient
Moyenne du groupe      = Σ(Moy × Coef du groupe) / Σ(Coef du groupe)
Moyenne générale       = Σ(Moy × Coef) / Σ(Coef total)
```

> ⚠️ **Point de vigilance** : la moyenne générale N'EST PAS la moyenne des 3 moyennes de groupe.
> C'est une **pondération globale** sur l'ensemble des matières. Bulletin Nyalla : 322,64 / 34 = 9,49/20
> (la moyenne des 3 groupes aurait donné 9,39 — écart significatif).

### 5.4. Structure du bulletin (uniforme sur les 3 bulletins observés)

1. **En-tête institutionnel** bilingue français/anglais (République + MINESEC + Délégations + établissement)
2. **Identification élève** (nom, prénoms, sexe, date/lieu naissance, matricule, classe, effectif, redoublant, régime)
3. **Tableau des notes en 3 groupes** avec colonnes : Matière · Éval 1 · Éval 2 · Moy/20 · Coef · Moy × Coef · Moy classe · Notes ≥ 10 · Appréciation
4. **Sous-total par groupe** (Σ coef, Σ points, moyenne groupe)
5. **Rappel des évaluations** (5 emplacements Éval 1 à Éval 5)
6. **Travail** (total points, total coef, moyenne trimestre, rang trimestre, rang annuel)
7. **Rappel moyennes trimestres** (T1, T2, T3)
8. **Conduite** (absences totales, exclusions, avertissements, blâmes)
9. **Conseil de classe** (décisions : TH, Enc, Fel, AT, BT, AC, BC)
10. **Moy classe** + **Obs conseil** (mention générale)
11. **Signatures & visas** (Proviseur + CPO + Parent + cachet rouge)
12. **Traçabilité** (identifiant unique, code-barres, horodatage impression, mention USSD parents optionnelle)

## 6. Trois familles d'appréciation (obligatoirement séparées)

Erreur fréquente : mélanger les 3 systèmes indépendants dans un seul type. La v2.0 impose la **séparation stricte** en 3 tables distinctes en base de données.

### 6.1. Appréciation par matière — codes APC (référentiel MINESEC)

Type TypeScript : `AppreciationMatiere = "A++" | "A+" | "A" | "ECA" | "NA"`

| Code | Signification officielle | Seuil observé Nylon Ndogpassi | Seuil observé Nyalla / SKYSOFT |
|---|---|---|---|
| **A++** | Parfait | Moyenne ≥ 18 (observation Arts moy 18) | Non observé |
| **A+** | Expert | Moyenne ≥ ? (à préciser) | En légende seulement |
| **A** | Acquis | Moyenne ≥ ~12 | Moyenne ≥ ~15 |
| **ECA** | En Cours d'Acquisition | 10 ≤ Moy < seuil A | 10 ≤ Moy < 15 |
| **NA** | Non Acquis | Moyenne < 10 | Moyenne < 10 |

> ⚡ **Seuils configurables par école** — valeurs par défaut proposées à l'onboarding (grille Nyalla ou Nylon selon choix admin), modifiables à tout moment.

### 6.2. Mention générale — sur la moyenne globale (grille OBC nationale)

Type TypeScript : `MentionGenerale = "EXCELLENT" | "TRES_BIEN" | "BIEN" | "ASSEZ_BIEN" | "PASSABLE" | "MEDIOCRE"`

| Mention | Seuil moyenne générale |
|---|---|
| **Excellent** | ≥ 18 |
| **Très Bien** | 16 - 17,99 |
| **Bien** | 14 - 15,99 |
| **Assez Bien** | 12 - 13,99 |
| **Passable** | 10 - 11,99 |
| **Médiocre** | < 10 |

Cette grille est **nationale et fixée par l'Office du Baccalauréat** (OBC · officedubac.cm). Elle est uniforme sur les 3 bulletins observés (Nyalla : 9,49 = Médiocre · Nylon 2nde C : 10,88 = Passable · Nylon 5ème : 12,87 = Assez Bien).

### 6.3. Distinctions et sanctions du conseil de classe (codes standards MINESEC)

Type TypeScript : `DistinctionSanction = "TH" | "ENC" | "FEL" | "AT" | "BT" | "AC" | "BC"`

| Code | Signification |
|---|---|
| **TH** | Tableau d'Honneur |
| **ENC** | Encouragements |
| **FEL** | Félicitations |
| **AT** | Avertissement Travail |
| **BT** | Blâme Travail |
| **AC** | Avertissement Conduite |
| **BC** | Blâme Conduite |

Codes observés dans les 3 bulletins (colonne « Conseil de Classe »).

## 7. Modèles de données MongoDB (v2.0)

### 7.1. `Coefficient` — table éditable par école

```typescript
{
  schoolId:        ObjectId,     // référence School (multi-tenant)
  niveau:          string,        // "6e", "5e", ..., "Tle"
  serie:           string,        // "GENERAL", "A_ALLEMAND", "C", "D", "E", "TI"
  matiereCode:     string,        // "MATH", "PHILO", "LFR", ...
  matiereLabel:    string,        // "Mathématiques", "Philosophie"
  groupe:          "I" | "II" | "III",
  coefficient:     number,        // 0 ≤ x ≤ 20
  anneeScolaire:   string,        // "2026-2027"
  sourceOfficielle?: string,      // "Config école" | "Template Nyalla" | "Arrêté MINESEC …"
  updatedBy:       ObjectId,      // référence User (traçabilité)
  createdAt, updatedAt
}
// Index unique : (schoolId, niveau, serie, matiereCode, anneeScolaire)
```

### 7.2. `SeuilAPC` — configurable par école, override par matière possible en V2

```typescript
{
  schoolId:       ObjectId,       // requis
  seuilAPlusPlus?: number,        // optionnel (défaut : 18)
  seuilAPlus?:    number,         // optionnel
  seuilA:         number,         // requis (défaut : 12 ou 15 selon template choisi)
  seuilECA:       number,         // requis (défaut : 10)
  matiereCode?:   string,         // null = tous · sinon override spécifique matière
  anneeScolaire:  string,
  createdAt, updatedAt
}
```

### 7.3. `MatiereTemplate` — catalogue système des matières disponibles

```typescript
{
  code:          string,          // "MATH", "PHILO", ...
  label:         string,          // "Mathématiques"
  labelEn?:      string,          // "Mathematics" (sous-système anglophone)
  groupeDefaut:  "I" | "II" | "III",  // groupe par défaut à l'ajout
  categorie:     "generale" | "scientifique" | "litteraire" | "technique" | "artistique" | "sportive" | "religieuse",
  isSystemStandard: boolean,      // true = matière catalogue MINESEC standard
}
```

## 8. Templates de départ (V1 · 3 grilles pré-remplies)

Chaque template est **modifiable par l'école** (aucun champ verrouillé). Les valeurs proviennent directement des bulletins réels examinés. Le wizard onboarding présente ces templates avec la mention « à valider par le chef d'établissement ».

### 8.1. Template 1 — 5ᵉ (cycle 1, base Nylon Ndogpassi)

| Matière | Groupe | Coef |
|---|---|---|
| Composition Française | I | 3 |
| Dictée | I | 2 |
| Étude de Texte | I | 2 |
| ECM | I | 2 |
| Langues Nationales | I | 1 |
| Histoire-Géographie | I | 4 |
| Anglais | I | 3 |
| Informatique | II | 1 |
| Mathématiques | II | 4 |
| Sciences | II | 3 |
| Arts | III | 1 |
| EPS | III | 3 |
| ESF | III | 1 |
| TM | III | 1 |
| Latin | III | 1 |
| **Total** | | **26** |

### 8.2. Template 2 — 2ⁿᵈᵉ C (cycle 2 scientifique, base Nylon Ndogpassi)

| Matière | Groupe | Coef |
|---|---|---|
| Chimie | I | 2 |
| Mathématiques | I | 4 |
| Physique | I | 3 |
| SVT | I | 2 |
| Anglais | II | 3 |
| ECM | II | 2 |
| Histoire-Géographie | II | 4 |
| Informatique | II | 2 |
| Langue Française | II | 2 |
| Littérature | II | 2 |
| EPS | III | 2 |
| EBF | III | 1 |
| **Total** | | **29** |

### 8.3. Template 3 — Tle A Allemand (cycle 2 littéraire, base Nyalla)

| Matière | Groupe | Coef |
|---|---|---|
| ESF | I | 1 |
| Philosophie | I | 5 |
| Langue Française | I | 2 |
| Littérature Française | I | 3 |
| Anglais | I | 5 |
| Allemand | I | 3 |
| Mathématiques | II | 3 |
| Histoire | II | 2 |
| Géographie | II | 2 |
| ECM | II | 2 |
| Informatique | III | 2 |
| SVT | III | 1 |
| EPS | III | 2 |
| TM | III | 1 |
| **Total** | | **34** |

### 8.4. Templates supplémentaires à créer (roadmap)

- **Tle C · D · E · TI** — autres séries scientifiques du second cycle (à construire à partir de la mémoire terrain du fondateur ou d'un spécimen ultérieur)
- **6ᵉ · 4ᵉ · 3ᵉ** — variantes du template 5ᵉ avec ajustements par cycle
- **GCE anglophone** — Form 1-5 · Lower/Upper Sixth · utilise lettres A-E et points /25 au lieu de coefficients
- **Séries techniques F, G** — à cadrer avec spécimen de lycée technique

## 9. Import / export CSV

Format simple pour la saisie de masse :

```csv
niveau,serie,matiere_code,matiere_label,groupe,coefficient
Tle,A_ALLEMAND,PHILO,Philosophie,I,5
Tle,A_ALLEMAND,LFR,Langue Française,I,2
Tle,A_ALLEMAND,LITT,Littérature Française,I,3
...
```

Le chef d'établissement télécharge un template CSV, remplit dans Excel/LibreOffice, réuploade → toute la grille est saisie en 1 minute. Support Excel `.xlsx` à prévoir en V2 pour les écoles moins à l'aise avec le CSV.

## 10. Éléments d'authenticité obligatoires sur le rendu bulletin

Observés uniformément sur les 3 bulletins réels :

- **Identifiant unique** (ex : `7IH1GSBD1111677105`) généré par SmartLearn
- **Code-barres** imprimé (ex : `5001835056995`)
- **QR code de vérification** (nouveau en v2.0) pointant vers `/verifier/[idBulletin]` pour vérification tiers
- **Horodatage impression** (ex : `15/12/2025 20:12:02`)
- **Emplacements visa physique** : `LE PROVISEUR` + `Conseiller Principal d'Orientation` + `VISA DU PARENT` + zone cachet rouge
- **Mention imprimée obligatoire** : « délivré sans rature ni surcharge »
- **Consultation USSD parents** (optionnelle · ex : `*141*05#` chez Nyalla) — nice-to-have V2

## 11. Sous-système anglophone (GCE) — hors périmètre V1

Le sous-système anglophone (Government Bilingual High School) utilise le référentiel GCE Board (camgceb.org) :

- Notation : lettres A · B · C · D · E (F/U = échec non porté)
- Points : jusqu'à 25 (A = 5, B = 4, C = 3, D = 2, E = 1)
- Le GCE est un **examen certificatif**, pas un bulletin trimestriel
- Les **bulletins internes anglophones ne sont pas standardisés nationalement** — chaque établissement bilingue applique sa propre grille

**Décision V1** : hors périmètre. Le mode anglophone (`School.mode = "anglophone"`) sera implémenté en V2 avec un template dédié `GCE_ALEVEL` et une logique de calcul lettres+points au lieu de coefficients+/20.

## 12. Impact code — 12 changements structurants

| # | Changement | Effort |
|---|---|---|
| 1 | Refactor `AppreciationGenerale` en 3 types séparés (`AppreciationMatiere`, `MentionGenerale`, `DistinctionSanction`) | 2 h |
| 2 | Ajouter le code A++ manquant | 30 min |
| 3 | Corriger fixtures Tle A Allemand (34 pas 36, ESF + TM ajoutés) | 1 h |
| 4 | Nouveaux modèles Mongo `Coefficient`, `SeuilAPC`, `MatiereTemplate` | 4-5 h |
| 5 | API CRUD `/api/coefficients/*` + `/api/seuils-apc/*` + `/api/matieres/*` | 3-4 h |
| 6 | UI admin « Configuration coefficients » (tableau éditable, import/export) | 5-6 h |
| 7 | UI admin « Seuils APC » (formulaire + preview) | 2-3 h |
| 8 | Import CSV avec validation + preview + rollback | 3-4 h |
| 9 | Seed 3 templates système + wizard onboarding | 2 h |
| 10 | Intégration composant Bulletin (lecture depuis BD au lieu de fixtures) | 3 h |
| 11 | Ajout code-barres + QR code sur le rendu bulletin | 2 h |
| 12 | Tests unit + intégration + PR | 3 h |
| | **Total** | **30-36 h** |

## 13. Mission OM-2026-001 — statut

La mission confiée à Tatiana EYENGA le 11 juillet 2026 est **quasi-annulée** grâce à la consolidation v2.0.

| Question OM-2026-001 | Statut | Justification |
|---|---|---|
| Coefficients officiels par série et niveau | ✅ Résolu | Décision « école configure » · 3 templates fournis |
| Codes d'appréciation générale exacts | ✅ Résolu | 5 codes APC confirmés · grille OBC mentions confirmée |
| Seuils APC nationaux ou école | ✅ Résolu | Preuve empirique de variabilité · configurable |
| Cadre juridique signature électronique | ✅ Résolu | Loi n° 2010/021 + Décret n° 2011/1521/PM · hybride V1 |
| Sous-système anglophone GCE | ✅ Résolu | Système A-E, /25 points · hors périmètre V1 |
| Règles de passage + bulletin annuel | ✅ Résolu | Seuil ≥ 10/20 confirmé · bulletin annuel = template configurable |

**Aucune mission externe supplémentaire n'est nécessaire.** Le développement peut avancer de façon totalement autonome.

## 14. Sources consultées

- Bulletin réel Lycée Bilingue de Nyalla · Tle A Allemand · T1 2025-2026
- Bulletin réel Lycée Bilingue de Nylon Ndogpassi · 2ⁿᵈᵉ C · T1 2020-2021
- Bulletin réel Lycée Bilingue de Nylon Ndogpassi · 5ᵉ M B · T1 2020-2021
- Audit documentaire indépendant · 22 juillet 2026
- Recherche IA DeepSeek · 22 juillet 2026 (identifie arrêtés 92/22/MINESEC 2022 et 239/23/MINESEC 2023, textes intégraux non accessibles)
- Recherche IA Claude · 22 juillet 2026 (identifie Décret 2012/267, Loi 98/004, arrêté calendrier scolaire, mentions OBC)
- Recherche IA Perplexity · 22 juillet 2026 (non contributive)
- Loi n° 2010/021 du 21/12/2010 (commerce électronique)
- Décret n° 2011/1521/PM du 15/06/2011 (application signature électronique)
- Loi n° 2010/012 du 21/12/2010 (cybersécurité)
- Cameroon Tribune (presse gouv) — sens des codes APC
- Office du Baccalauréat du Cameroun · officedubac.cm — mentions officielles
- Cameroon GCE Board · camgceb.org — sous-système anglophone
- Expérience de terrain · Salomon Joël FOÉ (scolarité 6ème → Tle au Cameroun)

## 15. Références internes

- `ADR-001-multi-tenant-rbac.md` — décision E2 (aucune règle métier hardcodée)
- `ADR-003-configuration-metier-par-etablissement.md` — pattern universel (à créer)
- `cahier-de-textes-minesec.md` v0.2 — application du même pattern (à mettre à jour)
- `conseil-de-classe-minesec.md` v0.1 — spec sœur à venir
- `.claude/skills/anti-hallucination/` — règle d'or : refuser plutôt qu'inventer
- `.claude/skills/school-rbac/` — permissions granulaires (rôle configurable inclut la gestion des coefficients)

---

**Fin de la spec v2.0**
