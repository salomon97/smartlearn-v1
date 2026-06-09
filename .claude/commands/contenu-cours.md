---
description: Produit une fiche + QCM alignés MINESEC pour {matière} {niveau} {chapitre} via l'agent concepteur-contenu.
argument-hint: <matière> <niveau> <chapitre>
---

# /contenu-cours — Production d'un module de cours

Tu vas produire un **module de cours complet** : une fiche de révision + un QCM
d'auto-évaluation, alignés sur le programme officiel MINESEC.

## Arguments

L'utilisateur a fourni : `$ARGUMENTS`

Format attendu : `<matière> <niveau> <chapitre>`
Exemples :
- `/contenu-cours Mathématiques Terminale-C "Suites numériques"`
- `/contenu-cours Français 3e "L'argumentation"`
- `/contenu-cours Physique-Chimie 1ère-D "Cinématique"`

Si les 3 arguments ne sont pas fournis, refuse et demande :
> ⚠️ donnée manquante — fournir : matière, niveau, chapitre

## Procédure

1. **Délègue à `concepteur-contenu`** pour produire la **fiche** :
   - Type : `fiche`
   - Chemin : `contenu/{niveau}/{matiere}/fiche-{slug}.md`
   - Cadre pédagogique : APC (Approche par Compétences MINESEC)
   - Structure : Objectifs → Notions clés → Exemples résolus → À retenir → Pour aller plus loin

2. **Délègue à `concepteur-contenu`** pour produire le **QCM** :
   - Type : `qcm`
   - Chemin : `contenu/{niveau}/{matiere}/qcm-{slug}.md`
   - 10 à 20 questions × 4 propositions × 1 corrigée explicitée
   - Difficulté graduée (☆, ☆☆, ☆☆☆)
   - 2 variantes d'énoncé minimum (anti-triche en classe)

3. **Vérifications** (l'agent les fait automatiquement) :
   - Skill `programme-minesec` invoqué pour la référence officielle
   - Skill `charte-smartlearn` invoqué pour le ton
   - Skill `anti-hallucination` actif : si la référence MINESEC est inconnue,
     marque `⚠️ référence à vérifier` au lieu d'inventer

4. **Restitution** au demandeur :
   - Chemins des 2 fichiers créés
   - Durée d'étude estimée
   - Points de vigilance (références marquées `⚠️ à vérifier par l'équipe pédagogique`)
   - Suggestion de produire ensuite : annale liée, corrigé-type, parcours tutorat

## Règles héritées (cf. CLAUDE.md)

- Charte navy/teal/orange uniquement (jamais "or")
- Français par défaut, anglais si sous-système anglophone
- Prénoms fictifs uniquement (Awa, Junior, Marie, Eric, Aïcha, Patrick)
- Aucune référence inventée
- Exemples ancrés au contexte camerounais (FCFA, villes camerounaises) quand pertinent
