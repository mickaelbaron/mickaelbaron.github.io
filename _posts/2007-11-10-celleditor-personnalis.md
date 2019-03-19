---
title: CellEditor personnalisé
tags: [Eclipse, JFace]
blogger_orig_url: https://keulkeul.blogspot.com/2007/11/celleditor-personnalis.html
category: technical
description: Tous les composants de type ColumnViewer (TableViewer et TreeViewer) peuvent éditer des éléments.
---

Tous les composants de type `ColumnViewer` (`TableViewer` et `TreeViewer`) peuvent éditer des éléments. Une édition se caractérise par :

* un modèle qui détermine si l'édition est autorisée, la valeur à afficher lors de l'édition et la nouvelle valeur saisie ;
* un composant appelé Editor permettant de modifier la valeur d'un élément. Un Editor doit satisfaire la classe CellEditor .

C'est ce dernier point qui nous intéresse. L'API Eclipse fournit un ensemble de `CellEditor` prédéfini :

* `TextCellEditor` pour l'édition d'un simple texte ;
* `ColorCellEditor` pour le choix d'une couleur ;
* `ComboboxCellEditor` pour le choix d'une boite à sélection multiple ;
* `CheckboxCellEditor` pour le choix dans une boite à cocher ;
* `DialogCellEditor` pour la saisie d'une valeur dans une boite de dialogue.

Si par contre vous devez fournir votre propre Editor, lisez la suite...  

La capture d'écran (une table avec trois colonnes dont la 1ère fournit un éditeur personnalisé composé d'un Label avec la valeur "Saisir :" et d'un Text pour l'édition)  

![(/images/avecedition.jpg)](/images/avecedition.jpg)

Chaque colonne a un `ViewerColumn` pour définir le `LabelProvider` et `EditingSupport`. C'est ce dernier qui est employé pour préciser si l'édition est autorisé ou pas, la valeur à afficher lors de l'édition et retourner la valeur au modèle.  

```java
class MyEditingSupport extends EditingSupport {  
  private MyCustomCellEditor editor;  
  private Viewer myViewer;  
  
  public MyEditingSupport(ColumnViewer viewer) {  
    super(viewer);  
    myViewer = viewer;  
    editor = new MyCustomCellEditor((Composite)viewer.getControl(), SWT.NONE);  
  }  
  
  protected boolean canEdit(Object element) {  
    return true;  
  }  
  
  protected CellEditor getCellEditor(Object element) {  
    return editor;  
  }  
  
  protected Object getValue(Object element) {  
    Person current = (Person)element;  
    return current.getName();  
  }  
  
  protected void setValue(Object element, Object value) {  
    Person current = (Person)element;  
    current.setName((String)value);  
    myViewer.refresh();  
  }
}
```

La méthode `getCellEditor` permet de préciser l'éditeur à afficher au moment de l'édition. Cette méthode doit retourner un objet de type CellEditor.  

```java
class MyCustomCellEditor extends CellEditor {  
  private Text myText;  
  private Composite myComposite;  
  
  public MyCustomCellEditor(Composite parent, int style) {  
   super(parent, style);  
  }  
  
  protected Control createControl(Composite parent) {  
    myComposite = new Composite(parent, SWT.NONE);  
    GridLayout gridLayout = new GridLayout();  
    gridLayout.numColumns = 2;  
    gridLayout.marginTop = -5;  
    gridLayout.marginBottom = -5;  
    gridLayout.verticalSpacing = 0;  
    gridLayout.marginWidth = 0;  
    myComposite.setLayout(gridLayout);  
    Label myLabel = new Label(myComposite, SWT.NONE);  
    myLabel.setText("Saisir : ");  
    myText = new Text(myComposite, SWT.NONE);  
    myText.setLayoutData(new GridData(GridData.FILL\_BOTH));  
    myText.addSelectionListener(new SelectionAdapter() {  
      public void widgetDefaultSelected(SelectionEvent e) {  
        MyCustomCellEditor.this.fireApplyEditorValue();  
      }
    });  
    return myComposite;  
  }  
  
  protected Object doGetValue() {  
    return myText.getText();  
  }  
  
  protected void doSetFocus() {  
    myText.setFocus();
    myText.selectAll();  
  }  
  
  protected void doSetValue(Object element) {  
    if (element instanceof String) {  
      myText.setText((String)element);  
    }  
  }  
}  
```

Ci-dessus un `CellEditor` personnalisé : les méthodes `createControl`, `doGetValue`, `doSetFocus` et `doSetValue` doivent être implémentées car elles sont abstraites.  

La construction du composant d'édition est réalisée par la méthode `createControl`. Comme vous pouvez le constater cette méthode doit retourner un objet de type `Control`. Par conséquent toutes les folies sont possibles. Nous pourrions imaginer lors de l'édition d'une cellule, d'afficher un autre tableau.  

L'exemple complet peut être trouvé [ici](http://mbaron.ftp-developpez.com/divers/customeditorexample.zip).