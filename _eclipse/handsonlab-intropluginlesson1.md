---
title: Développer des plug-ins avec la plateforme Eclipse
tags: [Eclipse]
image: /images/equinox_large.png
description: Apprendre à développer des plug-ins avec la plateforme Eclipse.
category: Article
weight: 12
date: 2009-09-28
update: 2013-05-24
---

Le but de cette première leçon est d'apprendre à construire et exécuter un plug-in minimal sous Eclipse.

**Buts pédagogiques** : assistant de création de plug-ins, manipulation de concepts OSGi, création d'extensions, de vues, de catégories et mise en place de configurations d'exécution d'applications Eclipse.

**Codes sources** : les codes sources et la solution de la leçon sont disponibles à l'adresse suivante : [lesson1-ressources.zip](/files/lesson1-ressources.zip).

## Exercice 1 : Construction interactive d'un plug-in Eclipse

Les buts de cet exercice sont les suivants :

* construire un plug-in en utilisant l'assistant de création fourni par l'environnement Eclipse ;
* examiner les classes qui ont été générées.

### Description

Le plug-in *eclipse.labs.jugercp.attendees* s'occupe de la gestion des participants de la session Atelier Construction Plug-in avec la plateforme Eclipse. Il fournit une vue pour la saisie d'un nouveau participant, une vue pour afficher la liste des participants et une perspective pour agence ces vues. Dans cet exercice, on se limite à la construction de la structure du plug-in.

### Etapes à suivre

Démarrez Eclipse.

Choisissez comme nom du Workspace la valeur workspaceEclipseLabs.

![Choix du Workspace](/images/handsonlab-intropluginlesson1/ex1-workspace.png)

Sélectionnez à partir du menu Eclipse l'action *File -> New -> **Project*** pour ouvrir l'assistant de création de projet. Le groupe " Plug-in Development " fournit un ensemble d'assistants lié au développement de plug-ins. Sélectionnez l'assistant de création de projet de plug-in (Plug-in Project).

![Assistant de création de projet de plug-in](/images/handsonlab-intropluginlesson1/ex1-createproject.png)

Dans la zone de saisie Project name saisissez le nom du projet *eclipse.labs.jugercp.attendees* lié au plug-in à créer. Laissez les paramètres par défaut en s'assurant que la cible d'exécution est une application Eclipse.

![Assistant de création de projet de plug-in : nom du projet](/images/handsonlab-intropluginlesson1/ex1-newpluginprojectname.png)

Le prochain écran permet de paramétrer le plug-in en cours de construction. Laissez les paramètres par défaut comme indiqué sur la figure ci-dessous.

![Assistant de création de projet de plug-in : paramètres](/images/handsonlab-intropluginlesson1/ex1-createproject2.png)

**NE PAS UTILISER** de patron de génération qui, pour cette première prise en main de la plateforme Eclipse, masque certains concepts intéressants à réaliser manuellement. Veuillez par conséquent décocher la case *Create a plug-in using one of the templates*.

![Assistant de création de projet de plug-in : templates](/images/handsonlab-intropluginlesson1/ex1-createproject3.png)

L'environnement Eclipse génère un ensemble de fichiers dont la structure doit être identique à la structure présentée ci-dessous. Prenez connaissance des différents fichiers et répertoires générés. Veuillez remarquer dans l'arborescence le *nœud Plug-in Dependencies* qui permet de connaître les dépendances de ce plug-in (ce sont à cet instant des plug-ins de la plateforme Eclipse).

![Structure des fichiers d'un projet plug-in](/images/handsonlab-intropluginlesson1/ex1-filestructure.png)

Toutes les informations liées au plug-in sont stockées dans le fichier MANIFEST.MF (partie OSGi) et plugin.xml (partie extension). L'édition de ces fichiers peut être réalisée de manière textuelle ou en utilisant l'outil PDE (Plugin Development Environment) dont une capture d'écran est donnée ci-dessous.

![Outil PDE (Plugin Development Environment)](/images/handsonlab-intropluginlesson1/ex1-pdetool.png)

## Exercice 2 : Manipuler les concepts OSGi

Les buts de cet exercice sont les suivants :

* Comprendre le cycle de vie d'un plug-in via la classe Activator
* Exporter des services
* Effectuer un parallèle entre un bundle OSGi et un plug-in Eclipse

### Description

Un ensemble de classes Java décrivant une API pour la création et l'interrogation d'un participant a été réalisé, l'objectif étant de se focaliser principalement sur le développement de plug-in. Il vous est demandé dans cet exercice d'enrichir le plug-in eclipse.labs.jugercp.attendees en ajoutant cette API, en initialisant le gestionnaire de participants dans la classe Activator puis en exposant certains services de cette API.

### Etapes à suivre

Copiez les interfaces *IAttendee*, *IAttendeesManager* et *IAttendeeListener* puis les classes *Attendee* et *AttendeesManager* située dans le répertoire *ressources\lesson 1 - Construction d'un plug-in\exercice2-1* dans le plug-in créé précédemment en respectant le chemin défini par le package de chaque interface et classe.

Ce plug-in fournit un service de gestion des participants par l'intermédiaire de *IAttendeesManager* et de son implémentation *AttendeesManager*. Pour que ce plug-in puisse exposer ce service à d'autres plug-ins (utilise notamment pour la leçon 3), il est nécessaire de le préciser dans les méta-données du plug-in (fichier MANIFEST.MF). Editez interactivement, via l'outil PDE le fichier MANIFEST.MF, la section Runtime en ajoutant le package *eclipse.labs.jugercp.attendees* (résultat doit être identique à la figure ci-dessous).

![Exporter package d'un plug-in](/images/handsonlab-intropluginlesson1/ex2-runtime.png)

Modifier la classe *Activator* (qui gère le cycle de vie du plug-in) de telle sorte que le gestionnaire des participants soit initialisé au démarrage du plug-in, que le gestionnaire des participants soit accessible via un accesseur (*IAttendeesManager getAttendeesManager()*), qu'une fabrique d'objet *IAttendee* soit disponible (*IAttendee createAttendee(String pName, String pCompany)*) et enfin que la liste des participants soit vidée à l'arrêt du plug-in.

```java
    private IAttendeesManager refAttendeesManager;

    private int count = 0;

    /**
     * The constructor
     */
    public Activator() {
    }

    public void start(BundleContext context) throws Exception {
        super.start(context);
        plugin = this;
        refAttendeesManager = new AttendeesManager();
    }

    public void stop(BundleContext context) throws Exception {
        plugin = null;
        refAttendeesManager.removeAllAttendees();
        super.stop(context);
    }

    public IAttendeesManager getAttendeesManager() {
        return refAttendeesManager;
    }

    public IAttendee createAttendee(String pName, String pCompanyName) {
        return new Attendee(pName, pCompanyName, count++);
    }

    /**
     * Returns the shared instance
     *
     * @return the shared instance
     */
    public static Activator getDefault() {
        return plugin;
    }
```

## Exercice 3 : Construire des vues

Les buts de cet exercice sont les suivants :

* Construire une extension
* Implémenter une vue en dérivant de la classe *ViewPart*
* Notion d'identifiant
* Manipulation de l'API JFace / SWT

### Description

Deux vues sont à définir : une interface graphique pour la saisie du nom et de la société (deux champs de textes) puis une vue qui affiche la liste de l'ensemble des participants (une table). Lorsqu'un participant est ajouté bouton **Ajouter**, la liste est mise à jour. **ATTENTION** : à ce niveau nous ne gérons pas la sélection d'un participant dans la liste qui permettrait par exemple d'éditer un profil d'un participant (voir leçon 3). Par ailleurs, une partie des interfaces graphiques a été définie pour faciliter le développement.

### Etapes à suivre

À partir de l'outil PDE, sélectionnez l'onglet des Extensions qui permet de construire de nouvelles extensions.

Sélectionnez l'action Add qui permet d'ajouter une nouvelle série d'extension à partir d'une extension donnée, en l'occurrence ici le point d'extension *org.eclipse.ui.views*.

Dans le champ de saisie Extension Point filter, faites un filtre sur **views** et choisissez le point d'extension *org.eclipse.ui.views* (voir capture d'écran ci-dessous). Ne pas sélectionner le patron *Sample View*.

![Création d'une extension de type View](/images/handsonlab-intropluginlesson1/ex3-extensionview.png)

Ajoutez un nouvel élément de type view pour créer une vue **Edition Participant** (sélectionnez l'élément *org.eclipse.ui.views* puis bouton droit et enfin choisir *view*).

Remplissez les différents champs en respectant les valeurs comme cela est précisé sur la capture d'écran ci-dessous. Le champ class permet de définir la classe qui implémentera l'interface graphique de la vue.

![Création de la vue Participant](/images/handsonlab-intropluginlesson1/ex3-extensionview2.png)

Une partie du code de la classe *AttendeeViewPart* a déjà été développée pour simplifier l'exercice. Copiez cette classe située dans le répertoire *ressources\lesson 1 - Construction d'un plug-in\exercice3-6* en respectant le chemin défini par le package.

À partir de la classe *AttendeeViewPart* complétez le code du traitement de l'action **Ajouter** (récupérez l'instance de l'objet *Activator*, créez un participant, ajoutez ce participant au gestionnaire des participants puis effacer le contenu des champs de texte).

```java
        newAttendee.addSelectionListener(new SelectionListener() {
            @Override
            public void widgetSelected(SelectionEvent e) {
                // Add
                Activator currentActivator = Activator.getDefault();
                IAttendee createAttendee = currentActivator.createAttendee(attendeeNameValue.getText(), 
                        companyNameValue.getText());
                Activator.getDefault().getAttendeesManager().addAttendee(createAttendee);

                attendeeNameValue.setText("");
                companyNameValue.setText("");
            }

            @Override
            public void widgetDefaultSelected(SelectionEvent e) {
            }
        });
```

Créez un nouvel élément de type view pour créer une vue **Liste Participants** (sélectionnez l'élément *org.eclipse.ui.views* puis bouton droit et enfin choisir view) et remplissez les différents champs comme cela est précisé sur la capture d'écran ci-dessous.

![Création de la vue Liste Participants](/images/handsonlab-intropluginlesson1/ex3-extensionview3.png)

La classe *AttendeesViewPart* a déjà été développée en partie, copiez cette classe située dans le répertoire *ressources\lesson 1 - Construction d'un plug-in\exercice3-9* en respectant le chemin défini par le package.

Complétez la classe *AttendeesViewPart* pour réaliser un abonnement d'un écouteur *IAttendeeListener* de telle sorte que tout changement du gestionnaire de participants notifie la vue **Liste Participants**. Utilisez la méthode *refresh()* et *refresh(Object)* de la classe *TableViewer* pour notifier la table qu'une modification du modèle a été réalisée.

```java
        Activator.getDefault().getAttendeesManager().addAttendeeListener(new IAttendeeListener() {
            @Override
            public void attendeeRemoved(IAttendee p) {
                viewer.refresh(p);
            }

            @Override
            public void attendeeAdded(IAttendee p) {
                viewer.refresh();
            }

            @Override
            public void allAttendeeRemoved() {
                viewer.refresh();
            }

            @Override
            public void attendedUpdated(IAttendee p) {
                viewer.refresh(p);
            }
        });
```

## Exercice 4 : Exécution d'un plug-in

Les buts de cet exercice sont les suivants :

* Exécuter un plug-in à partir d'une configuration d'exécution
* Lier à la configuration d'exécution les dépendances nécessaires

### Description

Dans cet exercice nous définissons une configuration d'exécution permettant de tester le plug-in *eclipse.labs.jugercp.attendees*. Ce plug-in est associé avec un sous ensemble de plug-ins de la plateforme Eclipse qui constitue un noyau minimum pour tester de nouveaux plug-ins développés.

### Etapes à suivre

Ouvrez le menu d'édition des configurations d'exécution comme indiqué sur la capture d'écran ci-dessous. **ALTERNATIVE** : passer par le menu Eclipse *Run -> **Run Configurations …***

![Menu configuration d'exécution](/images/handsonlab-intropluginlesson1/ex4-menuconfiguration.png)

Créez une nouvelle configuration via l'action **New launch Configuration**.

![Création d'une nouvelle configuration d'exécution](/images/handsonlab-intropluginlesson1/ex4-newlaunchconfiguration.png)

Dans la zone de droite, modifiez le nom de la configuration en *JugercpAttendeesConfiguration* puis modifiez l'emplacement des données du Worskpace (utilisé pour l'exécution) en *${workspace_loc}/../JugercpAttendeesConfiguration*.

![Edition du chemin du répertoire de travail de l'application Eclipse](/images/handsonlab-intropluginlesson1/ex4-launchconfigurationpath.png)

Dans l'onglet Plug-ins, modifiez la valeur *Launch with en plug-ins selected below only* puis sélectionnez uniquement le plug-in *eclipse.labs.jugercp.attendees*

Décochez l'élément *Target Platform* puis sélectionnez l'action **Add Required Plug-ins**. Ceci a pour effet d'ajouter uniquement les plug-ins utiles pour l'exécution de notre plug-in (voir résultat attendu sur la capture d'écran ci-dessous).

![Sélection plug-ins dans la configuration d'exécution](/images/handsonlab-intropluginlesson1/ex4-selectionplugin.png)

Démarrez la configuration d'exécution via l'action **Run**. Une nouvelle instance d'Eclipse (avec des fonctionnalités réduites) démarre.

A partir de cette nouvelle instance d'Eclipse, visualisez les vues du plug-in qui ont été développées via le menu *Window -> Show View -> **Other***. Dans la fenêtre dépliez le nœud Other et sélectionnez les deux vues : **Edition Participant**, **Liste Participants**. Elles s'affichent dans la perspective courante.

![Exécution du plug-in](/images/handsonlab-intropluginlesson1/ex4-execution.png)

**ASTUCE** : il est possible de persister dans un fichier physique les paramétrages des configurations d'exécution. L'avantage étant que tous ces paramétrages sont alors associés au projet du plug-in et non au Workspace. Par conséquent lors de l'importation d'un projet dans un autre Workspace la configuration d'exécution est également importée.

Editez la configuration d'exécution précédente et sélectionnez l'onglet **Common**. Puis dans la partie **Save As**, choisissez **Shared file** et sélectionnez le projet *eclipse.labs.jugercp.attendees*. En appliquant les modifications, un nouveau fichier est ajouté à la racine du projet *JugercpAttendeesConfiguration.launch*.

## Exercice 5 : Construire une catégorie pour une vue

Les buts de cet exercice sont les suivants :

* Créer un élément category du point d'extension *org.eclipse.ui.views*
* Associer des vues à une catégorie

### Description

Une catégorie de vues permet de réaliser des regroupements de vues. La décomposition en catégories est visible au niveau de la liste de l'ensemble des vues. Il vous est demandé dans cet exercice de créer une nouvelle catégorie *jugercp* et d'associer les vues **Edition Participant** et **Liste Participants** à cette catégorie.

### Etapes à suivre

Créez un élément *category* à partir du point d'extension *org.eclipse.ui.views* dont l'identifiant est *eclipse.labs.jugercp.attendees.category* et son nom est *jugercp* (valeur qui sera affichée à l'utilisateur).

![Création d'un élément category](/images/handsonlab-intropluginlesson1/ex5-extensioncategory.png)

Associez l'identifiant de la catégorie aux paramètres des deux vues (capture d'écran des paramètres de la vue Edition Participant).

![Mise à jour de l'attribut category](/images/handsonlab-intropluginlesson1/ex5-updateviews.png)

Démarrez la configuration d'exécution associée au plug-in et affichez la liste des vues disponibles *Window -> Show View -> **Other***. Le nœud *Other* a été remplacé par jugercp.

![Exécution du plug-in](/images/handsonlab-intropluginlesson1/ex5-execution.png)

## Pour aller plus loin

* [/eclipse/intro-swt/](/eclipse/intro-swt/) : support de cours relatif à la boîte à outils SWT ;
* [/eclipse/intro-jface1/](/eclipse/intro-jface1/) : support de cours relatif à l'utilisation des composants Viewer ;
* [/eclipse/intro-plugin/](/eclipse/intro-plugin/) : support de cours relatif à la conception de plug-in (cycle de vie, concepts OSGi) ;
* [/eclipse/intro-extensions/](/eclipse/intro-extensions/) : support de cours relatif à la construction d'extensions et de points d'extension.
