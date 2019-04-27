---
title: Introduction à la construction d'Editeurs avec la plateforme Eclipse
tags: [Eclipse]
blogger_orig_url: https://keulkeul.blogspot.com/2010/06/introduction-la-construction-dediteurs_25.html
category: lectures
---

Je vous propose un nouveau support de cours sur les éditeurs pour la plateforme Eclipse.

Le plan est le suivant :

* construction déclarative d'éditeurs ;
* `IEditorPart`, `IEditorSite`, `IEditorInput` à quoi ça sert ;
* registre des éditeurs ;
* cycle de vie des éditeurs ;
* `MultiPageEditorPart` ;
* écouteurs ;`
* éditeur et les commandes ;
* workspace et les ressources ;
* éditeur et le texte via `TextEditor` (Coloration syntaxique, assistant de contenu...).

À noter que pour la dernière partie, éditeur et le texte, une analyse approfondie de la boîte à outils JFace a été réalisée. À mon avis, cette partie risque d'évoluer au gré de différentes fonctionnalités apportées par la fondation Eclipse telles que XText et Eclipse 4.

Vous trouverez sur ce [lien](/eclipse/editors) un contenu détaillé de ce support de cours et sur ce [lien](/files/editors_examples.zip) le code source des exemples.

{% include slides.html type="speakerdeck" id="b74be305523f49ea86d3e3956815b8f0" %}