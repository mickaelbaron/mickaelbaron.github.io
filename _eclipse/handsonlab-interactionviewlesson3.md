---
title: Utiliser des vues avec la plateforme Eclipse
tags: [Eclipse]
image: /images/views.jpg
description: Apprendre à utiliser des vues dans le développement de plug-ins avec la plateforme Eclipse.
category: Article
weight: 14
date: 2010-02-02
update: 2013-05-27
toc: true
comments: utterances
---

Le but de cette troisième leçon est d'apprendre à communiquer entre des plug-ins et des vues.

**Buts pédagogiques** : Service OSGi, service de sélection et IAdaptable.

**Codes sources** : les codes sources et la solution de la leçon sont disponibles à l'adresse suivante : [lesson3-ressources.zip](/files/lesson3-ressources.zip).

## Exercice 1 : Interaction entre plug-ins

Les buts de cet exercice sont les suivants :

* réaliser une communication entre deux plug-ins en utilisant les mécanismes OSGi ;
* ajouter une dépendance entre plug-ins.

### Description

Le plug-in *eclipse.labs.jugercp.quizz* requiert des informations stockées dans le plug-in *eclipse.labs.jugercp.attendees* comme le nombre de participants et le nom d'un participant pour un index donné.

### Etapes à suivre

Si vous n'avez pas complètement terminé le développement des plug-ins *eclipse.labs.jugercp.attendees* et *eclipse.labs.jugercp.quizz* lors de la fin de la leçon 2, vous pouvez récupérer les codes complets dans le répertoire *ressources\lesson 2 - Perspectives\solution*.

Ajoutez une dépendance du plug-in *eclipse.labs.jugercp.attendees* dans le plug-in *eclipse.labs.jugercp.quizz*. Editez le fichier MANIFEST.MF du plug-in *eclipse.labs.juercp.quizz* via l'outil PDE et sélectionnez l'onglet Dependencies.

![Ajouter une dépendance vers un autre plug-in](/images/handsonlab-interactionviewlesson3/ex1-dependencies.png)

Ajoutez via le bouton " Add … " le plug-in *eclipse.labs.jugercp.attendees* (s'il n'est pas visible, vérifiez que le plug-in est présent dans la liste des projets et que son projet est en ouverture).

![Sélection du plug-in à ajouter en dépendance](/images/handsonlab-interactionviewlesson3/ex1-pluginselection.png)

Si tout s'est correctement déroulé, vous devriez voir afficher le nom du plug-in *eclipse.labs.jugercp.attendees* dans la liste des dépendances.

![Dépendance vers un autre plug-in terminée](/images/handsonlab-interactionviewlesson3/ex1-dependenciesresult.png)

Tous les services proposés par le plug-in *eclipse.labs.jugercp.attendees* sont désormais accessibles par le plug-in *eclipse.labs.jugercp.quizz*.

La classe `QuizzViewPart` a été complétée de telle sorte à récupérer le nombre de participants et à afficher le nom du participant qui a gagné. Recopiez la nouvelle version de la classe `QuizzViewPart` située dans le répertoire " ressources\lesson 3 - Interaction Vue\exercice1-4 " en respectant le chemin défini par le package.

Exécutez la configuration d'exécution pour tester le nouveau résultat attendu. Vous devriez voir afficher un résultat similaire à la capture d'écran ci-dessous.

![Exécution de la vue Quizz](/images/handsonlab-interactionviewlesson3/ex1-viewquizzworking.png)

## Exercice 2 : Interaction entre vues via le service de sélection

Le but de cet exercice est le suivant :

* Utilisation du service de sélection pour la communication entre deux vues.

### Description

Lorsqu'un élément de la vue **Liste Participants** est sélectionné, les informations sont affichées dans la vue **Edition Participant**. De cette manière, un participant peut être édité. Cet exercice exploite le service de sélection pour notifier la vue **Edition Participant**.

### Etapes à suivre

Editez la classe `AttendeesViewPart` de manière à associer le composant *TableViewer* au service de sélection. Ce composant *TableViewer* est en fait un fournisseur de sélection (appelé *Provider*). Pour diffuser la sélection vers le service de sélection vous devez le connecter au niveau de la méthode `createPartControl(…)` de la façon suivante :

```java
        for (int i = 0, n = table.getColumnCount(); i < n; i++) {
            table.getColumn(i).setWidth(100);
        }

        table.setHeaderVisible(true);
        table.setLinesVisible(true);

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

        this.getSite().setSelectionProvider(viewer);

```

A chaque modification de la sélection du composant *TableViewer* de la vue **Liste Participants**, le service de sélection est notifié des changements. Il vous est demandé dans les prochaines étapes de modifier la vue **Edition Participant** pour faire apparaître le participant sélectionné.

Modifiez la classe `AttendeeViewPart` de manière à ajouter un écouteur sur les sélections qui proviennent de la vue **Edition Participant**. L'accès au service de sélection est obtenu comme ceci : `this.getSite().getWorkbenchWindow().getSelectionService()`. Complétez le code de la classe comme indiqué ci-dessous.

```java
        this.getSite().getWorkbenchWindow().getSelectionService().addSelectionListener(
                "eclipse.labs.jugercp.attendees.listattendeesid", new ISelectionListener() {
            @Override
            public void selectionChanged(IWorkbenchPart part, ISelection selection) {
                if (selection == null) {
                    currentSelection = null;
                    return;
                }
                if (selection instanceof IStructuredSelection) {
                    IStructuredSelection structuredSelection = (IStructuredSelection)selection;
                    Object firstElement = structuredSelection.getFirstElement();
                    if (firstElement != null) {
                        currentSelection = (IAttendee)firstElement;
                        attendeeNameValue.setText(currentSelection.getName());
                        companyNameValue.setText(currentSelection.getCompany());
                    }
                }
            }
        });
```

Ajoutez par ailleurs un attribut *currentSelection* à cette classe qui est de type `IAttendee`. Cela permettra de stocker la sélection courante.

Complétez le traitement du bouton "Mise à jour" qui permet de mettre à jour le contenu de la sélection en cours. Saisissez le code proposé ci-dessous.

![Mise à jour du contenu d'une vue lors du changement de sélection](/images/handsonlab-interactionviewlesson3/ex2-updateselection.png)

Exécutez la configuration d'exécution pour tester le nouveau résultat attendu. Créez deux participants puis sélectionnez en un participant à partir de la vue **Liste Participants**.

## Exercice 3 : Interaction entre vues via le service de sélection et IAdaptable

### But

Les buts de cet exercice sont les suivants :

* utilisation du service de sélection ;
* manipulation de l'interface `IAdaptable` ;
* ré-utilisation des fonctionnalités proposées par la vue **Properties**.

### Description

Lorsqu'un élément de la vue **Liste Participants** est sélectionné, son contenu est également affiché dans la vue **Properties**. Cet exercice montre comment adapter un objet de type *IAttendee* en un objet compréhensible par la vue **Properties** en utilisant le mécanisme d'extension.

### Etapes à suivre

Editez le fichier *plugin.xml* en utilisant l'outil PDE et sélectionnez l'onglet Extensions.

Créez une nouvelle extension à partir du point d'extension *org.eclipse.core.runtime.adapters*.

![Création d'extensions à partir du point d'extension org.eclipse.core.runtime.adapters](/images/handsonlab-interactionviewlesson3/ex3-extensionpointadapters.png)

Un sous élément factory est créé implicitement à partir de l'élément *org.eclipse.core.runtime.adapters*, veuillez saisir les valeurs pour les attributs *adaptableType* et *class* comme indiqué sur la figure ci-dessous :

![Création d'une nouvelle extension à partir du point d'extension org.eclipse.core.runtime.adapters](/images/handsonlab-interactionviewlesson3/ex3-newextensionadapters.png)

Une classe doit être normalement créée : `AttendeeAdapterFactory`.

Veuillez également construire un sous élément adapter à partir de l'élément factory, veuillez saisir les valeurs pour l'attribut type comme indiqué sur la figure ci-dessous :

![Création d'un élément factory](/images/handsonlab-interactionviewlesson3/ex3-newelementfactory.png)

Editez le contenu de la classe `AttendeeAdapterFactory` puis recopiez le code ci-dessous.

```java
public class AttendeeAdapterFactory implements IAdapterFactory {

    @SuppressWarnings("rawtypes")
    private static final Class[] TYPES = { IPropertySource.class };

    @SuppressWarnings({ "rawtypes" })
    public Object getAdapter(Object adaptableObject, Class adapterType) {
        if (adapterType == IPropertySource.class) {
            if (adaptableObject instanceof IAttendee) {
                return new AttendeePropertySourceAdapter((IAttendee) adaptableObject);
            }
        }
        return null;
    }

    @SuppressWarnings("rawtypes")
    public Class[] getAdapterList() {
        return TYPES;
    }
}
```

Editez le contenu de la classe `AttendeePropertySourceAdapter` puis recopiez l'extrait du code ci-dessous.

```java
public class AttendeePropertySourceAdapter implements IPropertySource {

    private IAttendee attendee;

    public AttendeePropertySourceAdapter(IAttendee attendee) {
        this.attendee = attendee;
    }

    @Override
    public Object getEditableValue() {
        return this;
    }

    @Override
    public IPropertyDescriptor[] getPropertyDescriptors() {
        List<PropertyDescriptor> descriptors = new ArrayList<PropertyDescriptor>();

        PropertyDescriptor descriptorId = new PropertyDescriptor("id", "Identifiant");
        descriptorId.setAlwaysIncompatible(true);
        PropertyDescriptor descriptorName = new PropertyDescriptor("name", "Nom");
        descriptorName.setAlwaysIncompatible(true);
        PropertyDescriptor descriptorCompany = new PropertyDescriptor("company", "Société");
        descriptorCompany.setAlwaysIncompatible(true);
        descriptors.add(descriptorId);
        descriptors.add(descriptorName);
        descriptors.add(descriptorCompany);

        return descriptors.toArray(new IPropertyDescriptor[0]);
    }
```

Créer la classe `AttendeePropertySourceAdapter` puis complétez là par l'extrait du code ci-dessous.

```java
    @Override
    public Object getPropertyValue(Object id) {
        if (id instanceof String) {
            String idString = (String) id;

            if (idString.equals("id")) {
                return this.attendee.getId();
            } else if (idString.equals("name")) {
                return this.attendee.getName();
            } else if (idString.equals("company")) {
                return this.attendee.getCompany();
            } else {
                return "...";
            }
        } else {
            return null;
        }
    }

    @Override
    public boolean isPropertySet(Object id) {
        return false;
    }
    @Override
    public void resetPropertyValue(Object id) {
    }
    @Override
    public void setPropertyValue(Object id, Object value) {
    }
}
```

Exécutez de nouveau la configuration d'exécution et vérifiez que le contenu d'un élément sélectionné dans la vue **Liste Participants** est affiché dans la vue **Properties**.

![Exécution configuration d'exécution](/images/handsonlab-interactionviewlesson3/ex3-execution.png)

# Pour aller plus loin

* [/eclipse/views/](/eclipse/views/) : support de cours relatif à la construction de vues.
