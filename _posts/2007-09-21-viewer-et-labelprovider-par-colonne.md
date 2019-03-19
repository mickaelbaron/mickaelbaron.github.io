---
title: TableViewer et TableViewerColumn
tags: [Eclipse, JFace]
blogger_orig_url: https://keulkeul.blogspot.com/2007/09/viewer-et-labelprovider-par-colonne.html
category: technical
description: "Dans ce billet je vais préciser la notion de LabelProvider unique par colonne. L'intérêt : des comportements spécifiques à chaque colonne pour les bulles d'aides et tout ce qui touche aux couleurs."
---

Dans un précédent billet ([ici](/blog/tableviewer-et-ownerdrawlabelprovider)) je vous avais montré comment utiliser OwnerDrawLabelProvider pour dessiner le contenu des cellules d'une table. Dans ce billet je vais préciser la notion de `LabelProvider` unique par colonne. L'intérêt : des comportements spécifiques à chaque colonne pour les bulles d'aides et tout ce qui touche aux couleurs.  

Chaque Viewer de la famille des `ColumnViewer` (`TableViewer` et `TreeViewer`), c'est-à-dire des composants affichant plusieurs colonnes, peuvent manipuler pour chaque colonne un `LabelProvider` spécifique. Pour ce faire un ColumnViewer doit être associé à un ViewerColumn (la colonne en fait) pour être relié à un LabelProvider donné.  


La capture d'écran (la bulle d'aide est customisable : déclenchement, temps d'affichage, couleurs)  
  
![/images/columnlabelprovider.jpg](/images/columnlabelprovider.jpg)

```java
final TableViewer viewer = new TableViewer(shell, SWT.FULL\_SELECTION);  
viewer.setContentProvider(new MyStructuredContentProvider());  
  
TableViewerColumn column = new TableViewerColumn(viewer,SWT.NONE);  
column.setLabelProvider(new MyColumnLabelProvider() {  
public Color getBackground(Object element) {  
  return Display.getDefault().getSystemColor(SWT.COLOR\_GREEN);  
}  
  
public String getText(Object element) {  
  PersonData currentPerson = (PersonData)element;  
  return currentPerson.getName();  
}  
  
public Color getToolTipBackgroundColor(Object object) {  
  return Display.getCurrent().getSystemColor(SWT.COLOR\_MAGENTA);  
}  
  
public String getToolTipText(Object element) {  
  PersonData myReference = (PersonData)element;      
  return "Le nom de cette personne est : " + myReference.getName();  
}  
});  
column.getColumn().setText("Nom");  
  
ColumnViewerToolTipSupport.enableFor(viewer,ToolTip.NO\_RECREATE);  
```

La colonne est créée par l'intermédiaire d'un objet `TableViewerColumn` (l'équivalent pour un `TreeViewer` est un `TreeViewerColumn`). Notez que ce composant est associé au `Viewer` concerné lors de la construction. Le `LabelProvider` est ensuite spécifié. Je factorise les comportements via la classe statique `MyColumnLabelProvider` (voir ci-dessous). Cette classe hérite de `ColumnLabelProvider` qui donne tous les services pour modifier la forme et le fond d'une cellule, mais aussi pour customiser les bulles d'aides. Une spécialisation de `MyColumnLabelProvider` est obtenue au travers d'une classe anonyme où je précise la couleur de fond de la bulle d'aide et le contenu de la bulle d'aide. 

Bien entendu, c'est également dans ce `LabelProvider` que j'affiche le contenu de la cellule. La même démarche est appliquée à la seconde colonne. La dernière instruction du code ci-dessus est importante `ColumnViewerToolTipSupport.enable(viewer,ToolTip.NO\_RECREATE)`, elle permet d'activer la customisation des bulles d'aides.  

```java
static class MyColumnLabelProvider extends ColumnLabelProvider {  
  public int getToolTipDisplayDelayTime(Object object) {  
    return 500;  
  }  
  
  public int getToolTipTimeDisplayed(Object object) {
    return 2000;  
  }
  
  public Point getToolTipShift(Object object) {  
    return new Point(5, 5);  
  }  
  
  public boolean useNativeToolTip(Object object) {  
    return false;  
  }  
}  
```

Vous trouverez le code source de cet exemple [ici](/files/tableviewercolumntinyexample.zip).