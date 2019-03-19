---
title: Lecteur de médias avec QuickTime for Java
tags: [Java, Swing]
blogger_orig_url: https://keulkeul.blogspot.com/2006/09/lecteur-de-fichiers-vidos-et-audios.html
category: technical
---

Voici mon premier post concernant un code Java. Je commence par une petite application de type lecteur de média que j'ai utilisé dans un outil de modélisation de tâches utilisateur.

Pour ce lecteur, j'ai utilisé l'API d'Apple pour sa librairie QuickTime. Il faut avouer qu'au premier abord, l'utilisation de cette API n'est pas des plus faciles. Après avoir repéré dans l'API les classes qui ne sont pas à utiliser (DEPRECATED), son exploitation a été rendue difficile par l'absence de documentation et d'exemples.  

Avant de continuer, voici quelques ressources sur le sujet :

* le site d'Apple concernant la partie [QuickTime for Java](http://developer.apple.com/quicktime/qtjava/) ;
* les [exemples](http://examples.oreilly.com/quicktimejvaadn/) de code du livre [QuickTime for Java : A Developer's Notebook](http://www.oreilly.com/catalog/quicktimejvaadn/).

Sur la figure ci-dessous est présentée l'interface de ce lecteur.
  
![](/images/quicktimeplayer.jpg)

Une partie centrale pour le média, une partie sud pour les contrôles et enfin une partie droite pour les informations du film.  

L'originalité de ce lecteur tient dans la possibilité de positionner des marqueurs (début et fin) dans le but de sélectionner une zone du média.

Je ne vais pas rentrer dans les détails du code, je vous laisse le plaisir d'y regarder. Comme cet exemple est riche en termes d'états, la séparation du contrôle et de la présentation est largement justifée.  

Avant de terminer, je vais simplement émettre une remarque concernant la gestion des événements introduits par Apple (par exemple : événement déclenché à la fin de la lecture d'un média). Je repprocherai donc à l'API QuickTime d'Apple de ne pas utiliser des écouteurs à la sauce Java mais plutôt des callbacks à la sauce vieille boîte à outils.

Une petite pub au passage pour l'outil en question [K-MADe](https://forge.lias-lab.fr/projects/kmade).

Les codes sont disponibles ici ([playerquicktime.zip](/files/playerquicktime.zip)) sous licence GPL.
