# ADR-003 — Configuration métier par établissement (pattern universel)

**Statut** : Accepté
**Date** : 22 juillet 2026
**Décideur** : Salomon Joël FOÉ (avec consolidation Claude Code)
**Contexte** : décision produit du 22 juillet suite à la consolidation de la spec bulletin v2.0

---

## Contexte

Lors de la préparation de la spec bulletin MINESEC v2.0, trois recherches indépendantes (audit documentaire du 22 juillet + recherches IA croisées DeepSeek/Claude/Perplexity + observation empirique de 3 bulletins réels de 2 lycées différents) ont établi un constat sans appel :

**Les règles métier de l'enseignement secondaire camerounais NE SONT PAS uniformément publiées ni standardisées au niveau national.** Elles sont, en pratique :

1. **Variables d'un établissement à l'autre** — preuve empirique par les 3 bulletins réels :
   - Nyalla (Tle A Allemand) : 34 coefficients au total
   - Nylon Ndogpassi (2nde C) : 29 coefficients
   - Nylon Ndogpassi (5ème M B) : 26 coefficients

2. **Non consolidées en texte officiel accessible** — les arrêtés MINESEC qui les fixeraient sont soit introuvables en accès libre (arrêté n° 08/C/20/MINEDUC 1996), soit référencés sans contenu détaillé public (arrêtés n° 92/22/MINESEC 2022 et n° 239/23/MINESEC 2023 identifiés par DeepSeek).

3. **Effectivement paramétrées par chaque école** — le logiciel SKYSOFT Technology utilisé par le Lycée Bilingue de Nyalla permet aux administrateurs de définir leurs propres seuils APC et grilles de coefficients.

Ce constat s'étend au-delà du bulletin. La même incertitude documentaire touche :

- Le **cahier de textes MINESEC** (format exact des colonnes, fréquence des visas hiérarchiques)
- Les **règles du conseil de classe** (composition, quorum, valeur juridique du PV) — le seul texte trouvé concernait les Écoles Normales, non transposable
- L'**emploi du temps** (nombre d'heures par matière selon niveau/série)
- Les **barèmes de sanctions internes** (grille disciplinaire)
- Les **formulaires officiels** (attestation de scolarité, certificat de fin d'études, relevé de notes)

## Décision

### 1. Principe fondateur

**Toute règle métier de l'enseignement secondaire non explicitement fixée par un texte MINESEC accessible et uniforme est considérée comme configurable par chaque établissement.**

SmartLearn School fournit :
- L'**infrastructure de configuration** (interface admin, API, modèles Mongo, import/export)
- Des **templates de départ** pré-remplis extraits de bulletins réels ou de sources vérifiables
- Une **traçabilité complète** des modifications (qui a changé quoi quand)

SmartLearn School **NE FIXE PAS** les règles à la place de l'établissement.

### 2. Généralisation du pattern à toute la V1

Le pattern « configuration par établissement » s'applique à tous les objets métier suivants :

| Objet métier | Configuration école | Configuration système |
|---|---|---|
| Coefficients matières | ✅ Table `Coefficient` (niveau × série × matière × année) | Templates de départ (3 en V1) |
| Seuils APC | ✅ Table `SeuilAPC` (par école, override par matière possible) | Défauts observés (NA<10 · ECA 10-<15 · A≥15) |
| Liste des matières | ✅ Table `Coefficient` (chaque école ajoute/retire) | Catalogue `MatiereTemplate` (matières standards) |
| Format cahier de textes | ✅ Table `CahierFormat` (colonnes actives) | Colonnes standards MINESEC |
| Fréquence visas hiérarchiques | ✅ Config école (hebdo/mensuel/trimestriel) | Défaut mensuel |
| Composition conseil de classe | ✅ Config école (rôles présents) | Composition standard MINESEC |
| Barème sanctions internes | ✅ Config école (règlement intérieur) | — |
| Emploi du temps | ✅ Config école (heures par matière) | Ordre de grandeur indicatif |
| Formulaires officiels | ✅ Templates éditables par école (logos, mentions, signatures) | Squelette MINESEC standard |

### 3. Ce qui reste NATIONAL (non configurable par école)

Quelques règles sont fixées par des textes officiels accessibles ET uniformes. Elles restent **hardcodées en constantes système** :

- **Formule moyenne matière** = (Éval 1 + Éval 2) / 2 — confirmée arithmétiquement sur 3 bulletins
- **Formule moyenne générale** = Σ(Moy × Coef) / Σ(Coef) — pondération globale
- **Grille mentions générales** (Passable / AB / Bien / TB / Excellent) — Office du Baccalauréat officiel
- **5 codes APC** (A++ / A+ / A / ECA / NA) — Cameroon Tribune presse gouvernementale
- **7 codes conseil de classe** (TH / Enc / Fel / AT / BT / AC / BC) — uniforme sur les 3 bulletins observés
- **Seuil de passage classe supérieure ≥ 10/20** — presse 2025 + expérience terrain
- **Bilinguisme français/anglais** en-tête institutionnel — Constitution
- **Cadre juridique signature électronique** — Loi n° 2010/021 + Décret n° 2011/1521/PM
- **Structure bulletin en 3 groupes + synthèse** — uniforme sur les 3 bulletins
- **Mention « délivré sans rature ni surcharge »** — uniforme

### 4. Templates de départ obligatoires

Pour chaque objet métier configurable, SmartLearn fournit au minimum **1 template de départ** basé sur des données réelles vérifiables. L'école n'est jamais forcée à saisir depuis zéro.

Bénéfices :
- **Onboarding rapide** — 5 minutes pour valider un template pré-rempli au lieu de 2 h de saisie
- **Cohérence de base** — l'école part d'une structure éprouvée
- **Discovery pédagogique** — la présentation des templates éduque le proviseur sur les bonnes pratiques observées

### 5. Traçabilité obligatoire

Toute modification de configuration métier par un utilisateur école est **tracée** avec :
- Utilisateur (`updatedBy: ObjectId → User`)
- Timestamp (`updatedAt`)
- Éventuellement `revisionHistory: [{ userId, at, changes: {...} }]` pour un audit granulaire

Cette traçabilité sert à :
- **Audit interne** (le proviseur vérifie qui a modifié les coefs de Terminale)
- **Preuve juridique** (en cas de contestation d'un bulletin, l'école prouve la configuration à la date d'émission)
- **Rollback** (revenir à une configuration précédente en cas d'erreur)

## Conséquences

### Positives

- **Débloque le développement immédiatement** — plus besoin d'attendre l'obtention de textes officiels introuvables
- **Élimine le risque juridique** — SmartLearn ne prétend pas être source de vérité réglementaire ; l'école assume ses propres règles
- **Robuste dans le temps** — les évolutions réglementaires MINESEC futures (nouveaux arrêtés) sont absorbées par l'école, sans nécessiter de mise à jour SmartLearn
- **Aligné sur la pratique terrain** — c'est déjà comme ça que fonctionnent les logiciels concurrents observés (SKYSOFT Technology)
- **Cohérent avec ADR-001 E2** — aucune règle métier hardcodée, tout est en BD configurable par école (le principe RBAC est étendu aux règles métier)
- **Pattern SaaS multi-tenant standard** — les grands SIS internationaux (PowerSchool, Genesis, SchoolMint) fonctionnent tous ainsi

### Négatives

- **Complexité UI** — chaque type de configuration exige un écran admin dédié + import/export + preview
- **Volume de code initial supérieur** — création de N modèles Mongo + N APIs CRUD + N UIs (mitigé par la réutilisation d'un générateur générique en V2)
- **Onboarding potentiellement décourageant** si les templates de départ sont insuffisants ou mal pré-remplis (mitigé par la fourniture systématique de 3+ templates par objet + wizard guidé)
- **Support client accru** — les écoles poseront des questions du type « quel coefficient dois-je mettre pour X ? » — nécessite documentation utilisateur claire ET base de connaissance FAQ

### Techniques

- **1 collection MongoDB par objet configurable** avec toujours : `schoolId`, timestamps, `updatedBy`
- **1 middleware `withPermission('coefficients.update')`** systématique sur toute route de configuration
- **1 audit log automatique** sur toute modification (via middleware générique)
- **1 endpoint `/api/<objet>/import`** et `/api/<objet>/export` pour chaque objet configurable
- **1 wizard d'onboarding** qui parcourt les objets à configurer avec templates pré-remplis

## Alternatives envisagées et rejetées

### Alternative A — Attendre la publication officielle des grilles MINESEC

**Rejeté** : les recherches consolidées (audit + 3 IA) démontrent l'absence de publication accessible. L'attente serait indéfinie. La mission OM-2026-001 confiée à Tatiana pour aller les chercher physiquement a été annulée après consolidation.

### Alternative B — Hardcoder une seule grille « MINESEC officielle » à partir de sources secondaires

**Rejeté** : les sources secondaires (LMS de préparation, cameroondesks, blogs) ne sont pas vérifiables et se contredisent. Le risque juridique de publier des valeurs erronées serait significatif. De plus, la variabilité empirique observée (34 vs 29 vs 26 coefficients) prouve qu'une grille unique ne peut exister.

### Alternative C — Grille éditable mais avec valeurs par défaut nationales verrouillées

**Rejeté** : verrouiller des valeurs « nationales » sans texte officiel les fixant expose SmartLearn à la contestation. La configurabilité totale (sans verrou) protège l'entreprise et respecte la souveraineté de chaque établissement.

### Alternative D — Système hybride : national par défaut, override école optionnel

**Envisagé, différé en V2** : cette approche aurait du sens si des grilles nationales officielles étaient publiées un jour. En attendant, la configurabilité totale reste la seule option viable. La V2 pourra ajouter un « mode conforme national » lorsque le MINESEC aura publié une grille de référence.

## Références

- **ADR-001** — Multi-tenant + RBAC fondateur SmartLearn School (décision E2 : aucune règle hardcodée)
- **Spec `bulletin-minesec.md` v2.0** — première application concrète de ce pattern
- **Spec `cahier-de-textes-minesec.md` v0.2** — deuxième application (à venir)
- **Audit indépendant du 22 juillet 2026** — rétro-ingénierie du bulletin Nyalla, preuve initiale du principe
- **Recherches IA croisées** — DeepSeek + Claude + Perplexity, 22 juillet 2026
- Skill `.claude/skills/school-rbac/` — permissions pour la gestion configurations école
- Skill `.claude/skills/anti-hallucination/` — règle d'or qui interdit d'inventer des valeurs officielles

## Historique

| Version | Date | Contenu |
|---|---|---|
| 1.0 | 2026-07-22 | Création de l'ADR après consolidation spec bulletin v2.0 |
