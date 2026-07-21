---
type: spec-metier
sujet: Cahier de textes MINESEC
statut: draft-v0.1
version: 0.1
date: 2026-07-21
auteur: équipe humain + IA (Salomon FOÉ + Claude)
sprint-cible: Vague γ Pédagogie · Sprint S7–S9 (novembre 2026)
source-validation: AUCUNE — aucun spécimen réel de cahier de textes MINESEC n'a été fourni au moment de la rédaction. Toutes les valeurs sont indicatives, marquées comme telles, et attendent validation contre un spécimen physique + entretien avec un chef de département en poste.
---

# Spec métier — Cahier de textes MINESEC (v0.1 · **draft**)

> **⚠️ AVERTISSEMENT ANTI-HALLUCINATION**
>
> Cette spec est un **cadrage préparatoire** — aucun cahier de textes réel n'a été observé au moment de la rédaction. Elle sert à structurer l'attaque du sujet, à identifier les questions à poser à un chef de département en poste, et à démarrer le scaffold côté code **avec placeholders explicites**.
>
> **Toutes les valeurs précises** (colonnes du modèle officiel, fréquence des visas, distinctions cycle 1 vs cycle 2, tolérances signature électronique) sont marquées `[À VALIDER]` ci-dessous. Une v1.0 devra les remplacer contre un spécimen physique + confirmation d'un chef de département actif.
>
> Le cahier de textes est **le second pilier documentaire de la Vague γ Pédagogie**, après le bulletin trimestriel. C'est le **document juridique de preuve** de la couverture du programme officiel MINESEC par chaque enseignant. Sa fiabilité conditionne la crédibilité du produit face à l'inspection pédagogique.

---

## 1. Rôle et statut juridique du document

Le **cahier de textes** est le document dans lequel chaque enseignant du secondaire consigne, cours après cours, ce qu'il a effectivement traité en classe. Il est distinct du :

- **Cahier de préparation** (privé à l'enseignant, notes personnelles préparant chaque leçon)
- **Cahier de notes / registre de notes** (consignation des évaluations)
- **Cahier de textes de l'élève** (document parfois demandé aux élèves eux-mêmes, hors périmètre)

Le cahier de textes de l'enseignant est **un document institutionnel officiel** [À VALIDER — statut juridique exact à confirmer] servant à :

1. **Tracer la couverture du programme officiel MINESEC** par matière et par classe
2. **Justifier la note d'un élève** en cas de contestation (démontrer que la leçon évaluée a bien été enseignée)
3. **Alimenter le contrôle hiérarchique** — chef de département, censeur, proviseur, inspecteur pédagogique régional
4. **Constituer une preuve** en cas de contentieux avec un parent ou d'inspection ministérielle
5. **Assurer la continuité pédagogique** en cas de remplacement de l'enseignant

## 2. Personas et usages

| Persona | Ce qu'il fait avec | Fréquence |
|---|---|---|
| **Enseignant** | Remplit à chaque séance : date, contenu leçon, exercices donnés, devoirs | Quotidien / hebdomadaire selon emploi du temps |
| **Chef de département** | Vise le cahier périodiquement, contrôle progression conforme au programme | [À VALIDER — hebdo ? mensuel ? trimestriel ?] |
| **Censeur / Directeur des études** | Contrôle échantillon des cahiers, alerte proviseur en cas de retard programme | Périodique + inspection ciblée |
| **Proviseur** | Contrôle final avant inspection externe, signe visa | Trimestriel [À VALIDER] |
| **Inspecteur pédagogique régional** | Contrôle lors de l'inspection annuelle de l'établissement | Annuel |
| **Enseignant remplaçant** | Consulte pour reprendre la classe au bon point du programme | Ponctuel |

**Test P1 (rappel D13)** : le cahier de textes numérique doit **inspirer la même confiance institutionnelle** qu'un cahier papier officiel signé et tamponné. Pas de gadget, pas d'emoji. Densité maximale d'information, traçabilité totale, historique inaltérable.

## 3. Anatomie du document

### 3.1. Identification (page de garde ou en-tête permanent)

- Nom de l'établissement (bilingue français / anglais)
- Année scolaire (format `AAAA-AAAA`)
- Classe concernée (ex : `Tle A1`, `6ème M4`)
- Matière enseignée
- Nom et grade de l'enseignant titulaire
- Coefficient de la matière dans la classe
- Nombre d'heures hebdomadaires prévues au programme

### 3.2. Corps du document — tableau chronologique des séances

**[À VALIDER contre spécimen réel — modèle officiel probablement variable selon académie]**

Colonnes probables (hypothèse basée sur usage francophone standard) :

| Colonne | Contenu | Obligatoire ? |
|---|---|---|
| N° séance | Numéro chronologique dans le trimestre | Oui |
| Date | Date exacte de la séance (JJ/MM/AAAA) | Oui |
| Durée | Nombre d'heures (souvent 1h ou 2h) | Oui |
| Titre de la leçon | Intitulé conforme au programme officiel MINESEC | Oui |
| Compétences visées (APC) | Référentiel APC — compétences ciblées par la séance | Oui [À VALIDER — obligatoire depuis quelle année ?] |
| Contenu / notions abordées | Résumé opérationnel de ce qui a été traité | Oui |
| Travail donné en classe | Exercices, activités, mises en situation | Recommandé |
| Devoir à la maison | Exercices à préparer pour la séance suivante | Recommandé |
| Observations | Remarques enseignant (absents, incident, séance écourtée) | Optionnel |
| Signature enseignant | Paraphe daté à chaque séance | Oui |
| Visa chef de département | Contrôle périodique | Oui |
| Visa censeur | Contrôle périodique | [À VALIDER — systématique ou ciblé ?] |

### 3.3. Ordre du document

- **Chronologique strict** — impossible de rétro-dater ou d'insérer une séance après coup
- **Sans rature ni surcharge** [À VALIDER — probable, par analogie avec le bulletin]
- **Continuité totale** — une séance manquée doit être justifiée (absence enseignant, jour férié, grève, etc.), pas absente du tableau

### 3.4. Bilinguisme

**[À VALIDER]** : le cahier de textes doit-il être bilingue français/anglais comme le bulletin, ou seul l'en-tête institutionnel est bilingue ?

Hypothèse par défaut : contenu pédagogique dans la langue d'enseignement de la matière (français OU anglais selon sous-système), en-tête institutionnel bilingue.

## 4. Règles métier candidates (V1)

Ces règles sont **candidates** — à confronter à la pratique réelle avant durcissement.

### R-CDT-01 · Immutabilité chronologique

Une séance créée ne peut plus être modifiée après **7 jours** [À VALIDER — délai exact]. Passé ce délai, seul un rectificatif horodaté est possible, gardant la trace de la modification.

### R-CDT-02 · Séance obligatoire toutes les périodes prévues

Si l'emploi du temps prévoit un cours à `mardi 8h-10h` en `Tle A1 · Mathématiques`, une entrée doit exister pour chaque mardi de l'année scolaire, soit avec contenu, soit avec justification d'absence (férié, grève, absence enseignant).

### R-CDT-03 · Alignement obligatoire sur le programme officiel

Chaque leçon doit référencer un chapitre / une notion du **programme officiel MINESEC** pour la classe et la matière. Le référentiel programmes MINESEC doit être digitalisé dans une collection Mongo distincte (`programmes`) [→ voir skill `programme-minesec` du repo `smartlearn`].

### R-CDT-04 · Traçabilité des visas

Chaque visa (chef de département, censeur, proviseur) est :

- **Signature électronique** [À VALIDER — recevabilité juridique conditionnée par mission OM-2026-001 point 4]
- **Horodaté** (date + heure)
- **Non-modifiable** une fois apposé
- **Contextualisé** — le visa mentionne la période couverte (ex : séances du 01/09 au 30/09)

### R-CDT-05 · Alerte retard programme

Le système alerte automatiquement le censeur si un enseignant est **[À VALIDER — X séances / X% du programme]** de retard sur la progression attendue à date.

### R-CDT-06 · Archivage réglementaire

Le cahier de textes est archivé **pendant [À VALIDER — probablement 10 ans]** après la fin de l'année scolaire, conforme aux règles d'archivage administratif camerounais.

## 5. Différences par cycle et par sous-système

### 5.1. Cycle 1 (6ème → 3ème) vs Cycle 2 (2nde → Tle)

**[À VALIDER]** : les colonnes obligatoires diffèrent-elles entre cycle 1 et cycle 2 ? Le cycle 2 impose-t-il des mentions supplémentaires (méthodologie, approche par projet, etc.) ?

### 5.2. Sous-système francophone vs anglophone (GCE)

**[À VALIDER — même remarque que pour le bulletin, mission OM-2026-001 point 5]**

Hypothèse : le sous-système anglophone (Government Bilingual High School côté A-Level) utilise un équivalent `Scheme of Work` + `Register of Lessons Taught`, avec structure comparable mais nomenclature différente. À confirmer.

### 5.3. Enseignement technique (Tle TI, filières industrielles)

**[À VALIDER]** : les cahiers de textes des enseignements techniques (Tle TI, séries industrielles F, G) intègrent-ils des colonnes spécifiques (matériel utilisé, atelier, sécurité) ?

## 6. Points d'incertitude — à intégrer dans une prochaine mission Tatiana ou entretien terrain

| # | Question | Impact V1 |
|---|---|---|
| 1 | Modèle officiel exact (colonnes, ordre) | Bloque le design final du composant |
| 2 | Fréquence des visas (chef dép., censeur, proviseur) | Bloque le workflow validation |
| 3 | Statut juridique de la signature électronique du cahier | Peut imposer signature manuscrite à imprimer |
| 4 | Délai après lequel une séance devient immutable | Règle métier R-CDT-01 |
| 5 | Seuil d'alerte retard programme (X% ou X séances) | Règle métier R-CDT-05 |
| 6 | Bilinguisme du contenu pédagogique | Impact modèle données + UI |
| 7 | Différences cycle 1 vs cycle 2 | Impact structure fixtures |
| 8 | Format cahier de textes GCE anglophone | Impact roadmap V2 |
| 9 | Colonnes spécifiques enseignement technique | Impact fixtures Tle TI |
| 10 | Durée d'archivage réglementaire | Impact modèle Mongo (soft delete vs hard delete) |

## 7. Décisions à prendre pour la V1 (scaffold sans attendre)

Malgré les incertitudes, plusieurs décisions structurantes peuvent être prises immédiatement pour démarrer le scaffold côté code :

### D-CDT-01 · Modèle Mongo `Lesson` par séance individuelle

Chaque séance = 1 document `Lesson` dans MongoDB, pas un tableau imbriqué dans un document `CahierDeTextes`. Rationale : lookups efficaces, immutabilité par document, historique visa par document, alignement CRUD simple.

### D-CDT-02 · Route dédiée `/enseignant/cahier-de-textes/[classe]/[matiere]`

Suit le pattern éprouvé Vague γ (bulletin) : route dédiée dans l'espace enseignant, distincte des espaces directeur/admin.

### D-CDT-03 · Composant hybride écran + print (comme le bulletin)

Vue écran = tableau interactif avec édition inline. Vue print = tableau A4 sans toolbar, avec cartouche visa en bas de chaque page.

### D-CDT-04 · Fixtures Tle A · Mathématiques · T1 2026-2027

Persona fictif enseignant `M. NGONO Christian` (déjà utilisé dans admin-copy.ts comme professeur principal) — 12 séances fictives sur le trimestre, alignées sur le programme MINESEC Tle A · Mathématiques [référentiel à digitaliser en parallèle].

### D-CDT-05 · Placeholders explicites TODO(Tatiana|Chef-dept)

Toute règle marquée `[À VALIDER]` dans cette spec devient un `TODO(Tatiana)` ou `TODO(Chef-dept)` dans le code, avec valeur par défaut prudente et test associé.

## 8. Prochaines étapes

1. **Cette semaine** : scaffold côté code sur base de cette spec v0.1 + placeholders
2. **À planifier** : entretien avec un chef de département en poste (ou intégrer dans mission Tatiana OM-2026-002 si nécessaire)
3. **Livrable v1.0** : mise à jour de cette spec après validation contre spécimen physique + entretien
4. **Livrable v1.1** : ajout section GCE anglophone après validation sous-système bilingue

## 9. Références internes

- `knowledge/product/specs/bulletin-minesec.md` v1.0 — spec sœur, méthodologie identique
- `knowledge/product/school-rules.md` — règles métier School R1–R20
- `knowledge/product/roadmap/school/` — Vague γ Pédagogie Sprint S7–S9
- `.claude/skills/programme-minesec/` — référentiel programmes MINESEC (à consulter)
- `.claude/skills/anti-hallucination/` — règle d'or : refuser plutôt qu'inventer

---

## Versions

| Version | Date | Auteur | Changements |
|---|---|---|---|
| 0.1 | 2026-07-21 | Salomon FOÉ + Claude | Cadrage initial · avertissement anti-hallucination · 10 points d'incertitude · 5 décisions structurantes prises · aucun spécimen réel observé |
