---
title: Liens pratiques de la semaine 31 (août 2010)
tags: [Eclipse]
blogger_orig_url: https://keulkeul.blogspot.com/2010/08/liens-pratiques-de-la-semaine.html
category: technological-watch
twitter: 20449361293
---

Vous trouverez ici une sélection de liens pratiques autour des technologies Java qui m'ont particulièrement intéressées cette semaine 31 (août 2010).
  
Eclipse  

* Un [billet](http://www.vogella.de/blog/2010/07/06/reading-resources-from-plugin/) de Lars Vogel qui montre comment charger une ressource (un fichier par exemple) à partir d'un plugin Eclipse.
* Pour résoudre le problème de mémoire entre Java 6 update 21 et Eclipse ([PermGen Space](http://www.eclipse.org/forums/index.php?t=msg&th=171585&start=0)) soit vous modifiez les paramètres de votre [eclipse.ini](http://aniefer.blogspot.com/2010/07/permgen-problems-and-running-eclipse-on.html) soit vous installez le dernier build de [Java 6 update 21](http://www.oracle.com/technetwork/java/javase/downloads/index.html) (merci à [Bruno Leroux d'EclipseTotale](http://www.eclipsetotale.com/) pour la coquille qui s'était glissée).  
* Migrer une application RCP de Galileo à Helios, l'équipe de Bonita Soft vous propose un [billet](http://www.bonitasoft.org/blog/eclipse/moving-a-rcp-application-from-galileo-to-helios-feedback-and-tips/) de leur retour d'expérience.
* [Eclipse 4.0](http://www.eclipse.org/eclipse4/) est disponible. Cette version s'adresse pour l'instant aux développeurs d'applications de la plateforme Eclipse. Un schéma de la nouvelle architecture est présenté [ici](http://borisoneclipse.blogspot.com/2010/07/eclipse-40-overview.html).
* Un [article](http://eclipse.dzone.com/articles/eclipse-40-inject-your-own) qui présente les injections pour Eclipse 4.0.
* Un [tutoriel](http://tomsondev.bestsolution.at/2010/07/28/eclipse-4-0-and-tutorial-on-writing-e4-rcp-application-released/) pour débuter le développement avec Eclipse 4.0.  
* Un des points forts d'Eclipse 4.0 est de faciliter le changement de l'apparence (look and feel). Deux articles présentent comment réaliser cette opération : [article 1](http://eclipse.dzone.com/articles/eclipse-40-automatically) et [article 2](http://tomsondev.bestsolution.at/2010/08/05/eclipse-4-0-so-you-can-theme-me-part-1/).
* [Instantiations](http://www.instantiations.com/), une compagnie qui proposait un ensemble de GUI-Builder pour les boîtes à outils SWT, SWING et GWT vient de se faire racheter par Google. Une bonne affaire pour espérer que l'éditeur GWT devienne gratuit et monte en puissance. Par contre, que vont devenir les éditeurs graphiques pour SWT et SWING ?  

Divers  

* La bibliothèque [ContiPerf](http://databene.org/contiperf.html) permet d'enrichir JUnit en ajoutant la notion de tests performance (un test doit s'exécuter en un temps donné).