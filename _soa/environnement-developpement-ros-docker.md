---
title: 'Préparer son environnement de développement ROS avec Docker : concepts ROS et exemples illustratifs'
tags: [ROS, Docker]
direct_link:
image: /images/ros_logo.jpg
description: Ce tutoriel s'intéresse à présenter ROS (Robot Operating System) et à décrire comment proposer à un développeur un environnement de développement prêt à l'emploi quel que soit le système d'exploitation utilisé pour le développement et pour le déploiement.
category: Article
date: 2018-05-28
weight: 19
toc: true
---

Ce tutoriel s'intéresse à présenter ROS (*Robot Operating System)* et à décrire comment proposer à un développeur un environnement de développement prêt à l'emploi quel que soit le système d'exploitation utilisé pour le développement et pour le déploiement. Notre proposition s'appuiera sur l'utilisation exclusive des outils **Docker** pour créer des conteneurs basés sur des images **Docker** ROS.

## Introduction

Ce tutoriel s'intéresse à présenter ROS (*Robot Operating System*) et à décrire comment proposer à un développeur un environnement de développement prêt à l'emploi quel que soit le système d'exploitation utilisé pour le développement et pour le déploiement. En effet, par défaut, ROS n'est disponible que sous un système Linux. Il existe bien des versions pour macOS, mais elles sont expérimentales et il n'existe aucune version pour Windows. Par ailleurs, même si nous souhaitions utiliser ces versions expérimentales, aurions-nous le même comportement une fois notre programme déployé ? Bien entendu, si du matériel doit être utilisé spécifiquement (bras robotisé, carte Raspberry…) pour un système d'exploitation donné (généralement sous Linux), nous n'aurions pas le choix d'utiliser le système en question.

Notre proposition s'appuie massivement sur l'utilisation de **Docker** pour créer des conteneurs basés sur des images **Docker** ROS. Ces images **Docker** ROS existent et sont officielles : [https://hub.docker.com/\_/ros/](https://hub.docker.com/_/ros/) . Toutefois, l'usage de ces images n'est pas mis en avant par les différentes documentations. De plus, il peut être difficile de combiner **Docker** et ROS pour un développeur ne maîtrisant pas forcément les deux technologies.

Le plan de ce tutoriel est le suivant. Dans une première section, nous présenterons ROS et les concepts sous-jacents. Dans une deuxième section, nous détaillerons la construction d'une image **Docker** ROS personnalisée. Dans une troisième section, nous utiliserons cette image **Docker** ROS dans un cadre de développement via l'exemple simple : Publieur/Consommateur. Dans une quatrième section, nous partirons d'un exemple plus complexe, celui de la tortue, afin de montrer que notre proposition peut supporter des programmes avec des fenêtres graphiques (via le déport d'affichage). Les exemples Publieur/Consommateur et Tortue sont des exemples pédagogiques, nous programmerons dans une dernière section un exemple plus adapté à ROS en utilisant des cartes Raspberry Pi. Finalement, nous conclurons et donnerons un aperçu du prochain tutoriel.

## Généralités ROS

ROS pour *Robot Operating System* est un ensemble de briques logicielles permettant le développement d'applications pour le domaine de la robotique. La signification de son acronyme peut porter à confusion, car il ne s'agit pas vraiment d'un système d'exploitation. En effet, pour utiliser ROS il est nécessaire de disposer d'un système existant en l'occurrence Linux.

En termes de fonctionnalités ROS propose une abstraction du matériel, une gestion de la concurrence, une gestion des processus, une transmission de messages synchrones ou asynchrones dans une architecture de communication interprocessus et intermachine. ROS fournit également un kit de développement logiciels (SDK) pour faciliter le développement d'applications basées sur ROS. Nous retrouvons tout d'abord des outils pour créer, exécuter et déployer des applications ROS. Nous retrouvons ensuite des API pour développer des programmes avec les langages de développement officiels C++ et Python. Il existe également une API pour le développement d'applications ROS avec le langage Java. L'initiative avait été poussée afin de pouvoir exécuter des applications ROS sous le système d'exploitation Android. Il est à noter que l'utilisation du langage Java avec ROS fera l'objet d'un second tutoriel. Enfin, ROS fournit un système de *packages* permettant de distribuer des composants développés pour ROS. Ce système de *package* permet de réutiliser des développements réalisés par la communauté ROS.

Dans la suite de cette section, nous allons présenter rapidement la structuration de ROS en présentant les concepts clés à savoir : *node*, *Master*, *message*, *topic* et *service*. Nous terminerons par la présentation du système de fichiers via la notion de *workspace* et de *package*.

### Node : nœud

Un nœud ou *Node* en anglais est un processus qui effectue une opération. Il peut s'agir d'extraire les informations d'un capteur, de contrôler un moteur, de capturer des images à partir d'une caméra, d'exécuter un algorithme, d'afficher une interface graphique pour la visualisation de données… Le contenu d'un nœud est développé dans un langage de programmation supporté par ROS, actuellement C++, Python ou Java.

Lors du démarrage d'un nœud, celui-ci s'identifie auprès du *Master*. L'architecture utilisée par ROS s'appuie sur un réseau Point à Point (*peer to peer*). Ainsi, les nœuds communiquent avec d'autres nœuds via les *topics* (communication asynchrone) ou via les *services* (communication synchrone).

### Master

Le *Master* est un service ROS qui permet de déclarer des nœuds (comme pour un annuaire) et de notifier des nœuds que des changements dans le système ont été réalisés. La déclaration d'un nœud vers le *Master* se fait lors de la création du nœud. Le *Master* est donc un intermédiaire qui permet à des nœuds de se connaître et de pouvoir communiquer entre eux.

Dans une architecture intermachine où des nœuds doivent communiquer ensemble, certaines restrictions réseaux sont nécessaires.

* Chaque nœud doit être identifié par un nom que tous les autres nœuds peuvent identifier.
* Comme il y a une communication bidirectionnelle entre les nœuds, **tous les ports d'une machine doivent être ouverts**. L'attribution du numéro de port pour communiquer vers un nœud donné se fait par le *Master,* et c'est lui qui informe les nœuds du port d'écoute. Le choix du port d'écoute n'est pas libre, il est imposé par le *Master*.

### Topic

Le *topic* est un mécanisme de communication asynchrone entre des nœuds connu sous le nom de Lecteur/Écrivain ou Publisher/Subscriber en anglais. Il fonctionne sur le principe d'un bus de messages auquel un ou plusieurs nœuds (Écrivains) pourront publier de l'information et où un ou plusieurs nœuds (Lecteurs) pourront lire de l'information. Les données qui transitent à travers le *topic* sont typées et déclarées à travers des *messages*.

La figure ci-dessous résume le processus complet de communication à base de *topics* suivant trois étapes.

![Processus Complet de Communication à base de topics](/images/environnement-developpement-ros-docker/topic.png)

1. Un nœud Écrivain se déclare auprès du *Master* pour lui indiquer qu'il souhaite publier dans un *topic* avec un type de Message donné (phase 1 : Identifier).
2. Un nœud Lecteur se déclare auprès du *Master* pour lui indiquer qu'il souhaite s'abonner à un *topic* avec un type de Message donné (phase 2 : Abonner).
3. Le *Master* avertit le nœud Écrivain que le nœud Lecteur s'est abonné au topic qu'il a publié. Une connexion s'établit entre le nœud Écrivain et le nœud Lecteur. Le nœud Écrivain publie des données vers le nœud Lecteur en respectant le type de Message défini lors de la déclaration (phase 3 : Publier).

### Service

Le *service* est un mécanisme de communication synchrone uniquement entre deux nœuds identifiés comme Fournisseur (le nœud qui fournit le *service*) et Consommateur (le nœud qui consomme le *service*).

La figure ci-dessous résume le processus complet de communication à base de *service*.

![Processus Complet de Communication à base de services](/images/environnement-developpement-ros-docker/service.png)

1. Un nœud Fournisseur se déclare au *Master* pour lui indiquer qu'il souhaite publier un *service* en précisant un nom et un *message* (phase 1 : Publier).
2. Un nœud Consommateur se déclare au *Master* pour lui indiquer qu'il souhaite consommer un *service* avec un nom donné (phase 2 : Chercher). La signature du service à consommer est déjà connue par le Consommateur. La signature du service désigne le **nom** du service et les **paramètres d'entrées et de sorties** définis dans des messages.
3. Une connexion est établie entre le Fournisseur et le Consommateur via l'intermédiaire du *Master*. Le nœud Consommateur invoque le *service* en respectant sa signature (phase 3 : Consommer).

### Message

Un *message* est une structure de données utilisée pour la communication entre des nœuds (*topic* et *service*).

## Prérequis logiciel

Dans cette section sont listés les différents logiciels que nous utiliserons pour les expérimentations. Ces expérimentations se feront à partir de macOS High Sierra. Tous les outils listés ci-dessous sont pratiquement multiplateformes, dans le cas contraire, nous donnerons des alternatives :

* [Docker](https://www.docker.com/) : création de conteneur à partir d'image **Docker** ; 
* [DockerCompose](https://www.docker.com/) : outil de l'écosystème **Docker** pour créer des orchestrations de conteneurs **Docker** ; 
* [DockerMachine](https://www.docker.com/) : outil pour créer des machines **Docker** permettant de provisionner des **Docker** distants ; 
* [XQuartz](https://www.xquartz.org/) : le serveur X11 pour macOS pour afficher des interfaces graphiques sur le système. Dans le cas de Windows, vous pouvez utiliser l'excellent outil [MobaXterm](https://mobaxterm.mobatek.net/) qui intègre un serveur X11 et un client SSH ou alors le couple [Putty](https://www.putty.org/) et [Xming](http://www.straightrunning.com/XmingNotes/) ; 
* [Visual Studio Code](https://code.visualstudio.com/) : un éditeur de texte. 

## Construire une image Docker personnalisée pour ROS

Pour conduire nos futures expérimentations dans la suite de ce tutoriel, nous allons, dans cette section, préparer une image **Docker** basée sur l'image **Docker** ROS officielle ([https://hub.docker.com/\_/ros/](https://hub.docker.com/_/ros/)). L'image **Docker** ROS officielle est utilisable en l'état, voir la documentation officielle à ce sujet : [http://wiki.ros.org/docker/Tutorials/Docker](http://wiki.ros.org/docker/Tutorials/Docker). Toutefois, comme expliqué dans la documentation, de nombreuses opérations doivent se faire à l'intérieur d'un conteneur. Par ailleurs, les données générées (workspace, fichiers…) ne sont pas disponibles sur le système hôte du développeur. Nous allons tenter d'apporter des solutions à ces problèmes et rendre transparente l'utilisation de l'image ROS sur votre système comme s'il avait été installé nativement.

Nous commençons par créer un nouveau fichier *Dockerfile* qui permettra de construire une image **Docker** basée sur l'image ROS officielle.

* Ouvrir un éditeur de texte et saisir le code ci-dessous. Sauvegardez dans un fichier appelé *Dockerfile*.

```terminal
FROM ros:kinetic

COPY ./ros_entrypoint.sh /
```

Vous constatez que les modifications sont minimes. Nous avons juste apporté une modification au fichier *ros_entrypoint.sh* déjà présent sur l'image ROS officielle. Ce fichier *ros_entrypoint.sh* sera invoqué à chaque fois que nous créerons un nouveau conteneur basé sur l'image ROS.

* Ouvrir un éditeur de texte et saisir le code ci-dessous. Sauvegarder dans un fichier appelé *ros_entrypoint.sh* situé dans le même répertoire que le fichier *Dockerfile*.

```console
#!/bin/bash
set -e

# setup ros environment
source "/opt/ros/$ROS_DISTRO/setup.bash"

# setup workspace if it exists
if [ -n "$WORKSPACE_NAME" ]; then 
    if [ ! -e "/root/$WORKSPACE_NAME/devel/setup.sh" ]; then
        previousDirectory=$(pwd)
        cd /root/$WORKSPACE_NAME
        catkin_make
        cd $previousDirectory
    fi
    source "/root/$WORKSPACE_NAME/devel/setup.sh"
fi

exec "$@"
```

Nous avons apporté des modifications à partir de la ligne 7. Ces modifications concernent l'initialisation de votre espace de travail (appelé *workspace*) dans l'environnement ROS. Quand un workspace ROS est créé (identifié dans le script par la variable d'environnement `WORKSPACE_NAME`), il est nécessaire d'invoquer la commande *catkin_make* (ligne 11). Cette commande permet de créer deux répertoires dans votre workspace qui sont *build/* et *devel/*. À l'intérieur du répertoire *devel/* se trouvent plusieurs fichiers scripts dont un qui permet d'initialiser votre workspace dans l'environnement ROS. Sans l'invocation de ce script (ligne 12) les variables d'environnements ne seraient pas positionnées sur votre workspace et par conséquent aucune commande ROS ne fonctionnerait. Vous pouvez consulter la documentation officielle pour plus de détail : [http://wiki.ros.org/ROS/Tutorials/InstallingandConfiguringROSEnvironment#Create_a_ROS_Workspace](http://wiki.ros.org/ROS/Tutorials/InstallingandConfiguringROSEnvironment#Create_a_ROS_Workspace).

* Ouvrir un terminal, se positionner dans le répertoire contenant les fichiers *Dockerfile* et *ros_entrypoint.sh* et exécuter la commande suivante pour créer une image **Docker** appelée *ros:mykinetic* :

```console
$ docker build --tag ros:mykinetic .

Sending build context to Docker daemon    469kB
Step 1/2 : FROM ros:kinetic
kinetic: Pulling from library/ros
d3938036b19c: Pull complete
a9b30c108bda: Pull complete
67de21feec18: Pull complete
817da545be2b: Pull complete
d967c497ce23: Pull complete
069aa2123770: Pull complete
2e3034c1bf7f: Pull complete
a8a977fd1bfb: Pull complete
97f33493d5be: Pull complete
e39d37c0ad49: Pull complete
7a1b27f0640b: Pull complete
97a49ac9bdcd: Pull complete
dc6b4c7fd4e4: Pull complete
Digest: sha256:392442dd953baeef86c747753060d1efa34e9a651ebe3ad0f2bc259aded90e9e
Status: Downloaded newer image for ros:kinetic
 ---> 4b2e99aadf55
Step 2/2 : COPY ./ros_entrypoint.sh /
 ---> 0cbcdc6508bf
Successfully built 0cbcdc6508bf
Successfully tagged ros:mykinetic
```

Dans un premier temps, l'image **Docker** *ros:kinetic* va être téléchargée depuis le registre DockerHub puis dans un second temps, notre image **Docker** sera construite par rapport aux indications du fichier *Dockerfile*.

* Assurons-nous que les images **Docker** correspondant à ROS soient présentes sur le système. Depuis le terminal, saisir la commande suivante :

```console
$ docker images

REPOSITORY                                TAG                 IMAGE ID            CREATED             SIZE
ros                                       mykinetic           f2aae4e9c1fa        3 minutes ago       1.18GB
ros                                       kinetic             4b2e99aadf55        5 days ago          1.18GB
```

Nous constatons que les deux images sont présentes. La nôtre intitulée *ros:mykinetic* et celle que nous avons téléchargée *ros:kinetic*. Vous remarquerez que la taille des images est identique (1.18GB). Comme notre image **Docker** repose sur *ros:kinetic*, elle dispose de la même taille modulo les modifications mineures apportées dans le fichier *ros_entrypoint.sh*.

## Créer des conteneurs : exemple Publieur/Consommateur

Désormais, notre image **Docker** ROS est créée. Nous allons pouvoir l'utiliser afin de mener un développement et une exécution sans installer ROS nativement sur notre système. Nous allons nous appuyer sur l'exemple Publieur/Consommateur pour illustrer l'utilisation de notre image **Docker** ROS.

L'exemple complet du Publieur/Consommateur est disponible à cette adresse : [http://wiki.ros.org/ROS/Tutorials/WritingPublisherSubscriber%28python%29](http://wiki.ros.org/ROS/Tutorials/WritingPublisherSubscriber%28python%29). Le principe est simple : un nœud publie un message dans un *topic* et un autre nœud consomme le message du *topic* et affiche le message sur la sortie console.

### Initialisation du projet Publieur/Consommateur

Nous allons donc commencer par créer un workspace pour contenir notre projet.

* Ouvrir un terminal, se placer dans un répertoire de travail par exemple *ros* (pas forcément le même que pour la construction de l'image **Docker**) et exécuter la commande suivante pour créer le squelette du répertoire workspace :

```console
mkdir -p workspace/src
```

Nous allons ensuite créer un package qui portera le nom de l'exemple de la documentation officielle. La création de package avec ROS se fait à partir de l'outil **catkin_create_pkg**. Pour créer un package *beginner_tutorials* quand ROS est installé nativement sur votre système, vous auriez fait comme cela : `$ catkin_create_pkg beginner_tutorials std_msgs rospy`. Désormais, nous allons invoquer la même commande en utilisant notre image **Docker** ROS.

* Depuis le même terminal, saisir la ligne de commande suivante :

```console
$ docker run --rm -it -e WORKSPACE_NAME=workspace -v $(pwd)/workspace:/root/workspace -w /root/workspace/src ros:mykinetic catkin_create_pkg beginner_tutorials std_msgs rospy
... Sera détaillé par la suite
```

Premier constat, cette commande est plus longue que la précédente. Nous remarquons à la fin de cette longue commande le contenu suivant `catkin_create_pkg beginner_tutorials std_msgs rospy` qui est le même que la commande que nous aurions invoquée sans **Docker** pour créer un package. Décortiquons le reste de la nouvelle commande spécifique à **Docker** : `docker` est l'outil pour créer des conteneurs ; `run` indique qu'un conteneur doit être créé ; `--rm` précise que le conteneur sera automatiquement détruit quand il s'arrêtera ; `-it` permet d'utiliser le mode interactif sur le tty courant, en gros, sans cela nous n'aurions pas le retour du terminal et nous ne pourrions pas saisir de commandes supplémentaires si besoin ; `-e WORKSPACE\_NAME=workspace` crée une variable d'environnement appelée `WORKSPACE\_NAME` avec la valeur `workspace` ; `-v $(pwd)/workspace:/root/workspace` crée un volume qui est un dossier partagé de *$(pwd)/workspace* du système hôte avec le dossier */root/workspace* du conteneur ; `-w /root/workspace/src` force le répertoire courant depuis le conteneur, toute interaction se fera depuis ce répertoire ; enfin `ros:mykinetic` est le nom de l'image sur laquelle **Docker** se basera pour créer le conteneur.

Dans la suite de nos expérimentations, un patron de commande identique à celui-ci sera utilisé : `$ docker + OPTIONS_DOCKER + rosTool + OPTIONS_ROS`. La première partie ne changera pratiquement jamais, seule `rosTool + OPTIONS_ROS` sera à adapter en fonction des actions à effectuer.

Avant de continuer, examinons le résultat de l'exécution de la commande précédente :

```console
$ docker run --rm -it -e WORKSPACE_NAME=workspace -v $(pwd)/workspace:/root/workspace -w /root/workspace/src ros:mykinetic catkin_create_pkg beginner_tutorials std_msgs rospy
Base path: /root/workspace
Source space: /root/workspace/src
Build space: /root/workspace/build
Devel space: /root/workspace/devel
Install space: /root/workspace/install
Creating symlink "/root/workspace/src/CMakeLists.txt" pointing to "/opt/ros/kinetic/share/catkin/cmake/toplevel.cmake"
####
#### Running command: "cmake /root/workspace/src -DCATKIN_DEVEL_PREFIX=/root/workspace/devel -DCMAKE_INSTALL_PREFIX=/root/workspace/install -G Unix Makefiles" in "/root/workspace/build"
####
-- The C compiler identification is GNU 5.4.0
-- The CXX compiler identification is GNU 5.4.0
-- Check for working C compiler: /usr/bin/cc
-- Check for working C compiler: /usr/bin/cc -- works
-- Detecting C compiler ABI info
-- Detecting C compiler ABI info - done
-- Detecting C compile features
-- Detecting C compile features - done
-- Check for working CXX compiler: /usr/bin/c++
-- Check for working CXX compiler: /usr/bin/c++ -- works
-- Detecting CXX compiler ABI info
-- Detecting CXX compiler ABI info - done
-- Detecting CXX compile features
-- Detecting CXX compile features - done
-- Using CATKIN_DEVEL_PREFIX: /root/workspace/devel
-- Using CMAKE_PREFIX_PATH: /opt/ros/kinetic
-- This workspace overlays: /opt/ros/kinetic
-- Found PythonInterp: /usr/bin/python (found version "2.7.12")
-- Using PYTHON_EXECUTABLE: /usr/bin/python
-- Using Debian Python package layout
-- Using empy: /usr/bin/empy
-- Using CATKIN_ENABLE_TESTING: ON
-- Call enable_testing()
-- Using CATKIN_TEST_RESULTS_DIR: /root/workspace/build/test_results
-- Found gmock sources under '/usr/src/gmock': gmock will be built
-- Looking for pthread.h
-- Looking for pthread.h - found
-- Looking for pthread_create
-- Looking for pthread_create - not found
-- Looking for pthread_create in pthreads
-- Looking for pthread_create in pthreads - not found
-- Looking for pthread_create in pthread
-- Looking for pthread_create in pthread - found
-- Found Threads: TRUE
-- Found gtest sources under '/usr/src/gmock': gtests will be built
-- Using Python nosetests: /usr/bin/nosetests-2.7
-- catkin 0.7.11
-- BUILD_SHARED_LIBS is on
-- Configuring done
-- Generating done
-- Build files have been written to: /root/workspace/build
####
#### Running command: "make -j4 -l4" in "/root/workspace/build"
####
make: Warning: File 'Makefile' has modification time 8.3 s in the future
make[1]: Warning: File 'CMakeFiles/Makefile2' has modification time 9.2 s in the future
make[1]: warning:  Clock skew detected.  Your build may be incomplete.
make: warning:  Clock skew detected.  Your build may be incomplete.
/opt/ros/kinetic/setup.bash
Created file beginner_tutorials/package.xml
Created file beginner_tutorials/CMakeLists.txt
Created folder beginner_tutorials/src
Successfully created files in /root/workspace/src/beginner_tutorials. Please adjust the values in package.xml.
```

De la ligne 1 à 57, il s'agit de l'affichage du retour pour la construction du workspace. Pour rappel, l'outil **catkin_make** est invoqué dans le fichier *ros_entrypoint.sh* à chaque création de conteneur ET si la construction du workspace courant n'avait jamais été faite. De la ligne 58 à la fin, il s'agit de l'affichage pour la création du package *beginner_tutorials*.

Observons les répertoires et fichiers depuis le répertoire *workspace/*.

```console
workspace/
  build/
  devel/
  src/
    beginner_tutorials/
      src/
      CMakeLists.txt      -- Fichier de compilation pour le package beginner_tutorials
      package.xml         -- Fichier de description du package beginner_tutorials
    CMakeLists.txt        -- Fichier de compilation pour tous les packages
```

Initialement le répertoire *workspace/* ne contenait qu'un seul dossier vide *src/*. Nous constatons à la racine de *workspace/* la présence des répertoires *build/* et *devel/*. Pour rappel (voir section sur la construction d'une image **Docker**), ces répertoires servent à fournir des scripts prêts à l'emploi pour l'initialisation du workspace lorsque nous allons utiliser les différents outils de ROS. Dans le répertoire `src/` se trouve un répertoire `beginner_tutorials` qui correspond au résultat de la création d'un package par l'outil **catkin_create_pkg**.

À cette étape, notre environnement de développement est prêt à l'emploi, un workspace ROS a été initialisé et un package a été créé. Sur le système hôte (voir figure ci-dessous), nous disposons des répertoires et des fichiers pour déposer nos codes sources.

![Contenu du répertoire workspace depuis le système hôte](/images/environnement-developpement-ros-docker/localfilesystem.png)

### Implémentation de l'exemple Publieur/Consommateur

Le code Python du nœud *Publieur* est donné ci-dessous (fichier *talker.py*) :

```python
#!/usr/bin/env python
# license removed for brevity
import rospy
from std_msgs.msg import String

def talker():
    pub = rospy.Publisher('chatter', String, queue_size=10)
    rospy.init_node('talker', anonymous=True)
    rate = rospy.Rate(10) # 10hz
    while not rospy.is_shutdown():
        hello_str = "hello world %s" % rospy.get_time()
        rospy.loginfo(hello_str)
        pub.publish(hello_str)
        rate.sleep()

if __name__ == '__main__':
    try:
        talker()
    except rospy.ROSInterruptException:
        pass
```

Une API Python appelée `rospy` est importée (ligne 3). Elle fournit des fonctions `Publisher("chatter", String, queue_size=10)` pour s'abonner au *topic* *chatter* (ligne 7). Le deuxième paramètre `String` de cette fonction précise le type du message. Le troisième paramètre `queue_size` précise la limite du nombre de messages dans la file d'attente du topic. Le nom du nœud est remonté au nœud *Master* à partir de la fonction `init_node` (ligne 8). Le paramètre `anonymous` précise que le nom du nœud doit être unique dans le registre des noms. Pour cela, un numéro sera automatiquement ajouté au nom du nœud. La fréquence d'émission du message dans le topic est réalisée par la fonction `Rate` (ligne 9). Elle précise dans cet exemple que le programme souhaite transmettre 10 messages par seconde si bien sûr le temps de traitement (ligne 11 à 13) ne dépasse pas 1/10e de seconde. Le message `hello_str` (construit à la ligne 11) est affiché sur la console du nœud (ligne 12) puis transmis au topic *chatter* (ligne 13).

* Créer un fichier *workspace/src/beginner_tutorials/talker.py* et placer le contenu ci-dessus.
* Rendre le fichier *workspace/src/beginner_tutorials/talker.py* exécutable :

```console
chmod +x workspace/src/beginner_tutorials/talker.py
```

Le code Python du consommateur est donné ci-dessous (fichier *listener.py*) :

```python
#!/usr/bin/env python
import rospy
from std_msgs.msg import String

def callback(data):
    rospy.loginfo(rospy.get_caller_id() + "I heard %s", data.data)

def listener():

    # In ROS, nodes are uniquely named. If two nodes with the same
    # node are launched, the previous one is kicked off. The
    # anonymous=True flag means that rospy will choose a unique
    # name for our 'listener' node so that multiple listeners can
    # run simultaneously.
    rospy.init_node('listener', anonymous=True)

    rospy.Subscriber("chatter", String, callback)

    # spin() simply keeps python from exiting until this node is stopped
    rospy.spin()

if __name__ == '__main__':
    listener()
```

La même API Python est importée (ligne 2). Tout comme le code correspondant au nœud *Publieur*, le nom du nœud est remonté au nœud *Master* à partir de la fonction `init_node` (ligne 15). Le nœud s'abonne au topic *chatter* et à chaque fois qu'un message est publié un callback nommé `callback` est invoqué (ligne 17). Un affichage du message est réalisé vers la console dans le code du callback (ligne 6).

* Créer un fichier *workspace/src/beginner_tutorials/listener.py* et placer le contenu ci-dessus.
* Rendre le fichier *workspace/src/beginner_tutorials/listener.py* exécutable :

```console
chmod +x workspace/src/beginner_tutorials/talker.py
```

### Compilation du package de l'exemple Publieur/Consommateur

La compilation sous ROS consiste à construire un package (générer des fichiers spécifiques aux messages et aux services) et s'assurer que les dépendances entre les packages sont cohérentes. Dans notre exemple très simple qui n'utilise pas de services ni de messages spécifiques autres que des chaînes de caractères, la compilation ne va rien apporter. Toutefois, pour la suite de nos expérimentations nous allons quand même montrer comment le réaliser avec **Docker**.

* Depuis le même terminal (en vous assurant que vous être placé à la racine contenant le répertoire *workspace*), exécuter la commande suivante qui va appeler l'outil **catkin_make** :

```console
$ docker run --rm -it -e WORKSPACE_NAME=workspace -v $(pwd)/workspace:/root/workspace -w /root/workspace ros:mykinetic catkin_make
/opt/ros/kinetic/setup.bash
Base path: /root/workspace
Source space: /root/workspace/src
Build space: /root/workspace/build
Devel space: /root/workspace/devel
Install space: /root/workspace/install
####
#### Running command: "cmake /root/workspace/src -DCATKIN_DEVEL_PREFIX=/root/workspace/devel -DCMAKE_INSTALL_PREFIX=/root/workspace/install -G Unix Makefiles" in "/root/workspace/build"
####
-- Using CATKIN_DEVEL_PREFIX: /root/workspace/devel
-- Using CMAKE_PREFIX_PATH: /root/workspace/devel;/opt/ros/kinetic
-- This workspace overlays: /root/workspace/devel;/opt/ros/kinetic
-- Using PYTHON_EXECUTABLE: /usr/bin/python
-- Using Debian Python package layout
-- Using empy: /usr/bin/empy
-- Using CATKIN_ENABLE_TESTING: ON
-- Call enable_testing()
-- Using CATKIN_TEST_RESULTS_DIR: /root/workspace/build/test_results
-- Found gmock sources under '/usr/src/gmock': gmock will be built
-- Found gtest sources under '/usr/src/gmock': gtests will be built
-- Using Python nosetests: /usr/bin/nosetests-2.7
-- catkin 0.7.11
-- BUILD_SHARED_LIBS is on
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- ~~  traversing 1 packages in topological order:
-- ~~  - beginner_tutorials
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- +++ processing catkin package: 'beginner_tutorials'
-- ==> add_subdirectory(beginner_tutorials)
-- Configuring done
-- Generating done
-- Build files have been written to: /root/workspace/build
####
#### Running command: "make -j4 -l4" in "/root/workspace/build"
####
```

En examinant le répertoire *workspace/*, nous constatons que le répertoire *workspace/build* contient un répertoire portant le nom du package. De même, dans *workspace/devel* plusieurs répertoires et fichiers ont été ajoutés.

### Exécution de l'exemple Publieur/Consommateur

L'exécution de l'exemple va consister à créer un nœud *Master* et deux nœuds *Publieur* et *Consommateur* basés sur le même package. Pour ces deux derniers nœuds, un sera créé en exécutant le code source décrit par le fichier *talker.py* et un autre sera créé en exécutant le code source décrit par le fichier *listener.py*. Les deux nœuds *Publieur* et *Consommateur* communiqueront via le nœud *Master*.

Les trois nœuds seront créés via des conteneurs **Docker** toujours basés sur notre image **Docker** *mykinetic*. Comme les conteneurs représentants les nœuds *Publieur* et *Consommateur* devront communiquer avec le nœud *Master*, les trois conteneurs devront faire parti du même sous-réseau. Sous **Docker**, créer un réseau est la solution récente pour faire communiquer des conteneurs. L'utilisation de lien (option `link`) n'est plus recommandée. Nous allons donc devoir créer un réseau sous **Docker**.

* Depuis un terminal, exécuter la ligne de commande ci-dessous :

```console
$ docker network create ros
9602c12e629a33ef27859fdaa13d0f9b4fa55ed8fc0eba30e7119837b8c129cb
```

* S'assurer que le réseau a correctement été créé en exécutant la commande suivante :

```console
$ docker network ls
9e9c7638aaa2        bridge              bridge              local
4523411e4251        host                host                local
50afa90b1502        none                null                local
9602c12e629a        ros                 bridge              local
```

Pour l'exécution de notre programme ROS, nous allons avoir besoin de trois terminaux ou si vous êtes à l'aise vous pouvez utiliser [tmux](https://fr.wikipedia.org/wiki/Tmux).

* Depuis un premier terminal, exécuter la commande suivante qui va démarrer le nœud *Master* à partir de l'outil **roscore** :

```console
$ docker run --rm -it --net ros --name roscore ros:kinetic roscore

/opt/ros/kinetic/setup.bash
... logging to /root/.ros/log/1bc24550-4544-11e8-b32d-0242ac120002/roslaunch-81974c0026b0-1.log
Checking log directory for disk usage. This may take awhile.
Press Ctrl-C to interrupt
Done checking log file disk usage. Usage is <1GB.

started roslaunch server http://81974c0026b0:36093/
ros_comm version 1.12.13


SUMMARY
========

PARAMETERS
 * /rosdistro: kinetic
 * /rosversion: 1.12.13

NODES

auto-starting new master
process[master]: started with pid [59]
ROS_MASTER_URI=http://81974c0026b0:11311/

setting /run_id to 1bc24550-4544-11e8-b32d-0242ac120002
process[rosout-1]: started with pid [72]
started core service [/rosout]
```

La commande **Docker** invoquée est sensiblement identique aux précédentes. Nous remarquons toutefois la présence de deux nouvelles options au niveau de **Docker** permettant d'une part de nommer explicitement un conteneur (`--name roscore`) et d'autre part d'indiquer qu'un conteneur fait partie d'un réseau (`--net ros`). Ces options sont étroitement liées et permettront aux deux autres nœuds de communiquer avec le nœud Master. L'option `--name roscore` permet de nommer le conteneur *roscore*. Ainsi pour accéder au conteneur relatif au nœud *Master* depuis les deux autres conteneurs, il suffira de faire [http://ros:11311](http://ros:11311/).

* Depuis un deuxième terminal, exécuter la commande suivante qui va créer le conteneur correspondant au nœud *Publieur* (le conteneur sera nommé *talker*) à partir de l'outil **rosrun** :

```console
$ docker run --rm -it -e WORKSPACE_NAME=workspace --net ros --name talker -e ROS_MASTER_URI=http://roscore:11311 -v $(pwd)/workspace:/root/workspace -w /root/workspace ros:mykinetic rosrun beginner_tutorials talker.py
[INFO] [1519060948.447008]: hello world 1519060948.45
[INFO] [1519060948.549300]: hello world 1519060948.55
[INFO] [1519060948.649580]: hello world 1519060948.65
[INFO] [1519060948.750334]: hello world 1519060948.75
[INFO] [1519060948.848382]: hello world 1519060948.85
[INFO] [1519060948.950392]: hello world 1519060948.95
[INFO] [1519060949.049760]: hello world 1519060949.05
```

Deux options **Docker** sont spécifiques à cette commande. La première est le nom du conteneur `--name talker` et la seconde est la définition de la variable d'environnement `ROS_MASTER_URI` permettant d'indiquer comment le nœud *Publieur* peut atteindre le nœud *Master*. Pour revenir à l'outil **rosrun** (dernier paramètre de la commande **Docker**), il doit préciser le nom du package et le programme à exécuter.

En sortie de console, le nœud *Publieur* émet toutes les 1/10e de seconde le message « hello world » sur le *topic* `chatter` et sur la console. Il nous reste donc à exécuter le nœud *Consommateur* pour extraire du *topic* `chatter` ce message et l'afficher sur la console.

* Depuis un troisième terminal, exécuter la commande suivante qui va créer le conteneur correspondant au nœud *Consommateur* (le conteneur sera nommé *listener*) à partir de l'outil **rosrun** :

```console
$ docker run --rm -it -e WORKSPACE_NAME=workspace -e ROS_MASTER_URI=http://roscore:11311 --net ros --name listener -v $(pwd)/workspace:/root/workspace -w /root/workspace ros:mykinetic rosrun beginner_tutorials listener.py
[INFO] [1519060974.951692]: /listener_1_1519060974752I heard hello world 1519060974.95
[INFO] [1519060975.051022]: /listener_1_1519060974752I heard hello world 1519060975.05
[INFO] [1519060975.149728]: /listener_1_1519060974752I heard hello world 1519060975.15
[INFO] [1519060975.251297]: /listener_1_1519060974752I heard hello world 1519060975.25
[INFO] [1519060975.351836]: /listener_1_1519060974752I heard hello world 1519060975.35
[INFO] [1519060975.453088]: /listener_1_1519060974752I heard hello world 1519060975.45
[INFO] [1519060975.550020]: /listener_1_1519060974752I heard hello world 1519060975.55
[INFO] [1519060975.650819]: /listener_1_1519060974752I heard hello world 1519060975.65
[INFO] [1519060975.752685]: /listener_1_1519060974752I heard hello world 1519060975.75
```

Pas de grand changement par rapport à la commande permettant d'exécuter le nœud *Publieur* excepté le nom du conteneur `--name listener` et la commande associée à **rosrun**.

En sortie console, le nœud *Consommateur* affiche le message transmis par le *topic* `chatter`.

Comme on peut le constater, les trois nœuds communiquent correctement ensemble. Vous trouverez ci-dessous une animation de ce que vous auriez dû obtenir sur les trois terminaux.

![Contenu du répertoire workspace depuis le système hôte](/images/environnement-developpement-ros-docker/demo.gif)

* Pour vérifier que les conteneurs ont été créés et sont toujours en cours d'exécution, affichez-les via la commande suivante :

```console
$ docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS               NAMES
2625ffbb9490        ros:mykinetic       "/ros_entrypoint.sh …"   12 seconds ago      Up 11 seconds                           listener
fd84e3ae0ac8        ros:mykinetic       "/ros_entrypoint.sh …"   19 seconds ago      Up 18 seconds                           talker
13a48b2aa594        ros:mykinetic       "/ros_entrypoint.sh …"   30 seconds ago      Up 28 seconds                           roscore
```

### Exécution de l'exemple Publieur/Consommateur sans l'outil rosrun (solution alternative)

Dans la section précédente, nous avons utilisé l'outil **rosrun** pour créer les deux nœuds *Publieur* et *Consommateur*. Comme notre package ne dépend pas d'autres packages et qu'il n'y a pas de message spécifique (définition de type complexe), nous pouvons démarrer les nœuds via l'exécution de programmes Python (outil **python**). Pour la suite des expérimentations, assurez-vous que les conteneurs sont arrêtés (un simple CTRL+C suffira).

* Depuis le premier terminal, démarrer le nœud *Master* via la ligne de commande ci-dessous :

```console
$ docker run --rm -it --net ros --name roscore ros:mykinetic roscore
...
```

* Depuis le deuxième terminal, démarrer le nœud *Publieur* via la ligne de commande ci-dessous :

```console
$ docker run --rm -it -e WORKSPACE_NAME=workspace -e ROS_MASTER_URI=http://roscore:11311 --net ros -v $(pwd)/workspace:/root/workspace -w /root/workspace/src/beginner_tutorials/src ros:mykinetic python talker.py
/opt/ros/kinetic/setup.bash
[INFO] [1524512900.033339]: hello world 1524512900.03
[INFO] [1524512900.134333]: hello world 1524512900.13
[INFO] [1524512900.234304]: hello world 1524512900.23
[INFO] [1524512900.334232]: hello world 1524512900.33
[INFO] [1524512900.434657]: hello world 1524512900.43
[INFO] [1524512900.536256]: hello world 1524512900.54
[INFO] [1524512900.634888]: hello world 1524512900.63
```

* Depuis le troisième terminal, démarrer le nœud *Consommateur* via la ligne de commande ci-dessous :

```console
$ docker run --rm -it -e WORKSPACE_NAME=workspace -e ROS_MASTER_URI=http://roscore:11311 --net ros -v $(pwd)/workspace:/root/workspace -w /root/workspace/src/beginner_tutorials/src ros:mykinetic python listener.py
/opt/ros/kinetic/setup.bash
[INFO] [1524512981.878919]: /listener_1_1524512981675I heard hello world 1524512981.88
[INFO] [1524512981.978380]: /listener_1_1524512981675I heard hello world 1524512981.98
[INFO] [1524512982.079724]: /listener_1_1524512981675I heard hello world 1524512982.08
[INFO] [1524512982.179340]: /listener_1_1524512981675I heard hello world 1524512982.18
[INFO] [1524512982.278469]: /listener_1_1524512981675I heard hello world 1524512982.28
[INFO] [1524512982.378678]: /listener_1_1524512981675I heard hello world 1524512982.38
[INFO] [1524512982.477874]: /listener_1_1524512981675I heard hello world 1524512982.48
[INFO] [1524512982.580334]: /listener_1_1524512981675I heard hello world 1524512982.58
```

Une chose à faire attention, c'est le positionnement du répertoire de travail qui doit être à */root/workspace/src/beginner_tutorials/src*.

### Automatiser l'exécution de l'exemple Publier/Consommateur

Dans la section précédente, nous avons créé des conteneurs Docker dont deux qui communiquent avec le conteneur modélisant le nœud *Master*. L'outil **docker-compose** va nous permettre d'orchestrer la création des conteneurs. Nous allons donc devoir créer un fichier *docker-commpose.yml* qui décrit cette orchestration. Toutes les options que nous allons utiliser dans ce fichier *docker-compose.yml* se baseront sur les options précédemment utilisées.

* Ouvrir un fichier dans le répertoire contenant le dossier *workspace/*, créer un fichier *docker-commpose.yml* puis saisir le code ci-dessous.

```yaml
version: '3'

services:
  master:
    image: ros:mykinetic
    container_name: roscore
    command:
      - roscore

  talker:
    image: ros:mykinetic
    container_name: talker
    volumes:
      - ./workspace:/root/workspace
    working_dir: /root/workspace
    depends_on:
      - master
    environment:
      ROS_MASTER_URI: http://roscore:11311
      WORKSPACE_NAME: workspace
    command: rosrun beginner_tutorials talker.py

  listener:
    image: ros:mykinetic
    container_name: listener
    volumes:
      - ./workspace:/root/workspace
    working_dir: /root/workspace
    depends_on:
      - master
    environment:
      ROS_MASTER_URI: http://roscore:11311
      WORKSPACE_NAME: workspace
    command: rosrun beginner_tutorials listener.py

networks:
  default:
    external:
      name: ros
```

Il s'agit d'un fichier yaml qui impose que l'indentation, par des espaces, manifeste une arborescence. La ligne `version: '3'` signifie que la version 3 du contenu de *docker-compose.yml* est utilisée. Deux arborescences sont utilisées : `services` et `networks`. Dans `services`, nous précisons les trois conteneurs associés aux trois nœuds (*Master*, *Publieur* et *Consommateur*). Chaque conteneur se base sur la même image `image: ros:mykinetic`, précise le nom du conteneur par `container_name: ...` et décrit un dossier partagé `volumes: - ./workspace:/root/workspace`. Nous précisons pour chaque service une commande particulière via `command` qui reprend les outils ROS : **roscore** (pour démarrer le nœud *Master*) et **rosrun**. Les variables d'environnement sont explicitées par `command`. Finalement, `depends_on` permet d'indiquer que les services `talker` et `listener` associés respectivement aux nœuds *Publieur* et *Consommateur* doivent être démarrés avant le service `master`. Notons que s'il est possible de préciser un ordre pour les services, il n'est pas garanti que le service `master` ait pu démarrer complètement avec les autres services. Si c'est le cas, il faudra prévoir dans le code un mécanisme pour vérifier que le nœud *Master* ait effectivement été démarré et initialisé.

* Pour démarrer cette orchestration, exécuter la ligne de commande suivante :

```console
$ docker-compose up -d
Creating roscore ... done
Creating talker   ... done
Creating listener ... done
```

* Pour afficher les logs, exécuter la ligne de commande suivante :

```console
$ docker-compose logs
...
listener    | [INFO] [1524577237.793343]: /listener_1_1524577146122I heard hello world 1524577237.79
talker      | [INFO] [1524577206.989160]: hello world 1524577206.99
listener    | [INFO] [1524577237.892315]: /listener_1_1524577146122I heard hello world 1524577237.89
talker      | [INFO] [1524577207.089389]: hello world 1524577207.09
listener    | [INFO] [1524577237.990939]: /listener_1_1524577146122I heard hello world 1524577237.99
talker      | [INFO] [1524577207.189429]: hello world 1524577207.19
listener    | [INFO] [1524577238.092752]: /listener_1_1524577146122I heard hello world 1524577238.09
talker      | [INFO] [1524577207.288829]: hello world 1524577207.29
listener    | [INFO] [1524577238.191004]: /listener_1_1524577146122I heard hello world 1524577238.19
talker      | [INFO] [1524577207.389204]: hello world 1524577207.39
listener    | [INFO] [1524577238.294723]: /listener_1_1524577146122I heard hello world 1524577238.29
talker      | [INFO] [1524577207.489018]: hello world 1524577207.49
listener    | [INFO] [1524577238.393038]: /listener_1_1524577146122I heard hello world 1524577238.39
talker      | [INFO] [1524577207.589141]: hello world 1524577207.59
listener    | [INFO] [1524577238.492205]: /listener_1_1524577146122I heard hello world 1524577238.49
talker      | [INFO] [1524577207.690526]: hello world 1524577207.69
listener    | [INFO] [1524577238.594597]: /listener_1_1524577146122I heard hello world 1524577238.59
...
```

* Pour afficher uniquement les logs d'un service, faire suivre par le nom du service :

```console
$ docker-compose logs listener
Attaching to talker
talker      | /opt/ros/kinetic/setup.bash
talker      | [INFO] [1524577145.288646]: hello world 1524577145.29
talker      | [INFO] [1524577145.388794]: hello world 1524577145.39
talker      | [INFO] [1524577145.489195]: hello world 1524577145.49
talker      | [INFO] [1524577145.589421]: hello world 1524577145.59
talker      | [INFO] [1524577145.689103]: hello world 1524577145.69
talker      | [INFO] [1524577145.788987]: hello world 1524577145.79
talker      | [INFO] [1524577145.889035]: hello world 1524577145.89
...
```

### Utilisation de l'outil rostopic

À ce stade d'exécution, nous souhaiterions pouvoir analyser notre application pour connaître les données publiées sur un *topic*, connaître l'ensemble des *topics* actuellement abonnés et publiés, ou alors de pouvoir publier directement des données dans un *topic*. Pour réaliser cela, nous allons utiliser l'outil **rostopic**.

Pour la suite des expérimentations, nous supposons que notre programme précédent avec trois nœuds est toujours en cours d'exécution (voir la section précédente avec le fichier *docker-compose.yml*).

#### Commande rostopic list

La commande **list** permet d'afficher l'ensemble des *topics* actuellement abonnés et publiés.

* Pour afficher, tous les *topics* abonnés et publiés, exécuter la commande suivante :

```console
$ docker run --rm -it --net ros -e ROS_MASTER_URI=http://roscore:11311 ros:mykinetic rostopic list -v
/opt/ros/kinetic/setup.bash

Published topics:
 * /chatter [std_msgs/String] 1 publisher
 * /rosout [rosgraph_msgs/Log] 2 publishers
 * /rosout_agg [rosgraph_msgs/Log] 1 publisher

Subscribed topics:
 * /chatter [std_msgs/String] 1 subscriber
 * /rosout [rosgraph_msgs/Log] 1 subscriber
 ```

Nous retrouvons le _topic_ `/chatter` sur lequel le nœud _Publieur_ publie et sur lequel le nœud _Consommateur_ écoute. La donnée envoyée au _topic_ est de type `String` (message `std_msgs/String`) comme décrit dans le fichier _talker.py_ `pub = rospy.Publisher('chatter', String, queue_size=10)`.

#### Commande rostopic echo

La commande **echo** permet d'afficher les données qui sont publiées dans un _topic_ particulier. Les données sont cohérentes par rapport au type décrit dans le message associé.

* Pour afficher, les données qui sont publiées dans le _topic_ `/chatter`, exécuter la commande suivante :

```console
$ docker run --rm -it --net ros -e ROS_MASTER_URI=http://roscore:11311 ros:mykinetic rostopic echo /chatter
/opt/ros/kinetic/setup.bash
data: "hello world 1525277581.64"
---
data: "hello world 1525277582.15"
---
data: "hello world 1525277582.65"
---
data: "hello world 1525277583.14"
```

Pour rappel, le message envoyé à ce *topic* est de type `String`. Pour sortir de l'affichage en continu, faites 'CTRL + C'.

#### Commande rostopic pub

La commande **pub** permet d'envoyer des données vers un *topic*. La syntaxe de cette commande est la suivante : `rostopic pub [topic] [msg_type] [args]` où `topic` est le nom du *topic*, `msg_type` est le type de message et `args` un ensemble de paramètres pour envoyer des données.

* Nous allons commencer par arrêter le nœud *Publieur* afin de pouvoir suivre les données publiées dans le *topic* `/chatter`. Exécuter la commande suivante en vous assurant d'être dans le même répertoire contenant le fichier *docker-compose.yml*.

```console
$ docker-compose stop talker
Stopping talker ... done
```

* Exécuter la commande suivante permettant de publier des données dans le *topic* `/chatter` :

```console
$ docker run --rm -it --net ros -e ROS_MASTER_URI=http://roscore:11311 ros:mykinetic rostopic pub -1 /chatter std_msgs/String 'Hello From Docker'
/opt/ros/kinetic/setup.bash
publishing and latching message for 3.0 seconds
```

* Depuis un autre terminal, afficher le contenu des logs du nœud *Consommateur* en exécutant la commande suivante :

```console
$ docker logs listener
[INFO] [1525279892.647035]: /listener_1_1525113602169I heard hello world 1525279892.65
[INFO] [1525279893.147292]: /listener_1_1525113602169I heard hello world 1525279893.15
[INFO] [1525279893.647326]: /listener_1_1525113602169I heard hello world 1525279893.65
[INFO] [1525279894.150914]: /listener_1_1525113602169I heard hello world 1525279894.15
[INFO] [1525279894.648535]: /listener_1_1525113602169I heard hello world 1525279894.65
[INFO] [1525280003.902928]: /listener_1_1525113602169I heard Hello From Docker
```

Vous pouvez remarquer sur la dernière ligne, la donnée que nous venons d'envoyer.

## Créer des conteneurs avec une interface graphique : exemple de la Tortue

Actuellement, nous avons montré comment exécuter une application ROS composée de trois nœuds ROS sous **Docker** et dont le retour de l'exécution de chaque nœud se faisait sur la console du terminal. Il est tout à fait possible d'exécuter des nœuds ROS qui fournissent des interfaces graphiques de type client lourd.

Dans cette section, nous allons montrer comment exécuter avec **Docker** des nœuds ROS utilisant une interface graphique de type client lourd. Pour cela, nous utiliserons le déport d'affichage via la redirection X11 qui est un mécanisme courant quand on utilise un accès distant avec SSH. Pour illustrer nos propos, nous utiliserons l'exemple de la tortue disponible sur le site de ROS ( [http://wiki.ros.org/ROS/Tutorials/UnderstandingTopics](http://wiki.ros.org/ROS/Tutorials/UnderstandingTopics)). Contrairement à l'exemple Publieur/Consommateur, nous nous focaliserons uniquement sur l'exécution du programme.

### Construction d'une image avec les exemples

L'exemple de la tortue est disponible via des packages Debian. Nous allons préparer une image **Docker** qui inclut ces packages.

* Créer un fichier *DockerfileTutorial* au même endroit que le précédent fichier *Dockerfile* et saisir le texte suivant :

```console
FROM ros:mykinetic

RUN apt-get update && apt-get install -y ros-kinetic-ros-tutorials ros-kinetic-common-tutorials ros-kinetic-rqt ros-kinetic-rqt-common-plugins && rm -rf /var/lib/apt/lists/
```

Cette image sera basée sur notre précédente image appelée *ros:mykinetic* à laquelle nous installerons de nouvelles dépendances.

* Ouvrir un terminal et saisir la ligne de commande suivante :

```console
docker build -f DockerfileTutorial --tag ros:mykinetictutorial .
Sending build context to Docker daemon  2.048kB
Step 1/2 : FROM ros:mykinetic
 ---> bdad12c671be
Step 2/2 : RUN apt-get update && apt-get install -y ros-kinetic-ros-tutorials ros-kinetic-common-tutorials ros-kinetic-rqt ros-kinetic-rqt-common-plugins && rm -rf /var/lib/apt/lists/
 ---> Running in 8f5c8e22a40d
 ...
Setting up ros-kinetic-rqt-image-view (0.4.11-0xenial-20180416-171135-0800) ...
Setting up ros-kinetic-rqt-common-plugins (0.4.8-0xenial-20180419-152950-0800) ...
Setting up odbcinst (2.3.1-4.1) ...
Processing triggers for libc-bin (2.23-0ubuntu10) ...
Removing intermediate container 8f5c8e22a40d
 ---> 604bf1df9b1e
Successfully built 604bf1df9b1e
Successfully tagged ros:mykinetictutorial
```

* Assurons-nous que la nouvelle image **Docker** intégrant les exemples du tutoriel est présente. Depuis le terminal, saisir la ligne de commande suivante :

```console
$ docker images

REPOSITORY                                TAG                 IMAGE ID            CREATED             SIZE
ros                                       mykinetic           f2aae4e9c1fa        3 minutes ago       1.18GB
ros                                       kinetic             4b2e99aadf55        5 days ago          1.18GB
ros                                       mykinetictutorial   604bf1df9b1e        About a minute ago  2.27GB
```

Nous constatons que l'ajout de nouvelles dépendances a considérablement augmenté la taille de l'image (2,27 Go).

### Déport d'affichage : redirection X11

Vous avez peut-être déjà réalisé du déport d'affichage lors d'une connexion client/serveur via SSH. Pour rappel, le déport d'affichage consiste à rediriger l'affichage via la connexion SSH alors que l'exécution de l'application se fait sur le serveur. Du côté serveur, il faut que vous autorisiez la redirection X11 et du côté client il faut disposer d'un serveur X11. La redirection X11 avec **Docker** se base sur le même principe. Voyons voir comment mettre en place cela sous macOS en utilisant [XQuartz](https://www.xquartz.org/) pour le serveur X11.

#### Pour macOS

La première étape est de récupérer l'adresse IP publique du client (système hôte) afin de la transmettre au serveur (le conteneur) de telle sorte qu'une communication bidirectionnelle puisse exister.

1 - Exécuter la commande suivante pour récupérer l'adresse du client (système hôte) :

```console
ip=$(ifconfig|grep 'inet '|grep -v '127.0.0.1'| tail -1|awk '{print $2}')
echo $ip
```

Les configurations réseaux sont listées via `ifconfig` ; filtrer par `inet` ; les adresses `127.0.0.1` sont exclues ; la dernière IP est choisie (faire attention si vous avez à la fois le Wi-Fi et l'Ethernet) et finalement seule l'adresse IP est conservée.

2 - Exécuter la commande suivante pour démarrer l'outil **socat** afin d'exposer la *socket* de XQuartz locale sur un port TCP :

```console
socat TCP-LISTEN:6001,reuseaddr,fork UNIX-CLIENT:\"$DISPLAY\" &
```

3 - Quand un conteneur est créé, définir la variable d'environnement `DISPLAY` en précisant l'adresse IP du système hôte. Exécuter la ligne de commande suivante :

```console
docker run -e DISPLAY=$ip:1 ...
```

#### Pour Linux

Pour le système Linux, c'est un peu plus simple puisque le serveur X11 est intégré au système.

1 - Exécuter la commande suivante permettant à l'utilisateur root d'accéder au serveur X11 :

```console
xhost +SI:localuser:root
```

2 - Quand un conteneur est créé, définir la variable d'environnement `DISPLAY` en précisant comme valeur le contenu de la variable `DISPLAY` du système local :

```console
docker run -e DISPLAY=unix$DISPLAY ...
```

### Exécution de l'exemple Tortue

Pour l'exécution de l'exemple complet, nous allons préparer quatre terminaux. À noter que nous n'aurons pas besoin du répertoire *workspace* sachant que le code source de la tortue a été délivré par les packages installés depuis l'image **Docker**.

* Exécuter la commande suivante afin de créer le nœud *Master* :

```console
$ docker run --rm -it --name roscore --net ros ros:mykinetictutorial roscore
/opt/ros/kinetic/setup.bash
... logging to /root/.ros/log/1f0bbca6-4eee-11e8-b026-0242ac120002/roslaunch-90e712dfdfbf-1.log
Checking log directory for disk usage. This may take awhile.
Press Ctrl-C to interrupt
Done checking log file disk usage. Usage is <1GB.

started roslaunch server http://90e712dfdfbf:46873/
ros_comm version 1.12.13


SUMMARY
========

PARAMETERS
 * /rosdistro: kinetic
 * /rosversion: 1.12.13

NODES

auto-starting new master
process[master]: started with pid [39]
ROS_MASTER_URI=http://90e712dfdfbf:11311/

setting /run_id to 1f0bbca6-4eee-11e8-b026-0242ac120002
process[rosout-1]: started with pid [52]
started core service [/rosout]
```

Nous allons ensuite créer le nœud correspondant à l'affichage de la tortue dans son environnement. Avant tout, nous allons configurer le déport d'affichage pour la redirection X11 (l'expérimentation se fera sous macOS, pour Linux se référer à la section précédente).

* Exécuter les lignes de commande suivantes depuis un nouveau terminal pour créer un nouveau nœud basé sur l'application *turtlesim_node* du package *turtlesim* :

```console
$ ip=$(ifconfig|grep 'inet '|grep -v '127.0.0.1'| tail -1|awk '{print $2}')
$ socat TCP-LISTEN:6001,reuseaddr,fork UNIX-CLIENT:\"$DISPLAY\" &
$ docker run --rm -it --name turtlesim --net ros -e ROS_MASTER_URI=http://roscore:11311 -e XAUTHORITY=/tmp/xauth -e DISPLAY=$ip:1 ros:mykinetictutorial rosrun turtlesim turtlesim_node
/opt/ros/kinetic/setup.bash
[ INFO] [1525365018.259424800]: Starting turtlesim with node name /turtlesim
[ INFO] [1525365018.272410200]: Spawning turtle [turtle1] at x=[5.544445], y=[5.544445], theta=[0.000000]
libGL error: No matching fbConfigs or visuals found
libGL error: failed to load driver: swrast
```

Le résultat attendu devrait être l'affichage d'une fenêtre comme montré sur la figure suivante :

![Tortue dans son environnement](/images/environnement-developpement-ros-docker/turtlesimu.png)

Pour contrôler la tortue, nous allons créer le nœud basé sur l'application *turtle_teleop_key* du package *turtlesim*. Le contrôle ne se fera pas depuis une interface graphique, mais depuis la console de la ligne de commande.

* Depuis un nouveau terminal, exécuter la ligne de commande suivante :

```console
$ docker run --rm -it --name turtleteleopkey --net ros -e ROS_MASTER_URI=http://roscore:11311 ros:mykinetictutorial rosrun turtlesim turtle_teleop_key
/opt/ros/kinetic/setup.bash
Reading from keyboard
---------------------------
Use arrow keys to move the turtle.
```

Avec les touches fléchées de votre clavier, vous pouvez faire bouger la tortue. Un résultat est disponible sur la figure ci-dessous montrant une animation de la tortue sur la fenêtre de simulation.

![Déplacement de la tortue ](/images/environnement-developpement-ros-docker/turtlesimuanimation.gif)

Pour compléter cet exemple, nous allons ajouter un nouveau nœud pour intégrer l'outil **rqt_graph** (disponible via les packages *ros-kinetic-rqt* et *ros-kinetic-rqt-common-plugins*). **rqt_graph** permet de visualiser les relations entre les nœuds du système complet en affichant, le nom des nœuds, les messages et les *topics*

* Depuis un nouveau terminal, exécuter la ligne de commande suivante pour démarrer l'application *rqt_graph* du package *rqt_graph* :

```console
docker run --rm -it --name rqt_graph --net ros -e ROS_MASTER_URI=http://roscore:11311 -e XAUTHORITY=/tmp/xauth -e DISPLAY=$ip:1 ros:mykinetictutorial rosrun rqt_graph rqt_graph
```

![Déplacement de la tortue ](/images/environnement-developpement-ros-docker/rqtgraph.png)

Le résultat attendu affiche une interface graphique en montrant la relation entre le nœud *turtlesim* et le nœud *teleop_turtle* et dont la communication est obtenue par le message */turtle1/cmd_vel*.

## Déploiement avec des cartes Raspberry Pi

Cette section adresse plusieurs problématiques :

* utilisation d'une image **Docker** sur des architectures matérielles différentes : Processeur ARM pour les cartes Raspberry Pi et processeur x86 pour macOS ;
* localisation des codes sources sur des machines physiques différentes ;
* invocation de commandes **Docker** sur des machines différentes.

Pour répondre à ces problématiques, nous envisageons :

* utilisation d'images **Docker** ROS multisystèmes pour le processeur ARM et x86 ;
* utilisation de l'outil **rsync** pour synchroniser les codes sources sur plusieurs machines physiques ;
* utilisation de l'outil **docker-machine** pour contrôler les moteurs **Docker** à distance.

### Présentation de l'exemple et du matériel

Reprenons l'exemple du Publieur/Consommateur sur lequel une communication avec les ports GPIO va être ajoutée. Comme nous exploitons des cartes Raspberry Pi, nous allons en profiter pour utiliser un peu de matériel électronique. Notre ajout sera simple, depuis le nœud *Consommateur* une LED s'allumera ou s'éteindra à chaque réception d'un message depuis le *topic* */chatter*. Par ailleurs, nous allons nous efforcer à créer un package pour les nœuds *Talker* et *Listener* contrairement à la première présentation de cet exemple où nous avions utilisé qu'un seul package.

Concernant le matériel, trois cartes Raspberry Pi (modèle 3 avec une capacité de 32 Go pour la carte micro SD) seront utilisées correspondant respectivement aux trois nœuds utilisés dans l'exemple : une carte pour le nœud *Master*, une carte pour le nœud **Publieur** et une carte pour le nœud **Consommateur**. Bien entendu, nous aurions pu nous limiter à une seule carte Raspberry Pi pour exécuter les trois nœuds, mais nous voulions montrer un déploiement avec des contraintes sur le réseau. Pour ce dernier point, les trois cartes Raspberry Pi ainsi que le MacBook Pro du développeur seront dans le même sous réseau. Tous les périphériques réseau pourront donc être accessibles depuis le poste du développeur.

Voici une description complète de notre expérimentation :

* XXX.YYY.ZZZ.74 : nœud *Master* ;
* XXX.YYY.ZZZ.75 : nœud *Publieur* ;
* XXX.YYY.ZZZ.76 : nœud *Consommateur* + *breadboard* (LED + résistance) ;
* XXX.YYY.ZZZ.77 : le poste du développeur sous macOS.

Sur chaque carte Raspberry Pi, le système d'exploitation [HypriotOS](https://blog.hypriot.com/downloads/) sera utilisé. Il s'agit d'un système d'exploitation dédié aux cartes Raspberry Pi développé autour de l'écosystème **Docker**. Les avantages d'utiliser ce système d'exploitation au lieu du classique Raspbian sont : 1) de pouvoir profiter de la dernière version de **Docker** et des outils satellites et 2) de disposer d'un système épuré.

Finalement, la carte Raspberry Pi en charge du nœud *Consommateur* sera connectée avec une *breadboard* et un montage électronique simpliste à base d'une LED et d'une résistance. Les *pins* 3 (GPIO02) et 9 (Ground) ont été utilisés pour alimenter la *breadboard*.

Nous donnons ci-dessous une photo du montage complet :

![Montage de l'exemple avec trois cartes Raspberry PI](/images/environnement-developpement-ros-docker/raspberrypi_cards.png)

### Expérimentations : du développement au déploiement

Cette section présente l'expérimentation complète à savoir la préparation des cartes Raspberry Pi, la création des machines **Docker**, le téléchargement et la création des images **Docker**, la synchronisation des codes sources et finalement l'exécution du programme complet.

#### Préparation des cartes Raspberry Pi

Cette section s'intéresse à préparer les trois cartes Raspberry Pi afin d'installer et configurer le système d'exploitation HypriotOS.

* Télécharger la dernière version de l'image HypriotOS en vous rendant à cette adresse : [https://github.com/hypriot/image-builder-rpi/releases](https://github.com/hypriot/image-builder-rpi/releases). Lors de l'écriture de l'article, c'est la version 1.9.0 qui a été utilisée. 
* Pour l'installation de l'image HypriotOS sur la carte SD, l'outil graphique Etcher multiplateforme a été utilisé ( [https://etcher.io/](https://etcher.io/)). Une fois l'image HypriotOS copiée sur les trois cartes micro SD, insérer ces cartes micro SD dans l'emplacement prévu sur les cartes Raspberry Pi. Les informations d'identification sont les suivantes : utilisateur **pirate** et le mot de passe **hypriot**. 

Afin d'éviter de vous authentifier via l'utilisation explicite d'un mot de passe, une clé publique a été utilisée. En supposant que vous disposez déjà d'une clé privée et publique dans votre répertoire *.ssh*, nous allons copier cette dernière sur chaque carte Raspberry Pi via l'outil **ssh-copy-id**.

* Ouvrir une invite de commande et saisir la ligne de commande suivante :

```console
ssh-copy-id -i ~/.ssh/id_rsa.pub pirate@XXX.YYY.ZZZ.76
```

Actuellement le système d'exploitation installé sur les cartes Raspberry Pi est HypriotOS lui-même basé sur Raspbian. Toutefois **Docker-Machine** de la suite **Docker** permettant de contrôler des moteurs **Docker** (Docker engine) à distance ne reconnaît pas encore le système Raspbian. Nous allons donc renommer le système en Debian afin de résoudre ce problème.

* Se connecter en ssh (`ssh pirate@XXX.YYY.ZZZ.74`) sur chaque carte Raspberry Pi et changer la valeur *ID* depuis le fichier */etc/os-release* :

```console
$ ssh pirate@XXX.YYY.ZZZ.74
...
$ sudo nano /etc/os-release

PRETTY_NAME="Raspbian GNU/Linux 9 (stretch)"
NAME="Raspbian GNU/Linux"
VERSION_ID="9"
VERSION="9 (stretch)"
ID=debian
ID_LIKE=debian
HOME_URL="http://www.raspbian.org/"
SUPPORT_URL="http://www.raspbian.org/RaspbianForums"
BUG_REPORT_URL="http://www.raspbian.org/RaspbianBugs"
HYPRIOT_OS="HypriotOS/armhf"
HYPRIOT_OS_VERSION="v2.0.1"
HYPRIOT_DEVICE="Raspberry Pi"
HYPRIOT_IMAGE_VERSION="v1.9.0"
```

Afin de synchroniser le répertoire *workspace* avec les différents Raspberry Pi, l'outil **rsync** doit être installé sur chaque carte.

* Se connecter sur chaque carte Raspberry Pi et installer l'outil **rsync** :

```console
$ sudo apt-get update
Get:1 http://raspbian.raspberrypi.org/raspbian stretch InRelease [15.0 kB]
Get:2 http://archive.raspberrypi.org/debian stretch InRelease [25.3 kB]
Get:3 http://raspbian.raspberrypi.org/raspbian stretch/main armhf Packages [11.7 MB]
Get:4 http://archive.raspberrypi.org/debian stretch/main armhf Packages [145 kB]
Get:5 https://download.docker.com/linux/raspbian stretch InRelease [15.3 kB]
...
$ sudo apt-get install rsync
Reading package lists... Done
Building dependency tree
Reading state information... Done
The following NEW packages will be installed:
  rsync
0 upgraded, 1 newly installed, 0 to remove and 1 not upgraded.
...
```

#### Création des docker-machine

Depuis macOS, nous allons créer trois machines **Docker** connectées respectivement sur les trois cartes Raspberry PI.

* Saisir la ligne de commande suivante pour créer un **docker-machine** vers la carte Raspberry Pi dédiée à la gestion du nœud *Master*.

```console
$ docker-machine create --driver generic --generic-ip-address=XXX.YYY.ZZZ.74 --generic-ssh-user "pirate" --generic-ssh-key ~/.ssh/id_rsa --engine-storage-driver overlay2 master
Running pre-create checks...
Creating machine...
(master) Importing SSH key...
Waiting for machine to be running, this may take a few minutes...
Detecting operating system of created instance...
Waiting for SSH to be available...
Detecting the provisioner...
Provisioning with debian...
Copying certs to the local machine directory...
Copying certs to the remote machine...
Setting Docker configuration on the remote daemon...
Checking connection to Docker...
Docker is up and running!
To see how to connect your Docker Client to the Docker Engine running on this virtual machine, run: docker-machine env master
```

La création de cette machine **Docker** passe par l'utilisation du *driver* générique `--driver generic`. Différentes options doivent être indiquées à savoir : l'adresse IP de la machine `--generic-ip-address=XXX.YYY.ZZZ.74`, l'utilisateur ssh `--generic-ssh-user "pirate"`, la clé publique `--generic-ssh-key ~/.ssh/id_rsa` et finalement le nom de la machine `master`. Lors de la création de la machine **Docker**, le nom réseau de la machine (hostname) portera son nom à savoir ici `master`.

* Saisir la ligne de commande suivante pour créer un **docker-machine** vers la carte Raspberry Pi dédiée à la gestion du nœud *Publieur* :

```console
$ docker-machine create --driver generic --generic-ip-address=XXX.YYY.ZZZ.75 --generic-ssh-user "pirate" --generic-ssh-key ~/.ssh/id_rsa --engine-storage-driver overlay2 talker
Running pre-create checks...
Creating machine...
(talker) Importing SSH key...
Waiting for machine to be running, this may take a few minutes...
Detecting operating system of created instance...
Waiting for SSH to be available...
Detecting the provisioner...
Provisioning with debian...
Copying certs to the local machine directory...
Copying certs to the remote machine...
Setting Docker configuration on the remote daemon...
Checking connection to Docker...
Docker is up and running!
To see how to connect your Docker Client to the Docker Engine running on this virtual machine, run: docker-machine env talker
```

* Saisir la ligne de commande suivante pour créer un **docker-machine** vers la carte Raspberry Pi dédiée à la gestion du nœud *Consommateur* :

```console
$ docker-machine create --driver generic --generic-ip-address=XXX.YYY.ZZZ.76 --generic-ssh-user "pirate" --generic-ssh-key ~/.ssh/id_rsa --engine-storage-driver overlay2 talker
Running pre-create checks...
Creating machine...
(listener) Importing SSH key...
Waiting for machine to be running, this may take a few minutes...
Detecting operating system of created instance...
Waiting for SSH to be available...
Detecting the provisioner...
Provisioning with debian...
Copying certs to the local machine directory...
Copying certs to the remote machine...
Setting Docker configuration on the remote daemon...
Checking connection to Docker...
Docker is up and running!
To see how to connect your Docker Client to the Docker Engine running on this virtual machine, run: docker-machine env listener
```

* Pour s'assurer que les trois machines **Docker** ont été correctement créées, saisir la commande suivante :

```console
NAME       ACTIVE   DRIVER    STATE     URL                        SWARM   DOCKER        ERRORS
master     -        generic   Running   tcp://XXX.YYY.ZZZ.74:2376           v18.04.0-ce
talker     -        generic   Running   tcp://XXX.YYY.ZZZ.75:2376           v18.04.0-ce
listener   -        generic   Running   tcp://XXX.YYY.ZZZ.76:2376           v18.04.0-ce
```

Nous remarquons qu'aucune machine **Docker** n'est active (colonne *ACTIVE*) et qu'elles sont toutes en fonctionnement (colonne *STATE*) avec la même version du moteur **Docker**.

Pour prendre le contrôle d'une machine **Docker**, utiliser la commande suivante `eval $(docker-machine env NOM_MACHINE)` où `NOM_MACHINE` est le nom de la machine. Cette commande aura pour effet de modifier les variables d'environnement de votre système afin de pouvoir se connecter sur une instance distante de **Docker**.

* Pour se connecter à la machine **Docker** du nœud *Master*, saisir la ligne de commande suivante :

```console
eval $(docker-machine env master)
```

Une fois connectée, toutes les commandes **Docker** que nous avons étudiées sont utilisables à savoir les commandes pour la gestion des images, la gestion des conteneurs…

* Exécuter la ligne de commande suivante pour vérifier qu'aucune image **Docker** n'est présente puisque nous n'avons pas encore interagi avec cette instance **Docker** :

```console
$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
```

* Saisir la commande ci-dessous pour se connecter à l'instance locale de **Docker** (celui installé sur macOS) :

```console
eval $(docker-machine env -u)
```

* Puis afficher les images **Docker** via la ligne de commande :

```console
$ docker images
REPOSITORY                                TAG                 IMAGE ID            CREATED             SIZE
ros                                       mykinetic           f2aae4e9c1fa        3 minutes ago       1.18GB
ros                                       kinetic             4b2e99aadf55        5 days ago          1.18GB
ros                                       mykinetictutorial   604bf1df9b1e        About a minute ago  2.27GB
```

Nous retrouvons les images **Docker** téléchargées et créées précédemment.

#### Préparer l'image Docker

Pour nos expérimentations, nous avons besoin de deux images différentes :

1. L'image `ros:mykinetic` pour les nœuds *Master* et *Publieur* ;
2. Une image basée sur `ros:mykinetic` et qui intègre la bibliothèque Python permettant de communiquer avec les ports GPIO. Cette image sera utilisée par le nœud *Consommateur*.

Bien entendu, comme les architectures matérielles entre macOS (plateforme x86) et une carte Raspberry Pi (plateforme ARM) ne sont pas les mêmes, l'image `ros:mykinetic` doit être reconstruite sur les cartes Raspberry Pi. Heureusement, les images **Docker** officielles ROS sont fournies suivant différents types d'architecture matérielle. Dans la suite, les images pour chacun des nœuds vont être construites en utilisant les machines **Docker** précédemment créées.

* Se connecter à la machine **Docker** intitulée *Master* via la ligne de commande suivante :

```console
eval $(docker-machine env master)
```

* Se positionner dans le répertoire contenant le fichier *Dockerfile* que nous avions utilisé précédemment pour construire l'image `ros:mykinetic` et lancer la ligne de commande suivante :

```console
docker build --tag ros:mykinetic .
Sending build context to Docker daemon  579.6kB
Step 1/2 : FROM ros:kinetic
kinetic: Pulling from library/ros
f68dc00194f4: Pull complete
281b914f46e3: Pull complete
754b205ebc94: Pull complete
1418c61fca2a: Pull complete
8b471dd10511: Pull complete
b5050587be2f: Pull complete
334ce8d24851: Pull complete
10d06c2ef1c0: Pull complete
9b97dba49af9: Pull complete
b1310601b613: Pull complete
a715f7dcd6ee: Pull complete
bb4e27b5b65d: Pull complete
af540861d5e6: Pull complete
Digest: sha256:3ca1c10c802b3bb54b068ece8a4999b6388aefd7e21c970574ae6b0e9939ebfb
Status: Downloaded newer image for ros:kinetic
 ---> f1b693d5d950
Step 2/2 : COPY ./ros_entrypoint.sh /
 ---> a9598ee40ef9
Successfully built a9598ee40ef9
Successfully tagged ros:mykinetic
```

Premier constat évident, la construction de l'image **Docker** `ros:mykinetic` sur architecture matérielle ARM est lente. Second constat, le fichier *ros_entrypoint.sh*, présent uniquement sur le système de fichiers de macOS, est copié vers la carte Raspberry Pi *Master* pour construire l'image.

* Afficher la liste des images **Docker** de la carte Raspberry Pi *Master* pour s'assurer que `ros:mykinetic` est bien présente :

```console
$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
ros                 mykinetic           a9598ee40ef9        8 days ago          944MB
ros                 kinetic             f1b693d5d950        9 days ago          944MB
```

* Procéder de la même façon pour la carte Raspberry Pi *Publieur*, saisir les lignes de commandes ci-dessous :

```console
eval $(docker-machine env talker)
docker build --tag ros:mykinetic .
Sending build context to Docker daemon  579.6kB
Step 1/2 : FROM ros:kinetic
kinetic: Pulling from library/ros
f68dc00194f4: Pull complete
281b914f46e3: Pull complete
754b205ebc94: Pull complete
1418c61fca2a: Pull complete
8b471dd10511: Pull complete
b5050587be2f: Pull complete
334ce8d24851: Pull complete
10d06c2ef1c0: Pull complete
9b97dba49af9: Pull complete
b1310601b613: Pull complete
a715f7dcd6ee: Pull complete
bb4e27b5b65d: Pull complete
af540861d5e6: Pull complete
Digest: sha256:3ca1c10c802b3bb54b068ece8a4999b6388aefd7e21c970574ae6b0e9939ebfb
Status: Downloaded newer image for ros:kinetic
 ---> f1b693d5d950
Step 2/2 : COPY ./ros_entrypoint.sh /
 ---> a9598ee40ef9
Successfully built a9598ee40ef9
Successfully tagged ros:mykinetic
```

Il reste encore une image **Docker** à construire, celle qui sera utilisée sur la carte Raspberry Pi *Consommateur*. Cette image doit intégrer la bibliothèque Python permettant de communiquer avec les ports GPIO.

* Ouvrir un éditeur de texte et saisir le code ci-dessous. Sauvegardez dans un fichier appelé *DockerfileRPI*.

```console
FROM ros:mykinetic

RUN apt-get update && apt-get install -y wget && wget -qO- https://files.pythonhosted.org/packages/e2/58/6e1b775606da6439fa3fd1550e7f714ac62aa75e162eed29dbec684ecb3e/RPi.GPIO-0.6.3.tar.gz --no-check-certificate | tar xvz && cd RPi.GPIO-0.6.3/ && python setup.py install
```

* Depuis une invite de commande, saisir les commandes suivantes pour construire l'image depuis la machine **Docker** appelée *Consommateur* :

```console
eval $(docker-machine env listener)
docker build -f DockerfileRPI --tag ros:mykineticrpi .
Sending build context to Docker daemon  580.6kB
Step 1/3 : FROM ros:kinetic
 ---> f1b693d5d950
Step 2/3 : COPY ./ros_entrypoint.sh /
 ---> Using cache
 ---> 511e164624c5
Step 3/3 : RUN apt-get update && apt-get install -y wget && wget -qO- https://files.pythonhosted.org/packages/e2/58/6e1b775606da6439fa3fd1550e7f714ac62aa75e162eed29dbec684ecb3e/RPi.GPIO-0.6.3.tar.gz --no-check-certificate | tar xvz && cd RPi.GPIO-0.6.3/ && python setup.py install
 ---> Running in 3fde0b10d649
Get:1 http://ports.ubuntu.com/ubuntu-ports xenial InRelease [247 kB]
Get:2 http://ports.ubuntu.com/ubuntu-ports xenial-updates InRelease [109 kB]
...
running install_egg_info
Writing /usr/local/lib/python2.7/dist-packages/RPi.GPIO-0.6.3.egg-info
Removing intermediate container 3fde0b10d649
 ---> 018a768e8f3c
Successfully built 018a768e8f3c
Successfully tagged ros:mykineticrpi
```

* Afficher la liste des images **Docker** de la carte Raspberry Pi correspondant au nœud *Consommateur* pour s'assurer que `ros:mykineticrpi` est bien présente :

```console
$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
ros                 mykineticrpi        018a768e8f3c        10 days ago         987MB
ros                 mykinetic           511e164624c5        10 days ago         944MB
ros                 kinetic             f1b693d5d950        11 days ago         944MB
```

Nous disposons à cette étape de trois cartes Rapsberry Pi avec pour chacune des images **Docker**. Voici en détail la répartition des images **Docker** :

* XXX.YYY.ZZZ.74 : nœud *Master* avec une image **Docker** *ros:mykinetic* ;
* XXX.YYY.ZZZ.75 : nœud *Publieur* avec une image **Docker** *ros:mykinetic* ;
* XXX.YYY.ZZZ.76 : nœud *Consommateur* + breadboard (LED + résistance) avec une image **Docker** *ros:mykineticrpi*.

#### Rendre accessible le répertoire de travail (workspace)

Le répertoire de travail (portant le nom de *workspacerpi* pour cet exemple) est disponible sur le poste du développeur et doit être partagé sur les différents nœuds. Pour réaliser cette opération, l'outil **rsync** sera utilisé pour synchroniser le répertoire workspace tandis que l'outil **fswatch** sera utilisé pour écouter les changements sur le code source.

Pour revenir à notre exemple, un répertoire de travail *workspacerpi* avec le même package *beginner_tutorials* qu'au début du tutoriel sera utilisé. Le contenu du répertoire de travail sera synchronisé avec les cartes Rapsberry Pi utilisées pour l'exécution des nœuds *Publieur* et *Consommateur*.

* Activer la machine **Docker** du poste de développeur à partir de la ligne de commande suivante :

```console
eval $(docker-machine env -u)
```

* Ouvrir une invite de commande et exécuter les commandes suivantes :

```console
$ mkdir -p workspacerpi/src

$ docker run --rm -it -e WORKSPACE_NAME=workspacerpi -v $(pwd)/workspacerpi:/root/workspacerpi -w /root/workspacerpi/src ros:mykinetic catkin_create_pkg beginner_tutorials std_msgs rospy
Base path: /root/workspacerpi
Source space: /root/workspacerpi/src
Build space: /root/workspacerpi/build
Devel space: /root/workspacerpi/devel
Install space: /root/workspacerpi/install
Creating symlink "/root/workspacerpi/src/CMakeLists.txt" pointing to "/opt/ros/kinetic/share/catkin/cmake/toplevel.cmake"
...
Created file beginner_tutorials/package.xml
Created file beginner_tutorials/CMakeLists.txt
Created folder beginner_tutorials/src
Successfully created files in /root/workspacerpi/src/beginner_tutorials. Please adjust the values in package.xml.
```

* Ajouter le contenu ci-dessous dans le fichier *workspacerpi/src/beginner_tutorials/src/talker.py*

```python
#!/usr/bin/env python
import rospy
from std_msgs.msg import String

def talker():
    pub = rospy.Publisher('chatter', String, queue_size=10)
    rospy.init_node('talker', anonymous=True)
    rate = rospy.Rate(2) # 10hz
    while not rospy.is_shutdown():
        hello_str = "hello world %s" % rospy.get_time()
        rospy.loginfo(hello_str)
        pub.publish(hello_str)
        rate.sleep()

if __name__ == '__main__':
    try:
        talker()
    except rospy.ROSInterruptException:
        pass
```

Ce code du fichier *talker.py* est le même que celui que nous avions présenté au début du tutoriel.

* Ajouter le contenu ci-dessous dans le fichier *workspacerpi/src/beginner_tutorials/src/listener.py*

```python
#!/usr/bin/env python
import rospy
import RPi.GPIO as GPIO
from std_msgs.msg import String

def callback(data):
    rospy.loginfo(rospy.get_caller_id() + "I heard %s", data.data)
    GPIO.output(3, not GPIO.input(3))

def listener():

    # In ROS, nodes are uniquely named. If two nodes with the same
    # node are launched, the previous one is kicked off. The
    # anonymous=True flag means that rospy will choose a unique
    # name for our 'listener' node so that multiple listeners can
    # run simultaneously.
    rospy.init_node('listener', anonymous=True)

    rospy.Subscriber("chatter", String, callback)

    # spin() simply keeps python from exiting until this node is stopped
    rospy.spin()

if __name__ == '__main__':
    GPIO.setmode(GPIO.BOARD)
    GPIO.setup(3, GPIO.OUT, initial = GPIO.HIGH)
    listener()
```

Ce code est basé sur celui du fichier *listener.py* utilisé au début du tutoriel et sur lequel nous avons ajouté des instructions pour faire clignoter la LED de notre circuit électronique.

* Exécuter la ligne de commande suivante pour démarrer l'écoute du répertoire de travail *workspacerpi* et réaliser les actions de synchronisation :

```console
fswatch -o $(pwd)/workspacerpi | xargs -n1 -I{} /bin/sh -c "rsync -avzhe ssh --progress $(pwd)/workspacerpi pirate@XXX.YYY.ZZZ.75:/home/pirate && rsync -avzhe ssh --progress $(pwd)/workspacerpi pirate@XXX.YYY.ZZZ.76:/home/pirate" &
```

À chaque changement du répertoire de travail *workspacerpi*, tout son contenu est transféré vers les deux cartes Raspberry Pi dédiées aux nœuds *Publieur* et *Consommateur*. Les actions consistent à invoquer l'outil **rsync**. Dans cette proposition, nous considérons que tous les changements liés au répertoire de travail (par exemple une compilation via l'outil **catkin_make**) seront effectués depuis le poste du développeur.

### Exécuter l'application complète

La dernière étape consiste à exécuter notre application composée de trois nœuds sur les cartes Raspberry Pi. Nous aurons besoin de trois terminaux pour nos expérimentations.

Avant de débuter notre expérimentation, il est important de préciser que tous les ports réseau des cartes Raspberry Pi correspondants aux nœuds *Publieur* et *Consommateur* doivent être ouverts. En effet, comme décrit dans la partie introduction à ROS, la communication entre les nœuds se fait de manière bidirectionnelle (point à point). Ainsi, un nœud communique avec le nœud *Master* via le port 11311 et inversement le nœud *Master* communique avec un nœud via un port défini aléatoirement par le *Master*. On ne peut donc pas prévoir le port qui sera utilisé par le *Master* pour communiquer avec un nœud. Il est donc nécessaire d'ouvrir tous les ports. Du côté, de la mise en place avec **Docker**, plusieurs solutions sont possibles. La première est d'utiliser le réseau *host* (`--net host`) qui va faire en sorte que le réseau d'un conteneur ne soit pas isolé. En d'autres termes, si vous exécutez un conteneur qui exploite le port 8080 et que vous utilisez le réseau *host*, alors ce port 8080 sera accessible depuis l'adresse IP de la machine hôte. Une des limitations à cette solution, c'est que sous **DockerForMac** et **DockerForWindows** le réseau hôte ne se comporte pas de la même façon que sous Linux (à cause des microhyperviseurs utilisés qui rajoutent un niveau supplémentaire au réseau). Une seconde solution est d'exposer un intervalle de port sous **Docker** (`-p 30000-50000:30000-50000`). Comme le nœud *Master* s'appuie sur le système Linux pour déterminer quels sont les ports disponibles, il suffira de restreindre l'intervalle de ces ports disponibles. Dans la suite de nos expérimentations, nous utiliserons la première solution à base de réseau *host*.

* Depuis un premier terminal, exécuter les lignes de commandes suivantes pour démarrer le nœud *Master* :

```console
$ eval $(docker-machine env master)
$ docker run --rm -it --name roscore ros:mykinetic roscore
/opt/ros/kinetic/setup.bash
... logging to /root/.ros/log/d2008f1a-4b71-11e8-8f7b-0242ac110002/roslaunch-d488117aaa91-1.log
Checking log directory for disk usage. This may take awhile.
Press Ctrl-C to interrupt
Done checking log file disk usage. Usage is <1GB.

started roslaunch server http://d488117aaa91:40265/
ros_comm version 1.12.13


SUMMARY
========

PARAMETERS
 * /rosdistro: kinetic
 * /rosversion: 1.12.13

NODES

auto-starting new master
process[master]: started with pid [39]
ROS_MASTER_URI=http://d488117aaa91:11311/

setting /run_id to d2008f1a-4b71-11e8-8f7b-0242ac110002
process[rosout-1]: started with pid [52]
started core service [/rosout]
```

La première chose à réaliser est de rendre active la machine **Docker** intitulée *Master*. Comme il s'agit du nœud *Master* et que nous connaissons le port à utiliser (11311), il n'est pas nécessaire de spécifier le réseau *host* en paramètre.

* Depuis un deuxième terminal, exécuter les lignes de commandes suivantes pour démarrer le nœud *Publieur* :

```console
$ eval $(docker-machine env talker)
$ docker run --rm -it -e WORKSPACE_NAME=workspacerpi --net host --name talker -e ROS_IP=XXX.YYY.ZZZ.75 -e ROS_MASTER_URI=http://XXX.YYY.ZZZ.74:11311 -v /home/pirate/workspacerpi:/root/workspacerpi -w /root/workspacerpi ros:mykinetic rosrun beginner_tutorials talker.py
/opt/ros/kinetic/setup.bash
[INFO] [1524982683.522040]: hello world 1524982683.52
[INFO] [1524982684.022705]: hello world 1524982684.02
[INFO] [1524982684.523073]: hello world 1524982684.52
[INFO] [1524982685.023171]: hello world 1524982685.02
[INFO] [1524982685.523175]: hello world 1524982685.52
```

Nous commençons par rendre active la machine **Docker** intitulée *Talker* (celle décrivant le nœud *Publieur*). Dans la commande de création du conteneur pour démarrer le nœud *Publieur* de nouvelles options sont utilisées : `--net host` permet de spécifier le réseau à utiliser ; `-e ROS_IP=XXX.YYY.ZZZ.75` permet de donner l'adresse IP du nœud *Publieur*, sans cette option le hostname du conteneur aurait été utilisé ; `-e ROS_MASTER_URI=http://XXX.YYY.ZZZ.74:11311` cette option n'est pas nouvelle, mais son contenu est différent, nous spécifions ici l'adresse IP de la carte Raspberry Pi du nœud *Master*.

* Depuis un troisième terminal, exécuter la ligne de commande suivante :

```console
eval $(docker-machine env listener)
docker run --rm -it --privileged --net host -e WORKSPACE_NAME=workspacerpi -e ROS_IP=XXX.YYY.ZZZ.76 -e ROS_MASTER_URI=http://XXX.YYY.ZZZ.74:11311 --name listener -v /home/pirate/workspacerpi:/root/workspacerpi -w /root/workspacerpi ros:mykineticrpi rosrun beginner_tutorials listener.py
```

Même explication que précédemment excepté pour cette nouvelle option `--privileged` utilisée lors de la création du conteneur pour démarrer le nœud *Consommateur*. `--privileged` permet d'autoriser le conteneur à accéder aux éléments matériels du système hôte, en l'occurrence les ports GPIO.

## Conclusion et perspectives

Ce tutoriel a montré comment utiliser **Docker** pour le développement des applications basées sur ROS (Robot Operating System). Plus précisément avec **Docker**, nous avons vu :

* comment enrichir l'image ROS ;
* comment utiliser les outils fournis par ROS (**rostopic**) en exécutant un conteneur ;
* comment exécuter une application ROS de plusieurs nœuds en créant plusieurs conteneurs « à la main » ou via l'outil d'orchestration **docker-compose** ;
* comment démarrer des nœuds qui possèdent des interfaces graphiques via le déport d'affichage (serveur X11) ;
* comment déployer une application ROS sur plusieurs machines physiques via l'utilisation de **docker-machine** ;
* comment autoriser un conteneur à accéder aux éléments matériels du système hôte ;
* comment synchroniser son répertoire de travail sur plusieurs machines.

De nombreuses perspectives sont à explorer :

* faciliter l'usage des lignes de commandes **Docker** via l'utilisation d'alias spécifiques. Nous pourrions aller plus loin en masquant la complexité de **Docker** dans un environnement de développement préconfiguré et plus simple en réduisant la longueur des lignes de commandes ;
* effectuer de la cross-compilation pour des programmes ROS développés en C++. Nous avons choisi la simplicité avec Python, mais dans le cas de C++ il y a une compilation à réaliser en amont. Qu'en est-il lorsqu'il faut compiler sur une plateforme matérielle différente X86 vs ARM ;
* utiliser **Swarm** de la famille **Docker** pour la création d'un cluster ;
* gérer le problème de la redondance de nœuds par **Docker**.

Dans le prochain tutoriel consacré à ROS, nous nous intéresserons à la possibilité de développer des programmes ROS avec le langage Java. Nous montrerons que ROS une architecture où plusieurs programmes développés dans des langages différents peuvent communiquer. À ce titre, nous ferons communiquer des nœuds écrits dans des langages différents tels que Python et Java.

## Remerciements

Je tiens à remercier les collègues du laboratoire [LIAS](https://www.lias-lab.fr/) pour toutes les discussions autour de [ROS](http://www.ros.org/) qui m'ont permis d'avancer sur le sujet.

Cet article est disponible sur le site de [Developpez.com](https://mbaron.developpez.com/tutoriels/ros/environnement-developpement-ros-docker/).

Je tiens également à remercier [f-leb](https://www.developpez.net/forums/u283256/f-leb/) pour sa relecture orthographique.