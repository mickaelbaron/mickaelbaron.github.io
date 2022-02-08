---
title: Formation Kubernetes
tags: [Kubernetes]
category: technical
description: Introduction à Kubernetes (K8s) de la théorie à la pratique, un billet bilan pour détailler les ressources utilisées
twitter: 1490989236723777538
---

Je vous propose dans ce billet de détailler les différents contenus et les retours d'une formation Kubernetes que j'ai dispensée hier à l'IUT de Poitiers au niveau du département Réseau et Télécom. Cette formation s'intègre dans la continuité des cours autour des Microservices que vous pouvez retrouver sur cette page : <https://mickael-baron.fr/soa>

J'utilise un support de cours qui présente les problématiques adressées par Kubernetes K8s (le pourquoi), les différentes distributions disponibles et les principaux concepts à savoir `Pod`, `Deployment`, `Service`, et `Volume`. En parallèle, les participants s'appuyaient sur un atelier pour expérimenter K8s via la distribution K3s sous sa forme DockerInDocker avec K3d ou en créant des machines virtuelles avec Multipass.

* Lien du support de cours : <https://mickael-baron.fr/soa/microservices-mise-en-oeuvre-kubernetes>
* Lien de l'atelier : <https://github.com/mickaelbaron/microservices-kubernetes-gettingstarted-tutorial>

Durant la formation, je n'ai pas rencontré de gros problèmes techniques exceptés un que je n'avais pas vu venir. J'ai été confronté à la limitation liée à [Docker Hub](https://hub.docker.com/) qui ne permet pas de faire plus de 100 requêtes pour récupérer une image Docker (<https://www.docker.com/increase-rate-limits>). La prochaine fois, je m'appuyerai sur un registre privé d'images [Docker](https://www.docker.com/).

L'apprentissage de Kubernetes m'a pris un certain temps et j'ai pu compter sur de nombreuses ressources : 

* la documentation officielle de Kubernetes. Elle est très bien faite dans sa version anglaise. La version française a le mérite d'exister, mais malheureusement est ancienne par rapport à la version anglaise.
* de nombreux ouvrages. Les livres sont référencés dans le support de cours.
* des contributeurs passionnés :
  * la chaîne Youtube de Xavki => <https://www.youtube.com/c/xavki-linux> ;
  * la chaîne Youtube de Aurélie Vache => <https://www.youtube.com/c/AurelieVache> ;
  * le blog de Philippe Charrière => <https://k33g.gitlab.io/KUBERNETES.html> ;
  * la chaîne Youtube de TechWorld with Nana => <https://www.youtube.com/c/TechWorldwithNana>.

N'hésitez pas à laisser des commentaires sur le tweet prévu à cet effet 👇