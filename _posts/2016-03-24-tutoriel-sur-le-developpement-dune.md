---
title: Tutoriel sur le développement d'une application basée sur une architecture microservice avec Docker
tags: [SOA, Microservices]
blogger_orig_url: https://keulkeul.blogspot.com/2016/03/tutoriel-sur-le-developpement-dune.html
category: technical
---

Je viens de publier sur le site de Developpez.com un tutoriel concernant le développement d'une application basée sur une architecture microservice avec Docker.

L'objectif de cette troisième série d'exercices est d'apprendre à construire une application en respectant une architecture à base de microservices. Nous utiliserons pour cela plusieurs technologies :

* la bibliothèque KumuluzEE pour packager et exécuter une application Java EE en ligne de commande ;
* l'outil Docker pour l'isolation des microservices ;
* la bibliothèque et le serveur RabbitMQ pour la gestion d'un bus d'événements afin que les microservices communiquent de manière asynchrone ;
* finalement l'outil Docker Compose pour la composition des microservices.

La grande majorité du code contenu dans les microservices vous sera donnée comme support. En effet, ces exercices se focaliseront principalement sur les problématiques de déploiement.

L'adresse du tutoriel est : [https://github.com/mickaelbaron/microservices-docker-java-tutorial](https://github.com/mickaelbaron/microservices-docker-java-tutorial).

Les codes pour les exercices sont disponibles sur le dépôt Git suivant : https://github.com/mickaelbaron/microservices-docker-java-tutorial (pour récupérer le code faire : `$ git clone https://github.com/mickaelbaron/microservices-docker-java-tutorial`).

La solution de tous les exercices est disponible sur la branche solution : `$ git checkout solution`.

Ce tutoriel a été utilisé dans le cadre du cours que j'ai dispensé à l'ISAE / ENSMA et à l'Université de Poitiers pour des étudiants en dernière année du cycle d'ingénieur et de Master 2.