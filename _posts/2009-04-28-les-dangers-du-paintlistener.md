---
title: Les dangers du PaintListener avec SWT
tags: [SWT]
thumbnail: http://4.bp.blogspot.com/_azmyBJVJ09E/SfYxUst5JhI/AAAAAAAADgI/iPmYp_uCdMs/s72-c/paintlistener.jpg
blogger_orig_url: https://keulkeul.blogspot.com/2009/04/les-dangers-du-paintlistener.html
category: technical
---

Pour information, lorsque vous utilisez l'écouteur `PaintListener` pour ajouter des éléments graphiques à des composants, faites attention lorsque vous souhaitez avoir accès aux dimensions du cadre de la zone de dessin.

Il y a deux façons d'obtenir la taille de cette zone de dessin :

* soit en utilisant les attributs `width` et `height` de l'objet `PaintEvent`, passé en paramètre de la méthode `paintControl` ;
* soit en utilisant la source de l'écouteur qui devrait être normalement de type `Control`. Ainsi par l'intermédiaire de la propriété `bounds`, il y a possibilité d'avoir accès à la hauteur et à la largeur.

On pourrait penser que les valeurs obtenues sont identiques, et bien non. Dans le premier cas, la taille de la zone de dessin peut changer lors de mise à jour de l'affichage. Le cas classique quand une fenêtre superpose la fenêtre contenant la zone de dessin. On peut obtenir des résultats assez catastrophiques. On se rend compte que la largeur et la hauteur peuvent prendre des valeurs incohérentes (voir capture ci-dessous).
  
![/images/paintlistener.jpg](/images/paintlistener.jpg)

Pour résoudre ce problème, je vous recommande de passer par les dimensions de la source pour déterminer les limites de la zone de dessin.

Pour résumer, il ne faut pas utiliser le code ci-dessous (où e est de type PaintEvent) :

```java
int width = e.width;  
int height = e.height;  
```

Mais le code ci-dessous pour déterminer la hauteur et la largeur de la zone de dessin :

```java
int width = 0;  
int height = 0;  
if (e.getSource() != null) {  
 Control currentSource = (Control)e.getSource();  
 Rectangle bounds = currentSource.getBounds();  
 width = bounds.width;  
 height = bounds.height;  
}
```

Tout ça pour dire que je ne faisais pas attention depuis un certain moment et j'utilisais bêtement les dimensions fournis par l'objet `PaintEvent`.
