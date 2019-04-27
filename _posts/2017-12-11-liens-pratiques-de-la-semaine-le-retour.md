---
title: Liens pratiques de la semaine 50 (décembre 2017)
tags: [Java, Eclipse]
blogger_orig_url: https://keulkeul.blogspot.com/2017/12/liens-pratiques-de-la-semaine-le-retour.html
category: technological-watch
---

Vous trouverez dans ce billet une sélection de liens pratiques autour des technologies Java et autres qui m'ont particulièrement intéressées cette semaine 50 (décembre 2017.

Java

* Java 9 est disponible. Ok ce n'est pas tout neuf mais une news avait été rédigée sur le [site](https://java.developpez.com/actu/160955/Java-9-est-disponible-la-plateforme-se-met-aux-modules-tour-d-horizon-des-nouveautes/) de Developpez.com.
* [GWT 2.8.2](http://www.gwtproject.org/release-notes.html#Release_Notes_2_8_2) est disponible avec la possibilité de compiler les projets GWT avec une JDK 9. Attention les fonctionnalités Java 9 ne sont pas encore supportées par GWT. Mes applications sont encore en 2.8.0...
* [DuctTape](https://github.com/rnorth/duct-tape) est une bibliothèque permettant la gestion des erreurs quand vous avez du code qui doit accéder à des API externes. Grosso-modo, vous pouvez expliciter quoi faire quand interroger un service web qui ne répond pas tout de suite (retenter au bout de X secondes...).
* Une nouvelle version pour [JITWatch](https://github.com/AdoptOpenJDK/jitwatch), un outil de profiling de la JVM.
* Pour utiliser Docker depuis Java, différentes bibliothèques sont disponibles : [DockerJava](https://github.com/docker-java/docker-java) utilisé dans TestContainers, [DockerClient](https://github.com/spotify/docker-client) proposé par Spotify et dernièrement [Jocker](https://github.com/Dockins/jocker). Pour ce dernier, l'objectif est d'utiliser le moins de dépendance Maven possible.
* JUnit 5 est désormais disponible. Allez faire un tour sur le [documentation](http://junit.org/junit5/docs/current/user-guide/) en ligne très riche.
* Jocker est une nouvelle API pour communiquer depuis Java vers les services Docker. Sinon il existe [DockerJava](https://github.com/docker-java/docker-java) utilisé par TestContainers, [DockerClient](https://github.com/spotify/docker-client) proposée par Spotify, un peu plus éloigné [Fabric8io](https://github.com/fabric8io) ou [docker-client](https://github.com/gesellix/docker-client) pour le langage Groovy.
* [Simple Theme Plugin](https://wiki.jenkins.io/display/JENKINS/Simple+Theme+Plugin) est un plugin pour rendre plus joli son Jenkins.

Eclipse

* La série EMF sur Eclpse CHE continue. Voici deux nouveaux billets qui présentent respectivement la [création d'un plugin](https://eclipsesource.com/blogs/2017/07/21/emf-support-for-che-day-5/) et l'[ajout d'un éditeur spécifique](https://eclipsesource.com/blogs/2017/09/28/emf-support-for-che-day-6-adding-your-own-editor/).

Divers

* De très [bons tutoriels vidéos](https://www.grafikart.fr/formations/git/) pour comprendre Git. Celui sur le reset est très bien fait.
* L'outil [Docify](https://docsify.js.org/) permet de générer des documentations techniques à partir de document Markdown.
* J'expérimente depuis peu l'écosystème ArduPilot. Comme je commence à me Dockeriser à l'extrême, j'ai réalisé une version [conteneur du simulateur SITL](https://github.com/mickaelbaron/docker4sitl) (Software In The Loop). Dans le dépôt Git il est expliqué comment utilisé l'option console pour avoir l'interface graphique.
* Pour gérer les fenêtres sous MacOS, j'utilisais [SizeUP](http://www.irradiatedsoftware.com/sizeup/) qui était payant. Une alternative gratuite et OpenSource est disponible via [Spectacle](https://www.spectacleapp.com/).  
* Si vous souhaitez tester la première version d'Unix (1972), vous pouvez par l'intermédiaire de [Docker](https://nickjanetakis.com/blog/run-the-first-edition-of-unix-1972-with-docker).
* [10 animations sympathiques](https://cloudinary.com/blog/creating_html5_animations) à faire avec HTML5.
* Faire de son crack en informatique avec l'animation Hollywood. Saisir cette commande `docker run -it --rm jess/hollywood`.
* [gtop](https://github.com/aksakalli/gtop) est une version graphique (en mode texte) de l'application Linux top.