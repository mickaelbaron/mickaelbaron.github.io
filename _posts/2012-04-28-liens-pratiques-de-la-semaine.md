---
title: Liens pratiques de la semaine 17 (avril 2012)
tags: [Eclipse, Java]
blogger_orig_url: https://keulkeul.blogspot.com/2012/04/liens-pratiques-de-la-semaine.html
category: technological-watch
description: Vous trouverez dans ce billet une sélection de liens pratiques autour des technologies Java et Eclipse qui m'ont intéressées cette semaine 17 (avril 2012). 
---

Vous trouverez dans ce billet une sélection de liens pratiques autour des technologies Java et Eclipse qui m'ont intéressées cette semaine 17 (avril 2012). Vous trouverez également un bilan de choses intéressantes découvertes lors de Devoxx France 2012.

Eclipse

* [Nouveaux sucres syntaxiques](http://blog.efftinge.de/2012/04/xtend-new-language-features-coming-in.html) pour Xtend le nouveau langage de la fondation Eclipse. 
* [JNect](https://code.google.com/a/eclipselabs.org/p/jnect/) un plugin Eclipse qui fournit une passerelle Java pour le capteur Microsoft Kinect. La vidéo montre l'utilisation du capteur au niveau de l'IDE Eclipse.
* [Eclipse Orion](http://www.eclipse.org/orion/), l'IDE dans le navigateur, passe en 0.5 M1 ([page](http://planetorion.org/news/2012/04/orion-0-5-m1-new-and-noteworthy/) de nouveautés et [page](http://download.eclipse.org/orion/) de téléchargement).
* Une [série de billets](http://angelozerr.wordpress.com/2012/04/05/eclipse_spring_step0/) réalisée par Angelo Zerr qui traite de la mise en place d'une architecture Eclipse RCP/RAP avec Spring DM et Spring Data JPA. Comme d'habitude les billets sont très détaillés et illustré par une [démo](http://xdocreport-rap.opensagres.cloudbees.net/xdocreport?startup=fr.opensagres.xdocreport.eclipse.ui.application).
* Les transparents de la conférence EclipseCon 2012 sont disponibles en téléchargement sur cette [page](http://www.eclipsecon.org/2012/program/sessions/accepted-with-slides).
* EclipseLink dans sa version 2.4 supportera les solutions de stockage NoSQL. Un [billet](http://java-persistence-performance.blogspot.fr/2012/04/eclipselink-jpa-supports-mongodb.html) intéressant qui montre comment intégrer la prise en compte du mode de stockage dans les classes Java. Avec [Hibernate OGM](http://keulkeul.blogspot.fr/2011/10/jai-besoin-dune-introduction-hibernate.html), on se retrouve avec deux solutions différentes. A quand une standardisation au niveau JPA ?
* [EclipseTotale](http://www.eclipsetotale.com/) fournit des liens très intéressants sur des présentations données à l'EclipseCon 2012 expliquant le fonctionnement du socle Eclipse 4.
* [EclipseDayToulouse](http://www.eclipsedaytoulouse.com/), une conférence pour les amoureux de la plateforme Eclipse, se déroulera le 24 mai prochain à Toulouse. [Developpez.com](http://www.developpez.com/actu/43728/Eclipse-Day-Toulouse-le-24-mai-prochain-pour-decouvrir-les-nouveautes-d-Eclipse-Juno/) est partenaire presse de cet événement.

Java

* Peut-être en retard sur ce point là où trop focalisé sur le développement de clients lourds, j'ai découvert [Bootstrap](http://twitter.github.com/bootstrap/) lors de discussions à Devoxx. Ce n'est pas une bibliothèque ni un framework mais une feuille de style CSS développée par Twitter. Avec cette feuille, créer une page Web devient très facile. Visionnez cette [vidéo](http://www.grafikart.fr/tutoriels/html-css/bootstrap-twitter-182) pour vous faire un aperçu rapide. Au fait, le [site Web d'Xtend](http://www.eclipse.org/xtend/) utilise Bootstrap.
* [Byteman](http://www.jboss.org/byteman) est un outil qui permet d'injecter du code Java dans une classe déjà chargée par le classloader. Il permet donc de faire de la modification dynamique de bytecode. Je vais essayer de faire un billet sur ce sujet.
* Si vous souhaitez faire du Push serveur avec GWT vous pouvez utiliser [GWTEventService](http://code.google.com/p/gwteventservice/).
* J'ai découvert une nouvelle façon de coder un singleton, passer par un énuméré. Voici un [article](http://www.vogella.com/articles/DesignPatternSingleton/article.html) de Lars Vogel qui montre comment faire.
