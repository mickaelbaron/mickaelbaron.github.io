---
title: Installation et configuration de Raspbian sur Raspberry PI puis connexion SSH depuis Windows 7
tags: [RaspberryPI]
blogger_orig_url: https://keulkeul.blogspot.com/2014/11/installation-et-configuration-de.html
category: technical
description: Ce billet s'intéresse à configurer la partie réseau d'un Raspberry PI.
---

Je viens de recevoir au travail un ensemble de Raspberry PI (Raspberry PI modèle B et Raspberry PI modèle B+).  Pour une première prise en main, je voulais compiler mon premier programme Java _HelloWord_ dessus sans avoir à connecter sur le Raspberry PI un clavier, une souris et un écran.

Comme vous pouvez vous en douter, l'objectif de ce billet est de vous montrer comment à partir d'un simple Raspberry PI, installer un OS, se connecter en SSH puis éditer, compiler et exécuter un programme Java. Je me suis fixé comme contrainte de ne pas connecter de clavier, souris et écran sur le Raspberry PI. Ce dernier sera connecté en direct sur mon portable PC Windows via le port Ethernet. Avec le partage de connexion, l'accès Internet disponible depuis ma carte Wifi sera redirigé vers le port Ethernet. Par conséquent toutes les opérations depuis le Raspberry PI seront effectuées depuis mon portable PC Windows.

L'explication qui sera donnée dans ce billet n'est peut-être pas la plus simple. En effet, il est simple de connecter le Raspberry PI sur un routeur d'une Box d'en identifier son IP, de se connecter en SSH et de pouvoir profiter d'une connexion Internet depuis le Raspberry PI. Malheureusement dans la configuration au travail, je ne dispose pas de routeur connecté sur Internet.

## Présentation du matériel

![/images/hardware.png](/images/hardware.png)

Pour les besoins de cette expérimentation, j'ai utilisé le matériel suivant.

* un Raspberry PI modèle B+ (repère 1) ;
* un cable USB - Micro-B pour l'alimentation (repère 2) ;
* un cable Ethernet (repère 3) ;
* un micro SD de 4 Go avec un adaptateur grand format pour connecter au PC (repère 4) ;
* un portable PC avec WIFI sous Windows 7.

## Télécharger et préparer carte SD

* Télécharger depuis le site de [Raspberry PI](http://www.raspberrypi.org/downloads/), l'[image](http://downloads.raspberrypi.org/raspbian_latest) de [Raspbian](http://www.raspbian.org/). Le fichier pèse environ 955 Mo. Un point de détail, j'ai du passer par la version Torrent car la version ZIP posait problème pour le téléchargement.
* Télécharger [Win32DiskImager](http://sourceforge.net/projects/win32diskimager/) afin de construire une carte SD bootable. Je souhaitais utiliser [Refus](http://rufus.akeo.ie/), découvert [dernièrement](http://keulkeul.blogspot.fr/2014/11/liens-pratiques-de-la-semaine.html), mais il n'a su reconnaître ma carte SD.
* Exécuter Win32DiskImager, choisir votre carte SD, choisir l'image Raspbian puis faire Write. Attendre un certain temps, afin que votre carte SD soit prête.

## Configurer le partage de connexion Internet (ICS)

* Ouvrir la fenêtre de Connexions réseau.

![/images/connexionreseau.png](/images/connexionreseau.png)

* Sélectionner le réseau sans fil puis afficher les propriétés.

![/images/partagesansfil.png](/images/partagesansfil.png)

* Cocher l'option "_Autoriser d'autres utilisateurs du réseau ..._" puis sélectionner au niveau de "_Connexion réseau domestique_" le réseau filaire qui sera utilisé par le Raspberry PI.

* Cliquer sur _Paramètres_ et sélectionner les services _Serveur Web (HTTP)_ et _Serveur Web sécurisé (HTTPS)_

* Pour finir faire _Ok_ 

## Fixer une IP pour le Raspberry PI

* Connecter la carte SD dans le Raspberry PI puis connecter le câble réseau et d'alimentation.

* Ouvrir une console Windows (_cmd.exe_).

* Faire un appel à l'outil **ipconfig** pour connaître les informations des cartes réseaux.

![/images/ipconfig.png](/images/ipconfig.png)

* Dans la zone rouge est indiquée l'adresse IP de votre carte réseau. Dans mon cas, mon adresse IP est la _192.168.137.1_.

* Débrancher l'alimentation du Raspberry PI et connecter la carte SD sur le portable PC.

* Depuis la carte SD, éditer le fichier _cmdline.txt_ puis compléter à la fin en ajoutant le clé _ip_ et la valeur doit suivre le schéma suivant : A.B.C.E::A.B.C.D. Où A.B.C.D est votre adresse IP (pour moi 192.168.137.1) et E une valeur différente par exemple 3. Le résultat attendu est présenté sur la figure suivante.

![/images/editcmdline.png](/images/editcmdline.png)

* À noter que si vous ne souhaitez pas partager la connexion Internet, saisir de la forme _ip=A.B.C.E._

* Déconnecter la carte SD du portable PC, la connecter sur le Raspberry PI et alimenter le.

* Attendre environ une minute le temps que l'OS du Raspberry PI soit chargé.

## Se connecter en SSH via IP

* Pour la suite, je suppose que l'outil SSH est installé. Dans mon cas, il est fourni via le package GIT installé sur mon Windows.

* Depuis l'invite de console Windows (_cmd.exe_) exécuter l'instruction suivante :

```console
ssh pi@192.168.137.3
```

* Un mot de passe vous sera demandé, sa valeur par défaut est _raspberry_.

* Vous voilà connectez en SSH sur votre Raspberry PI. Il s'agit d'un environnement Linux basé sur Debian. Première chose pour vérifier si l'accès est Internet est fonctionnel, c'est de faire une mise à jour de votre dépôt : 

```console
sudo apt-get update
```

## Se connecter en SSH via le nom d'hôte

Les problèmes avec les solutions précédentes sont les suivants :

* si on change de Portable PC, il faut recommencer la procédure car l'IP fourni à votre carte réseau local ne sera peut-être pas la même ; 
* si on souhaite brancher un Raspberry PI sur un routeur avec un DHCP, il faudra supprimer les modifications du fichier _cmdline.txt_.

Je vous propose dans cette section de rendre accessible le nom d'hôte de votre Raspberry PI depuis votre Windows. Suivre les indications suivantes.

* Se connecter en SSH vers le Raspberry PI.

* Par défaut, le **hostname** du Raspberry PI est _raspberrypi_. Si vous souhaitez le changer, modifier les fichiers _/etc/hostname_ et _/etc/hosts_. Ne pas oublier de faire un reboot après changement.

* Depuis le système Raspberry PI, installer le package Samba :

```console
sudo apt-get install samba
```

* Éteindre votre Raspberry PI et connecter la carte SD sur votre portable PC afin de supprimer dans le fichier _cmdline.txt_ les modifications que vous aviez apportées.

* Connecter votre carte SD sur le Raspberry PI et allumer le.

* Pour connaître l'IP de votre Raspberry PI depuis Windows, faites simplement

```console
ping raspberrypi
```

À noter que si vous avez plusieurs Raspberry PI sur le réseau (ce qui n'est pas notre cas ici car c'est du point à point), penser à rendre unique le nom d'hôte.  

## Exécuter son premier programme Java

À la première connexion sur le Raspberry PI, j'ai été surpris de voir que la version 8 de Java était installée. Je m'attendais à la version 7. Disposant d'une JVM, j'ai donc décidé de la tester.  

* Créer un fichier appelé HelloWorld.java à partir de nano :

```console
sudo nano HelloWorld.java
```

* Saisir le bout de code ci-dessous :

```java
public class HelloWorld {  
  public static void main(String\[\] argv) {  
    System.out.println("Hello World");  
  }  
}
```

* Compiler via la commande suivante :

```console
javac HelloWorld.java
```

* Exécuter le programme Java :

```console
java HelloWorld
```

* Java vous dit _bonjour_ et de mon côté je vous dis à bientôt.

## Ressources

* [http://pihw.wordpress.com/guides/direct-network-connection/super-easy-direct-network-connection/](http://pihw.wordpress.com/guides/direct-network-connection/super-easy-direct-network-connection/)
* [https://anwaarullah.wordpress.com/2013/08/12/sharing-wifi-internet-connection-with-raspberry-pi-through-lanethernet-headless-mode/](https://anwaarullah.wordpress.com/2013/08/12/sharing-wifi-internet-connection-with-raspberry-pi-through-lanethernet-headless-mode/)
* [http://n00blab.com/](http://n00blab.com/)