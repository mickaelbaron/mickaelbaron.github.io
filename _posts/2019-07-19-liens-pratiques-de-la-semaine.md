---
title: Liens pratiques de la semaine 29 (juillet 2019)
tags: [Java,Docker]
category: technological-watch
---

Vous trouverez dans ce billet une sélection de liens pratiques autour des technologies Java et autres qui m'ont particulièrement intéressées cette semaine 29 (juillet 2019).

## Java

* Un [billet](https://developer.okta.com/blog/2019/07/15/java-myths-2019) de blog qui liste les 10 critiques autour de Java que l'on peut entendre en 2019 (Java est trop lent...)
* [Duct Tape](http://rnorth.viewdocs.io/duct-tape/) est une bibliothèque qui fournit des implémentations des principaux patrons de conception dédiés aux traitements des erreurs (*Circuit breakers*, *Automatic retry functions*, *Timeout functions* et *Rate limiter*).
* JAX-RS, la spécification dédiée au développement de services web REST, est en cours d'évolution. Une [présentation](https://headcrashing.wordpress.com/2019/07/05/jax-rs-3-0-jfs-2019-slides-and-source-code-now-online/) qui donne un aperçu des prochaines évolutions essentiellement autour de la suppression de `@Context` au profit de `@Inject`.
* [Crawler4j](https://github.com/yasserg/crawler4j) est un outil pour parcourir un contenu HTML via une API Java (un [article](https://www.baeldung.com/crawler4j) est disponible sur le site de Baeldung).

## Docker

* [Podman](https://podman.io/) est un outil pour gérer ses conteneurs comme le fait Docker. À la différence, c'est qu'il n'y a pas de *deamon* Docker, pas besoin d'être utilisateur *root*, les conteneurs et les images peuvent être placés dans le répertoire de l'utilisateur *~/.local/share/containers*. Les commandes de [Podman](https://podman.io/) sont identiques à celles de Docker. Fort heureusement les images de Docker sont utilisables par [Podman](https://podman.io/).
* Si vous cherchez des arguments pour faire utiliser [Docker](https://www.docker.com/) dans votre entreprise, lisez cet [article](https://blog.docker.com/2019/07/10-reasons-developers-love-docker/).
* Des [bonnes pratiques](https://blog.docker.com/2019/07/intro-guide-to-dockerfile-best-practices/) pour l'écriture des fichiers *Dockerfile*.

## JavaScript/HTML/CSS

* Pour rappel, j'ai mis en ligne un tutoriel en trois parties sur [Vue.js](https://vuejs.org/). La [première partie](https://mickael-baron.fr/web/vuejs-generalites-part1) concerne les principaux concepts qu’un framework web JavaScript nouvelle génération doit proposer et comment ils ont été intégrés dans [Vue.js](https://vuejs.org/). La [deuxième partie](https://mickael-baron.fr/web/vuejs-miseenoeuvre-part2) présente les principaux concepts de [Vue.js](https://vuejs.org/) au travers d’un exemple. La [troisième partie](https://mickael-baron.fr/web/vuejs-deploiement-part3) s’intéresse aux problématiques de déploiement d’une application [Vue.js](https://vuejs.org/) en utilisant massivement la brique technologique [Docker](https://www.docker.com/) pour créer des conteneurs.
* J'ai mis également en place une [liste Twitter](https://twitter.com/mickaelbaron/lists/vue-js) [Vue.js](https://vuejs.org/) pour suivre l'actualités autour de ce framework web.

## Divers

* [VidCutter](https://github.com/ozmartian/vidcutter) est un outil pour couper ou fusionner des vidéos. Un outil minimaliste disponible sur les trois plateformes macOS, Linux et Windows.
* Un [benchmark](https://www.jeffgeerling.com/blog/2019/raspberry-pi-microsd-card-performance-comparison-2019) intéressant sur les performances des cartes microSD sur Raspberry PI.
* Un [article](https://hackernoon.com/understanding-kafka-with-factorio-74e8fc9bf181) qui permet de comprendre les concepts d'[Apache Kafka](https://kafka.apache.org/) via le jeux-video [Factorio](https://factorio.com/). [Factorio](https://factorio.com/), le jeu pour les ingénieurs gamers.

## Gif de la semaine

![Three Armstrong](/images/gifofzweek/armstrongtriplet.jpg)