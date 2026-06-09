---
name: bareme-minesec
description: Barèmes officiels MINESEC pour BEPC, Probatoire et Baccalauréat camerounais — par épreuve, série, session. Utilisé par correcteur-copies pour noter une copie selon le barème officiel et NON un barème inventé. Squelette à remplir manuellement avec les barèmes des sessions récentes (à minima 2020-2026). Critique : sans barème officiel pour un sujet précis, correcteur-copies refuse de noter ou produit une grille "indicative" clairement étiquetée.
---

# Barèmes MINESEC — Référentiel SmartLearn Unified

## Statut

⚠️ **Skill en squelette.** Contenu à remplir manuellement avec les barèmes officiels
des sessions BEPC, Probatoire et Baccalauréat. Tant qu'un barème n'est pas renseigné
pour un sujet précis, `correcteur-copies` doit étiqueter sa grille comme
`bareme_source: indicatif` et alerter l'utilisateur (cf. agent `correcteur-copies`).

## Structure attendue par entrée

```yaml
examen: <BEPC | Probatoire | Baccalauréat>
serie: <A | C | D | E | TI | etc.>
matiere: <ex: Mathématiques>
session: <ex: juin 2024>
zone: <ex: Zone 1 / Zone 2 / unique>
duree_minutes: <ex: 180>
note_max: <ex: 20>
sections:
  - section: <ex: Exercice 1>
    points: <ex: 4>
    questions:
      - q: <ex: 1.a>
        points: <ex: 1>
        attendu: <description synthétique>
```

## Priorité de remplissage

1. Bac C / D — Maths, Physique, Chimie (matières scientifiques principales)
2. Probatoire C / D — Maths, Physique, Chimie
3. BEPC — Maths, PCT, Français (matières communes)
4. Sessions 2024-2025-2026 (les plus actuelles)

## Sources à consulter pour le remplissage

- Documents officiels MINESEC / OBC (Office du Baccalauréat du Cameroun)
- Annales corrigées validées par des enseignants
- Pas de Wikipedia, pas de forums, pas de sources non officielles

## Contenu

<!-- À remplir : barèmes par examen × série × matière × session -->
