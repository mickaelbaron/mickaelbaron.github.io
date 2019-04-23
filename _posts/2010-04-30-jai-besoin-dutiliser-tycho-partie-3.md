---
title: 'J''ai besoin ... d''utiliser Tycho - Partie 3 : Construction d''un bundle OSGi'
tags: [Tycho]
blogger_orig_url: https://keulkeul.blogspot.com/2010/04/jai-besoin-dutiliser-tycho-partie-3.html
description: Ce billet se propose de vous montrer comment générer les fichiers descripteurs Maven (pom.xml) au niveau du répertoire parent et du répertoire du bundle OSGi.
category: technical
---

Dans le précédent billet ([J'ai besoin ... d'utiliser Tycho - Partie 2 : Générer les poms Maven]({% post_url 2010-04-20-jai-besoin-dutiliser-tycho-partie-2 %})) nous avons montré comment générer les fichiers descripteurs Maven (pom.xml) au niveau du répertoire parent et du répertoire du bundle OSGi.  

Nous nous attardons dans ce billet à montrer comment construire un projet OSGi (composé généralement d'un ensemble de bundles, dans notre cas un seul a été défini) à partir de Maven et son plugin Tycho.  
  
Comme nous sommes dans le monde Maven, nous utiliserons les commandes classiques pour le nettoyage du projet (clean) et la construction du bundle (package ou install). Le résultat attendu est un fichier au format jar localisé dans le répertoire target du répertoire du bundle.  

* Ouvrir l'invite de commandes de Windows et se placer à la racine du répertoire parent. Saisir la ligne de commande ci-dessous :  

```console
mvn3 clean package
```

Le résultat de cette ligne de commande est sans appel, une erreur est lancée (voir capture ci-dessous).  
  
![/images/packagewithoutlocalplatform.jpg)](/images/packagewithoutlocalplatform.jpg)

Il est question d'une contrainte qui n'est pas respectée. En fait, le package *org.osgi.framework* n'est pas disponible pour la construction du bundle. Cette dépendance n'est pas respectée.  
  
Pour résoudre ce problème, il faut préciser au plugin Tycho où se trouve la plateforme cible (*target platform*). La plateforme cible est en quelque sorte un entrepôt Maven. Cette plateforme cible contient tous les plugins nécessaires au fonctionnement d'une application OSGi sous Equinox. Dans notre cas, il faut pouvoir fournir un ou plusieurs plugins exposant le package *org.osgi.framework*.

* Ainsi, pour indiquer la plateforme cible, saisir la ligne de commande ci-dessous

```console
mvn3 clean package -Dtycho.targetPlatform=C:\\eclipse3.5.2
```

Où *c:\\eclipse3.5.2* est le répertoire contenant l'installation d'Eclipse 3.5.2.
  
Après quelques secondes de compilation (un peu plus s'il y a besoin de télécharger des dépendances pour Tycho et Maven 3), un fichier jar (*eclipse.tycho.osgifirstbundle-1.0.0-SNAPSHOT.jar*) est disponible dans le répertoire target du bundle *eclipse.tycho.osgifirstbundle*. Si vous utilisez la commande install en place de package, le jar sera en plus déployé dans l'entrepôt de Maven 3.

## À suivre...

Veuillez noter que pour construire ce bundle il est nécessaire de disposer d'une plateforme cible en local sur sa machine. Si vous souhaitez vérifier votre construction sur différentes plateformes (différentes versions OSGi par exemple), il sera nécessaire de disposer autant de plateformes cibles que de versions à construire.  
  
Nous montrerons ainsi dans le prochain billet comment utiliser un entrepôt p2 pour construire le bundle afin d'éviter de fournir explicitement les plugins de dépendance.