# Styles de combat (multijoueur)

Statut : à venir. Rien n'est implémenté.

## Idée

Donner à chaque combattant en ligne un style de jeu distinct, à partir des coups qui existent déjà (aucune nouvelle animation Mixamo nécessaire).

Coups disponibles (`MOVES`) : jab, direct (cross), crochet (hook), corps (body), uppercut, low kick, front kick (teep), middle kick (roundhouse), high kick (headkick), projection (throw), guillotine (soumission).

## Styles proposés

| Style | Stats | Combos (touches) | Point fort / faible |
|---|---|---|---|
| **Équilibré** (style actuel) | normales | tous les combos actuels | polyvalent, rien d'exceptionnel |
| **Boxeur** | rapide, PV un peu bas, poings plus forts | jab → direct → crochet → uppercut. Pas de pied (ou seulement le front kick pour tenir la distance), pas de saisie | enchaînements de poings très rapides, mais facile à tenir à distance et à saisir |
| **Kickboxeur** | vitesse normale, grande portée | low kick → middle kick → high kick, front kick pour repousser. Poings limités à jab et direct | domine à distance, fragile de près |
| **Lutteur** | lent, beaucoup de PV, bonne résistance | projection et guillotine accessibles en 1 ou 2 touches. Poings courts | dangereux de près (soumission), vulnérable aux coups de loin |
| **Bagarreur** | lent, énormément de PV, dégâts élevés | crochet et uppercut dès le départ, coups lourds mais lents | un coup qui touche fait mal, mais facile à esquiver |

L'écran de pause affiche les combos propres au style du joueur (plus la liste unique actuelle).

## Question de conception ouverte

Le style est-il **lié au personnage** (Rico = boxeur, Mika = lutteur…) ou **choisi séparément** à l'écran de sélection ?
Recommandation : choix séparé (plus flexible), au prix d'une étape de plus dans `#select`.

## Faisabilité technique

Facile :
- Stats par style via `configure` (`speed`, `maxHp`, `dmgMul`, `heavyExtra`) dans la table `CHARS`.
- Combos propres à chaque style : la table globale `COMBOS` doit devenir par-combattant. Environ 6 sites à adapter : `playerIntent`, `remoteIntent`, `Fighter.update` / `canChain`, `tryHit` (`finished`), `comboName`, `AI`, tableau de la pause.
- Réseau sans impact : les deux clients construisent le combattant à partir de son id, et `MOVES` reste global. Il suffit d'ajouter l'id du style au message `pick`.

Difficile :
- Créer de nouveaux coups : il faut de nouvelles animations Mixamo converties au format JSON du jeu (l'outil de conversion n'est pas dans le dossier).

## Combos actuels (référence)

- `''` : J → jab, K → lowkick, E → throw
- jab → (J direct, K teep)
- jab>cross → (J hook, K roundhouse, E guillotine)
- jab>cross>hook → (J upper, K headkick, E guillotine)
- jab>teep → K roundhouse
- lowkick → (J cross, K roundhouse)
- lowkick>cross → (J hook, E guillotine)
- lowkick>cross>hook → K headkick

Remarque : `body` existe dans `MOVES` mais n'est dans aucun combo.
