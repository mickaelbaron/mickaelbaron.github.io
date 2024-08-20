---
title: J'ai besoin... de construire une PirateBox
tags: [Divers]
blogger_orig_url: https://keulkeul.blogspot.com/2012/09/jai-besoin-de-construire-une-piratebox.html
description: Ce billet s'intéresse à construire une PirateBox pour partager des données de manière anonyme.
category: technical
toc: true
---

Suite à un article publié sur [Le Monde](http://www.lemonde.fr/technologies/article/2012/07/06/boites-pirates-hacktivistes-et-monde-physique_1730501_651865.html), j'ai découvert une [conférence vidéo](http://www.youtube.com/watch?v=jdogMpsmQos&feature=player_embedded) de [Gaël Musquet](http://www.linkedin.com/in/gmusquet) donnée à l'occasion du festival [Pas Sage en Seine](http://www.passageenseine.org/) et qui présentait le principe de la [PirateBox](http://fr.wikipedia.org/wiki/PirateBox). Une PirateBox est un réseau sans fil, local qui permet d'échanger des fichiers de manière anonyme. L'idée m'est alors venue de créer une PirateBox afin de pouvoir partager mes différents outils de développements préférés (Eclipse, Java...). Cela est aussi une occasion de découvrir des choses intéressantes sur l'installation et la configuration d'un système embarqué comme [OpenWRT](https://openwrt.org/).

L'objectif de ce billet et donc de vous présenter une installation d'une PirateBox. A vrai dire il s'agit d'une installation un peu particulière puisqu'elle ne s'est pas déroulée correctement. En effet, la mise à jour du firmware du routeur n'a pas réussi et j'ai du passer par une communication port série pour résoudre le problème.

Dans le cas où vous souhaitez des tutoriels plus concis et qui montrent les étapes pour installer une PirateBox dans les cas classiques, je vous conseille les suivants :  

* [https://docs.google.com/file/d/0B29hOjS3UlFmNmYtLWVsYUNodjA/edit](https://docs.google.com/file/d/0B29hOjS3UlFmNmYtLWVsYUNodjA/edit%20) ;
* [http://pirateboxfr.com/tutorielmr3020/](http://pirateboxfr.com/tutorielmr3020/) ;
* [http://wiki.daviddarts.com/PirateBox\_DIY\_OpenWrt](http://wiki.daviddarts.com/PirateBox_DIY_OpenWrt) ;
* [http://forum.daviddarts.com/read.php?2,3456](http://forum.daviddarts.com/read.php?2,3456).

Pour créer une PirateBox, j'ai utilisé le matériel suivant :

* Router [TP-Link MR3020](http://www.tp-link.fr/products/details/?model=TL-MR3020) V1.7 disponible sur [Amazon](http://www.amazon.fr/TP-Link-TL-MR3020-Routeur-portable-3-75G/dp/B00634PLTW/ref=pd_cp_computers_0),
* Batterie [Tecknet 7000 mAh](http://www.tecknetonline.co.uk/products/TeckNet%C2%AE-iEP387-7000mAh-Universal-USB-Power-Bank-%28Black%29.html) pour être autonome au niveau de l'alimentation électrique. Prévoir une capacité élevée pour augmenter la durée ~ 14 heures disponible sur [Amazon](http://www.amazon.fr/TeckNet-Dual-Port-iEP387-II-incroyable-Blackberry/dp/B0041OQFAU/ref=sr_1_1?s=electronics&ie=UTF8&qid=1346576527&sr=1-1),
* Clé USB 32 GO pour stocker les données. Il est possible d'utiliser une disque externe mais il faudra penser à l'alimenter ce qui pourra réduire considérablement l'autonomie de la batterie.

Concernant le matériel pour la communication port série, j'y reviendrai plus tard. C'est un passage obligé s'il ne vous est plus possible de passer par la voie Ethernet.

Au niveau logiciel, j'ai utilisé :  

* Windows 7 ;
* Putty pour la communication Telnet, SSH et COM ;
* le [firmware](http://downloads.openwrt.org/snapshots/trunk/ar71xx/openwrt-ar71xx-generic-tl-mr3020-v1-squashfs-factory.bin) OpenWR ;
* le package PirateBox.

Pour les différentes étapes, je vais suivre un ordre chronologique.  

## Déballage du routeur TP-Link MR3020

Ayant reçu rapidement mon routeur TP-Link MR3020 commandé sur Amazon, je décide de me lancer dans la création de ma PirateBox. Premier constat, j'ai l'impression de déballer un produit Apple (IPod, IPhone). L'emballage est très ressemblant. Le contenu contient un routeur, une alimentation un cable USB et un câble Ethernet.  

![Emballage du TP-Link MR3020](/images/emballagetplink.jpg)

![Contenu de l'emballage du TP-Link MR3020](/images/contenutplink.jpg)

## Connexion au routeur TP-Link MR3020

Je m'assure avec tout que l'interrupteur du routeur est en mode « Wisp ». Je branche ensuite l'alimentation du routeur via le micro USB vers le port USB de mon portable. De même, je branche le câble Ethernet du routeur à mon portable. Enfin, je passe en WIFI afin de conserver la connexion internet sur mon portable PC.

![Connexion du TP-Link MR3020](/images/connectionmr3020.jpg)

* Ouvrir l'URL suivante _http://192.168.0.254_ à partir de n'importe quel navigateur. Le nom d'utilisateur et le mot de passe sont 'admin'.

## Mise à jour du firmware du routeur

* Depuis le menu de gauche, choisir l'élément _System Tools_ ;

* Choisir alors l'entrée _Firmware Upgrade_ puis sélectionner le fichier _openwrt-ar71xx-generic-tl-mr3020-v1-squashfs-factory.bin_ (téléchargé [ici](http://downloads.openwrt.org/snapshots/trunk/ar71xx/openwrt-ar71xx-generic-tl-mr3020-v1-squashfs-factory.bin)).

* Faire la mise à jour en cliquant sur _Upgrade_. L'installation va procéder et aucun message d'erreur ne devrait apparaitre. Il est ensuite indiqué que le routeur va redémarrer.  

Historiquement il ne s'agit pas du même fichier que j'avais utilisé. Le précédent concernait la version 1.6 du routeur et l'installation sur la 1.7 (la version de mon routeur) a abouti à un problème d'activation du réseau. On va donc considérer par la suite que le connexion réseau vers le routeur ne fonctionne pas.

## Le blackout, le début des problèmes

Le routeur redémarre et d'après les différents tutoriels que j'ai suivis, l'étape suivante consistait à se connecter en Telnet au routeur. J'ai utilisé le _Telnet_ de Putty via la configuration suivante :

![Configuration Telnet avec Putty](/images/telnetputty.jpg)

Le problème c'est que rien ne se produisait, le routeur ne répondait pas. Un test _ping_ pour s'assurer de l'existence d'une connexion active n'a rien donné. Comme j'étais en DHCP sur ma configuration réseau, j'ai configuré en IP fixe pour avoir une classe d'adresses identique au routeur. Cela n'a également rien donné. J'ai décidé de _rebooter_ le routeur et réitérer les différentes commandes précédentes, mais pas plus de changement.

J'ai découvert sur les différents forums qu'il existait un [Safe Mode](http://www.youtube.com/watch?v=sm9-_z6qroE) sur le routeur. Pour l'activer, il faut éteindre le routeur et le rebrancher. Dés que la première LED s'allume, il faut appuyer longtemps sur le seul bouton du routeur. Le résultat que vous devez obtenir est que la première LED clignote très rapidement. Mais le Safe Mode n'a rien changé non plus. À cette étape, j'ai bien pensé que mon routeur était mort.

## Les forums PirateBox et le WIKI OpenWRT

Le site [PirateBox](http://wiki.daviddarts.com/PirateBox) contient un [forum](http://forum.daviddarts.com/list.php?2) que j'ai parcouru pour tenter de trouver un message qui décrirait à peu près mon problème. C'était pas glorieux, il n'y avait pas grand chose. En fait, je me rendais compte que la version du routeur que je possédais était récente. J'ai donc décidé après m'être assuré que le problème n'était pas résolu de poster un message sur ce forum ([Cannot connect in telnet after the OpenWRT firmware installation](http://forum.daviddarts.com/read.php?2,4459)). Après plusieurs Allé / Retour sur cette discussion et sur le forum OpenWRT, j'en suis venu à la conclusion que seule une connexion via le port série était possible.  

## Achat du module série

Depuis le [WIKI d'OpenWRT](http://wiki.openwrt.org/toh/tp-link/tl-mr3020) pour le MR3020, une section décrit comment communiquer via le port série. Il est préconisé d’acheter un composant tout prêt qui permet d'utiliser le port série via une entrée USB. En fait je ne me sentais pas capable de monter un circuit _from scratch_. Je me suis donc orienté vers ce module [FTDI Basic Breakout - 3.3V](https://www.sparkfun.com/products/9873?). J'ai également pris [cela](http://www.sparkfun.com/products/9140) pour que les branchements soient plus faciles.

## Le bricolage et la soudure

Tout d'abord il faut accéder à l'intérieur du routeur. Pour cela il faut vous munir d'un petit pied de biche en plastique et ouvrir le couvercle côté LED (vous pouvez essayer avec un tournevis au risque de rayer le plastique).  

![Outil pour ouvrir le dessus du routeur](/images/outilplastique.JPG)

* Il n'y a aucune vis pour retenir le circuit imprimé du routeur, retirer donc le de son logement en plastique afin de faciliter les opérations de soudure.

Le port série est identifiable via les quatre petits fiches / trous placé(e)s en ligne.  

![Identification des fiches du port série du TP-Link MR3020](/images/portserie.jpg)

Deux solutions s'offraient à moi pour connecter les fils sur le circuit imprimé. La première était de dénuder quatre fils et d'effectuer un point de soudure pour chaque trou. Le problème s'est la fragilité des fils. La seconde s'était d'essayer de reproduire une fiche mâle. C'est la seconde solution qui a été choisie.

Pour trouver la bonne taille de connectique, j'ai utilisé des aiguilles à coudre. Pour les points de soudure, faites les par le dessous du circuit imprimé. Vous devriez obtenir le résultat suivant. J'ai fait un test au voltmètre pour m'assurer que les points de soudure étaient correctement réalisés.

## Connexion via le port série du routeur TP-Link MR3020

Sur le routeur, la première fiche est identifiée par _p1_. Les fiches désignent dans l'ordre :  

* p1 : TX ;
* p2 : RX ;
* p3 : GND (masse) ;
* p4 : VCC.

Sur le module USB/Série, le rôle des fiches est directement imprimé :  

* p1 : GND (masse) ;
* p2 : CTS ;
* p3 : Power 3.3V ;
* p4 : TX ;
* p5 : RX ;
* p6 : DTR.

Naturellement j'ai fait correspondre les TX, RX et GND. Pour le VCC, j'ai branché l'alimentation. Toutefois, ça ne fonctionnera pas. Suivre alors les modifications suivantes.

Il faut supprimer l'alimentation (VCC) pas de _p4_ et intervertir TX et RX. Vous obtiendrez le résultat suivant :

![Connexion TP-Link MR3020 avec le module [FTDI Basic Breakout - 3.3V](https://www.sparkfun.com/products/9873?)](/images/connectionserie.jpg)

* Il faut ensuite connecter le module USB/Série sur votre PC et alimenter le router via le mini USB.

* Il faut par ailleurs identifier le port virtuel COM employé par le module USB/Série. Dans mon cas c'était le COM5.

* Depuis l'application Putty, paramétrer les informations afin d'effectuer une connexion en port série en s'assurant que les paramétrages suivants sont respectés :  

* Bits per second: 115200 ;
* Data bits: 8 ;
* Stop bits: 1 ;
* Parity: None ;
* Flow control: None.

* Faire Open, vous devriez maintenant obtenir une communication avec OpenWRT. Si ça ne fonctionne pas assurez-vous que lorsque vous _tappotez_ sur le clavier de votre PC les LED du module USB/Série clignotent. Vérifier également les points de soudure et contrôler enfin les branchements.

## Mise à jour du firmware

À cette étape, j'arrive à me connecter au routeur. Je peux parcourir le contenu et m'apercevoir que tout le contenu de l'OpenWRT a l'air correcte. Un reboot du routeur me permet de remarquer que le configuration réseau pose problème. Il fallait donc que je trouve un moyen de mettre à jour ce firmware en m'assurant d'utiliser une version correcte pour mon routeur. J'ai pris le parti d'utiliser une clé USB et de déposer le firmware dézippé dedans.  

* Depuis Windows, copier le nouveau firmware dé-zippé sur une clé.
  
* Brancher cette clé sur le routeur et procéder à son montage.

```console
mount /dev/sda1 /mnt/usb
```

* Copier le firmware dans le répertoire /tmp  

* Exécuter cette instruction et attendez que la mise à jour soit terminée  

```console
mtd -r write openwrt-ar71xx-generic-tl-mr3020-v1-squashfs-factory.bin firmware
```

## Installer PirateBox

Pour le reste de l'installation de la PirateBox, je ne vais pas faire un copier/coller des nombreux tutoriels qui existent. Vous pouvez suivre [celui-ci](https://docs.google.com/file/d/0B29hOjS3UlFmNmYtLWVsYUNodjA/edit) qui est très bien fait.

## Conclusion

Au début de ce challenge, je ne pensais pas qu'il allait m'arriver ce genre de mésaventure. En y réfléchissant, je ressentis lors du plantage une certaine frustration du fait que j'avais acheté le routeur et que peut-être il ne me servirait pas à grand chose. Un peu de patience, des recherches sur Internet, des [gens motivés](http://forum.daviddarts.com/profile.php?2,48) et le tour est joué : j'ai maintenant ma PirateBox.