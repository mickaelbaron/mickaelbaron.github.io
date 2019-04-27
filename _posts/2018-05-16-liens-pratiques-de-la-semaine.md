---
title: Liens pratiques de la semaine 20 (mai 2018)
tags: [Java]
blogger_orig_url: https://keulkeul.blogspot.com/2018/05/liens-pratiques-de-la-semaine.html
category: technological-watch
twitter: 996750466695516160
---

Vous trouverez dans ce billet une sélection de liens pratiques autour des technologies Java et autres qui m'ont particulièrement intéressées cette semaine 20 (mai 2018).

Java

* [Un dépôt Github](https://github.com/gesellix/docker-client-shootout) pour la comparaison des clients Java pour manipuler l'API Docker.
* Le projet Amber qui inclut notamment le typage implicite (var) est détaillé dans ce [billet](https://mahmoudanouti.wordpress.com/2017/12/23/what-is-project-amber-in-java/) de blog.
* Dans la suite du premier item, voici les autres [nouveautés](https://tekaholics.com/2017/12/19/what-to-expect-in-java-jdk-10/) pour Java 10. Depuis la sortie, voici un [article](https://javarevisited.blogspot.fr/2018/03/java-10-released-10-new-features-java.html) qui présente les 10 principales nouveautés.
* Un [billet](https://medium.com/hurryops/server-sent-events-with-jax-rs-a63ce1813d82) de blog qui détaille comment utiliser Server-Sent Events SSE (technologie pour envoyer des messages du serveur vers le client, une technologie concurrente aux WebSockets) avec JAX-RS. Au passage, un [article](http://www.devdummy.com/2017/12/http-polling-http-long-polling.html) qui parle des autres technologies autre que SSE.
* [GWT-Jackson](https://github.com/vegegoku/gwt-jackson-apt) est une bibliothèque pour GWT pour fournir l'intégration de Jackson (mapping JSON).
* [vue-gwt](https://github.com/Axellience/vue-gwt) est un wrapper de la bibliothèque [Vue.js](https://vuejs.org/). Le langage Java est utilisé pour remplacer Javascript pour toute la partie contrôleur. Un [billet](http://www.g-widgets.com/2018/03/24/a-walk-through-the-gwt-wrapper-for-vue-js-vue-gwt/) qui montre comment l'utiliser.
* Un [article](https://dzone.com/articles/eclipse-jnosql-a-quick-overview-with-redis-cassand) qui traite de [JNoSQL](http://www.jnosql.org/), une bibliothèque qui fournit un accès JDBC "avancé" pour les bases de données NoSQL.
* [Java EE est devenu Jakarta EE](https://mmilinkov.wordpress.com/2018/02/26/and-the-name-is/) et est désormais soutenue par la fondation Eclipse, j'espère que cela permettra d'accélérer les nouveautés.
* Un [billet](http://www.g-widgets.com/2018/05/09/reactive-gwt/) de blog qui montre comment utiliser RXJava avec GWT.
* Une série de trois billets sur JShell, l'interpréteur Java introduit depuis Java 9 ([billet 1](http://blog.soat.fr/2018/03/java9_decouverte_jshell_1/), [billet 2](http://blog.soat.fr/2018/04/java9_decouverte_jshell_2/) et [billet 3](http://blog.soat.fr/2018/04/java-9-a-la-decouverte-de-jshell-33/)).
* Un [billet](https://www.fxjavadevblog.fr/jshell-http-server/) intéressant sur les possibilités de JShell pour créer un serveur HTTP minimaliste.

Javascript / Web

* Une [page](https://github.com/vuejs/awesome-vue) Github de type Awesome qui regroupe beaucoup de liens autour de Vue.js.
* Toujours dans la série de Vue.js, voici [un livre de recettes](https://vuejs.org/v2/cookbook/) (Cookbook) des meilleures pratiques.
* Un [billet](https://alligator.io/vuejs/working-with-environment-variables/) de blog qui montre comment utiliser les variables d'environnement dans ses projets Vue.js
* Une très bonne [présentation](https://mixitconf.org/2018/vue-js-le-framework-progressif) de Vue.js par un Core développeur ([slides](http://slides.com/akryum/vue-mixit-2018) de la présentation).
* Des comparatifs ([lien 1](http://slides.com/telerikdevrel/ns-vue) et [lien 2](http://slides.com/telerikdevrel/ns-rn-ionic)) de framework web natif pour développer par exemple des applications Progressive Web App. Pour le second comparatif, une [vidéo](https://www.youtube.com/watch?v=1Kqtg1Mw2wc) est disponible.

Divers

* Un [billet](https://xsolve.software/blog/face-detection-open-source-symfony3/) de blog qui montre comment choisir et utiliser une API pour la reconnaissance faciale.
* Quelques [outils](https://css-tricks.com/front-end-tools-favorite-finds-2017/) à posséder quand on fait du développement web.
* Saviez-vous que pour Docker il y a deux options pour "monter" des volumes : -v et --mount. Cet [article](https://nickjanetakis.com/blog/docker-tip-33-should-you-use-the-volume-or-mount-flag) explique la différence de ces deux options.