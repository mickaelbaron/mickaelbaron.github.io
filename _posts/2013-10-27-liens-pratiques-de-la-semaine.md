---
title: Liens pratiques de la semaine 43 (octobre 2013)
tags: [Eclipse, Java, NoSQL]
blogger_orig_url: https://keulkeul.blogspot.com/2013/10/liens-pratiques-de-la-semaine.html
category: technological-watch
---

Vous trouverez dans ce billet une sélection de liens pratiques autour des technologies Java qui m'ont particulièrement intéressées cette semaine 43 (octobree 2013).

Eclipse

* Eclipse Luna M2 est dipsonible ([nouveautés](http://download.eclipse.org/eclipse/downloads/drops4/S-4.4M2-201309182000/news/) et [téléchargement](http://download.eclipse.org/eclipse/downloads/drops4/S-4.4M2-201309182000/index.php#EclipseSDK)).
* Une [série](http://eclipseo.blogspot.fr/2013/08/series-continued-on-maventycho-jenkins.html?view=classic) de tutoriels sur Tycho ([installation](https://docs.google.com/file/d/0BwQyPD9hEv4dTTQyaF94THpVR3c/edit?usp=sharing), [build plugins](https://docs.google.com/file/d/0BwQyPD9hEv4dcWpWVUVpWTllSHM/edit?usp=sharing), [build plugins avec Jenkins](https://docs.google.com/file/d/0BwQyPD9hEv4dcWpWVUVpWTllSHM/edit?usp=sharing), [build several plugins](https://docs.google.com/file/d/0BwQyPD9hEv4dZ2pDTl9vNzZ1LWM/edit?usp=sharing), [build features](https://docs.google.com/file/d/0BwQyPD9hEv4dbTBpbklNbDlxUFE/edit?usp=sharing), [build p2 repository](https://docs.google.com/file/d/0BwQyPD9hEv4dT1NvT3lPRmtaMTQ/edit?usp=sharing), [build product](https://docs.google.com/file/d/0BwQyPD9hEv4dZFNfVUpTYU5qNjA/edit?usp=sharing)).
* Un [plugin](http://codeandme.blogspot.fr/2013/08/preferences-browser-plug-in.html) qui permet de visualiser dans une vue les préférences Eclipse.
* Un [billet](http://eclipsesource.com/blogs/2013/08/30/introducing-rap-autosuggest/) qui montre comment faire un autosuggest avec Eclipse RAP.
* Eclipse RAP 2.2 M2 est disponible ([nouveautés](http://www.eclipse.org/rap/noteworthy/2.2/?build=M2) et [téléchargement](http://www.eclipse.org/downloads/download.php?file=/rt/rap/2.2/rap-2.2.0-M2-20130930-1404.zip)).
* Un [tutoriel](http://eclipsesource.com/blogs/2013/09/03/eclipse-4-e4-tutorial-services/) sur les services avec Eclipse 4.
* [SWTBot](http://eclipse.org/swtbot/) l'outil de test pour SWT, Eclipse et GEF a un nouveau logo ([source](http://mickaelistria.wordpress.com/2013/10/18/the-face-of-swtbot/)). La fondation Eclipse sponsorisait les projets Eclipse.org désireux de renouveler un logo.
* Connecter [Bonita BPM](http://www.bonitasoft.org/blog/tutorial/trello-application-example-%E2%80%93-part-2/) avec l'outil Trello d'organisation de tâches.
* Un [résumé](http://eclipsesource.com/blogs/2013/08/22/eclipse-command-line-options/) des options de lancement Eclipse.

Java

* Un [article](http://java-persistence-performance.blogspot.fr/2013/08/optimizing-java-serialization-java-vs.html) pour améliorer la sérialisation via différents formats
* [Une résolution du problème](http://eclipsesource.com/blogs/2013/08/19/mutable-variable-capture-in-anonymous-java-classes/) des variables mutables dans une classe anonyme.
* [jo-widgets](https://code.google.com/p/jo-widgets/) est une boîtes à outils au dessus de Swing, JavaFX, SWT et RAP.
* Une [présentation](http://www.slideshare.net/reza_rahman/using-nosql-with-jpa-eclipselink-and-java-ee) intéressante qui montre comment utiliser NoSQL avec EclipseLink et JPA.
* [PGStudio](https://bitbucket.org/openscg/pgstudio) est un PGAdmin PostgreSQL réalisé en GWT. Le code est accessible pratique pour faire du reverse Engineering. 

NoSQL

* [Fonctionnalités](http://www.datastax.com/dev/blog/whats-under-the-hood-in-cassandra-2-0) de Cassandra 2.0 (news sortie depuis septembre donc pas très fraiche, désolé)

Divers

* [ngrok](https://ngrok.com/) est une application qui permet de créer un tunnel pour accéder aux applications serveurs en local. L'intérêt est de pouvoir rendre accessible depuis Internet une application sur votre PC (un site Web par exemple). Très pratique pour les démonstrations en live.
* Un [site](http://www.jsdb.io/) qui regroupe un ensemble de bibliothèque JavaScript.
* [PHPVirtualBox](http://sourceforge.net/projects/phpvirtualbox/) et [VBoxRemote](https://code.google.com/p/vboxremote/) (réalisée en GWT) sont des applications Web qui permettent de gérer les machines virtuelles VirtualBox d'une machine hôte.
* En me documentant sur [Vagrant](http://www.vagrantup.com/), j'ai découvert et expérimenté [Puppet](http://puppetlabs.com/) après avoir fait plusieurs tentatives avec des scripts bash.  Il s'agit d'un langage pour gérer la configuration des systèmes d'exploitation (Linux et Windows).
* Un [site](https://puphpet.com/) qui propose de configurer une machine virtuelle pour provisionner un serveur Web pour du développement PHP. Il vous sera possible de choisir la distribution Linux, le type de serveur Web, la configuration et la version PHP puis le type de SGBD (MySQL ou PostgreSQL). Une fois créé une configuration Vagrant sera générée incluant des scripts Puppet. Un très beau projet tout simple. 
* Un [état des lieux](http://www.presse-citron.net/drones-de-loisirs-le-point-sur-un-marche-en-pleine-ebullition?utm_source=feedly) des différents drones de loisirs, ça commence a devenir abordable. Si vous êtes intéressés par les drones qui volent voici un lien : [http://helicomicro.com/](http://helicomicro.com/).
* Un débat Developpez.com sur "[Le métier d'ingénieur logiciel passionne-t-il encore ?](http://www.developpez.com/actu/62645/Le-metier-d-ingenieur-logiciel-passionne-t-il-encore-Un-developpeur-raconte-comment-il-a-perdu-la-flamme/)". Pour moi la réponse est positive. Le métier dans la recherche amène à des projets très intéressants.
* [ASCII Generator](http://sourceforge.net/projects/ascgen2/) est une application qui permet de convertir une image en texte ASCII.