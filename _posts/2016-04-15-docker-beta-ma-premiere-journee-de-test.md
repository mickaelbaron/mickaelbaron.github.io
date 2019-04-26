---
title: Docker Beta, ma première journée de test
tags: [Docker]
blogger_orig_url: https://keulkeul.blogspot.com/2016/04/docker-beta-ma-premiere-journee-de-test.html
category: technical
description: Un billet qui s'intéresse au test de Docker pour Mac.
---

La société Docker a lancé fin mars une opération « beta-test » pour tester une version Docker pour Mac et Windows ([https://blog.docker.com/2016/03/docker-for-mac-windows-beta/](https://blog.docker.com/2016/03/docker-for-mac-windows-beta/)). Les avantages sont sans être exhaustif : une abstraction de VirtualBox, une gestion performante des volumes et une meilleure intégration du système d'exploitation.

Je me suis donc inscrit au programme de test début avril via cette URL : [https://beta.docker.com](https://beta.docker.com/). J'ai reçu mon invitation hier et j'ai testé dans la foulée.

Je ne vais pas faire un article complet car il en existe beaucoup sur la toile et de bonnes qualités :

* [http://blog.hypriot.com/post/first-touch-down-with-docker-for-mac/](http://blog.hypriot.com/post/first-touch-down-with-docker-for-mac/) ;
* [http://lemag.sfeir.com/docker-mac-windows-renouveau/](http://lemag.sfeir.com/docker-mac-windows-renouveau/).

Voici quelques constats rapides après mon test.

1. Même si Docker for Mac n'utilise pas de machine virtuelle gérée par VirtualBox, l'application m'a demandé de mettre à jour mon VirtualBox (4.12) vers une version plus récente 5.x. L'explication du pourquoi est donnée ici : [https://forums.docker.com/t/fatal-error-after-install-virtualbox-requirements/8350](https://forums.docker.com/t/fatal-error-after-install-virtualbox-requirements/8350).
2. Le répertoire de travail de Docker for Mac se trouve ici : _/Users//Library/Containers/com.docker.docker_.
3. Docker Engine fonctionne depuis la distribution Alpine Linux qui est elle même virtualisée depuis le virtualiseur xhyve ([https://github.com/mist64/xhyve](https://github.com/mist64/xhyve)). Par conséquent le fichier utilisé pour la virtualisation de la distribution Alpine (Docker.qcow2) grossit au fur et à mesure. En effet, si vous supprimez des images, le fichier ne réduit pas. 
4. J'en ai profité pour installer Kitematic à partir de ce lien ([https://github.com/docker/kitematic/releases](https://github.com/docker/kitematic/releases)). Il n'y a pas besoin de télécharger Docker Toolbox pour installer Kitematic. À noter que bizarrement Kitematic n'est pas disponible pour Linux. Un comble sachant que Docker n'est vraiment disponible que sous Linux. L'utilisation de Kitematic avec Docker for Mac fonctionne bien. Par exemple, quand je crée un conteneur depuis Kitematic, je vois le résultat via le CLI ($ docker images et $ docker ps) de Docker et inversement. 
5. Docker for Mac fonctionne plutôt pas mal (docker et docker-compose). J'ai testé mon application jouet développée dans le cadre d'un TP : [https://github.com/mickaelbaron/helloworldmicroservices](https://github.com/mickaelbaron/helloworldmicroservices). Le seul petit défaut c'est qu'à la différence d'une version sous Linux où je pouvais rediriger les ports des conteneurs vers les ports de localhost ici on ne peut pas utiliser localhost mais une adresse de sous réseau 192.168.64.2 associé au hosts docker.local.