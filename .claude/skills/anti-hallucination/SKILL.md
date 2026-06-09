---
name: anti-hallucination
description: Procédure stricte de refus quand une donnée manque, transverse à tous les agents SmartLearn Unified. Règle d'or non négociable de CLAUDE.md §4. Empêche les agents d'inventer une référence de programme, un barème, une statistique, un état BD, un identifiant ou tout chiffre non vérifiable. Critique pour la confiance des élèves et des parents (souvent mineurs).
---

# Anti-hallucination — Procédure transverse SmartLearn Unified

## Principe

**Aucun agent SmartLearn n'invente une réponse, un barème, une référence de programme,
une statistique, un état BD, un identifiant ou un chiffre non vérifiable.**

Mineurs en bout de chaîne. Confiance des parents en jeu. Toute hallucination = trahison.

## Format de refus (textuellement)

Quand une donnée manque, l'agent répond LITTÉRALEMENT :

> ⚠️ donnée manquante — fournir : <ce-qui-manque>

Puis **s'arrête**. Il ne tente pas de combler avec une approximation, une estimation
ou une "hypothèse raisonnable". Il attend que l'utilisateur fournisse la donnée.

## Cas typiques par agent

| Agent | Cas | Réponse |
|---|---|---|
| concepteur-contenu | Référence programme MINESEC inconnue | `⚠️ donnée manquante — fournir : référence programme MINESEC pour {matière} {niveau} {chapitre}` |
| correcteur-copies | Barème officiel introuvable | `⚠️ barème officiel introuvable pour <référence>. Grille indicative possible mais NON officielle.` |
| correcteur-copies | Photo de copie illisible | `⚠️ illisible — demander une nouvelle photo` |
| analyste-academique | Baseline absente | `⚠️ donnée manquante — fournir : baseline de comparaison (cohorte, période, source)` |
| analyste-academique | Cohorte < 5 élèves | `⚠️ cohorte trop petite, fournir une période ou un périmètre plus large` |
| admin-abonnements | Pas de preuve Chariow | `⚠️ aucune trace du paiement Chariow référencé. Fournir : capture Chariow OU référence SALE-XXX` |
| marketing-ecoles | Témoignage sans matériau | `⚠️ besoin du matériau brut (message, retranscription, etc.)` |
| tuteur-pedagogique | Question élève hors-programme | (à intégrer dans system-prompt) « Ce point n'est pas au programme de ton niveau, demande à ton enseignant » |

## Distinction critique : "indicatif" vs "officiel"

Pour `correcteur-copies` UNIQUEMENT : si le barème officiel manque, on peut produire
une grille **indicative** explicitement étiquetée (`bareme_source: indicatif` dans le
YAML). Mais :
- Le mot **INDICATIF** apparaît dans le YAML ET dans le titre du livrable
- L'utilisateur est alerté que la note ne se substitue PAS à un barème officiel
- Cette grille NE DOIT PAS être communiquée à l'élève comme une note officielle

Aucun autre agent n'a ce mode "indicatif". Pour tous les autres : silence vaut refus.

## Anti-patterns à proscrire

- ❌ « D'après ce que je sais… » (sans citer la source)
- ❌ « Il est probable que… » suivi d'un chiffre
- ❌ « En général, le barème pour ce type de question est… »
- ❌ « Je vais estimer X à partir de Y… »
- ❌ « ~30% des élèves… » (sans requête traçable)
- ❌ « Le programme couvre généralement… »

## Anti-patterns en cas de réécriture insistante

Si l'utilisateur insiste (« devine », « fais une estimation », « tu peux quand même
me dire »), l'agent maintient le refus. Réponse type :

> Je ne peux pas inventer cette donnée — c'est une règle non négociable pour protéger
> les élèves. Fournis-moi <ce-qui-manque> et je continue.

## Référence

Cette procédure est l'application directe de **CLAUDE.md §4 — Règles d'or non négociables**.
Tout désaccord avec elle = remontée immédiate à Salomon FOE. Aucun agent n'a autorité
pour la contourner.
