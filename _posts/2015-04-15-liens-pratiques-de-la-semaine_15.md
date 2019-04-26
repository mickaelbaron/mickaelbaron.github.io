---
title: Liens pratiques de la semaine 16 (avril 2015)
tags: [Eclipse,Java]
blogger_orig_url: https://keulkeul.blogspot.com/2015/04/liens-pratiques-de-la-semaine_15.html
category: technological-watch
---

Vous trouverez dans ce billet une sélection de liens pratiques autour des technologies Java qui m'ont particulièrement intéressées cette semaine 16 (avril 2015).

Eclipse

* [Eclipse Oomph](http://projects.eclipse.org/projects/tools.oomph) est une installateur d'Eclipse. Il permet d'automatiser l'installation et la mise à jour d'Eclipse. C'est pratique pour tester une distribution Eclipse donnée. Vous pouvez même choisir la version d'un plugin donné. Le problème c'est la lenteur car il va chercher chaque plugin. Plus d'information sur cette page : [http://projects.eclipse.org/projects/tools.oomph](http://projects.eclipse.org/projects/tools.oomph).

Java

* Une [présentation](http://fr.slideshare.net/samijaber/devoxx-fr2015-gwt) de Sami Jaber sur le futur de GWT au dernier Devoxx France 2015. L'utilisation des WebComponent est très prometteuse. 
* Un [portage](http://gwt-material.appspot.com/) de Material Design sur GWT ([Github](https://github.com/kevzlou7979/GwtMaterial)). Pour information, Material Design est un ensemble de règles de conception graphique proposées par Google (merci à Jonathan Mesny [@jmesny\_](https://twitter.com/jmesny_) pour l'information).
* [JMH](http://openjdk.java.net/projects/code-tools/jmh/) est une bibliothèque pour faire du micro benchmarking avec son code Java. En gros, la bibliothèque fournit un ensemble d'annotations pour configurer l'exécution (combien de fois une méthode doit être appelée...).
* [Moquette](https://projects.eclipse.org/proposals/moquette-mqtt) est un brocker MQTT développé en Java. Il y a aussi [Mosquitto](http://mosquitto.org/) qui est un brocker MQTT développé en C.
* [FastUtil](http://fastutil.di.unimi.it/) est une implémentation des principales collections en Java et qui se veut plus rapide et moins gourmande. En gros, si vous utilisez massivement des Map, vous devriez y regarder. (merci à Youcef pour l'information).

Divers

* Un [sondage](http://www.infoq.com/research/javascript-frameworks-2015) sur les frameworks JavaScript. Cela permet d'avoir une idée globale du nombre de framework disponible. A noter que GWT en fait parti.
* [Rainyday](https://github.com/maroslaw/rainyday.js) est une bibliothèque JavaScript qui simule la pluie sur une image passée en flou. C'est inutile mais c'est beau.
* [PYPL](http://pypl.github.io/PYPL.html) pour PopularitY of Programming Language est un site qui donne la "météo" sur la popularité d'un langage à partir des recherches faites sur Google. A noter que sur le même site il y a la popularité des environnements de développement et des bases de données (qu'elles soient relationnelles ou pas). Le projet est disponible sur Github.