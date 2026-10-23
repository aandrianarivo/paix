# ASSETS_CREDITS — démo navigateur « Laisse-moi tranquille »

Fichiers fournis par le développeur le 23 octobre 2026, téléchargés par lui sur Mixamo et Poly Haven. Bâtiments Kenney récupérés le 22 octobre 2026.

## Personnages — Mixamo (Adobe)

Conditions Mixamo : usage autorisé dans des projets personnels, commerciaux et non lucratifs ; redistribution des fichiers bruts seuls interdite. https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html — à revérifier avant toute diffusion publique.

| Fichier dans la démo | Source | Rôle | Modifications |
|---|---|---|---|
| `assets/chars/ch31.json` + `ch31_*.jpg/png` | Mixamo, personnage « Ch31 » (`Ch31_nonPBR.fbx`) | Le protagoniste | Converti en glTF (JSON). Squelette renommé `mixamorig*`. Textures réduites de 4K à 2K (peau/vêtements) et 1K (normales, cheveux). Cartes spéculaires et de brillance retirées. |
| `assets/chars/ch08.json` + `ch08_*.jpg/png` | Mixamo, personnage « Ch08 » (`Ch08_nonPBR.fbx`) | Rico, Mika et les figurants | Mêmes conversions. Mika et les figurants : couleur des vêtements teintée par le code, barbe masquée pour certains. |

## Animations — Mixamo (Adobe), mêmes conditions

| Fichier | Animation Mixamo | Usage dans le jeu |
|---|---|---|
| `anims/idle.json` | Idle (garde de combat) | Garde |
| `anims/stepback.json` | Step Backward | Déplacements en garde (joué à l'envers pour avancer) |
| `anims/jabcross.json` | Jab Cross | Jab |
| `anims/cross.json` | Cross Punch | Direct |
| `anims/hook.json` | Hook Punch | Crochet |
| `anims/upper.json` | Uppercut | Uppercut |
| `anims/mmakick.json` | Mma Kick | Low kick |
| `anims/kicking.json` | Kicking | Front kick et high kick |
| `anims/roundhouse.json` | Roundhouse Kick | Middle kick |
| `anims/block.json` | Blocking | Garde (blocage) |
| `anims/dodge.json` | Dodging | Esquive |
| `anims/headhit.json` | Head Hit | Coup reçu à la tête |
| `anims/bodyhit.json` | Big Stomach Hit | Coup reçu au corps, soumission subie |
| `anims/ko.json` | Knocked Out | K.O. et personnage au sol |
| `anims/getup.json` | Getting Up | Se relever |
| `anims/throw.json` | Flying Shoulder Throw | Personnage projeté |
| `anims/strut.json` | Strut Walking | Marche de Rico |
| `anims/arguing.json` | Standing Arguing (extrait de 5,5 s) | Mika qui reproche |
| `anims/angry.json`, `cocky.json`, `dismiss.json`, `lookaway.json`, `annoyed.json`, `thoughtful.json`, `nod.json` | Gestures Pack Basic | Gestes pendant les scènes |
| `anims/cidle.json`, `walk.json`, `sad.json`, `headshake.json`, `agree.json` | X Bot (exemples three.js, Mixamo) | Attente, marche, posture abattue ; reciblés sur le squelette des personnages |

Toutes les animations : déplacement horizontal du bassin supprimé (le jeu gère la position), valeurs arrondies. Coups : la fenêtre d'impact du jeu est calée sur l'instant d'extension maximale du poing ou du pied dans le clip.

Non utilisés : `Walk_Forward_Arc_Right.fbx`. Illisibles par le chargeur FBX : `shaking head no`, `relieved sigh`, `weight shift`.

## Sols — Poly Haven, licence CC0

| Fichier | Texture | Source | Modifications |
|---|---|---|---|
| `assets/tex/tarred_gravel_*.jpg` | Tarred Gravel | https://polyhaven.com/a/tarred_gravel | Diffuse et déplacement réduits de 4K à 1K. Déplacement utilisé comme relief (bump). Normales et rugosité EXR non utilisées. |
| `assets/tex/gravel_stones_*.jpg` | Gravel Stones | https://polyhaven.com/a/gravel_stones | Idem. |

Licence CC0 : https://polyhaven.com/license

## Décors — Kenney, licence CC0

| Fichier | Asset | Source | Modifications |
|---|---|---|---|
| `assets/kenney/building-*.json`, `Textures/colormap.png` | Starter Kit City Builder | https://github.com/KenneyNL/Starter-Kit-City-Builder | Convertis en glTF JSON, mis à l'échelle ×5,2. |

## Créé dans le code

Terrain de basket, cour, grillage, mobilier, lampadaires, voiture, sons (synthèse Web Audio), voix (synthèse vocale du navigateur).
