---
title: 'J''ai besoin ... d''utiliser Tycho - Partie 1 : Installation'
tags: [Eclipse, Tycho]
blogger_orig_url: https://keulkeul.blogspot.com/2010/04/jai-besoin-dutiliser-tycho-partie-1.html
category: technical
description: Depuis un certains temps de nombreux utilisent Tycho et il semble que les dernières versions de Tycho soient très encourageantes. Je vous propose donc une série de billets pour approfondir autour de Tycho.
---

Dans un précédent [billet]({% post_url 2009-05-08-premier-essai-avec-tycho %}), je me suis essayé à Tycho. Déjà à l'époque j'étais très satisfait du résultat. Depuis un certains temps de nombreux [projets](http://pastie.org/880170) utilisent Tycho et il semble que les dernières versions de Tycho soient très encourageantes.  
  
Je pense qu'il est de temps de s'y attarder plus profondément. Je vous propose donc une série de billets autour de Tycho. L'idée est de pouvoir construire automatiquement un plugin, un product de déployer dans un référentiel commun, etc.  

Ce premier billet s'intéresse à installer et configurer Maven 3 puisque Tycho est un plugin Maven. Tycho s'installera automatiquement s'il est utilisé dans une configuration pom.xml. La manipulation a été réalisée sous Windows 7 64 bits mais doit fonctionner sur tous les autres systèmes où Maven est supporté. Par ailleurs, je ne souhaite pas réaliser un changement trop brutal et je vais faire cohabiter Maven 2 et Maven 3.  
  
## Téléchargement  

* Se rendre sur le site de Maven ([http://maven.apache.org/download.html](http://maven.apache.org/download.html)) et télécharger la version Maven 3 Alpha 7.
* Décompresser l'archive dans un répertoire (exemple : C:\\Program Files\\apache-maven-3.0)

## Configuration  

* En examinant le répertoire bin de Maven 3, vous remarquerez la fameuse commande mvn.bat. Renommer cette commande en mvn3.bat pour éviter le conflit avec mvn.bat de Maven 2.  

* Compléter la variable d'environnement PATH de manière à ajouter le chemin bin de Maven 3 (exemple : C:\\Program Files\\apache-maven-3.0\\bin)  

* Ajouter une variable d'environnement M3\_HOME dont la valeur à donner est le chemin de Maven 3 (exemple : C:\\Program Files\\apache-maven-3.0)

* Ouvrir le fichier mvn3.bat et remplacer tous les M2\_HOME en M3\_HOME

* Ouvrir le fichier %M3\_HOME%\\conf\\settings.xml et modifier la balise localRepository qui permet à Maven d'indiquer son répertoire où entreposer les dépendances construites et téléchargées. Choisir un répertoire différent du répertoire utilisé par Maven 2 (exemple : d:\\config\\repoMaven3)  

## Tester  

* Pour tester, rien de plus simple. Ouvrir une invite de commande et saisir la commande mvn3 -version. Si vous voyez apparaître le numéro de Maven (dans mon cas 3.0-alpha 7) c'est bon ça fonctionne. Par la suite ne pas oublier que pour utiliser Maven 3 utiliser la commande mvn3 et non pas mvn

À cette étape, Tycho n'est pas encore installé. Toutefois son environnement d'exécution est prêt.  

Dans le prochain billet, nous montrerons comment transformer un simple projet OSGi (un bundle) en projet supporté par Tycho (génération des pom.xml) et comment construire ce projet via Tycho.  
  
Finalement, je profite de ce billet introductif pour lister les ressources sur Tycho  

* [Billet](http://blog.proxiad.com/2010/02/16/construire-ses-plugins-eclipse-rcp-avec-maven-c%E2%80%99est-plus-facile-maintenant-avec-maven-3-et-tycho/) de Pascal Leclerc introduisant Tycho
* Deux billets techniques ([1](http://mattiasholmqvist.se/2010/02/building-with-tycho-part-1-osgi-bundles/) et [2](http://mattiasholmqvist.se/2010/03/building-with-tycho-part-2-rcp-applications/)) sur l'utilisation de Tycho
* Le [site](http://tycho.sonatype.org/) de Tycho
* La proposition de [projet](http://www.eclipse.org/proposals/tycho/) à la communauté Eclipse
* Un [billet](http://www.sonatype.com/people/2008/11/building-eclipse-plugins-with-maven-tycho/) de Sonatype présentant les débuts de Tycho
* Le [GIT](http://github.com/sonatype/sonatype-tycho) de Tycho pour construire Tycho et pour dénicher de nombreux exemples
* Le [forum](http://n2.nabble.com/Tycho-Users-f3053503.html) de Tycho
* Une [liste](http://pastie.org/880170) de projets utilisant actuellement Tycho  
