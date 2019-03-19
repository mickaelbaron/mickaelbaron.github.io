---
title: TableViewer et OwnerDrawLabelProvider
tags: [Eclipse, JFace]
blogger_orig_url: https://keulkeul.blogspot.com/2007/08/tableviewer-et-ownerdrawlabelprovider.html
category: technical
---

La classe `OwnerDrawLabelProvider` du package JFace apparue avec la nouvelle API d'Eclipse 3.3 permet de dessiner le contenu d'une cellule d'un TableViewer.

Dans les précédentes API, pour dessiner quelque chose, il fallait ruser et générer une image affichée par la cellule (une cellule contient en fait un simple label = texte + image).

La capture écran (remarquez que le texte contient une police, un style et une couleur différents).

![Capture d'écran du résultat d'une table utilisant OwnerDrawLabelProvider](/images/ownerdrawlabelprovider.jpg)

Le code qui présente cette modification.

```java
TableViewer viewer = new TableViewer(shell, SWT.FULL\_SELECTION);  
viewer.setContentProvider(new MyStructuredContentProvider());  
TableViewerColumn column = new TableViewerColumn(viewer,SWT.NONE);  

column.setLabelProvider(new OwnerDrawLabelProvider() {  
    protected void measure(Event event, Object element) {  
        PersonData currentPerson = (PersonData)element;  
        int height = event.gc.textExtent(currentPerson.getName()).y + 5;  
        int width = event.gc.textExtent(currentPerson.getName()).x;  
        event.setBounds(new Rectangle(0,0, width, height));  
    }

    protected void paint(Event event, Object element) {  
        PersonData currentPerson = (PersonData)element;  
        Display display = viewer.getControl().getDisplay();  
        TextLayout layout = new TextLayout(display);  
        layout.setText(currentPerson.getName());  
  
        Font firstFont = JFaceResources.getFont(JFaceResources.DEFAULT\_FONT);  
        Color firstColor = display.getSystemColor(SWT.COLOR\_LIST\_FOREGROUND);  
        TextStyle plain = new TextStyle(firstFont, firstColor, null);  
  
        Font secondFont = JFaceResources.getFontRegistry().getItalic(JFaceResources.DEFAULT\_FONT);  
        Color secondColor = display.getSystemColor(SWT.COLOR\_BLUE);  
        TextStyle italic = new TextStyle(secondFont, secondColor, null);  
  
        Font newFont = new Font(display, "Arial", 9, SWT.BOLD);  
        TextStyle font = new TextStyle(newFont, display.getSystemColor(SWT.COLOR\_GREEN), null);  
  
        layout.setStyle(plain, 0, 2);  
        layout.setStyle(italic, 3, 5);  
        layout.setStyle(font, 6, currentPerson.getName().length() - 1);  
        layout.setOrientation(SWT.RIGHT\_TO\_LEFT);  
        layout.draw(event.gc, event.x, event.y);  
    }  
});
column.getColumn().setText("Nom");
```

La table contient deux colonnes définie chacune par un `TableViewerColumn` (dans le code présenté seule la première colonne est décrite). Pour faire simple, un `TableViewerColumn`, également fournie dans l'API 3.3 d'Eclipse, permet d'associer à chaque colonne un `LabelProvider` et le support à l'édition. Par conséquent, j'y ai placé un `LabelProvider` de type `OwnerDrawLabelProvider`.

La classe `OwnerDrawLabelProvider` fournit trois méthodes :

* `measure(Event event, Object element)` : pour le redimensionnement de la cellule;  
* `paint(Event event, Object element)` : pour le dessin dans la cellule;
* `erase(Event event, Object element)` : pour dessiner la sélection.

Dans le code ci-dessus, je me sers d'un `TextLayout` pour placer mon texte dans la cellule. Trois styles différents sont appliqués au texte ce qui me permet d'obtenir une chaîne de caractères ayant des styles différents.

Je ne vais pas entrer dans les détails, je vous laisse le plaisir d'y regarder dans l'archive fournie [ici](/files/ownerdrawlabeltinyexample.zip).
  
Sachez également que je me suis basée sur le code présenté [ici](http://dev.eclipse.org/viewcvs/index.cgi/org.eclipse.jface.snippets/Eclipse%20JFace%20Snippets/org/eclipse/jface/snippets/viewers/Snippet010OwnerDraw.java?view=markup) et que cet exemple fait partie du cours JFace que je suis en train de finaliser.