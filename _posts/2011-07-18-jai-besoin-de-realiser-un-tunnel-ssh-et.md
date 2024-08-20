---
title: J'ai besoin ... de réaliser un tunnel SSH et me connecter à un Proxy HTTP
tags: [Divers]
blogger_orig_url: https://keulkeul.blogspot.com/2011/07/jai-besoin-de-realiser-un-tunnel-ssh-et.html
description: Je vous propose un billet pour décrire pas à pas la mise en place d'un tunnel ou pont SSH.
category: technical
toc: true
---

Je vous propose un billet un peu particulier puisque cela ne va pas traiter de Java ou d'Eclipse mais de configuration réseau. L'idée est de décrire pas à pas la mise en place d'un tunnel ou pont SSH. L'intérêt est de pouvoir encapsuler des données d'un protocole dans un autre protocole (ici le protocole SSH) et ainsi assurer une sécurité puisque les données qui transiteront dans le tunnel SSH seront chiffrées.

Dans mon cas, je voulais savoir si je pouvais réaliser un tunnel SSH pour me connecter à un proxy HTTP le tout de manière sécurisée. L'idée avant tout est d'outrepasser les droits d'un sous réseau ayant bien entendu laisser ouvert le port 22 du protocole SSH.

La mise en place d'un tunnel SSH nécessite du côté serveur, un serveur logiciel SSH et un proxy HTTP. Du côté client, une connexion au protocole SSH via un client et un paramétrage sur le navigateur seront nécessaires.

## Ma configuration réseau et pré-requis logiciels

Comme vous pouvez vous en doutez toutes les configurations qui vont suivre sont fortement dépendantes de la nature de votre réseau. Je vous propose ci-dessous ma configuration réseau sur les deux côtés.

### Serveur

* Windows 7
* Une BBox Bouygues Telecom
* Privoxy (pour le proxy HTTP)
* MobaSSH (serveur SSH)

### Client

* Windows 7
* Sous réseau avec le protocole SSH (port 22) ouvert
* Firefox (navigateur Web)
* Client SSH PUTTY  

Il est clair que cela fonctionne également avec d'autres outils et systèmes d'exploitation. Pour les logiciels j'ai choisi la simplicité et la gratuité.  
  
## Serveur

Je vous propose dans cette section une description détaillée de l'installation et de la configuration des logiciels et du paramétrage réseau.

### Serveur SSH

Sous Windows, je n'ai pas trouvé de serveur SSH qui n'encapsule pas le serveur SSH (OpenSSH) fournit par Cygwin. Il existe différentes distributions plus ou moins compliquées. J'utilise MobaSSH ([http://mobassh.mobatek.net/](http://mobassh.mobatek.net/)) qui reste très simple en installation et en configuration.

* Après téléchargement du ZIP, exécuter l'exécutable *MobaSSH\_Server\_Home\_1.XX.exe*.

* N'appuyer pas sur le bouton *Install It Now* avant d'avoir autorisé la création de tunnel SSH (*Settings -> PermitTunnel -> yes*).

![/images/01-mobassh.png](/images/01-mobassh.png)

* Choisir ensuite les comptes utilisateur Windows qui pourront se connecter au serveur SSH quitte à créer un compte spécifique (Users).

* Cliquer sur le bouton Install It Now et le serveur SSH s'installera comme service Windows.

### Proxy HTTP

Du côté Proxy HTTP, j'ai choisi un petit programme tout simple Privoxy disponible en téléchargement sur cette page ([http://www.privoxy.org/](http://www.privoxy.org/)).

* Choisir une version stable et sous Windows (*privoxy\_setup\_3.0.17.exe*).

* Installer le programme et choisir par les options par défaut.

De nombreuses configurations sont nécessaires, vous pouvez toutefois laisser par défaut les paramètres. Le port du Proxy HTTP utilisé est 8118.

### Configuration du pare-feu de Windows

Pour que vos serveurs soit accessibles au niveau de votre sous réseau, il va falloir indiquer au pare-feu Windows de laisser passer les données sortant du serveur SSH (port 22) et du Proxy HTTP (port ...). Pour cela nous allons définir des règles

* Panneau de Configuration -> Pare-feu Windows.

* Sur la colonne de gauche choisir Paramètres avancés, une interface liée aux fonctions avancées de sécurité doit s'afficher (voir capture d'écran ci-dessous).

![/images/01-firewall.png](/images/01-firewall.png)

* Ajouter une nouvelle règle pour le trafic entrant concernant le port 8118 lié au proxy (bouton droit sur Règles de trafic entrant -> Nouvelle règle ... puis choisir une règle de type Port \-> TCP et saisir dans Ports locaux spécifiques la valeur 8118).

* Ajouter une nouvelle règle pour le trafic entrant concernant le port 22 lié au protocole SSH (bouton droit sur Règles de trafic entrant -> Nouvelle règle ... puis choisir une règle de type Port \-> TCP et saisir dans Ports locaux spécifiques la valeur 22).

* Ajouter une nouvelle règle pour le trafic sortant concernant le port 8118 lié au proxy (bouton droit sur Règles de trafic sortant -> Nouvelle règle ... puis choisir une règle de type Port \-> TCP et saisir dans Ports locaux spécifiques la valeur 8118).

* Finalement, ajouter une nouvelle règle pour le trafic sortant concernant le port 22 lié au protocole SSH (bouton droit sur Règles de trafic sortant -> Nouvelle règle ... puis choisir une règle de type Port \-> TCP et saisir dans Ports locaux spécifiques la valeur 22).

* Fermer la fenêtre de configuration des fonctions avancées de sécurité.

### Configuration du pare-feu de la Box  

Pour la configuration du pare-feu de la Box (pour moi il s'agit d'une BBox Bouygues Telecom) il faut passer par l'interface du routeur qui est donc spécifique au fournisseur d'accès. Si vous êtes chez FREE, SFR ou autre, le principe reste le même. L'idée ici est de rediriger les requêtes que la Box reçoit sur un port donné vers ma machine (appartenant au sous-réseau) contenant le serveur SSH et le proxy HTTP. Bref, rien de bien sorcier, voici ci-dessous la procédure.

* Se connecter à l'interface d'administration du routeur de la BBox ([http://192.168.1.254/](http://192.168.1.254/)).

* Sur la partie gauche, choisir le menu *Configuration Avancée -> Configuration du routeur*.

* Choisir l'onglet *NAT/PAT*.

* Se connecter via le compte *administrateur*.

* Choisir la règle *SSH Server - Secure Shell* et modifier la de telle sorte que l'IP de la machine contenant le serveur SSH soit correcte (dans mon cas il s'agit de 192.168.1.6).

* Valider et vérifier que la règle a été ajoutée comme montrée sur la capture d'écran ci-dessous.

![/images/01-bbox.png](/images/01-bbox.png)

## Client

Du côté client, normalement pas sur le même sous réseau que la partie serveur, nous avons à installer un client SSH et à configurer le navigateur Web. Il est bien évident que le port 22 du protocole SSH doit être ouvert, sinon la manipulation ne va pas être possible.
  
### Putty

Putty est un client Telnet et SSH qui offre de très nombreux paramétrages. Il est disponible en téléchargement sur le site suivant ([http://www.chiark.greenend.org.uk/~sgtatham/putty/](http://www.chiark.greenend.org.uk/%7Esgtatham/putty/)). Je vous décris ci-dessous le paramétrage nécessaire.

* Ouvrir le menu Session, vous devriez obtenir la capture d'écran ci-dessous.

![/images/01-putty.png](/images/01-putty.png)

* Dans la zone de texte Host Name (or IP address), saisir l'IP attribuée à votre Box. Cette information est connue depuis l'accueil de l'interface administration de votre BBox ([http://192.168.1.254/](http://192.168.1.254/)) au niveau de la section Internet.

* Ouvrir le menu _Connection -> SSH -> Tunnels_ pour configurer les informations de votre futur Tunnel SSH (voir capture d'écran ci-dessous).

![/images/02-putty.png](/images/02-putty.png)

* Nous souhaitons indiquer ici qu'à la sortie du Tunnel SSH, les requêtes devront être redirigées vers l'IP 192.168.1.6 du port 8118. Cette adresse est l'IP local de mon serveur contenant le serveur SSH et Proxy.

* Revenir dans le menu *Session* puis donner un nom à cette configuration (exemple : Serveur SSH/Proxy) puis faire _Save_.

* Finalement, faire *Open* pour se connecter au serveur SSH.

* Si tout a été correctement configuré côté serveur, la connexion vers le serveur SSH doit fonctionner. Une authentification est requise vers un compte Windows contenant le serveur SSH (voir capture d'écran ci-dessous).

![/images/03-putty.png](/images/03-putty.png)

* La connexion SSH vous permet de vous déplacer dans l'arborescence de votre compte distant. Pour utiliser en tunnel, vous devez uniquement laisser cette connexion ouverte.

### Configuration du navigateur Web

Cette étape est la plus simple mais il faut faire attention à ne pas se tromper dans l'adressage du Proxy HTTP. Ici, le proxy HTTP est accessible via l'IP 127.0.0.1:8118 qui est l'entrée du tunnel.

* Ouvrir votre navigateur préféré (ici ça sera FireFox 5).

* Depuis le menu ouvrir la boîte de dialogue des options (Outils -> Options).

* Sélectionner l'onglet Avancé et le sous onglet Réseau, puis faire apparaître les paramètres de connexion (bouton Paramètres).

* Sélectionner Configuration manuelle du proxy et saisir dans la zone Proxy HTTP la valeur 127.0.0.1 et dans la zone Port la valeur 8118 (voir capture d'écran ci-dessous).

![/images/01-firefox.png](/images/01-firefox.png)

* Faire *OK*.

Normalement tout devrait fonctionner. Toutes requêtes HTTP passent par votre tunnel SSH. Vous pouvez surfer en toute sécurité.

Il est possible d'aller plus loin comme par exemple la mise en place d'un VPN. Pour cela, la toile propose de nombreux tutoriels qui vous faciliteront la vie.