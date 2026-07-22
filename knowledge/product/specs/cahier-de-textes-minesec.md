---
type: spec-metier
sujet: Cahier de textes MINESEC
statut: draft-v0.2
version: 0.2
date: 2026-07-22
auteur: équipe humain + IA (Salomon FOÉ + Claude)
sprint-cible: Vague γ Pédagogie · Sprint S7–S9 (novembre 2026)
source-validation: Aucun spécimen physique de cahier de textes observé. Application par transposition du pattern ADR-003 (Configuration métier par établissement) validé sur la spec bulletin v2.0.
---

# Spec métier — Cahier de textes MINESEC (v0.2 · **draft**)

> **⚠️ AVERTISSEMENT ANTI-HALLUCINATION**
>
> Cette spec reste un **cadrage préparatoire** — aucun cahier de textes réel n'a été observé
> au moment de la rédaction (v0.1 ni v0.2). La v0.2 diffère de la v0.1 en appliquant le
> **pattern universel** actée dans l'**ADR-003 Configuration métier par établissement** :
> puisque nous ne pouvons pas obtenir de spécimen officiel unique, nous **rendons configurable**
> ce qui varie entre établissements plutôt que d'inventer un modèle prétendument officiel.
>
> Le cahier de textes est **le second pilier documentaire de la Vague γ Pédagogie**, après le
> bulletin trimestriel. C'est le **document juridique de preuve** de la couverture du programme
> officiel MINESEC par chaque enseignant.

## Historique des versions

| Version | Date | Changements |
|---|---|---|
| **0.2** | 2026-07-22 | Application du pattern ADR-003 : les colonnes du cahier + la fréquence des visas + le format signature deviennent configurables par école. Ajout section « Templates de départ ». Retrait des points d'incertitude 6 (bilinguisme) et 8 (fréquence visas) qui deviennent des configs. Références croisées ADR-003 + bulletin v2.0. |
| 0.1 | 2026-07-21 | Cadrage initial anti-hallucination · 10 points d'incertitude explicites · 6 règles métier candidates · 5 décisions structurantes prises pour scaffold. |

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

## 2. Décision architecturale (v0.2)

> ⚡ **PATTERN ADR-003 APPLIQUÉ** : chaque chef d'établissement configure les colonnes actives
> de son cahier de textes, la fréquence des visas hiérarchiques et le format de signature
> (physique / électronique / hybride). SmartLearn fournit un **template de départ** basé sur
> l'usage francophone standard, modifiable en 5 minutes.

Justification : aucun texte MINESEC ne fixe le **modèle officiel exact** des colonnes du cahier de textes. Les pratiques varient d'un établissement à l'autre (certains ajoutent une colonne « Objectif pédagogique », d'autres une colonne « Support utilisé »). Comme pour le bulletin, appliquer une grille unique verrouillée serait :
- **Non représentatif** de la réalité terrain
- **Juridiquement risqué** (imposer un modèle non validé)
- **Techniquement inutile** (l'école redemande vite un override)

## 3. Personas et usages

| Persona | Ce qu'il fait avec | Fréquence |
|---|---|---|
| **Enseignant** | Remplit à chaque séance : date, contenu leçon, exercices donnés, devoirs | Quotidien / hebdomadaire selon emploi du temps |
| **Chef de département** | Vise le cahier périodiquement, contrôle progression conforme au programme | Configurable par école (hebdo / mensuel / trimestriel) |
| **Censeur / Directeur des études** | Contrôle échantillon des cahiers, alerte proviseur en cas de retard programme | Périodique + inspection ciblée |
| **Proviseur** | Contrôle final avant inspection externe, signe visa | Configurable par école (défaut : trimestriel) |
| **Inspecteur pédagogique régional** | Contrôle lors de l'inspection annuelle de l'établissement | Annuel |
| **Enseignant remplaçant** | Consulte pour reprendre la classe au bon point du programme | Ponctuel |

**Test P1 (rappel D13)** : le cahier de textes numérique doit **inspirer la même confiance institutionnelle** qu'un cahier papier officiel signé et tamponné. Pas de gadget, pas d'emoji. Densité maximale d'information, traçabilité totale, historique inaltérable.

## 4. Anatomie du document

### 4.1. Identification (page de garde ou en-tête permanent)

- Nom de l'établissement (bilingue français / anglais)
- Année scolaire (format `AAAA-AAAA`)
- Classe concernée (ex : `Tle A1`, `6ème M4`)
- Matière enseignée
- Nom et grade de l'enseignant titulaire
- Coefficient de la matière dans la classe (lu depuis `Coefficient` — spec bulletin v2.0)
- Nombre d'heures hebdomadaires prévues au programme

### 4.2. Corps du document — tableau chronologique des séances

**Colonnes configurables par établissement (défaut standard francophone)** :

| Colonne | Contenu | Défaut activé ? | Configurable ? |
|---|---|---|---|
| N° séance | Numéro chronologique dans le trimestre | Oui | Non (obligatoire système) |
| Date | Date exacte de la séance (JJ/MM/AAAA) | Oui | Non (obligatoire système) |
| Durée | Nombre d'heures | Oui | Oui (activable/désactivable) |
| Titre de la leçon | Intitulé conforme au programme officiel MINESEC | Oui | Non (obligatoire système) |
| Compétences visées (APC) | Référentiel APC — compétences ciblées | Oui | Oui |
| Contenu / notions abordées | Résumé opérationnel de ce qui a été traité | Oui | Non (obligatoire système) |
| Travail donné en classe | Exercices, activités, mises en situation | Oui | Oui |
| Devoir à la maison | Exercices à préparer pour la séance suivante | Oui | Oui |
| Support utilisé | Manuel, PDF, vidéo, atelier | Non | Oui (activable) |
| Objectif pédagogique | Objectif spécifique de la séance | Non | Oui (activable) |
| Observations | Remarques enseignant (absents, incident, séance écourtée) | Oui | Oui |
| Signature enseignant | Paraphe daté à chaque séance | Oui | Non (obligatoire système) |
| Visa chef de département | Contrôle périodique | Oui | Oui |
| Visa censeur | Contrôle périodique | Non | Oui (activable) |
| Visa proviseur | Contrôle trimestriel | Non | Oui (activable) |

### 4.3. Ordre du document

- **Chronologique strict** — impossible de rétro-dater ou d'insérer une séance après coup (règle système immuable)
- **Sans rature ni surcharge** — équivalent bulletin (règle système immuable)
- **Continuité totale** — une séance manquée doit être justifiée (absence enseignant, jour férié, grève, etc.), pas absente du tableau

### 4.4. Bilinguisme (statut décidé v0.2)

En-tête institutionnel bilingue français/anglais **obligatoire** (constitutionnel).
Contenu pédagogique dans la langue d'enseignement de la matière (français OU anglais selon sous-système). Décision v0.2 : **pas d'obligation bilingue sur le contenu** — la langue est déterminée par la matière.

## 5. Règles métier V1

### R-CDT-01 · Immutabilité chronologique (configurable école)

Une séance créée ne peut plus être modifiée après un **délai d'immutabilité** défini par l'école. Passé ce délai, seul un rectificatif horodaté est possible, gardant la trace de la modification.

- **Défaut proposé** : 7 jours
- **Configurable** entre 1 et 30 jours dans les paramètres établissement

### R-CDT-02 · Séance obligatoire toutes les périodes prévues

Si l'emploi du temps prévoit un cours à `mardi 8h-10h` en `Tle A1 · Mathématiques`, une entrée doit exister pour chaque mardi de l'année scolaire, soit avec contenu, soit avec justification d'absence (férié, grève, absence enseignant). Cette règle est **système, non configurable**.

### R-CDT-03 · Alignement obligatoire sur le programme officiel

Chaque leçon **peut** référencer un chapitre / une notion du **programme officiel MINESEC** pour la classe et la matière (référentiel `programmes` — collection Mongo distincte, voir skill `programme-minesec` du repo `smartlearn`).

**Décision v0.2** : la référence programme est **recommandée mais pas bloquante**. L'enseignant peut créer une séance sans lien programme (utile pour révisions, séances méthodologiques, etc.).

### R-CDT-04 · Traçabilité des visas

Chaque visa (chef de département, censeur, proviseur) est :

- **Signature électronique** selon config école (cadre juridique Loi n° 2010/021 et Décret n° 2011/1521/PM)
- **Horodaté** (date + heure) — système
- **Non-modifiable** une fois apposé — système
- **Contextualisé** — le visa mentionne la période couverte (ex : séances du 01/09 au 30/09)

**Décision v0.2** : le workflow signature est **configurable par école** :
- **Mode « électronique pur »** — signature dans l'app, valeur juridique via Loi 2010/021
- **Mode « hybride »** — signature électronique dans l'app + impression pour visa physique du chef département sur papier archivé
- **Mode « physique »** — impression obligatoire + visa manuscrit + scan de retour dans l'app

Défaut proposé : **hybride** (le plus prudent juridiquement pour la V1, aligné avec le workflow bulletin).

### R-CDT-05 · Alerte retard programme (configurable école)

Le système alerte automatiquement le censeur (ou tout rôle configuré) si un enseignant est de plus de **N heures** de retard sur la progression attendue à date.

- **Défaut proposé** : 4 heures
- **Configurable** dans les paramètres établissement

### R-CDT-06 · Archivage réglementaire

Le cahier de textes est archivé pendant une **durée configurable par école** après la fin de l'année scolaire, conformément aux règles d'archivage administratif camerounais.

- **Défaut proposé** : 10 ans
- **Non-suppression** systématique — l'école peut archiver, jamais supprimer définitivement

### R-CDT-07 · Fréquence des visas (configurable école, nouveau v0.2)

L'école définit **la fréquence attendue** de chaque visa :

- **Visa chef de département** — défaut : mensuel · configurable : hebdo / bimensuel / mensuel / trimestriel
- **Visa censeur** — défaut : trimestriel · configurable : mensuel / bimestriel / trimestriel / à la demande
- **Visa proviseur** — défaut : trimestriel · configurable : trimestriel / semestriel / annuel / à la demande

Le système génère automatiquement des rappels aux titulaires selon cette configuration.

## 6. Différences par cycle et par sous-système

### 6.1. Cycle 1 (6ème → 3ème) vs Cycle 2 (2nde → Tle)

**Application ADR-003** : les colonnes actives et la fréquence des visas peuvent différer entre cycles au sein d'un même établissement. La configuration se fait **par (école, niveau)** dans la V2 (V1 : configuration globale école).

### 6.2. Sous-système francophone vs anglophone (GCE)

Application du pattern V2 : mode `francophone` / `anglophone` configuré au niveau école, cahier de textes en anglais si mode anglophone, avec équivalent `Scheme of Work` + `Register of Lessons Taught`.

**V1** : francophone uniquement, comme pour le bulletin.

### 6.3. Enseignement technique (Tle TI, filières industrielles)

Les colonnes spécifiques (matériel utilisé, atelier, sécurité) sont **activables** dans la configuration école pour les matières techniques. La liste des colonnes disponibles inclut :
- Matériel utilisé
- Atelier / laboratoire concerné
- Consignes de sécurité rappelées
- Élèves absents à l'atelier (distinct des absences classe)

## 7. Modèles de données MongoDB (v0.2)

### 7.1. `Lesson` — 1 document par séance individuelle

```typescript
{
  schoolId:        ObjectId,       // multi-tenant
  cahierId:        ObjectId,       // référence CahierDeTextes
  numeroChronologique: number,
  date:            string,          // ISO YYYY-MM-DD
  heureDebut?:     string,          // HH:MM
  heureFin?:       string,
  dureeHeures:     number,
  titreLecon:      string,
  competencesVisees?: string[],
  contenuNotions:  string,
  travailEnClasse?: string,
  devoirMaison?:   string,
  supportUtilise?: string,          // colonne configurable
  objectifPedagogique?: string,     // colonne configurable
  observations?:   string,
  statut:          "planifiee" | "faite" | "reportee" | "annulee" | "manquante",
  motifAnnulation?: string,
  signatureEnseignant?: { date, valide },
  visas:           [Visa],
  createdAt, updatedAt, lastModifiedBy,
  immuableApresMs?: number,         // hérité de config école R-CDT-01
}
```

### 7.2. `CahierFormat` — configuration par école (nouveau v0.2)

```typescript
{
  schoolId:        ObjectId,        // requis
  niveau?:         string,          // null = tous · sinon override par niveau (V2)
  colonnes:        [{
    code:          string,          // "materiel_utilise", "objectif_pedagogique", ...
    active:        boolean,
    obligatoire:   boolean,         // si active, doit être renseignée
    ordre:         number,          // ordre d'affichage
  }],
  frequenceVisas:  {
    chefDepartement: "hebdomadaire" | "bimensuel" | "mensuel" | "trimestriel",
    censeur:         "mensuel" | "bimestriel" | "trimestriel" | "demande",
    proviseur:       "trimestriel" | "semestriel" | "annuel" | "demande",
  },
  modeSignature:   "electronique" | "hybride" | "physique",
  delaiImmutabiliteJours: number,   // R-CDT-01 · défaut 7
  seuilAlerteRetardHeures: number,  // R-CDT-05 · défaut 4
  dureeArchivageAnnees:  number,    // R-CDT-06 · défaut 10
  updatedBy:       ObjectId,
  createdAt, updatedAt,
}
```

### 7.3. `Rectificatif` — modification d'une séance immutable

```typescript
{
  seanceId:        ObjectId,
  auteurId:        ObjectId,
  date:            Date,
  motif:           string,
  contenuAvant:    Partial<Lesson>,
  contenuApres:    Partial<Lesson>,
}
```

## 8. Templates de départ (V1)

### 8.1. Template 1 — Standard francophone (défaut recommandé)

Colonnes actives par défaut : N° séance · Date · Durée · Titre · Compétences · Contenu · Travail classe · Devoir maison · Observations · Signature enseignant · Visa chef département

Colonnes désactivées : Support utilisé · Objectif pédagogique · Visa censeur · Visa proviseur

Fréquence visas : chef département mensuel · censeur trimestriel · proviseur trimestriel

Mode signature : hybride
Délai immutabilité : 7 jours
Seuil alerte retard : 4 h
Durée archivage : 10 ans

### 8.2. Template 2 — Technique / atelier (Tle TI, F, G)

Ajoute aux colonnes standard : Matériel utilisé · Atelier · Consignes sécurité

### 8.3. Template 3 — GCE anglophone (V2)

Format en anglais, colonnes : Session number · Date · Duration · Lesson title · Competences targeted · Content · Class work · Homework · Notes · Teacher signature · Head of department visa

## 9. Points d'incertitude restants (v0.2)

Grâce à l'application ADR-003, la plupart des points d'incertitude v0.1 sont résolus (ils deviennent des configs). Restent 3 points qui bénéficieraient d'une validation terrain :

| # | Question | Impact V1 |
|---|---|---|
| 1 | Statut juridique exact du cahier de textes (règlement intérieur ? arrêté ministériel ?) | Impact CGU + doc légale |
| 2 | Existence de sanctions pour l'enseignant en cas de cahier non tenu | Impact règles disciplinaires |
| 3 | Format exact du bulletin annuel de tenue de cahier (fait par le censeur en fin d'année) | Impact rapports fin d'année |

Ces points **ne bloquent pas** le développement V1 — ils affinent la doc et la communication.

## 10. Prochaines étapes

1. **Attendre validation de la spec v0.2** par le fondateur
2. **Scaffold côté code** : modèles `Lesson`, `CahierFormat`, `Rectificatif` + API CRUD + UI admin configuration
3. **Wizard onboarding** : proposer template de départ à choisir lors de la création école
4. **Collecte terrain** : dès qu'un vrai spécimen de cahier de textes est obtenu, mise à jour v0.3 → v1.0 pour caler les défauts sur des valeurs éprouvées

## 11. Références internes

- **`ADR-003-configuration-metier-par-etablissement.md`** — pattern universel dont cette spec est une application
- **`bulletin-minesec.md`** v2.0 — spec sœur, méthodologie identique
- **`school-rules.md`** — règles métier School R1–R20
- **`roadmap/school/vague-gamma-evaluation.md`** — Vague γ Pédagogie Sprint S7–S9
- **`.claude/skills/programme-minesec/`** — référentiel programmes MINESEC (à consulter)
- **`.claude/skills/anti-hallucination/`** — règle d'or : refuser plutôt qu'inventer

---

**Fin de la spec v0.2 · draft**
