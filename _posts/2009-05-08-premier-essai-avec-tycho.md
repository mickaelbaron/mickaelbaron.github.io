---
title: Premier essai avec Tycho
tags: [Eclipse, Tycho]
blogger_orig_url: https://keulkeul.blogspot.com/2009/05/premier-essai-avec-tycho.html
category: technical
---

Ce billet a pour but de mettre en œuvre l'outil de build Tycho qui est une sorte de portage de Maven 2 pour les applications basées sur OSGi. Dans ce cadre précis le développement de plugins Eclipse est concerné.

Je tiens à préciser que [Tycho](http://docs.codehaus.org/display/M2ECLIPSE/Tycho+project+overview) est en cours de développement. Je me suis fortement basé sur le [billet](http://www.sonatype.com/people/2009/04/tycho-implicit-build-target-platform-support-from-maven/) de [Jason Van Zyl](http://www.sonatype.com/people/author/jason/) de [Sonatype](http://www.sonatype.com/). Cette mise en œuvre a été réalisée sous Windows XP.  

## Installation de Tycho  

* Télécharger Tycho à l'adresse [suivante](http://repository.sonatype.org/content/repositories/tycho-pseudo-releases/org/codehaus/tycho/tycho-distribution/0.4.0-DEV-2233/) . Parmi la multitude de fichiers, j'ai choisi l'archive ZIP.
* Décompresser l'archive (*c:\\tycho*).
* En regardant la structure des répertoires obtenue, vous remarquerez que cela ressemble fortement à la structure d'une installation Maven.
* Ajouter une variable d'environnement `TYCHO_HOME` qui pointe sur le répertoire d'installation de Tycho (*TYCHO\_HOME=C:\\tycho*).
* Si vous avez déjà installé Maven, modifier la variable d'environnement `M2_HOME` pour pointer également sur le répertoire d'installation de Tycho (*M2\_HOME=c:\\tycho*).

## Télécharger l'exemple RCP

* Créer un nouveau répertoire qui contiendra les sources de l'exemple RCP (*c:\\RCPExample*).
* Récupérer à partir d'un client SVN, les sources de l'exemple RCP à l'adresse [suivante](http://svn.sonatype.org/m2eclipse/tycho/trunk/tycho-demo/itp01). Par exemple, en ligne de commande svn co http://svn.sonatype.org/m2eclipse/tycho/trunk/tycho-demo/itp01.

## Démarrer le Build  

* Se placer à la racine du répertoire c:\\RCPExample\\itp01
* Exécuter la ligne de commande %TYCHO%\\bin\\mvn clean install -Dtycho.resolver\=p2

Ce premier *build* est très long puisque toutes les dépendances nécessaires à la compilation de *RCPExample* sont téléchargées dans le référentiel local. Pour information et par défaut, le référentiel Tycho est positionné dans *c:\\Documents and settings\\\[user\]\\.m2\\repository*

À la fin du téléchargement, nous remarquons plusieurs étapes :

* démarrage du conteneur OSGi à partir du Bundle *org.eclipse.equinox.app* ;
* compilation de *RCPExample* ;
* installation de l'example dans le référentiel local (un des aspects le plus important, le plugin est construit et est disponible) ;
* compilation des tests de *RCPExample* ;
* exécution des tests. Ici, le test consiste à activer une action de l'exemple. Pour se faire, un Workbench Window est ouvert puis réalisation de l'action (toutes les dépendances sont ainsi réalisées puisqu'un "mini Eclipse" a pu s'exécuter). À préciser finalement que le jar de *RCPExample* est situé dans le référentiel local et que le plugin de test effectue sans problème la dépendance.

## Bilan

Ce première tentative est une bonne nouvelle :

* dépendance vers les plugins Eclipse ;
* téléchargement des plugins Eclipse dans le référentiel local ;
* installation des plugins construits dans le référentiel distant.

Toutefois, j'ai de nombreuses interrogations.

* Un Product Eclipse sera-il considéré comme une sorte d'Assembly Maven ? Comment générer mon exécutable et choisir ma plateforme cible.  
* Choisir la version de la distribution de la plateforme Eclipse. Faire un build sur Europa, Ganymede ou Gallileo est-ce possible ? je l'espère très fortement.
* Intégration de Tycho dans un outil d'intégration continue comme Hudson par exemple.
* Tycho par rapport à Maven 2 ? Tycho est-il le futur Maven 3 ? Les plugins Tycho suivent quel modèle ?
* Qu'en pense la fondation Eclipse ? A part sur les groupes de discutions de la fondation qui en parle, il n'y a pas à mon avis de volonté d'intégrer un outil de Build type Maven pour la conception de plugins.

En tout cas, je vais suivre ce projet avec attention.
