---
title: Effets sur les images, des ressources
tags: [SWT, Swing]
blogger_orig_url: https://keulkeul.blogspot.com/2007/09/effets-sur-les-images-des-ressources.html
category: technological-watch
description: Je viens de trouver un article qui traite de la manipulation des images et des effets qui peuvent y être appliqués. Toutefois, cet article cible l'API Java2D et par conséquent la boîte à outils AWT/Swing.
---

Je viens de trouver un article qui traite de la manipulation des images et des effets qui peuvent y être appliqués ([Ultimate Java Image Manipulation](http://www.javalobby.org/articles/ultimate-image/)). Toutefois, cet article cible l'API Java2D et par conséquent la boîte à outils AWT/Swing.

J'en profite donc pour faire un état des articles/ressources concernant la manipulation d'image pour SWT.

Tout d'abord un article d'IBM ([Java2D imaging for the SWT](http://www.ibm.com/developerworks/library/j-2dswt/?ca=dnt-522)) permettant de passer une image AWT/Swing (BufferedImage) en une image SWT (ImageData). Au niveau performance, j'avoue ce n'est pas le top mais la solution de conversion existe.  

Concernant les articles « purs » SWT traitant du sujet de la manipulation des images :

* [Taking a look at SWT images](http://www.eclipse.org/articles/Article-SWT-images/graphics-resources.html) ;
* [Simple Image Effects for SWT](http://www.eclipse.org/articles/article.php?file=Article-SimpleImageEffectsForSWT/index.html) ;
* [Mon cours sur SWT](/eclipse/intro-swt).

Par ailleurs, si vous souhaitez des explications concernant la manière de réaliser des effets sur des images, je vous conseille cet excelent site [JH Labs](http://www.jhlabs.com/ip/index.html). Les démonstrations sont en Swing.