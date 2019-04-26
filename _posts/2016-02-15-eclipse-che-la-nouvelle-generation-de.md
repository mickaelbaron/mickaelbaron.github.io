---
title: Eclipse Che, la nouvelle génération de l'EDI Eclipse accessible depuis un navigateur web.
tags: [Eclipse]
blogger_orig_url: https://keulkeul.blogspot.com/2016/02/eclipse-che-la-nouvelle-generation-de.html
category: technical
---

Eclipse CHE est disponible en version beta depuis le mois de janvier. Pour faire simple, il s'agit d'un Eclipse dans le navigateur et où le workspace est déporté sur le serveur. Le workspace est géré par des conteneurs Docker.  

Le [site web](https://eclipse.org/che/) d'Eclipse CHE est tout beau et la [documentation](https://eclipse-che.readme.io/) est très complète. J'ai donc voulu l'installer pour tester. 

Les pré-requis logiciels sont :

* Java 8 ;
* Docker.

Pour information je suis sous Mac OS X et pour Docker je n'ai jamais installé la suite logicielle boot2docker ou DockerMachine. Je passe par une box Linux Ubuntu Vagrant avec les bonnes redirections de ports.

J'ai donc préparé sur mon github un projet Vagrant pour tester Eclipse CHE. Je vous invite à télécharger :

* [https://github.com/mickaelbaron/vagrant-dockereclipseche-ubuntu64-build](https://github.com/mickaelbaron/vagrant-dockereclipseche-ubuntu64-build)

Il n'y qu'à faire `vagrant up` et ouvrir son navigateur web à l'adresse [http://localhost:8080](http://localhost:8080/).

Le principe de workspace déporté c'est vraiment pas mal. Le navigateur est très simpliste mais quel bonheur de pouvoir partager son espace de travail.

Voici par contre quelques points à souligner.

* chaque workspace utilise un conteneur Docker suivant une image différente selon la plateforme utilisée (une image pour Java, pour PHP, ...). Chaque conteneur expose au moins cinq ports différents suivant une plage déterminée. 
* l'éditeur de code est très simpliste pour l'instant. Il n'est même pas au niveau d'un Eclipse version bureau. Quand on voit ce que prend Eclipse comme critiques face à IntelliJ...
* cette version n'est que le début, j'espère qu'on pourra croiser un jour la partie EMF voir un SIRIUS sur Eclipse CHE pour faire de la modélisation.