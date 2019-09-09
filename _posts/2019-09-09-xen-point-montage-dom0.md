---
title: J'ai besoin de... monter une image d'un disque virtuel (VDI) sur un système hôte Xen (dom0)
tags: [Xen]
category: technical
description: Dans ce billet, j’explique comment accéder à une image de disque virtuel (VDI) depuis un système hôte Xen en realisant un point de montage.
twitter: 
---

Depuis 2009, le système de virtualisation choisi au sein de la structure où je travaille est l'hyperviseur [Citrix Hypervisor](https://www.citrix.fr/downloads/citrix-hypervisor/) (anciennement XenServer depuis le passage à la 8.0) basé sur le projet open source [Xen](https://xenproject.org/). Nous exploitons la version XenServer 7.6 Free Edition sur cinq serveurs. Les machines virtuelles servent essentiellement pour réaliser des expérimentations sur des bases de données, l'hébergement d'applicatifs (les outils de la forge par exemple) et parfois pour l'enseignement. Du fait de la version Free Edition, de nombreuses fonctionnalités d'administration des machines virtuelles ne sont pas disponibles depuis le client par défaut XenCenter (application Windows uniquement). Pour pallier à ces limitations, il existe deux autres clients : [XenOrchestra](https://xen-orchestra.com) (application web) et les outils en ligne commande. Pour ces outils, il en existe deux principalement : [xl](https://wiki.xen.org/wiki/XL) (utilisé majoritairement par le projet open source [Xen](https://xenproject.org/) et [xe](https://xenproject.org/developers/teams/xen-api/) (utilisé par XenServer).

Très recemment, je n'ai pas réussi à redémarrer une machine virtuelle Linux Ubuntu 16.04. Le problème venait du noyau Linux de la machine virtuelle qui était corrompu (problème sur une mise à jour). Je me suis donc intéressé à réparer la partition contenant les noyaux Linux (localisés dans le répertoire _/boot_).

Dans ce billet, j’explique comment accéder à une image de disque virtuel (VDI) depuis un système hôte Xen.

## Glossaire

Avant d'expliquer comment j'ai procédé, je vais rapidement présenter les différents concepts que nous allons manipuler.

* *Universally Unique IDentifier* (UUID) : identifiant unique qui correspond à un objet Xen (tous les types d'objet Xen sont présentés par la suite).
* *Virtual Machine* (VM) : un objet qui représente une machine virtuelle identifié par `VM_UUID`.
* *Domain-0* ou *dom0* : il s'agit de la machine virtuelle par défaut qui contrôle l'hyperviseur.
* *Storage Repository* (SR) : le dépôt de stockage qui stocke les données et identifié par `SR_UUID`. Un dépôt de stockage peut-être un lecteur de disque optique, un disque de stockage, un point de montage...
* image d'un disque virtuel (VDI) : un objet qui représente un disque virtuel identifié par `VDI_UUID`. Une image d'un disque virtuel est contenue dans un dépôt de stockage (SR).
* *Virtual Block Device* (VBD) : un objet qui permet de faire la liaison (attacher) entre une image d'un disque virtuel (VDI) et une machine virtuelle. L'objet VBD est identifié par `VBD_UUID`.

## Procédure

Dans la suite, nous allons supposer que nous disposons d'une machine virtuelle Linux appelée *test* et dont le nom du disque virtuel attaché s'appelle *test_disk*.

* Récupérer l'identifiant `VM_UUID` de la machine virtuelle intitulée *test*.

```console
$ xe vm-list name-label=test
uuid ( RO)           : 4a1cb250-342c-4b35-8bd9-efc78ca2c261
     name-label ( RW): test
    power-state ( RO): halted
```

Dans notre cas `VM_UUID` vaut `4a1cb250-342c-4b35-8bd9-efc78ca2c261`.

* Récupérer l'identifiant `VM_UUID` de la machine qui contrôle l'hyperviseur (*dom0*). C'est via cette machine virtuelle que nous allons attacher le disque virtuel de *test*.

```console
$ xe vm-list | grep -B 1 -A 1 -e Control
uuid ( RO)           : a7b6b8bd-8a5d-4773-9bc2-bbe2192b015a
     name-label ( RW): Control domain on host: s-virtualserver
    power-state ( RO): running
```

Dans notre cas `VM_UUID` vaut `a7b6b8bd-8a5d-4773-9bc2-bbe2192b015a`.

* Récupérer l'identifiant `VDI_UUDI` de l'image du disque virtuel qui s'appelle *test_disk*.

```console
$ xe vdi-list name-label=forgedisk
uuid ( RO)                : 4a30bd24-d21a-4130-9198-fcbb20d1265a
          name-label ( RW): test_disk
    name-description ( RW):
             sr-uuid ( RO): 258b621a-d3af-fd5b-ea1b-b122a7ad5c3d
        virtual-size ( RO): 268435456000
            sharable ( RO): false
           read-only ( RO): false
```

Dans notre cas `VDI_UUDI` vaut `4a30bd24-d21a-4130-9198-fcbb20d1265a`.

* Créer un *Virtual Block Device* (VBD) à partir de l'identifiant de la machine virtuelle *dom0* qui contrôle l'hyperviseur (`VM_UUID=a7b6b8bd-8a5d-4773-9bc2-bbe2192b015a`) et du disque *test_disk* (`VDI_UUDI=4a30bd24-d21a-4130-9198-fcbb20d1265a`).

```console
$ xe vbd-create device=autodetect vm-uuid=a7b6b8bd-8a5d-4773-9bc2-bbe2192b015a vdi-uuid=4a30bd24-d21a-4130-9198-fcbb20d1265a bootable=false mode=RO type=Disk
4819e930-1694-0882-7027-efabba902324
```

Un identifiant `VBD_UUDI` sera retourné. Conservez le il nous sera utile jusqu'à la fin.

* Attacher le disque à la machine virtuelle *dom0*.

```console
xe vbd-plug uuid=4819e930-1694-0882-7027-efabba902324
```

* Nous pouvons vérifier que le disque est disponible.

```console
...
$ fdisk -l
...
Disque /dev/tdc : 268.4 Go, 268435456000 octets, 524288000 secteurs
Unités = secteur de 1 × 512 = 512 octets
Taille de secteur (logique / physique) : 512 octets / 512 octets
taille d'E/S (minimale / optimale) : 512 octets / 512 octets
Type d'étiquette de disque : dos
Identifiant de disque : 0xc7b2b1f2

Périphérique Amorçage  Début         Fin      Blocs    Id. Système
/dev/tdc1            2048      999423      498688   83  Linux
/dev/tdc2         1001470   524285951   261642241    5  Extended
/dev/tdc5         1001472   524285951   261642240   8e  Linux LVM
```

* Utiliser l'outil **kpartx** pour créer des périphériques à partir des tables de partitions contenu dans l'image du disque virtuel.

```console
kpartx -av /dev/sm/backend/258b621a-d3af-fd5b-ea1b-b122a7ad5c3d/4a30bd24-d21a-4130-9198-fcbb20d1265a
add map 4a30bd24-d21a-4130-9198-fcbb20d1265a1 (253:3): 0 997376 linear /dev/sm/backend/258b621a-d3af-fd5b-ea1b-b122a7ad5c3d/4a30bd24-d21a-4130-9198-fcbb20d1265a 2048
add map 4a30bd24-d21a-4130-9198-fcbb20d1265a2 (253:4): 0 2 linear /dev/sm/backend/258b621a-d3af-fd5b-ea1b-b122a7ad5c3d/4a30bd24-d21a-4130-9198-fcbb20d1265a 1001470
add map 4a30bd24-d21a-4130-9198-fcbb20d1265a5 (253:5): 0 523284480 linear /dev/sm/backend/258b621a-d3af-fd5b-ea1b-b122a7ad5c3d/4a30bd24-d21a-4130-9198-fcbb20d1265a 1001472
```

Trois périphériques ont été créés et sont disponibles dans le répertoire */dev/mapper/*.

* S'assurer que le dossier */dev/mapper/* contient trois fichiers dont le nom débute par l'UUID de l'image du disque virtuel.

```console
$ ls /dev/mapper
lrwxrwxrwx 1 root root        7  6 sept. 23:18 4a30bd24-d21a-4130-9198-fcbb20d1265a1 -> ../dm-3
lrwxrwxrwx 1 root root        7  6 sept. 23:18 4a30bd24-d21a-4130-9198-fcbb20d1265a2 -> ../dm-4
lrwxrwxrwx 1 root root        7  6 sept. 23:18 4a30bd24-d21a-4130-9198-fcbb20d1265a5 -> ../dm-5
...
```

* Nous pouvons vérifier que les partitions sont disponibles via la commande suivante.

```console
...
$ fdisk -l
...
Disque /dev/tdc : 268.4 Go, 268435456000 octets, 524288000 secteurs
Unités = secteur de 1 × 512 = 512 octets
Taille de secteur (logique / physique) : 512 octets / 512 octets
taille d'E/S (minimale / optimale) : 512 octets / 512 octets
Type d'étiquette de disque : dos
Identifiant de disque : 0xc7b2b1f2

Périphérique Amorçage  Début         Fin      Blocs    Id. Système
/dev/tdc1            2048      999423      498688   83  Linux
/dev/tdc2         1001470   524285951   261642241    5  Extended
/dev/tdc5         1001472   524285951   261642240   8e  Linux LVM

Disque /dev/mapper/4a30bd24-d21a-4130-9198-fcbb20d1265a1 : 510 Mo, 510656512 octets, 997376 secteurs
Unités = secteur de 1 × 512 = 512 octets
Taille de secteur (logique / physique) : 512 octets / 512 octets
taille d'E/S (minimale / optimale) : 512 octets / 512 octets

Vous devez initialiser cylindres.
Vous pouvez faire cela depuis le menu des fonctions avancées.

Disque /dev/mapper/4a30bd24-d21a-4130-9198-fcbb20d1265a2 : 0 Mo, 1024 octets, 2 secteurs
Unités = secteur de 1 × 512 = 512 octets
Taille de secteur (logique / physique) : 512 octets / 512 octets
taille d'E/S (minimale / optimale) : 512 octets / 512 octets
Type d'étiquette de disque : dos
Identifiant de disque : 0x00000000

                                     Périphérique Amorçage  Début         Fin      Blocs    Id. Système
/dev/mapper/4a30bd24-d21a-4130-9198-fcbb20d1265a2p1               2   523284481   261642240   8e  Linux LVM

Disque /dev/mapper/4a30bd24-d21a-4130-9198-fcbb20d1265a5 : 267.9 Go, 267921653760 octets, 523284480 secteurs
Unités = secteur de 1 × 512 = 512 octets
Taille de secteur (logique / physique) : 512 octets / 512 octets
taille d'E/S (minimale / optimale) : 512 octets / 512 octets
```

* Monter le premier disque `4a30bd24-d21a-4130-9198-fcbb20d1265a1` permettant d'accéder à la partition dédiée aux noyaux Linux.

```console
mount /dev/mapper/4a30bd24-d21a-4130-9198-fcbb20d1265a1 /mnt/vdi
```

* Visualiser le contenu du point de montage `/mnt/vdi`.

```console
config-4.4.0-151-generic  grub                          initrd.img-4.4.0-138-generic  initrd.img-4.4.0-159-generic  System.map-4.4.0-151-generic  vmlinuz-4.4.0-151-generic
config-4.4.0-159-generic  initrd.img-4.4.0-137-generic  initrd.img-4.4.0-151-generic  lost+found                    System.map-4.4.0-159-generic  vmlinuz-4.4.0-159-generic
```

Ne reste plus qu'à placer un noyau correct et le tour est joué.

> Par curiosité, j'ai essayé de monter la partition contenant toutes les données de la machine virtuelle `4a30bd24-d21a-4130-9198-fcbb20d1265a5`. Malheureuement, je n'ai pas pu la monter du au fait qu'il s'agisse d'une partition de type `Linux LVM`.  Si par chance, vous avez un moyen pour le faire, n'hésitez pas à me contacter.

## Nettoyage

Une fois terminée, pensez à tout défaire. Je vous explique ci-dessous la procédure.

* Démonter le point de montage sur `/mnt/vdi`.

```console
umount /mnt/vdi
```

* Supprimer les périphériques supplémentaires créés à partir de l'outil **kpartx**.

```console
kpartx -d /dev/sm/backend/258b621a-d3af-fd5b-ea1b-b122a7ad5c3d/4a30bd24-d21a-4130-9198-fcbb20d1265a
```

* Détacher l'image de disque virtuel identifié par `4819e930-1694-0882-7027-efabba902324`.

```console
xe vbd-unplug uuid=4819e930-1694-0882-7027-efabba902324
```

* Détruire le VBD

```console
xe vbd-destroy uuid=4819e930-1694-0882-7027-efabba902324
```

## Conclusion

À partir de cette procédure, j'ai pu résoudre le problème de démarrage de la machine virtuelle Linux.

J'aurais souhaité également accéder au contenu du reste du disque. Malheureusement, les partitions de type `Linux LVM` sont pour l'instant impossible à monter. Je ne manquerai pas de compléter ce billet s'il y a des avancés dans mes expérimentations.

## Ressources

* https://discussions.citrix.com/topic/334905-mount-vm-disk-image-as-file-system-in-xenserver-6
* https://www.computerweekly.com/tip/How-to-mount-Xen-virtual-machine-storage-on-physical-hosts
