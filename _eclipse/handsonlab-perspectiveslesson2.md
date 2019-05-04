---
title: Utiliser des perspectives avec la plateforme Eclipse
tags: [Eclipse]
image: /images/testperspectivesketch.jpg
description: Apprendre à utiliser des perspectives dans le développement de plug-ins avec la plateforme Eclipse.
category: Article
weight: 13
date: 2009-10-12
update: 2013-05-27
---

Le but de cette deuxième leçon est d'apprendre à construire des perspectives.

**Buts pédagogiques** : Perspective, Perspective Extension, IPerspectiveFactory, Plug-in Spy.

**Codes sources** : les codes sources et la solution de la leçon sont disponibles à l'adresse suivante : [lesson2-ressources.zip](/files/lesson2-ressources.zip).

## Exercice 1 : Construction programmatique d'une perspective

Les buts de cet exercice sont les suivants :

* construire une perspective en implémentant `IPerspectiveFactory` ;
* utiliser l'outil Plug-in Spy pour identifier les identifiants de vues.

### Description

Cet exercice va consister à construire la perspective **JUGParticipants** qui contient les vues **Liste Participants** et **Edition Participant** définies dans la leçon 1 puis la vue **Properties** définie par la plateforme Eclipse.

### Etapes à suivre

Si vous n'avez pas complètement terminé le développement du plug-in *eclipse.labs.jugercp.attendees* lors de la fin de la leçon 1, vous pouvez récupérer le code complet dans le répertoire *ressources\lesson 1 - Construction d'un plug-in\solution*.

Créez une nouvelle extension à partir du point d'extension *org.eclipse.ui.perspectives* (voir capture d'écran ci-dessous). Ne pas sélectionner le patron **Release Engineering Perspective**. Pour une première fois, il est souvent utile de comprendre comment mettre en place à la *mano* ce type de fonctionnalité.

![Nouvelle extension Perspectivee](/images/handsonlab-perspectiveslesson2/ex1-extensionperspective.png)

Donnez en paramètre d'identifiant de la perspective la valeur *eclipse.labs.jugercp.attendees.jugattendees.id* et comme nom la valeur *JUGParticipants*.

Au niveau du champ classe qui décrit de manière programmatique la perspective **JUGParticipants** saisissez *JUGAttendeesPerspectiveFactory* et *eclipse.labs.jugercp.attendees.perspectives* comme valeur de package.

![Création de la perspective JUGAttendeesPerspectiveFactory](/images/handsonlab-perspectiveslesson2/ex1-extensionperspective2.png)

Dans le corps de la méthode *createInitialLayout(IPageLayout layout)* de la classe *JUGAttendeesPerspectiveFactory* saisissez le code présent ci-dessous.

```java
	public void createInitialLayout(IPageLayout layout) {
		layout.setEditorAreaVisible(false);
		String editorArea = layout.getEditorArea();

		layout.addView("eclipse.labs.jugercp.attendees.attendeeid",
				IPageLayout.LEFT, 0.5f, editorArea);
		layout.addView("eclipse.labs.jugercp.attendees.listattendeesid",
				IPageLayout.BOTTOM, 0.5f, editorArea);
		layout.addView("org.eclipse.ui.views.PropertySheet",
				IPageLayout.BOTTOM, 0.5f,
				"eclipse.labs.jugercp.attendees.attendeeid");
	}
```

Dans le code qui a été copié, seules deux vues sont intégrées dans la perspective **JUGParticipants**. Il vous reste à intégrer la vue **Properties** définie par la plateforme Eclipse. Pour récupérer l'identifiant de cette vue, une solution consiste à utiliser l'outil Plug-in Spy permettant d'introspecter le contenu d'une application Eclipse en cours d'exécution. Cet outil est installé par défaut dans l'environnement de développement. A partir de l'environnement de développement Eclipse, ouvrez la vue **Properties**. Puis effectuez le raccourci clavier suivant **ALT + SHIFT + F1**. Notez l'identifiant de cette vue.

![Outil Plug-in Spy](/images/handsonlab-perspectiveslesson2/ex1-plugintool.png)

Complétez la perspective **JUGParticipants** de façon à afficher la vue **Properties** sous la vue **Edition Participant**.

Exécutez la configuration d'exécution comme détaillée dans la leçon 1 et affichez la perspective **JUGParticipants** (le résultat attendu est celui présenté sur la capture d'écran ci-dessous).

![Afficher la perspective JUGParticipants](/images/handsonlab-perspectiveslesson2/ex1-execution.png)

**NOTE** : pour l'instant la vue **Properties** ne réagit pas à la sélection d'un élément de la liste des participants. Nous étudierons cet aspect dans la leçon 3.

## Exercice 2 : Construction déclarative d'une perspective

Le but de cet exercice est le suivant :

* construire une perspective de manière déclarative en dérivant une perspective existante via les Perspective Extensions.

### Description

Construire la perspective JUGConcours qui contient la vue **JeuConcours** et la vue **Properties** à partir de la perspective prédéfinie par la plateforme Eclipse Resource. Un nouveau plug-in *eclipse.labs.jugercp.quizz* est développé pour contenir cette vue et cette perspective. L'intérêt de cet exercice est de montrer qu'il est possible d'étendre une perspective existante en limitant l'usage de la programmation Java.

### Etapes à suivre

Créez un nouveau plug-in *eclipse.labs.jugercp.quizz* en suivant la démarche développée dans la leçon 1 (n'utilisez pas de patron de génération).

Créez une nouvelle extension à partir du point d'extension *org.eclipse.ui.views*

Créez un sous élément de type *view* pour construire la vue **JeuConcours**.

![Création d'un élément vue](/images/handsonlab-perspectiveslesson2/ex2-createviewelement.png)

Paramétrez les éléments de la nouvelle vue **JeuConcours** en respectant les informations données par la capture d'écran ci-dessous.

![Création d'une extension view](/images/handsonlab-perspectiveslesson2/ex2-extensionview.png)

La classe *QuizzViewPart* a déjà été développée en partie, copiez cette classe située dans le répertoire *ressources\lesson 2 - Perspectives\exercice2-5* en respectant le chemin défini par le package.

Occupons nous maintenant de créer la perspective qui va agencer la vue **JeuConcours** et **Properties**. Créez une nouvelle extension à partir du point d'extension *org.eclipse.ui.perspectiveExtensions*.

![Création d'une extension perspective extension](/images/handsonlab-perspectiveslesson2/ex2-extensionperspectiveextension.png)

Créez un élément de type *perspectiveExtension*.

Cliquez sur le bouton **Browse** de façon à rechercher la perspective **Resource** dont l'identifiant est *org.eclipse.ui.resourcePerspective*.

![Préciser l'identifiant de la perspective à étendre](/images/handsonlab-perspectiveslesson2/ex2-perspectiveextensionidentifier.png)

A partir de l'élément *perspectiveExtension* créez un sous élément de type *view*.

![Ajouter une vue dans une perspective](/images/handsonlab-perspectiveslesson2/ex2-addviewintoperspective.png)

Respectez les indications données par la capture d'écran ci-dessous pour paramétrer la vue **JeuConcours**.

![Ajouter la vue JeuConcours dans une perspective](/images/handsonlab-perspectiveslesson2/ex2-addquizzviewintoperspective.png)

Créez un nouvel élément de type *view* et respectez les indications données par la capture d'écran ci-dessous pour paramétrer la vue *Properties*.

![Ajouter la vue Properties dans une perspective](/images/handsonlab-perspectiveslesson2/ex2-addpropertiesviewintoperspective.png)

Modifiez la configuration d'exécution de telle sorte que le nouveau plug-in eclipse.labs.jugercp.quizz soit ajouté puis exécutez là. En affichant la perspective **Resource** vous devriez obtenir le résultat suivant :

![Afficher la perspective Resource](/images/handsonlab-perspectiveslesson2/ex2-execution.png)

## Pour aller plus loin

Comme vous avez pu le remarquer, construire une perspective de manière programmatique nécessite de manipuler le code Java puisque l'agencement des vues et de l'éditeur est codé dans une classe Java. Au contraire, la programmation déclarative permet de s'abstraire du langage Java et tout le développement se fait au travers de l'outil PDE via les paramètres de l'extension.

Quelle est par conséquent la solution à adopter ? Je recommanderais la solution déclarative qui à mon sens est celle qui permettra une plus grande facilité pour la migration des plugins lors des prochaines évolutions de la plateforme Eclipse. En effet, il est question d'utiliser d'autres langages que Java.

* [/eclipse/perspectives/](/eclipse/perspectives/) : support de cours relatif à la construction de perspectives ;
* [/eclipse/views/](/eclipse/views/) : support de cours relatif à la construction de vues.