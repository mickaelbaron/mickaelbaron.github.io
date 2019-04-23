---
title: J'ai besoin ... de comprendre l'utilité d'un éditeur épinglé (isPinned)
tags: [Eclipse]
blogger_orig_url: https://keulkeul.blogspot.com/2010/03/jai-besoin-de-comprendre-lutilite-dun.html
description: Je profite de ma série des J'ai besoin ... pour comprendre l'utilité d'un éditeur épinglé (isPinned).
category: technical
---

Comme je suis en train de préparer le support de cours sur les éditeurs, j'étudie en détail les APIs sur le sujet. Durant cette exploration, j'ai découvert dans l'interface IEditorReference la méthode boolean isPinned(). Malheureusement la documentation sur le sujet de ce que représente un éditeur "épinglé" n'est pas très explicite. Toutefois, en cherchant dans les préférences utilisateurs, je suis tombé sur une option assez sympathique.  

Ouvrir le menu des préférences (Window -> Preferences) puis dans les options générales (General) sélectionner le sous menu Editors (voir capture ci-dessous).  
  
![/images/preference.jpg](/images/preference.jpg)

L'option Close editors automatically permet de fermer automatiquement des éditeurs si le nombre d'éditeurs ouvert dépasse la valeur indiquée dans le champ de texte Number of opened... Très pratique si vous avez l'habitude d'ouvrir toutes les classes Java d'un projet dans des éditeurs, puis de devoir les fermer explicitement puisqu'il y en a trop à gérer.  

Par contre il se peut que pour certaines classes vous ne souhaitiez pas que des éditeurs soient fermés automatiquement, d'où l'utilité de l'option épinglée (pinned).  

Si l'option Close editors automatically est activée, vous remarquerez dans la barre d'outils, une nouvelle option (voir repère 1 sur la figure ci-dessous).  
  
![/images/pinned.jpg](/images/pinned.jpg)

Pour épingler un éditeur, sélectionnez en un puis épinglez le avec l'option de la barre d'outils. Vous remarquerez alors que l'icône de l'éditeur est modifié (voir repère 2 sur la figure ci-dessus).  

Ainsi tous les éditeurs épinglés ne seront pas fermés. Vous pourrez alors ouvrir autant d'éditeur que vous souhaitez sans avoir à gérer leur fermeture.