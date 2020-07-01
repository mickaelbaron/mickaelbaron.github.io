---
title: Mise à jour des tutoriels sur Vue.js
tags: [Vue.js, Java, Docker]
category: technical
description: Une mise à jour sur les tutoriels consacrés à Vue.js est disponible, venez découvrir les nouveautés que j'ai apportées pour cette révision 2020.
twitter: 1278387487363215361
---
Pour rappel, une série de trois tutoriels consacrés au framework web JavaScript [Vue.js](https://vuejs.org/) est disponible :

* généralités sur les frameworks web JavaScript et présentation de [Vue.js](https://vuejs.org/) ➡️ [partie 1](/web/vuejs-generalites-part1) ;
* mise en œuvre des concepts de [Vue.js](https://vuejs.org/) ➡️ [partie 2](/web/vuejs-miseenoeuvre-part2) ;
* déploiement d'une application web développée avec [Vue.js](https://vuejs.org/) ➡️ [partie 3](/web/vuejs-deploiement-part3).

J'ai réalisé une révision des trois tutoriels dont les principales améliorations sont les suivantes :

* passages aux dernières versions mineures de l'ensemble des bibliothèques JavaScript ;
* passage de Vue CLI 3 à Vue CLI 4 ;
* déplacement des sections *Rendu conditionnel* et *Rendu de liste* dans la section *Templating avec Vue.js ; Directives* ;
* déplacement de la section *Propriétés calculées et observateurs* dans la section *Composant avec Vue.js* ;
* utilisation plus poussée de ESLint avec un niveau de priorité à B *Strongly Recommended* ;
* passage de Java 8 à Java 11 pour la partie backend ;
* passage aux dernières versions majeures pour [KumuluzEE](https://ee.kumuluz.com/) ;

Je n'ai pas encore franchi le pas de la nouvelle version 3 de [Vue.js](https://vuejs.org/). Sa sortie ne devrait pas tarder, mais je me laisse un peu de temps pour la maîtriser (mise à jour pour 2021).

L'exemple utilisé est toujours PollDLE. Pour rappel, il s'agit d'une application pour créer et soumettre des sondages. PollDLE ~= Poll + la dernière partie de Doo DLE (Doodle est une application de planification de rendez-vous, très connue pour être simple d'utilisation).

![Ecran pour vôter à un sondage PollDLE](/images/vuejs-miseenoeuvre-part2/poll_polldle.png)

Le code source complet de l'exemple PollDLE a aussi été mis à jour, notamment dû aux restructurations des tutoriels. Le lien pour les codes sources est : <https://github.com/mickaelbaron/vuejs-polldle-tutorial-src>.

Ce tutoriel a été écrit avec ❤️ et sa mise à jour aussi. J'espère qu'il vous plaira et vous aidera à développer des applications web monopages (Single-Page Application) avec [Vue.js](https://vuejs.org/).

N'hésitez pas à laisser des commentaires sur le fil Twitter prévu à cet effet.
