---
title: Utiliser des commandes avec la plateforme Eclipse
tags: [Eclipse]
image: /images/commands.jpg
description: Apprendre à utiliser des commandes dans le développement de plug-ins avec la plateforme Eclipse.
category: Article
weight: 15
date: 2010-03-17
update: 2013-05-27
---

Le but de cette quatrième leçon est d'apprendre à ajouter des commandes puis à appliquer des restrictions sur l'affichage et le comportement de ces commandes.

**Buts pédagogiques** : Commandes, restriction, handler, menuContribution et Core Expressions.

**Codes sources** : les codes sources et la solution de la leçon sont disponibles à l'adresse suivante : [lesson4-ressources.zip](/files/lesson4-ressources.zip).

## Exercice 1 : Ajouter des commandes dans la barre de menu et la barre d'outils

Les buts de cet exercice sont les suivants :

* apprendre à créer une commande ;
* apprendre à créer un handler et à l'associer à une commande ;
* apprendre à ajouter une commande dans la barre d'outils d'une application Eclipse ;
* apprendre à ajouter une commande dans le menu d'une application Eclipse.

### Description

Ajoutez dans le menu principal un élément de menu appelé **JUGeRCP** qui contiendra deux commandes : une permettant de réinitialiser le gestionnaire des participants (supprime tous les participants) et une permettant de démarrer le jeu concours. Par ailleurs, une commande est également ajoutée à la barre d'outils principale permettant de réinitialiser le gestionnaire des participants (même comportement que la commande située dans le menu). Cet exercice apporte des modifications sur les deux plug-ins *eclipse.labs.jugercp.attendees* et *eclipse.labs.jugercp.quizz*.

### Etapes à suivre

Si vous n'avez pas complètement terminé le développement des plug-ins *eclipse.labs.jugercp.attendees* et *eclipse.labs.jugercp.quizz* lors de la fin de la leçon 3, vous pouvez récupérer le code complet dans le répertoire *ressources\lesson 3 - Interaction entre plug-ins\solution*.

À partir du plug-in *eclipse.labs.jugercp.quizz*, créez une extension sur la base du point d'extension *org.eclipse.ui.commands* (ne pas utiliser le patron de construction).

![Création d'une nouvelle extension commande](/images/handsonlab-commandslesson4/ex1-newcommandextension.png)

Ajoutez un sous élément de type Command à partir de l'élément *org.eclipse.ui.commands* puis respectez les valeurs des attributs comme indiqué sur la capture d'écran ci-dessous.

![Edition de l'extension commande](/images/handsonlab-commandslesson4/ex1-editcommandextension.png)

Recopiez le code ci-dessous dans la classe *LaunchQuizzHandler* qui implémente le comportement (appelé handler) de la commande.

```java
public class LaunchQuizzHandler extends AbstractHandler {
    @Override
    public Object execute(ExecutionEvent event) throws ExecutionException {
        try {
            IViewPart showView = PlatformUI.getWorkbench().getActiveWorkbenchWindow().getActivePage().showView(
                    "eclipse.labs.jugercp.quizz.quizzid");

            if (showView != null) {
                ((QuizzViewPart)showView).launchQuizz();
            }
        } catch (PartInitException e) {
            e.printStackTrace();
        }
        return null;
    }
}
```

Créez une extension sur la base du point d'extension *org.eclipse.ui.menus*.

![Création d'une nouvelle extension menu](/images/handsonlab-commandslesson4/ex1-newmenusextension.png)

Ajoutez un sous élément de type *menuContribution* à partir de l'élément *org.eclipse.ui.menus* puis respectez les valeurs des attributs comme indiqué sur la capture d'écran ci-dessous.

![Edition de l'extension menu](/images/handsonlab-commandslesson4/ex1-editmenuextension.png)

Il est précisé ici qu'un élément graphique est ajouté au menu principal de l'application Eclipse.

Ajoutez un sous élément de type *menu* à partir de l'élément *menuContribution* puis respectez les valeurs de l'attribut comme indiqué sur la capture d'écran ci-dessous.

![Ajouter un sous menu au menu principal](/images/handsonlab-commandslesson4/ex1-addsubmenu.png)

Il est précisé ici qu'un élément de menu **JUGeRCP** est ajouté au menu principal de l'application Eclipse.

Ajoutez un sous élément de type *command* à partir de l'élément *menu* puis respectez les valeurs des attributs comme indiqué sur la capture d'écran ci-dessous.

![Associer la commande Quizz à l'élément menu](/images/handsonlab-commandslesson4/ex1-menuquizzcommand.png)

Un élément de menu défini par la commande *eclipse.labs.jugercp.quizz.laundquizzcommandid* est ajouté au menu **JUGeRCP**.

Exécutez la configuration d'exécution pour tester le nouveau résultat attendu. Vous devriez voir afficher un résultat similaire à la capture d'écran ci-dessous.

![Tester la commande ajoutée dans le menu](/images/handsonlab-commandslesson4/ex1-testwithquizzmenu.png)

Nous nous intéressons maintenant à la commande de réinitialisation du gestionnaire de participants. A partir du plug-in *eclipse.labs.jugercp.attendees*, créez une extension sur la base du point d'extension *org.eclipse.ui.commands* (ne pas utiliser le patron de conception).

Ajoutez un sous élément de type *Command* à partir de l'élément *org.eclipse.ui.commands* puis respectez les valeurs des attributs comme indiqué sur la capture d'écran ci-dessous.

![Création de la commande Initialize Attendees](/images/handsonlab-commandslesson4/ex1-initializeattendeescommand.png)

Vous remarquerez que l'attribut *defaultHandler* n'a pas été renseigné. Par la suite, nous allons déléguer le comportement à un handler spécifique.

Créez une extension sur la base du point d'extension *org.eclipse.ui.handlers*

![Création d'une extension handler](/images/handsonlab-commandslesson4/ex1-createextensionhandler.png)

Automatiquement, un élément de type *handler* est ajouté à l'élément *org.eclipse.ui.handlers*.

![Edition de l'extension handler](/images/handsonlab-commandslesson4/ex1-editextensionhandler.png)

Recopiez le code ci-dessous dans la classe *InitializeAttendeesHandler* pour implémenter la réinitialisation du gestionnaire de participants.

```java
public class InitializeAttendeesHandler extends AbstractHandler {
    @Override
    public Object execute(ExecutionEvent event) throws ExecutionException {
        Activator.getDefault().getAttendeesManager().removeAllAttendees();
        return null;
    }
}
```

Créez une extension sur la base du point d'extension *org.eclipse.ui.menus*.

Ajoutez un sous élément de type *menuContribution* à partir de l'élément *org.eclipse.ui.menus* puis respectez les valeurs des attributs comme indiqué sur la capture d'écran ci-dessous.

![Ajout d'un élément menuContribution](/images/handsonlab-commandslesson4/ex1-addmenucontribution.png)

Ajoutez un sous élément de type *menu* à partir de l'élément *menuContribution* puis respectez les valeurs de l'attribut comme indiqué sur la capture d'écran ci-dessous.

![Ajout d'un élément menu](/images/handsonlab-commandslesson4/ex1-addjugercpmenu.png)

A noter que ce menu est identique à celui créé précédemment. Il est important que la valeur de l'identifiant soit la même pour éviter de créer un doublon.

Ajoutez un sous élément de type *command* à partir de l'élément *menu* puis respectez les valeurs des attributs comme indiqué sur la capture d'écran ci-dessous.

![Ajout d'un élément command](/images/handsonlab-commandslesson4/ex1-resetparticipants.png)

La commande est maintenant ajoutée au menu **JUGeRCP**. Intéressons nous maintenant à ajouter cette commande au niveau de la barre d'outils principale.

Ajoutez un sous élément de type *menuContribution* à partir de l'élément *org.eclipse.ui.menus* puis respectez les valeurs des attributs comme indiqué sur la capture d'écran ci-dessous.

![Ajout d'un élément menuContribution](/images/handsonlab-commandslesson4/ex1-addmenucontribution2.png)

Il est précisé ici qu'un élément graphique est ajouté à la barre d'outils de l'application Eclipse.

Ajoutez un sous élément de type *toolbar* à partir de l'élément *menuContribution* puis respectez la valeur de l'attribut *id* comme indiqué sur la capture d'écran ci-dessous.

![Ajout d'un élément dans la barre d'outils](/images/handsonlab-commandslesson4/ex1-addjugercptoolbar.png)

Ajoutez un sous élément de type *command* à partir de l'élément *toolbar* puis respectez les valeurs des attributs comme indiqué sur la capture d'écran ci-dessous.

![Ajout d'un élément commande](/images/handsonlab-commandslesson4/ex1-resetcommand.png)

Exécutez la configuration d'exécution pour tester le nouveau résultat attendu. Vous devriez voir affiché un résultat similaire à la capture d'écran ci-dessous.

![Afficher les deux commandes dans le menu](/images/handsonlab-commandslesson4/ex1-finalresult.png)

## Exercice 2 : Restrictions sur les commandes

Les buts de cet exercice sont les suivants :

* créer des Expression Definitions ;
* appliquer une restriction sur une commande en utilisant le langage Core Expressions.

### Description

Lorsque la perspective **JUGParticipants** est affichée seules la commande permettant de réinitialiser le gestionnaire des participants est accessible. De même lorsque la perspective **JUGConcours** est affichée seule la commande permettant de démarrer le jeu concours est accessible. Cet exercice apporte des modifications sur les deux plug-ins.

### Etapes à suivre

À partir du plug-in *eclipse.labs.jugercp.quizz*, éditez le fichier *plugin.xml* en utilisant l'outil PDE.

Ajoutez un élément *visibleWhen* à l'élément command (celui utilisé pour l'affichage de la commande dans le menu).

![Ajouter un élément visiblewhen à l'élément command](/images/handsonlab-commandslesson4/ex2-addvisiblewhenelement.png)

Ajoutez un élément *with* à l'élément *visibleWhen* puis indiquez dans l'attribut *variable* la valeur *activeWorkbenchWindow.activePerspective*. Ceci est une variable prédéfinie par la plateforme permettant de récupérer la valeur de la perspective courante.

![Ajouter un élément with à l'élément visiblewhen](/images/handsonlab-commandslesson4/ex2-addwithelement.png)

Ajoutez un élément *equals* à l'élément *with* puis indiquez dans l'attribut value l'identifiant de la perspective relative à la perspective **JUGConcours** (*org.eclipse.ui.resourcePerspective*).

![Ajouter un élément equals à l'élément with](/images/handsonlab-commandslesson4/ex2-addequalselement.png)

Exécutez la configuration d'exécution pour tester le nouveau résultat attendu. La commande *Quizz* ne devrait pas être disponible dans la perspective **JUGParticipants**.

![Perspective JUGConcours active](/images/handsonlab-commandslesson4/ex2-runwithjugconcours.png)

![Perspective JUGParticipants active](/images/handsonlab-commandslesson4/ex2-runwithjugparticipants.png)

Le plug-in *eclipse.labs.jugercp.attendees* affiche à la fois la commande dans le menu et dans la barre d'outils de l'application Eclipse. Nous pourrions procéder de la même manière que précédemment pour rendre accessible cette commande. Malheureusement nous devrions dupliquer les déclarations relatives à la restriction. Pour palier à ce problème nous utilisons la définition d'expression.

À partir du plug-in *eclipse.labs.jugercp.attendees*, éditez le fichier *MANIFEST.MF* en utilisant l'outil PDE. Ajoutez dans les dépendances (onglet Dependencies) le plug-in *org.eclipse.core.expressions*.

![Ajouter la dépendance du plugin org.eclipse.core.expressions](/images/handsonlab-commandslesson4/ex2-addcoreexpressiondependencie.png)

Créez maintenant une extension sur la base du point d'extension *org.eclipse.core.expressions.definitions*.

![Ajouter une extension de type Expression Definition](/images/handsonlab-commandslesson4/ex2-addexpressiondefinitionextension.png)

Automatiquement, un élément *definition* est créé. La construction de la restriction est similaire à celle construite précédemment.

Ajoutez un élément de type *with* avec la valeur *activeWorkbenchWindow.activePerspective* pour l'attribut *variable*.

Ajoutez un élément de type *equals* avec la valeur *eclipse.labs.jugercp.attendees.jugattendeesid* pour l'attribut *value*.

![Construction de l'extension Expression Definition](/images/handsonlab-commandslesson4/ex2-constructexpressiondefinitionextension.png)

Il reste à associer à la restriction *visibleWhen* du menu et de la barre d'outils **JUGeRCP** cette nouvelle définition.

Pour chaque restriction *visibleWhen*, ajoutez un sous élément de type *reference* avec la valeur *eclipse.labs.jugercp.attendees.resetexpdefinitionid* pour l'attribut *definitionid* (créé précemment).

![Associer la référence d'une Expression Definition](/images/handsonlab-commandslesson4/ex2-associatereferenceexpressiondefinition.png)

Exécutez la configuration d'exécution pour tester le nouveau résultat attendu. La commande Reset Participants ne devrait pas être disponible dans la perspective **JUGConcours**.

![Perspective JUGConcours active](/images/handsonlab-commandslesson4/ex2-runwithjugconcoursbis.png)

![Perspective JUGParticipants active](/images/handsonlab-commandslesson4/ex2-runwithjugparticipantsbis.png)

## Pour aller plus loin

* [/eclipse/commands](/eclipse/commands) : support de cours relatif à la notion de commandes ;
* [http://www.vogella.com/articles/EclipseCommands/article.html](http://www.vogella.de/articles/EclipseCommands/article.html) ;
* [http://wiki.eclipse.org/Command_Core_Expressions](http://wiki.eclipse.org/Command_Core_Expressions) ;
* [http://wiki.eclipse.org/Platform_Command_Framework](http://wiki.eclipse.org/Platform_Command_Framework).