---
title: Composant « Astuce du jour » en SWT
tags: [SWT]
blogger_orig_url: https://keulkeul.blogspot.com/2008/01/composant-astuce-du-jour-en-swt.html
category: technical
description: Après plusieurs recherches infructueuse d'une boîte de dialogue « Astuce du Jour » pour Eclipse, il ne restait plus qu'une solution, la développer...
---

Après plusieurs recherches infructueuse d'une boîte de dialogue « Astuce du Jour » pour Eclipse, il ne restait plus qu'une solution, la développer...

Ce billet présente donc le composant « Astuce du jour » codé avec la boîte à outils SWT. Son développement est fortement basé sur le code proposé par la bibliothèque [SwingX](http://swinglabs.org/) qui étend la boîte à outils Swing.

Toutefois comme SWT ne gére pas les « Look and Feel » à la manière de Swing, une seule interface graphique est proposée. Une capture d'écran du résultat est proposée ci-dessous.  

![/images/tipoftheday.jpg](/images/tipoftheday.jpg)

Les fonctionnalités proposées sont les suivantes :

* sauvegarde la possibilité de désactiver l'ouverture de la boîte de dialogue « Astuce du Jour » ;
* Internationalisation de la boîte de dialogue « Astuce du Jour » ;
* Look and Feel proche de celui de Windows ;
* Les astuces peuvent être de type text/plain ou Composite.

Les fonctionnalités qui ne sont pas encore proposées :

* Les astuces au format text/HTML. Une tentative a été tentée en utilisant le composant SWT Browser. Toutefois à la première initialisation du composant, c'est-à-dire à l'ouverture de la boîte de dialogue, il se passe un certains temps de chargement dû au moteur de rendu (IE ou FireFox).

Les sources complètes sont disponibles [ici](http://mbaron.ftp-developpez.com/divers/swttipoftheday.zip)