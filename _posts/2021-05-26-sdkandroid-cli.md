---
title: Installer le SDK Android depuis la ligne de commande
tags: [mobile]
category: technical
description: Un billet qui explique comment installer le SDK Android depuis la ligne de commande (CLI) sans passer par l'installation de Android Studio
---

Ce billet montrent comment installer le SDK [Android](https://www.android.com) sans passer par [Android Studio](https://developer.android.com/studio). Nous utiliserons les outils en ligne de commande nommés « Command Line Tools » qui fournissent l'outil **sdkmanager** pour télécharger la bonne version du SDK. 

Les avantages d'installer le SDK [Android](https://www.android.com) depuis la ligne de commande sont multiples. Tout d'abord, vous apprendrez à maîtriser l'installation sans passer par un outil graphique qui cache toutes les étapes. Ensuite, un éditeur graphique spécialisé comme [Android Studio](https://developer.android.com/studio) n'est utile que si vous développez avec le langage cible (par exemple Java ou Kotlin pour [Android](https://www.android.com)). On peut vouloir installer le SDK [Android](https://www.android.com) pour faire de l'intégration continue (CI) ou développer des applications mobiles via une approche hybride. Un excellent tutoriel sur le sujet est disponible sur mon [dépôt Github](https://github.com/mickaelbaron/vuejs-nativescript-tutorial).

## Installer le SDK Android

Le SDK de la plateforme [Android](https://www.android.com) est généralement stocké dans le répertoire utilisateur et ce chemin doit être déclaré dans la variable d'environnement `ANDROID_SDK_ROOT`. Les différentes possibilités sont les suivantes.

* Mac : _/Users/\<user\>/Library/Android/sdk_
* Windows : _C:\Users\\<user\>\AppData\Local\Android\Sdk_
* Linux : _/home/\<user\>/Android/Sdk_

Comme mes expérimentations se feront sous macOS, j'utiliserai le répertoire suivant _/Users/\<user\>/Library/Android/sdk_. Adapter ce chemin en fonction de votre système d'exploitation.

* Ouvrir un terminal, créer le répertoire du SDK et définir la variable d'environnement `ANDROID_SDK_ROOT` via les lignes de commande suivantes.

```console
$ mkdir /Users/<user>/Library/Android/sdk
$ export ANDROID_SDK_ROOT=/Users/<user>/Library/Android/sdk
$ export ANDROID_HOME=ANDROID_SDK_ROOT
```

La variable `ANDROID_HOME` est normalement *deprecated*, elle était antérieure à `ANDROID_SDK_ROOT`. Il est quand même préférable de l'initialiser.

* Saisir les commandes suivantes pour télécharger les « Command Line Tools » et décompresser l'archive dans le répertoire `ANDROID_SDK_ROOT` (la version téléchargée est 6858069. Si besoin, les dernières versions sont disponibles depuis cette page https://developer.android.com/studio).

```console
$ wget https://dl.google.com/android/repository/commandlinetools-mac-6858069_latest.zip -O $ANDROID_SDK_ROOT/clt.zip
$ unzip -qq $ANDROID_SDK_ROOT/clt.zip -d ${ANDROID_SDK_ROOT}/cmdline-tools
$ mv $ANDROID_SDK_ROOT/cmdline-tools/cmdline-tools $ANDROID_SDK_ROOT/cmdline-tools/tools
$ rm $ANDROID_SDK_ROOT/clt.zip
$ export PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/tools/bin
```

> La version Linux du « Command Line Tools » est disponible ici : <https://dl.google.com/android/repository/commandlinetools-win-6858069_latest.zip> et celle pour la version Windows est ici : <https://dl.google.com/android/repository/commandlinetools-linux-6858069_latest.zip>.

## Gérer les plateformes et les périphériques via sdkmanager

L'outil **sdkmanager** est désormains disponible puisque nous l'avons ajouté dans la variable d'environnement `PATH` (d'autres outils seront ajoutés par la suite). Il servira à gérer la plateforme et créer les périphériques virtuels. 

* Saisir les commandes suivantes pour les différents outils du SDK [Android](https://www.android.com) à savoir l'émulateur [Android](https://www.android.com) (répertoire _emulator_) et les outils pour communiquer avec les périphériques physiques et virtuels d'Android (répertoire _platform-tools_). 

```console
$ yes | sdkmanager --sdk_root=${ANDROID_SDK_ROOT} --licenses
$ sdkmanager --sdk_root=${ANDROID_SDK_ROOT} --install "platform-tools" "extras;google;instantapps" "emulator"
$ export PATH=$PATH:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/emulator
```

Nous donnons accès aux différents outils disponibles dans les répertoires _platform-tools_ et _emulator_ en modifiant la variable d'environnement `PATH`. 

L'état du dosser `$ANDROID_SDK_ROOT` devra être le suivant :

```console
.
├── cmdline-tools
├── emulator
├── extras
├── licenses
├── patcher
└── platform-tools
```

À cette étape, les outils du SDK [Android](https://www.android.com) sont prêts. Il ne reste plus qu'à préciser la version de l'API [Android](https://www.android.com) souhaitée et **sdkmanager** se chargera de le télécharger et de déposer les fichiers dans le répertoire `ANDROID_SDK_ROOT`. Nous donnons ci-dessous un tableau donnant la correspondance entre le nom de code, la version [Android](https://www.android.com) et la version de l'API. Ces trois informations sont différentes.

Nom | Version | Version API
:-: | :-: | :-:
Cake | 11.0 | Android-30 
Q | 10.0 | Android-29
Pie | 9.0 | Android-28
Oreo | 8.1 | Android-27
Oreo | 8.0 | Android-26 
Nougat | 7.1 | Android-25 
Nougat | 7.0 | Android-24 
Marshmallow | 6.0 | Android-23
Lollipop | 5.1 | Android-22
Lollipop | 5.0 | Android-21

Dans la suite, nous téléchargerons le nécessaire pour compiler une application [Android](https://www.android.com) et créer un périphérique virtuel basé sur la version 11 correspondant au niveau de l'API intitulé `Android 30`. Pour réaliser cela, il faudra télécharger trois contenus qui sont :

* **platforms** : les dépendances ;
* **system-images** : l'image Android utilisée par l'émulateur ;
* **build-tools** : les outils de construction de l'application.

Ces trois contenus seront stockés dans les répertoires respectifs `platforms`, `system-images` et `build-tools` localisés à la racine de `ANDROID_SDK_ROOT`. Il y aura autant de sous-répertoires dans ces répertoires que de niveau d'API [Android](https://www.android.com) téléchargé. Faisons le test avec le niveau de l'API intitulé `Android 30` (version recommandée pour la suite de exercices).

* Exécuter la ligne de commande suivante pour connaître les bons noms des contenus à télécharger.

```console
$ sdkmanager --list 
...
build-tools;30.0.3                           | 30.0.3 | Android SDK Build-Tools 30.0.3
...
platforms;android-30                         |  3     | Android SDK Platform 30
...
system-images;android-30;google_apis;x86_64  | 10     | Google APIs Intel x86 Atom_64 System Image
```

* Exécuter les lignes de commande ci-dessous pour télécharger tout le nécessaire de l'API 30 d'[Android](https://www.android.com).

```console
$ sdkmanager "platforms;android-30"
$ sdkmanager "system-images;android-30;google_apis;x86_64"
$ sdkmanager "build-tools;30.0.3"
```

* Pour vérifier que tout fonctionne correctement, exécuter la ligne de commande suivante.

```console
$ sdkmanager --list_installed
Installed packages:=====================] 100% Fetch remote repository...
  Path                                        | Version | Description                                | Location
  -------                                     | ------- | -------                                    | -------
  build-tools;30.0.3                          | 30.0.3  | Android SDK Build-Tools 30.0.3             | build-tools/30.0.3/
  emulator                                    | 30.3.5  | Android Emulator                           | emulator/
  extras;google;instantapps                   | 1.9.0   | Google Play Instant Development SDK        | extras/google/instantapps/
  patcher;v4                                  | 1       | SDK Patch Applier v4                       | patcher/v4/
  platform-tools                              | 30.0.5  | Android SDK Platform-Tools                 | platform-tools/
  platforms;android-30                        | 3       | Android SDK Platform 30                    | platforms/android-30/
  system-images;android-30;google_apis;x86_64 | 10      | Google APIs Intel x86 Atom_64 System Image | system-images/android-30/google_apis/x86_64/
```

Si nous affichons le contenu des répertoires `platforms`, `system-images` et `build-tools` vous devriez obtenir le résultat suivant.

```console
platforms
└── android-30
system-images
└── android-30
build-tools
└── 30.0.3
```

## Créer un émulateur

Il ne nous reste plus qu'à apprendre à créer un émulator basé sur la version 30 de l'API [Android](https://www.android.com).

* Exécuter la ligne de commande suivante pour lister les périphériques préconfigurés, c'est-à-dire des profils (mémoire utilisée, taille de l'écran...) de téléphones [Android](https://www.android.com) qui existent sur le marché. Vous pouvez bien entendu créer les vôtres.

```console
$ avdmanager list device
...
id: 28 or "pixel_xl"
    Name: Pixel XL
    OEM : Google
...
```

* Exécuter la ligne de commande suivante pour créer un périphérique virtuel [Android](https://www.android.com) (AVD) basé sur le périphérique préconfiguré *pixel_xl*.

```console
$ avdmanager create avd --name pixel_xl_30 --package "system-images;android-30;google_apis;x86_64" -d "28"
```

* Exécuter la ligne de commande suivante pour vérifier que le précédent AVD a été créé.

```console
$ avdmanager list avd
Available Android Virtual Devices:
    Name: pixel_xl_30
  Device: pixel_xl (Google)
    Path: /Users/baronm/.android/avd/pixel_xl_30.avd
  Target: Google APIs (Google Inc.)
          Based on: Android 11.0 (R) Tag/ABI: google_apis/x86_64
  Sdcard: 512 MB
```

* Enfin, exécuter la ligne de commande suivante pour démarrer un émulateur basé sur cet AVD nommé *pixel_xl*.

```console
$ emulator @pixel_xl_30
```

L'émulateur se lance, il n'y a plus qu'à attendre que la machine virtuelle soit complètement démarrée.

Afin de conserver tous les chemins configurés, veuillez indiquer à votre système d'exploitation que vous souhaitez conserver les variables d'environnement `ANDROID_SDK_ROOT`, `ANDROID_HOME` et modifier la variable d'environnement `PATH`. Par exemple, sous macOS, vous pouvez modifier les fichiers *.bashrc* ou *.zshrc* en ajoutant le contenu ci-dessous.

```console
$ export ANDROID_SDK_ROOT=/Users/<user>/Library/Android/sdk
$ export ANDROID_HOME=$ANDROID_SDK_ROOT
$ export PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/tools/bin
$ export PATH=$PATH:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/emulator
```

> Remplacer `<user>` par votre nom d'utilisateur.

## Astuces

**Où sont stockées les paramètres d'un AVD ?**

Un répertoire _.android_ est créé dans le répertoire de l'utilisateur. Par exemple sous macOS, le dossier sera localisé dans */Users/\<user\>/.android/avd/<avd_name>*.

**Comment associer le clavier de l'ordinateur avec le clavier du périphérique virtuel ?**

Dans le dossier utilisé pour stocker les informations de l'AVD (sous macOS => */Users/\<user\>/.android/avd/<avd_name>*), un fichier *config.ini* sert à configurer le périphérique. Éditer le fichier *config.ini* et modifier le paramètre `hw.keyboard` à `yes`.

**Comment supprimer un AVD ?**

```$ avdmanager delete avd -n <avd_name>```

**Comment afficher la liste des périphériques (virtuel et physique) connectés ?**

```$ adb devices```

**Comment afficher les logs d'un périphérique virtuel ou physique ?**

```$ adb -s <device_id> logcat```

**Comment installer un APK sur un périphérique virtuel ou physique ?**

```$ adb -s <device_id> install my.apk```

**Comment être root sur un périphérique virtuel ou physique ?**

```$ adb -s <device_id> root```

**Comment afficher la taille du LogCat sur un périphérique virtuel ou physique ?**

```$ adb -s <device_id> logcat -g```

**Comment modifier la taille du LogCat sur un périphérique virtuel ou physique ?**

```$ adb -s <device_id> logcat -G 16M```

**Comment se connecter au shell d'un périphérique virtuel ou physique ?**

```$ adb -s <device_id> shell```

**Comment télécharger un fichier d'un périphérique virtuel ou physique ?**

```$ adb -s <device_id> pull /mnt/sdcard/myfile .```

**Comment envoyer un fichier vers un périphérique virtuel ou physique ?**

```$ adb -s <device_id> push myfile /mnt/sdcard```

**Comment installer l'accélération matérielle HAXM ?**

L'installation matérielle est réalisée via Intel Hardware Accelerated Execution Manager (HAXM) qui est disponible sur tous les systèmes d'exploitation. Veuillez suivre ce lien pour télécharger et l'installer : https://github.com/intel/haxm

Pour vérifier que l'accélération matérielle fonctionne, exécuter la ligne de commande suivante :

```console
$ emulator -accel-check
accel:
0
HAXM version 7.6.5 (4) is installed and usable.
accel
```

## Ressources

* https://gist.github.com/mrk-han/66ac1a724456cadf1c93f4218c6060ae
* https://developer.android.com/studio/run/emulator-acceleration
* https://gist.github.com/Pulimet/5013acf2cd5b28e55036c82c91bd56d8
