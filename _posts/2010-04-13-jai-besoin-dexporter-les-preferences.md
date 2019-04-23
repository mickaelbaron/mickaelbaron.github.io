---
title: J'ai besoin ... d'exporter les préférences d'un Workspace
tags: [Eclipse]
blogger_orig_url: https://keulkeul.blogspot.com/2010/04/jai-besoin-dexporter-les-preferences.html
category: technical
---

Dans la série des J'ai besoin ... je vous propose dans ce billet de détailler la manière d'exporter les préférences d'un Workspace (SVN Preferences, paramètres M2Eclipse, ...) vers un autre Workspace. 

L'objectif visé est d'éviter de reconfigurer son Eclipse quand un nouveau Workspace est créé. Dans mon cas, cela arrive souvent puisque j'essaye de tester les nouvelles versions d'Eclipse et je ne souhaite pas "polluer" certains Workspace vitaux.

## Exporter les préférences

* Ouvrir à partir du menu File, l'outil Export (File -> Export) et choisir dans la catégorie General, l'élément Preferences (General -> Preferences).  
  
Vous devriez obtenir un résultat identique à la capture d'écran ci-dessous.  
  
![/images/exportpreferences.png](/images/exportpreferences.png)

* Choisir Export All (ou à l'unité) et sélectionner le fichier où sera stocké les préférences, enfin valider tout simplement.  

Un fichier a été créé. En y regardant de plus près, vous remarquerez que tout a été enregistré.  

## Importer les préférences  

* Relancer Eclipse et choisir un nouveau Workspace.  
  
* Ouvrir cette fois à partir du menu File, l'outil Import (File -> Import) et choisir dans la catégorie General, l'élément Preferences (General -> Preferences).  
  
Vous devriez obtenir un résultat identique à la capture d'écran ci-dessous.  
  
![/images/importpreferences.png](/images/importpreferences.png)

* Sélectionner le fichier de préférences qui a été précédemment enregistré et valider l'importation (vous pouvez également affiner les préférences qui peuvent être importées).  
  
Après un léger chargement, assurez-vous que vos préférences ont été chargées. Dans mon cas, ce qui m'importe c'est mes entrepôts SVN, mes préférences pour m2eclipse et mes perspectives personnalisées. C'est bon tout est là ...