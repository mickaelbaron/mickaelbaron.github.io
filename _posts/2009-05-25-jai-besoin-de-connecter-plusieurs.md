---
title: J'ai besoin de... connecter plusieurs Viewers d'une même vue au service de sélection
tags: [Eclipse, JFace]
blogger_orig_url: https://keulkeul.blogspot.com/2009/05/jai-besoin-de-connecter-plusieurs.html
category: technical
---

Dans la série des J'ai besoin de ... je m'intéresse dans ce billet à la manière de connecter plusieurs SelectionProvider d'une même vue au service de sélection. 

Les `SelectionProvider` désignent tous les objets de type `Viewer` (`TableViewer`, `TreeViewer`, `ListViewer`...).

La connexion au service du sélection est obtenue par l'intermédiaire du site de la vue (le site peut être vue comme un pont entre la vue et le Workbench). Le code suivant se trouve généralement dans la méthode createPartControl de la ViewPart de la vue : `getSite().setSelectionProvider(tableViewer)`.

Comme vous pouvez le constater, la méthode qui consiste à connecter le composant `TableViewer` ne permet pas d'ajouter plusieurs composants de type `SelectionProvider`. Par ailleurs, la plateforme Eclipse n'autorise pas la modification dynamique du `SelectionProvider` d'une vue au service de sélection. Je me suis trouvé dans le cas où j'avais plusieurs composants `TableViewer` dans une même vue : cette vue contient deux composants de type `TableViewer`.

Une solution est proposée dans cet [article](http://www.eclipse.org/articles/Article-WorkbenchSelections/article.html) qui décrit l'utilisation du service de sélection. L'auteur propose notamment d'utiliser la classe `SelectionProviderIntermediate` pour gérer plusieurs composants de type `SelectionProvider` dans une même vue. Cet objet est connecté au service de sélection puisqu'il est de type `SelectionProvider`. En fait, cette classe joue le rôle de classe de délégation. Associé à un viewer, l'objet `SelectionProviderIntermediate` délègue les modifications de sélection du viewer au service de sélection. L'intérêt est de fixer l'objet de type `SelectionProviderIntermediate` et de lui associer dynamiquement les composants `SelectionProvider` (ici des composants de type TableViewer).

Dans la suite, je vous montre comment utiliser cette classe à partir de deux composants TableViewer. Tout ce qui va être présenté se trouve dans la méthode createPartControl.  

Ci-dessous, le code utilisé pour ajouter les deux composants TableViewer à la vue :

```java
public void createPartControl(Composite parent) {  
  viewer1 = new TableViewer(parent, SWT.MULTI | SWT.H\_SCROLL | SWT.V\_SCROLL | SWT.BORDER);  
  viewer1.setContentProvider(new ViewContentProvider());  
  viewer1.setLabelProvider(new ViewLabelProvider());  
  viewer1.setInput(getViewSite());  
  viewer2 = new TableViewer(parent, SWT.MULTI | SWT.H\_SCROLL | SWT.V\_SCROLL | SWT.BORDER);  
  viewer2.setContentProvider(new ViewContentProvider());  
  viewer2.setLabelProvider(new ViewLabelProvider());  
  viewer2.setInput(getViewSite());  
```

Ci-dessous, le code utilisé pour instancier le SelectionProvider qui délègue les modifications de sélection d'un viewer au service de sélection.

```java
final SelectionProviderIntermediate selectionProviderIntermediate = new SelectionProviderIntermediate();
this.getSite().setSelectionProvider(selectionProviderIntermediate);
```

Enfin, la notification du changement de la sélection locale de chaque composant TableViewer est utilisée pour modifier le SelectionProvider actif dans l'objet SelectionProviderIntermediate.

```java
viewer1.addSelectionChangedListener(new ISelectionChangedListener() {  
  public void selectionChanged(SelectionChangedEvent event) {  
    selectionProviderIntermediate.setSelectionProviderDelegate(viewer1);  
  }  
});  
viewer1.addPostSelectionChangedListener(new ISelectionChangedListener() {  
  public void selectionChanged(SelectionChangedEvent event) {  
    selectionProviderIntermediate.setSelectionProviderDelegate(viewer1);  
  }
});

viewer2.addSelectionChangedListener(new ISelectionChangedListener() {  
  public void selectionChanged(SelectionChangedEvent event) {  
    selectionProviderIntermediate.setSelectionProviderDelegate(viewer2);  
  }
});
viewer2.addPostSelectionChangedListener(new ISelectionChangedListener() {  
  public void selectionChanged(SelectionChangedEvent event) {  
    selectionProviderIntermediate.setSelectionProviderDelegate(viewer2);  
  }
 });
}
```

Vous pouvez télécharger le code source de cet [exemple](http://mbaron.ftp-developpez.com/divers/multipleprovidersexample.zip). Cet exemple fait parti du cours sur le Workbench Eclipse que je suis en train de préparer.