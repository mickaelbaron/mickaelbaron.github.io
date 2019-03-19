---
title: TableTreeViewer deprecated, TreeViewer à la rescousse
tags: [Eclipse, JFace]
blogger_orig_url: https://keulkeul.blogspot.com/2007/10/tabletreeviewer-deprecated-treeviewer.html
category: technical
---

Depuis la nouvelle version d'Eclipse 3.3, il est déconseillé d'utiliser directement le composant `TableTreeViewer` pour mixer un arbre avec une table. 

La raison est simple. Eclipse 3.3 intègre une gestion des colonnes via la classe `ViewerColumn` (sous types `TableViewerColumn` et `TreeViewerColumn`).

Par conséquent, pour éviter d'utiliser le composant `TableTreeViewer`, il faut utiliser un `TreeViewer` avec des colonnes de type `TreeViewerColumn`.

La capture d'écran (un arbre pour la première colonne et une table pour les autres colonnes)  

![/images/tabletreeviewer.jpg](/images/tabletreeviewer.jpg)

Ci-dessous un code d'exemple.  

```java
final TreeViewer viewer = new TreeViewer(shell, SWT.FULL\_SELECTION);  
viewer.setContentProvider(new MyTreeContentProvider());  
  
TreeViewerColumn column = new TreeViewerColumn(viewer, SWT.CENTER);  
column.setLabelProvider(new ColumnLabelProvider() {  
  public String getText(Object element) {  
    if (element instanceof Person) {  
      Person current = (Person)element;  
      return current.getName();  
    } else {  
      return element.toString();
    }  
  }  
});  
column.getColumn().setText("Métier / Nom");  
  
column = new TreeViewerColumn(viewer, SWT.CENTER);  
column.setLabelProvider(new ColumnLabelProvider() {  
  public String getText(Object element) {  
    if (element instanceof Person) {  
      Person current = (Person)element;  
      return current.getAdress();
    } else {  
      return null;  
    }  
  }  
});  
column.getColumn().setText("Adresse");  
```

La première colonne appelée Métier / Nom contient l'arbre tandis que les autres décrivent les colonnes de la table.  
  
L'exemple complet peut être trouvé [ici](/files/treeviewercolumntinyexample.zip).