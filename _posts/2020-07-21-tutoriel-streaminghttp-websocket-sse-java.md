---
title: Tutoriel sur le développement de WebSocket et de Server-Sent Event avec le langage Java
tags: [WebSocket, SSE, Java]
category: technical
---

Je vous propose une série d'exercices pour apprendre à concevoir et développer une application en utilisant des technologies de Streaming HTTP :

* WebSocket pour la communication bidirectionnelle entre la couche cliente et la couche serveur ;
* Server-Sent Event (SSE) pour la communication monodirectionelle entre la couche serveur et la couche cliente ;
* Service web REST pour une communication de la couche cliente vers la couche serveur.

Nous utiliserons le langage Java et les bibliothèques Tyrus pour le développement des WebSocket et JAX-RS pour le développeur de Server-Sent Event.

L'étude de cas utilisée est une application appelée « Spell What Royal ». C'est une application de type jeu dont l'objectif est de deviner un texte à partir d'une image. Une image est ainsi présentée au joueur et celui-ci doit saisir, dans un temps donné, un texte. Si le texte correspond à la valeur demandée, le joueur marque un point.

![Splash screen du jeu Spell What Royal](/images/spr-logo.jpg)

Le texte et les codes pour les exercices sont disponibles sur le dépôt Git suivant : https://github.com/mickaelbaron/streaminghttp-tutorial (pour récupérer le code faire : `$ git clone https://github.com/mickaelbaron/streaminghttp-tutorial`).

La solution de tous les exercices est disponible sur la branche solution : `$ git checkout solution`.

Ce tutoriel a été utilisé dans le cadre du cours que j'ai dispensé à l'ISAE / ENSMA et à l'Université de Poitiers pour des étudiants en dernière année du cycle d'ingénieur et de Master 2.