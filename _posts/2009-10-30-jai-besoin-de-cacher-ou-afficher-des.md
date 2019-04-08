---
title: J'ai besoin de... cacher ou afficher des commandes en fonction de la perspective courante
tags: [Eclipse]
thumbnail: http://4.bp.blogspot.com/_azmyBJVJ09E/SutcjQC9zkI/AAAAAAAAE_g/c_LXLaOgQWA/s72-c/perspectivecommand01.jpg
blogger_orig_url: https://keulkeul.blogspot.com/2009/10/jai-besoin-de-cacher-ou-afficher-des.html
category: technical
---

Actuellement je suis en train de rédiger un support de cours autour de la nouvelle API Commands et le moins que l'on puisse dire : enfin !!!

Avant, pour enrichir un menu, une barre d'outils ou un menu contextuel, il fallait passer par l'API `Actions`. C'était assez galère et la plupart du temps tout se faisait de manière « programmatique ». L'API `Commands` permet d'étendre les menus et les barres d'outils de manière déclarative en se focalisant principalement sur la déclaration via la construction d'extensions. Il se peut qu'il y ait encore des classes à créer mais cela s'est sensiblement réduit.

Ce billet présente un exemple d'utilisation de cette nouvelle API. L'exemple consiste à cacher des commandes selon la perspective active. Les points pédagogiques de ce billet sont :

* réutiliser des commandes définies par la plateforme Eclipse ;
* utiliser des Command Core Expressions ;
* ajouter une commande au menu d'une application Eclipse de manière déclarative ;
* ajouter une commande au menu et à la barre d'outils d'une vue de manière déclarative.

## Réutilisation de commandes prédéfinis

J'utiliserai des commandes et des handlers prédéfinis par la plateforme Eclipse. Ces commandes se focalisent essentiellement sur la manipulation de perspectives. Vous trouverez ci-dessous les commandes que je souhaite employer et leurs identifiants respectifs :

* `org.eclipse.ui.window.closeAllPerspectives` : ferme toutes les perspectives ;
* `org.eclipse.ui.window.closePerspective` : ferme la perspective courante ;
* `org.eclipse.ui.window.nextPerspective` : active la perspective suivante ;
* `org.eclipse.ui.window.previousPerspective` : active la perspective précédente ;
* `org.eclipse.ui.window.savePerspective` : sauvegarder la perspective courante ;
* `org.eclipse.ui.window.customizePerspective` : modifier la perspective courante ;
* `org.eclipse.ui.perspectives.showPerspective` : affiche une perspective.

## Création d'éléments menuContribution  
  
La création d'un élément `menuContribution` va nous permettre d'enrichir une barre de menu, une barre d'outils, une barre de menu d'une vue, une barre d'outils d'une vue ou d'un menu contextuel.

Dans ce billet, j'ai m'attarder à enrichir une barre de menu principale et celle d'une vue puis une barre d'outils d'une vue.

Il faut créer une extension basée sur le point d'extension `org.eclipse.ui.menus` comme indiqué sur la figure ci-dessous.
  
![/images/perspectivecommand01.jpg](/images/perspectivecommand01.jpg)

Ajoutez ensuite un élément `menuContribution` et créez un sous élément de type menu. Puis, au niveau de l'élément `menuContribution` modifiez l'attribut `locationURI` avec la valeur `menu:org.eclipse.ui.main.menu` ceci permettra d'enrichir le menu principal de l'application Eclipse.
  
![/images/perspectivecommand02.jpg](/images/perspectivecommand02.jpg)

Au niveau de l'attribut de l'élément menu, modifiez l'attribut label qui est le nom du menu affiché dans la barre de menu principal par la valeur Perspective *Commands*.
  
![/images/perspectivecommand03.jpg](/images/perspectivecommand03.jpg)

J'ajoute ensuite à l'élément menu plusieurs sous éléments de type command. De cette façon, je regroupe dans le menu *Perspective Commands* cinq commandes prédéfinies par la plateforme Eclipse. Pour chaque élément command, je modifie l'attribut commandId qui désigne l'identifiant de la commande. Pour éviter toutes erreurs, j'utilise le bouton Browse et je recherche l'identifiant de la commande qui m'intéresse. Sur la capture d'écran ci-dessous, je présente l'élément `command` (sous élément de menu) associé à la commande `org.eclipse.ui.window.closeAllPerspectives`.

![/images/perspectivecommand04.jpg](/images/perspectivecommand04.jpg)

Concernant l'enrichissement de la barre d'outils d'une vue le procédé reste le même. Ajoutez un élément `menuContribution` puis un sous élément command. Dans l'attribut `locationURI` indiquez cette fois `toolbar:eclipse.workbench.commandsperspectiveexample.commandsviewsampleid` dont le suffixe désigne l'identifiant de la vue cible.

![/images/perspectivecommand05.jpg](/images/perspectivecommand05.jpg)

Pour l'élément command, je renseigne l'attribut commandId par la valeur `org.eclipse.ui.window.customizePerspective` qui permet d'appeler la commande en charge de modifier le contenu d'une perspective.

Finalement pour l'enrichissement de la barre de menu de la vue, procédez de la même façon. Par contre la valeur de l'attribut `locationURI` est `menu:eclipse.workbench.commandsperspectiveexample.commandsviewsampleid` et la valeur de l'attribut `commandId` est `org.eclipse.ui.perspectives.showPerspective`.

Avant de continuer, testons le résultat attendu. Vous devriez obtenir ceci.
  
![/images/perspectivecommand06.jpg](/images/perspectivecommand06.jpg)

## Création d'une restriction visibleWhen  

Attardons-nous maintenant à ajouter une restriction de type `visibleWhen` sur un élément du menu que nous avons créé (notamment nous désirons cacher l'élément Fermer toutes les perspectives).

La restriction `visibleWhen` appliquée à un élément `menuContribution` consiste à cacher un élément graphique (élément de menu ou de barre d'outils) lorsque l'expression associée à la restriction est évaluée comme fausse.

L'expression que nous allons exprimer consiste à afficher la-dite commande si la perspective active est égale à `MyEmptyPerspective`. Cette dernière est une perspective que nous allons créer.

Pour commencer, sélectionnez la commande *Fermer toutes les perspectives*.

![/images/perspectivecommand07.jpg](/images/perspectivecommand07.jpg)

## Ajoutez un sous élément visibleWhen
  
![/images/perspectivecommand08.jpg](/images/perspectivecommand08.jpg)

Ajoutez un sous élément with et précisez dans l'attribut variable la valeur `activeWorkbenchWindow.activePerspective`. Ceci permet de récupérer le contenu de cette variable.

![/images/perspectivecommand09.jpg](/images/perspectivecommand09.jpg)

Enfin ajoutez un sous élément equals et précisez dans l'attribut value la valeur *MyEmptyPerspective*.

![/images/perspectivecommand10.jpg](/images/perspectivecommand10.jpg)

Lors du test, la commande Fermer toutes les perspectives localisée dans le menu PerspectiveCommands ne doit pas être affichée. Par contre, si vous créez une nouvelle perspective (en utilisant la commande *Save Perspective As ...*) et en l'appelant *MyEmptyPerspective* puis en l'activant cette commande devrait être disponible.

## Le mot de la fin

L'API Commands facilite l'enrichissement de la barre de menu, barre d'outils, etc. Dans un prochain billet, je vous montrerai comment utiliser et créer un *Property Tester*.

Le code source de cet exemple est disponible [ici](/files/commandsperspectiveexample.zip).