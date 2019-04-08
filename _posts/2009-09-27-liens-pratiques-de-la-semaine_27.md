---
title: Liens pratiques de la semaine 40 (septembre 2009)
tags: [Eclipse, Java]
blogger_orig_url: https://keulkeul.blogspot.com/2009/09/liens-pratiques-de-la-semaine_27.html
category: technological-watch
---

Vous trouverez ici une sélection de liens pratiques autour des technologies Java qui m'ont particulièrement intéressées cette semaine 40 (septembre 2009).

Eclipse

* Le site de la fondation Eclipse dispose d'un nouveau [forum](http://www.eclipse.org/forums) qui regroupe toutes les discutions de l'ancien système.
* [Lars Vogel](http://www.vogella.de/blog/2009/09/23/pde-templates-commands/) a proposé un [bug](https://bugs.eclipse.org/bugs/show_bug.cgi?id=265231) pour enfin modifier les templates de construction des exemples RCP qui utilisent encore les Actions pour remplacer par les Commands. Effet boule de neige, le template de l'exemple du client de messagerie va également subir une mise à jour ([bug](https://bugs.eclipse.org/bugs/show_bug.cgi?id=253105)).
* Un [billet](http://www.vogella.de/blog/2009/09/21/eclipse-plugin-libraries/) de Lars Vogel qui explique en quelque lignes comment utiliser le projet [Orbit](http://www.eclipse.org/orbit/). Ce projet consiste à fournir pour chaque bibliothèque externe (par exemple Log4J) une encaspulation dans un plug-in Eclipse. Les versions des bibliothèques est alors gérées par les branches du plug-in "enveloppe". A noter que ce principe est utilisé dans l'univers OSGi où SpringSource fournit un [repository](http://www.springsource.com/repository/app/) de Bundle.  

Java

* Google propose un nouveau langage "[Noop](http://code.google.com/p/noop/)" pour la plateforme Java dans le sens où il s'exécutera dans la JVM (Source [Didier Girard](http://www.application-servers.com/post/2009/09/24/Noop%2C-by-Google) qui propose un extrait de l'opinion de [Alexis Moussine-Pouchkine](http://blogs.sun.com/alexismp/) à propos de ce nouveau langage).