---
title: 'Tutoriel pour développer une application web avec Vue.js et Vue CLI : déploiement avec Docker (partie 3)'
tags: [Vue.js, Docker]
category: technical
description: Cette troisième partie s'intéresse aux problématiques de déploiement d'une application Vue.js en utilisant Docker pour créer des conteneurs.
twitter: 1148586483495972866
---

Je viens de finaliser l'écriture d'un tutoriel consacré framework web JavaScript [Vue.js](https://vuejs.org/). Il sera publié en trois parties :

* généralités sur les frameworks web JavaScript et présentation de [Vue.js](https://vuejs.org/) ;
* mise en œuvre des concepts de [Vue.js](https://vuejs.org/) ;
* déploiement d'une application web développée avec [Vue.js](https://vuejs.org/).

Cette troisième partie s'intéresse aux problématiques de déploiement d'une application [Vue.js](https://vuejs.org/) en utilisant massivement la brique technologique Docker pour créer des conteneurs.

* construction d'images Docker des différents composants (Java et [Vue.js](https://vuejs.org/)) ;
* création de conteneurs Docker ;
* gestion d'un déploiement avec un sous-chemin ;
* tester l'application PollDLE.

![Ecran pour vôter à un sondage PollDLE](/images/vuejs-deploiement-part3/schema.png)

L'exemple est appelé PollDLE qui est une application pour créer et soumettre des sondages. PollDLE ~= Poll + la dernière partie de Doo DLE (Doodle est une application de planification de rendez-vous, très connue pour être simple d'utilisation).

Vous trouverez sur ce [lien](/web/vuejs-deploiement-part3) le contenu de cette troisième partie du tutoriel.

Le code source complet de l'exemple PollDLE est disponible à cette adresse : <https://github.com/mickaelbaron/vuejs-polldle-tutorial-src>.

Ce tutoriel a été écrit avec ❤️. J'espère qu'il vous plaira et vous aidera à développer des applications web monopages (Single-Page Application) avec [Vue.js](https://vuejs.org/).

N'hésitez pas à laisser des commentaires sur le fil Twitter prévu à cet effet.
