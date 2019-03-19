---
title: Sauvegardes vos préférences
tags: [Java, Swing]
blogger_orig_url: https://keulkeul.blogspot.com/2006/11/sauvegardes-vos-prfrences.html
category: technical
---

On continue les exemples Java avec au programme des solutions pour sauvegarder les préférences utilisateurs concernant les états de l'IHM (position d'une fenêtre, taille d'une fenêtre, quelles sont les fenêtre ouvertes...).  

Pour cela, je vous propose deux solutions :

* la première est d'utiliser une API Java appelée Preferences ;
* la seconde est une solution maison qui exploite les fichiers properties (couple clé, valeur).

Le résultat final est identique. Les données sont enregistrées quelque part (un fichier ou dans la base de registre). 

Concernant la première solution c'est la machine virtuelle qui s'occupe du support d'enregistrement. Cette étape est transparente pour le développeur (selon le système d'exploitation hôte, le support est différent : base de registre pour Windows, répertoire bibliothèque pour MAC OS X...). Le développeur a seulement besoin d'indiquer les paramètres qu'il souhaite sauvegarder. 

Concernant la seconde solution, le développeur a la charge du support d'enregistrement, il doit gérer un flux de fichier...  

Les codes sont disponibles ici ([preferences.zip](/files/preferences.zip)) sous licence GPL. La première solution est développée dans la classe `PreferencesExemple` et la seconde dans la classe `PropertiesExemple`.