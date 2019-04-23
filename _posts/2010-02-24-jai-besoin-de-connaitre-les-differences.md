---
title: J'ai besoin ... de connaître les différences entre une vue et un éditeur d'une application Eclipse
tags: [Eclipse]
blogger_orig_url: https://keulkeul.blogspot.com/2010/02/jai-besoin-de-connaitre-les-differences.html
description: Je profite de ma série des J'ai besoin ... pour m'intéresser à lister les différences entre une vue et un éditeur tous deux utilisés dans la plateforme Eclipse.
category: technical
---

Actuellement je suis en train de rédiger un support de cours sur le sujet des éditeurs. Je profite de ma série des J'ai besoin ... pour m'intéresser dans ce billet à lister les différences entre une vue et un éditeur tous deux utilisés dans la plateforme Eclipse.  

* Un éditeur est commun à toutes les perspectives d'une fenêtre. Si l'éditeur est fermé à partir d'une perspective il est fermé pour toutes les perspectives de la fenêtre.
* Il n'est pas possible d'empiler une vue avec un éditeur.
* Un éditeur n'est pas détachable.
* Un éditeur a obligatoirement une barre de titre.
* Un éditeur n'a pas de barre de menus et de barre d'outils localisées, il partage avec les barres de la fenêtre. Toutefois, un éditeur peut avoir son propre menu contextuel.
* Un éditeur peut être instancié plusieurs fois pour un type d'éditeur donné. Une vue ne possède qu'une seule instance (cas particulier avec l'identifiant secondaire).
* Un éditeur apparaît à un seul endroit de la page alors qu'une vue peut être déplacée.
* Un éditeur peut être dans un état "modifié", son contenu peut ainsi être sauvegardé.
* Un éditeur peut être associé à un nom de fichier ou à une extension et cette association peut être modifiée par l'utilisateur.

La question importante à se poser est Quand utiliser un éditeur ?

* Quand le contenu est considéré comme l'élément central de la fenêtre. Toutes les vues sont utilisées comme support (outline, explorer, ...).  
* Quand il est nécessaire de fournir des actions spécifiques pour l'édition (sauvegarde, menu contextuel, ...)  

Je ne suis pas exhaustif de cette présentation. Ces informations sont tirées de la FAQ d'Eclipse ([lien](http://wiki.eclipse.org/FAQ_What_is_the_difference_between_a_view_and_an_editor%3F)) et du livre Eclipse Rich Client Platform - Designing, Coding, and Packaging Java Applications ([lien](http://eclipsercp.org/book/)). Si vous pensez que d'autres éléments doivent figurer, n'hésitez pas.

Vous pourrez trouver prochainement ces informations dans le support de cours que je suis en train de rédiger sur le sujet des éditeurs, patience ...