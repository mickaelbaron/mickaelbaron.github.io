---
title: Liens pratiques de la semaine 43 (octobre 2016)
tags: [Eclipse,Java,Docker]
blogger_orig_url: https://keulkeul.blogspot.com/2016/10/liens-pratiques-des-dernieres-semaines.html
category: technological-watch
---

Vous trouverez dans ce billet une sélection de liens pratiques autour des technologies Java et autres qui m'ont particulièrement intéressées cette semaine 43 (octobre 2016).

Java

* Un [billet](https://antoniogoncalves.org/2016/10/03/securing-jax-rs-endpoints-with-jwt/) qui montre l'utilisation de JWT (à ne pas confondre avec GWT) et de JAX-RS. JWT est un standard pour l'échange de données de manière sécurisée. En gros cela remplace les cookies et les tokens. Le [code source](https://github.com/agoncal/agoncal-sample-jaxrs/tree/master/04-JWT) de l'exemple complet.

Eclipse

* Pour tester un bout de code en Java, il faut faire un projet, une classe et une méthode main. En utilisant les Scrapbook vous pouvez copier/coller du code et l'exécuter par sélection. Un [billet](https://recoveringprogrammer.wordpress.com/2013/04/06/using-eclipse-scrapbook-to-quickly-test-your-code/) de blog qui explique tout cela.
* [Eclipse 4.7 M2](https://www.eclipse.org/eclipse/news/4.7/M2/) est disponible depuis septembre 2016. Cette version se concentre sur l'[utilisabilité](http://blog.vogella.com/2016/09/19/eclipse-4-7-m2-is-out-with-a-focus-on-usability/).

GWT

* GWT 2.8 est disponible ([source 1](http://googlewebtoolkit.blogspot.fr/2016/10/gwt-28-released.html) et [2](http://javaweb.developpez.com/actu/105741/GWT-disponible-dans-sa-version-2-8-JSInterop-et-support-de-Java-8-Retour-dans-la-course-de-Java-pour-le-developpement-web/)). Au menu, support de Java 8, JSInterop pour faciliter l'utilisation des bibliothèques JS existantes, Guava utilisable dans la partie cliente, CSS3 avec GSS et un super Dev Mode amélioré. 
* [GWT-Numeral](https://github.com/liraz/gwt-numeral) est un wrapper pour la bibliothèque JS Numeral qui sert à formatter et manipuler les nombres.
* [GWT-SoundJS](https://github.com/liraz/gwt-soundjs) est un wrapper pour la bibliothèque JS CreateJS qui permet d'utiliser du son.
* Un [billet](http://www.g-widgets.com/2016/09/22/dockerizing-a-gwt-app/) de blog qui explique comment utiliser Docker pour faire un build d'une application GWT et comment exécuter une application GWT avec une image utilisant Jetty.
* Un [billet](http://www.g-widgets.com/2016/09/09/gwt-http-requests-alternatives/) de blog qui montre les alternatives au système RPC utilisé par GWT, les alternatives focalisent essentiellement sur des API Rest. GWT a été créé trop tôt, RPC était hyper à l'époque ;-)

BigData

* Un très bon [billet](http://www.touilleur-express.fr/2016/09/23/hadoop-et-elasticsearch-comment-indexer-vers-es/) qui montre comment utiliser conjointement Hadoop et ElasticSearch. Pour le premier c'est surtout pour les aspects stockages distribués.

JavaScript

* [FlipClock.js](http://flipclock.js/) est une bibliothèque JavaScript qui montre de manière élégante une horloge. Vous pouvez vous en servir comme compteur.
* Un [billet](http://www.jvandemo.com/how-to-configure-your-angularjs-application-using-environment-variables/) simple mais efficace sur l'usage des variables d'environnement dans AngularJS. Avec cette explication il est facile d'externaliser l'URL d'un backend. Pratique si vous utilisez Docker pour le déploiement, il suffit de donner un fichier env.js lors de la construction du conteneur.

Docker

* Des [astuces](http://blog.florianlopes.io/5-tips-to-reduce-docker-image-size/) pour réduire la taille de vos images Docker.
* Un billet qui montre comment utiliser un [ElasticSearch](http://www.touilleur-express.fr/2016/09/21/environnement-de-developpement-elasticsearch-avec-docker/) avec Docker.

Divers

* [OpenShot](http://www.openshot.org/) est un logiciel de montage vidéo gratuit et Open Source 
* Si vous souhaitez configurez l'installation de votre Raspberry PI (Wifi activé avec le bon mot de passe...) en utilisant un DSL proche de Scratch, [PiBakery](http://www.pibakery.org/) est fait pour vous.
* [Insomnia](https://insomnia.rest/) est un outil pour faire des tests de services Rest. Il est agréable à utiliser et la version gratuite est suffisante pour faire de petits tests.
* Un [billet](http://www.jamesshore.com/Blog/Dependency-Injection-Demystified.html) de blog qui explique très simplement l'injection de dépendance.
* Depuis PostgreSQL 9.5, il existe le support de TableSample qui permet de générer aléatoirement des données pour une table. Ce [billet](http://blog.2ndquadrant.com/tablesample-in-postgresql-9-5-2/) de blog explique son utilisation. 
* Le projet [Jupyter](http://jupyter.org/) permet d'avoir un environnement d'exécution en live d'un langage de programmation donné dans une application web. En gros, si vous cherchez le moyen de fournir des bouts de code exécutables en live, ce projet est fait pour vous. À noter qu'il existe une [version expérimentale](https://github.com/Bachmann1234/java9_kernel) pour Java via l'utilisation du REPL du prochain Java 9.
* Une [bonne explication](https://dzone.com/articles/the-lgpl-license?) de la licence LGPL.