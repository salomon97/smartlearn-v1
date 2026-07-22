---
type: spec-metier
sujet: Conseil de classe MINESEC
statut: draft-v0.1
version: 0.1
date: 2026-07-22
auteur: équipe humain + IA (Salomon FOÉ + Claude)
sprint-cible: Vague γ Pédagogie · Sprint S8-S9 (novembre-décembre 2026)
sources-validation:
  - Observations empiriques · 3 bulletins réels (Nyalla Tle A Allemand · Nylon Ndogpassi 2nde C · Nylon Ndogpassi 5ème M B)
  - Codes du conseil observés uniformément : TH, Enc, Fel, AT, BT, AC, BC
  - Expérience terrain fondateur (scolarité 6ème → Tle au Cameroun)
  - Aucun texte MINESEC spécifique aux lycées trouvé (recherche IA du 22/07 : texte identifié concernait les Écoles Normales, non transposable)
---

# Spec métier — Conseil de classe MINESEC (v0.1 · **draft**)

> **⚠️ AVERTISSEMENT ANTI-HALLUCINATION**
>
> Cette spec v0.1 est un **cadrage préparatoire** — aucun PV de conseil de classe réel n'a été
> observé au moment de la rédaction. Elle s'appuie sur :
> - les décisions observées dans les 3 bulletins réels (codes TH/Enc/Fel/AT/BT/AC/BC)
> - l'expérience terrain du fondateur
> - la transposition du pattern **ADR-003 Configuration métier par établissement**
>
> Le conseil de classe est **le troisième pilier de la Vague γ Pédagogie**, après le bulletin
> trimestriel (v2.0) et le cahier de textes (v0.2). C'est **l'instance de délibération collégiale**
> qui légitime les décisions consignées sur le bulletin (mentions, distinctions, sanctions, passage).

## Historique des versions

| Version | Date | Changements |
|---|---|---|
| **0.1** | 2026-07-22 | Cadrage initial anti-hallucination · application ADR-003 dès le premier draft · 7 codes de décision confirmés par observation · composition + quorum + fréquence configurables par école |

## 1. Rôle et statut juridique

Le **conseil de classe** est l'instance de délibération collégiale qui, à la fin de chaque trimestre (et en fin d'année), examine la situation académique de chaque élève de la classe et prononce :

- Les **mentions générales** (calculées automatiquement à partir de la moyenne, grille OBC nationale — voir spec bulletin v2.0)
- Les **distinctions** de reconnaissance (Tableau d'Honneur, Encouragements, Félicitations)
- Les **sanctions** (Avertissement Travail, Blâme Travail, Avertissement Conduite, Blâme Conduite)
- Les **décisions de passage** en classe supérieure (en fin d'année uniquement)

Le PV du conseil de classe **fait foi** juridiquement en cas de contentieux (contestation d'un redoublement, d'une sanction, d'une non-obtention de distinction).

**Statut juridique exact** : [À VALIDER] — aucun texte MINESEC accessible ne fixe la composition, le quorum ou la valeur juridique précise du PV pour les lycées. Un texte trouvé lors de la recherche IA du 22 juillet concernait uniquement les **Écoles Normales**, non transposable. Décision v0.1 : appliquer ADR-003 → configurable par école, valeur juridique dérivée du règlement intérieur validé par la Délégation Régionale.

## 2. Décision architecturale (v0.1)

> ⚡ **PATTERN ADR-003 APPLIQUÉ** : chaque chef d'établissement configure la composition, le quorum,
> la fréquence et le format des PV de son conseil de classe. SmartLearn fournit un **template de départ**
> basé sur la composition standard camerounaise, modifiable en 5 minutes.

Justification : les pratiques varient d'un lycée à l'autre (rôles présents, participation des délégués élèves/parents, modalités de vote, quorum). Verrouiller un modèle unique ne représenterait pas la réalité.

## 3. Personas et usages

| Persona | Ce qu'il fait avec | Fréquence |
|---|---|---|
| **Proviseur (Président)** | Préside la session, valide les décisions, signe le PV | 1 par trimestre + 1 fin d'année |
| **Censeur (Secrétaire)** | Rédige le PV, présente les données préparées | 1 par trimestre + 1 fin d'année |
| **Professeur principal (Rapporteur)** | Présente la situation de sa classe, propose les distinctions/sanctions | 1 par trimestre + 1 fin d'année |
| **Professeurs de matière** | Apportent l'analyse par matière, votent les décisions | 1 par trimestre + 1 fin d'année |
| **Conseiller Principal d'Orientation** | Consulté sur les décisions d'orientation en fin d'année | 1 par trimestre + 1 fin d'année |
| **Délégué élèves** (2 par classe) | Représente les élèves · participe à certaines délibérations selon règlement école | Configurable |
| **Délégué parents** (2 par classe) | Représente les parents · idem | Configurable |
| **Surveillant Général** | Apporte les données de conduite (absences, sanctions disciplinaires) | 1 par trimestre + 1 fin d'année |
| **Parent d'élève concerné** | Reçoit le PV nominatif via bulletin · peut contester par recours écrit | Après chaque conseil |

## 4. Anatomie d'un conseil de classe

### 4.1. Préparation (avant la session)

1. **Consolidation des données** — moyennes calculées, taux de réussite, absences, incidents disciplinaires
2. **Convocation officielle** — envoyée par la Direction 1-2 semaines avant, précisant date/heure/ordre du jour
3. **Rapport préparatoire** — le professeur principal prépare une fiche par élève avec propositions de distinctions/sanctions
4. **Envoi aux membres** — les moyennes provisoires + le rapport préparatoire sont diffusés aux participants avant la session

### 4.2. Séance (déroulé standard)

1. **Ouverture par le proviseur** (5 min)
2. **Présentation de la classe par le professeur principal** (moyennes générales, comportement, difficultés collectives) (10-15 min)
3. **Revue élève par élève** — pour chaque élève :
   - Rappel moyenne + mention automatique
   - Discussion (professeurs, délégués si présents)
   - Vote / consensus sur distinctions et sanctions
4. **Décision de passage** (fin d'année uniquement)
5. **Décisions collectives** — mesures pour la classe (renforcement, tutorat, sortie pédagogique)
6. **Clôture par le proviseur** + signature du PV

### 4.3. Suivi (après la session)

1. **Rédaction finale du PV par le censeur**
2. **Signature par tous les membres** (physique ou électronique selon mode école — voir spec cahier de textes v0.2 R-CDT-04)
3. **Publication des bulletins nominatifs** avec les décisions du conseil
4. **Archivage du PV** conformément à la durée de conservation configurée par l'école

## 5. Les 7 codes de décision (confirmés uniformément par 3 bulletins observés)

Ces 7 codes sont **standards nationaux** et non configurables. Ils sont hardcodés en constantes système (`DistinctionSanction` — voir spec bulletin v2.0).

### 5.1. Distinctions positives

| Code | Signification | Critère typique (indicatif) |
|---|---|---|
| **TH** | Tableau d'Honneur | Moyenne générale élevée (≥ 14-16 selon école) + conduite exemplaire |
| **Enc** | Encouragements | Progression notable + attitude positive |
| **Fel** | Félicitations | Moyenne excellente (≥ 16-18) + excellence sur tous les plans |

### 5.2. Sanctions travail

| Code | Signification | Critère typique |
|---|---|---|
| **AT** | Avertissement Travail | Moyenne insuffisante + baisse manifeste |
| **BT** | Blâme Travail | Moyenne très insuffisante + non-travail avéré |

### 5.3. Sanctions conduite

| Code | Signification | Critère typique |
|---|---|---|
| **AC** | Avertissement Conduite | Comportement problématique récurrent |
| **BC** | Blâme Conduite | Faute grave (violence, tricherie, incivilité majeure) |

### 5.4. Combinaisons possibles

Un élève peut cumuler plusieurs codes (ex : Encouragements + Avertissement Conduite pour un élève brillant mais indiscipliné). Les combinaisons observées dans les 3 bulletins sont validées.

## 6. Règles métier V1

### R-CC-01 · Composition configurable (ADR-003)

L'école définit qui participe au conseil :

**Défaut proposé** (template standard camerounais) :
- Proviseur (Président) — obligatoire
- Censeur (Secrétaire) — obligatoire
- Professeur principal (Rapporteur) — obligatoire
- Tous les professeurs de la classe — obligatoires
- Surveillant Général — recommandé
- Conseiller Principal d'Orientation — recommandé (obligatoire fin d'année)
- Délégué élèves × 2 — optionnel (activable par école, présence limitée à certaines délibérations)
- Délégué parents × 2 — optionnel

### R-CC-02 · Quorum configurable

L'école définit le **quorum minimum** pour que le conseil délibère valablement.

**Défaut proposé** : 2/3 des membres obligatoires présents (dont obligatoirement le Président ou son représentant + le Secrétaire).

### R-CC-03 · Fréquence configurable

L'école définit **combien de conseils par an** :

**Défaut proposé** : 3 conseils de classe trimestriels + 1 conseil de fin d'année (délibération de passage). Total : 4 par an par classe.

**Configurable** : 1 conseil unique fin d'année (écoles à examens uniquement), 2 conseils (semestres), 4 (trimestres + fin année), 5 (mensuel + fin année).

### R-CC-04 · Vote et consensus

**Défaut proposé** : décisions prises par **consensus**. En cas de désaccord, vote à la majorité simple des membres avec voix prépondérante du Président.

**Configurable** : consensus obligatoire, majorité simple, majorité qualifiée 2/3.

### R-CC-05 · Format PV (template éditable par école)

Structure minimale du PV (obligatoire système) :

1. En-tête institutionnel bilingue
2. Identification du conseil (classe, trimestre, année, date, heure)
3. Liste des membres présents / absents / excusés
4. Constatation du quorum
5. Ordre du jour
6. Délibérations par élève (résumé) — avec les codes prononcés
7. Décisions collectives éventuelles
8. Signatures des membres (physique ou électronique selon mode école)

**Éléments optionnels activables** :
- Rappel des moyennes de classe / taux de réussite
- Analyse par matière
- Recommandations pédagogiques pour le trimestre suivant
- Décisions d'orientation individualisées

### R-CC-06 · Confidentialité et diffusion

**Défaut proposé** :
- Le PV complet est **confidentiel** — accessible uniquement aux membres du conseil et à l'inspection en cas d'audit
- Chaque parent reçoit **la partie nominative de son enfant** via le bulletin trimestriel
- Les décisions générales (moyennes de classe, distinctions collectives) peuvent être communiquées à la classe entière

### R-CC-07 · Immutabilité et rectificatifs

Un PV signé est **immutable**. Toute correction nécessite un rectificatif horodaté, signé par le Président, mentionnant explicitement la modification.

Application : réutilise le modèle `Rectificatif` défini dans la spec cahier de textes v0.2.

## 7. Modèles de données MongoDB (v0.1)

### 7.1. `ConseilClasse` — 1 document par conseil tenu

```typescript
{
  schoolId:        ObjectId,        // multi-tenant
  classeId:        ObjectId,        // référence Class
  anneeScolaire:   string,          // "2026-2027"
  trimestre:       "T1" | "T2" | "T3" | "ANNUEL",
  date:            Date,
  heureDebut:      string,
  heureFin?:       string,
  lieu?:           string,
  president:       ObjectId,        // référence User (Proviseur ou remplaçant)
  secretaire:      ObjectId,        // référence User (Censeur)
  rapporteur:      ObjectId,        // référence User (Prof principal)
  membresConvoques: [{
    userId:        ObjectId,
    roleConseil:   string,          // "professeur", "surveillant_general", "cpo", "delegue_eleve", "delegue_parent"
    statut:        "present" | "absent_excuse" | "absent",
  }],
  quorumAtteint:   boolean,
  ordreDuJour:     [string],
  deliberations:   [{
    eleveId:       ObjectId,
    moyenneTrim:   number,
    mentionAuto:   string,          // calculée par système
    distinctionsProposees: [string], // TH, Enc, Fel
    sanctionsProposees:    [string], // AT, BT, AC, BC
    voteResultat:  "adopte_consensus" | "adopte_majorite" | "rejete" | "reporte",
    voteDetail?:   { pour, contre, abstention },
    decisionFinale: [string],       // codes retenus après vote
    commentaireLibre?: string,
    passageDecision?: "passe" | "redouble" | "conditionnel" | "exclusion",
  }],
  decisionsCollectives?: [string],
  recommandations?:      [string],
  signatures:      [{
    userId:        ObjectId,
    dateSignature: Date,
    mode:          "electronique" | "physique",
    valide:        boolean,
  }],
  statut:          "planifie" | "en_cours" | "cloture" | "publie",
  createdAt, updatedAt,
}
```

### 7.2. `ConseilFormat` — configuration par école

```typescript
{
  schoolId:        ObjectId,        // requis
  compositionDefaut: {
    proviseur:            "obligatoire" | "recommande" | "optionnel",
    censeur:              "obligatoire" | "recommande" | "optionnel",
    professeur_principal: "obligatoire" | "recommande" | "optionnel",
    professeurs_matiere:  "obligatoire" | "recommande" | "optionnel",
    surveillant_general:  "obligatoire" | "recommande" | "optionnel",
    cpo:                  "obligatoire" | "recommande" | "optionnel",
    delegues_eleves:      { active: boolean, nombre: number },
    delegues_parents:     { active: boolean, nombre: number },
  },
  quorum:          { type: "ratio" | "nombre", valeur: number },  // défaut : ratio 2/3
  frequence:       "trimestriel_plus_annuel" | "trimestriel" | "semestriel" | "annuel" | "mensuel_plus_annuel",
  modeVote:        "consensus" | "majorite_simple" | "majorite_qualifiee_2_3",
  voixPrepondPresident: boolean,   // défaut : true en cas de partage
  formatPV:        {
    optionnels: {
      rappelMoyennesClasse: boolean,
      analyseParMatiere:    boolean,
      recommandations:      boolean,
      orientationIndividualisee: boolean,
    },
  },
  modeSignature:   "electronique" | "hybride" | "physique",  // hérité config école
  dureeArchivageAnnees: number,   // défaut 10 ans
  updatedBy:       ObjectId,
  createdAt, updatedAt,
}
```

### 7.3. `Convocation` — envoi aux membres

```typescript
{
  conseilClasseId: ObjectId,
  userId:          ObjectId,       // destinataire
  envoyeeLe:       Date,
  canal:           "email" | "push" | "in_app_inbox",  // multi-canal Vague δ
  reponseAttendue: "presence" | "absence" | "delegation",
  reponseRecue?:   { valeur, dateReponse, motif? },
  rappelsEnvoyes:  number,
}
```

## 8. Templates de départ (V1)

### 8.1. Template 1 — Standard camerounais (défaut recommandé)

- Composition : Proviseur, Censeur, Prof principal, tous profs, Surveillant Général, CPO
- Délégués élèves : activés (2 par classe, présents à la revue collective mais pas aux votes nominatifs)
- Délégués parents : désactivés (activable si l'école le souhaite)
- Quorum : ratio 2/3
- Fréquence : trimestriel + annuel (4 conseils par an)
- Vote : consensus par défaut, majorité simple avec voix prépondérante Président
- Format PV : rappel moyennes classe activé, analyse par matière désactivée, recommandations désactivées, orientation individualisée activée en fin d'année uniquement

### 8.2. Template 2 — Conseil réduit (petits établissements)

- Composition : Proviseur, Prof principal, professeurs présents
- Quorum : nombre 5
- Fréquence : semestriel + annuel
- Mode signature : hybride

### 8.3. Template 3 — Conseil élargi (établissements pilotes qualité)

- Composition : tous les rôles activés incluant délégués élèves ET parents
- Vote : majorité qualifiée 2/3
- Format PV : tous les blocs optionnels activés
- Publication : PV général (anonymisé) transmis à toute la classe

## 9. Interaction avec les autres modules SmartLearn

### 9.1. Avec le bulletin trimestriel (spec v2.0)

Les **décisions du conseil** (codes TH/Enc/Fel/AT/BT/AC/BC + mention générale) sont **écrites sur chaque bulletin** de l'élève concerné après clôture du conseil.

Contrainte : un bulletin trimestriel **n'est publié qu'après clôture** du conseil de classe correspondant. Le système bloque la publication tant que le conseil n'a pas été tenu ET signé.

### 9.2. Avec le cahier de textes (spec v0.2)

Le conseil consulte **les cahiers de textes** de tous les enseignants de la classe pour :
- Vérifier la progression pédagogique
- Détecter les retards de programme (alertes R-CDT-05)
- Justifier ou nuancer les moyennes basses par des difficultés collectives

### 9.3. Avec le module Communication (Vague δ)

- **Convocations** envoyées aux membres via NotificationService multi-canal
- **Publication des décisions** aux parents concernés via bulletin
- **PV complet** archivé, accessible uniquement aux membres du conseil et à l'inspection

## 10. Points d'incertitude restants (v0.1)

| # | Question | Impact V1 |
|---|---|---|
| 1 | Statut juridique exact du conseil de classe pour les lycées MINESEC | Impact CGU + doc légale |
| 2 | Obligations en cas d'absence non-excusée d'un membre obligatoire | Impact règles de tenue |
| 3 | Recevabilité juridique du PV signé électroniquement (cas du conseil) | Impact mode signature défaut |
| 4 | Formalisme exact de la contestation parent d'une décision | Impact workflow recours |

Ces 4 points **ne bloquent pas** le développement V1. La spec évoluera en v0.2 → v1.0 dès qu'un vrai PV de conseil est observé ou qu'un règlement intérieur d'établissement est fourni.

## 11. Prochaines étapes

1. **Attendre validation de la spec v0.1** par le fondateur
2. **Collecte terrain opportuniste** : demander à un proviseur pilote un exemplaire de PV réel + règlement intérieur
3. **Scaffold côté code** : modèles `ConseilClasse`, `ConseilFormat`, `Convocation` + API CRUD + UI admin
4. **Intégration bulletin** : bloquer la publication tant que conseil non-clôturé
5. **Wizard onboarding école** : proposer template de départ (standard camerounais recommandé)

## 12. Références internes

- **`ADR-003-configuration-metier-par-etablissement.md`** — pattern universel dont cette spec est une application
- **`bulletin-minesec.md`** v2.0 — spec sœur (les décisions du conseil s'inscrivent sur le bulletin)
- **`cahier-de-textes-minesec.md`** v0.2 — spec sœur (le conseil consulte les cahiers)
- **`school-rules.md`** — règles métier School R1–R20
- **`roadmap/school/vague-gamma-evaluation.md`** — Vague γ Pédagogie Sprint S8-S9
- **`.claude/skills/anti-hallucination/`** — règle d'or : refuser plutôt qu'inventer

---

**Fin de la spec v0.1 · draft**
