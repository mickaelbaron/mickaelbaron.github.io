---
title: 'Tutoriel pour exécuter du code natif en Java : JNI VS JNA'
tags: [Java]
direct_link:
image: /images/jnipourlesnuls.jpg
description: JNI et JNA sont deux technologies qui permettent d'adresser du code natif dans du code Java. Nous explorerons dans cet article une comparaison de ces deux technologies en les appliquant à un même exemple dans le but de dresser un bilan de leur utilisation.
category: Article
date: 2009-09-28
update: 2013-05-24
weight: 7
toc: true
authors: [martinif]
---

[JNI](https://dico.developpez.com/html/1020-Langages-JNI-Java-Native-Interface.php) (Java Native Interface) et [JNA](https://dico.developpez.com/html/3165-Langages-JNA-Java-Native-Access.php) (Java Native Access) sont deux technologies qui permettent d'adresser du code natif dans du code Java. Nous explorerons dans cet article une comparaison de ces deux technologies en les appliquant à un même exemple dans le but de dresser un bilan de leur utilisation.

Cet article est une version plus étoffée d'un [billet](https://blog.developpez.com/adiguba/p4221/java/jni_pour_les_nuls) posté par [adiguba](https://www.developpez.net/forums/u1195/adiguba/) sur le [blog Java](https://blog.developpez.com/adiguba/) de [Developpez.com](https://www.developpez.com/).

Les sources de l'exemple sont disponibles : [jnijna.zip](/fichiers/jnijna.zip).

## Introduction

« Write once, run anywhere » : le slogan du langage Java a toujours mis en avant la portabilité du langage et de ses [APIAPI](https://dico.developpez.com/html/1453-Langages-API-Application-Programming-Interface.php), tout en promettant qu'un même code pourra être exécuté sur n'importe quelle plateforme. Le compromis apporté par cette portabilité est que les se trouvent ainsi dépourvues de certaines fonctionnalités qui peuvent sembler « basiques » pour un système, mais qui ne sont pas forcément disponibles sur d'autres (exemple : gestion de la transparence des fenêtres). Bien que Java ait récemment incorporé des fonctionnalités propres à certains systèmes hôtes, il est toujours nécessaire de faire appel à du code natif dès que les besoins s'approchent un peu trop du système.

L'objectif de cet article est de mettre en avant des technologies permettant d'adresser du code natif dans du code Java. Nous tenterons ainsi de lister leurs défauts et leurs avantages en vue de choisir au mieux la technologie adaptée selon les circonstances.

Deux technologies seront présentées :

* la première technologie s'appelle [JNI](https://dico.developpez.com/html/1020-Langages-JNI-Java-Native-Interface.php) (Java Native Interface). Elle est fournie par défaut par le JDK et nécessite de manipuler un langage natif pour effectuer les appels aux fonctions natives ; 
* la seconde technologie s'appelle [JNA](https://dico.developpez.com/html/3165-Langages-JNA-Java-Native-Access.php) (Java Native Access). C'est une [API](https://dico.developpez.com/html/1453-Langages-API-Application-Programming-Interface.php) tierce qui offre l'avantage de s'abstraire de la couche native. 

Le plan présenté par cet article est le suivant. Nous décrivons dans une première section l'ensemble des prérequis logiciels utilisés. Puis, dans une deuxième section, nous détaillons l'étude de cas fil rouge à laquelle seront appliquées deux technologies. Les sections trois et quatre appliquent l'étude de cas respectivement avec les technologies [JNI](https://dico.developpez.com/html/1020-Langages-JNI-Java-Native-Interface.php) et [JNA](https://dico.developpez.com/html/3165-Langages-JNA-Java-Native-Access.php). Pour chaque technologie, nous détaillons les étapes de développement et nous dressons un bilan. Nous terminons cet article par une conclusion.

## Prérequis logiciels

Cette section présente tous les outils qui ont été utilisés dans le cadre de cet article. Nous renseignons volontairement pour chaque outil, la version utilisée lors de la réalisation de cet article.

* **Eclipse IDE** : l'environnement de développement Java (version 3.3.0).
* **MingW** : le compilateur C/C++ pour la plateforme Windows (version 5.1.3).
* **Projet CDT** : l'environnement de développement C, nécessaire pour la partie [JNI](https://dico.developpez.com/html/1020-Langages-JNI-Java-Native-Interface.php) (vers 4.0.1).
* **Bibliothèque** : [JNA](https://dico.developpez.com/html/3165-Langages-JNA-Java-Native-Access.php) (vers 3.0) : les bibliothèques pour utiliser .

Nous détaillerons pour chacun de ces outils la procédure d'installation et de configuration en montrant également les interconnexions entre les différents outils et bibliothèques (configuration de MingW avec Eclipse CDT).

### Eclipse IDE

L'environnement de développement Eclipse sera utilisé pour la gestion des langages Java et C/C++ (voir partie suivante pour l'installation et la configuration de la plateforme C/C++).

Le téléchargement de l'environnement de développement est obtenu sur le site de la fondation Eclipse : [www.eclipse.org/downloads/](https://www.eclipse.org/downloads/).

Pour l'installation, rien de difficile, décompressez l'archive dans le répertoire où vous installez généralement vos applications (par exemple : c:\program files).

### MingW

MinGW est l'acronyme de **Min**imalist **G**cc for **W**indows. Ce projet apporte une collection d'outils permettant de produire du code natif pour la plateforme Windows. Il s'agit en fait d'une adaptation des outils de développement du GNU du monde Linux à la plateforme Windows. Concrètement, MinGW va nous fournir l'outil GCC pour effectuer nos compilations et nos liaisons de la DLL construite pour la partie [JNI](https://dico.developpez.com/html/1020-Langages-JNI-Java-Native-Interface.php).

Le site du projet MinGW : [www.mingw.org](http://www.mingw.org/).

La page de téléchargement via SourceForge : [MinGW-5.1.3.exe](https://sourceforge.net/projects/mingw/files/).

Téléchargez la version estampillée *Automated MinGW Installer*. L'installation de MinGW est relativement simple. Suivez les informations du Wizard. Choisissez le répertoire d'installation par défaut *c:\MinGW*. Prenez soin également de cocher les packages comme indiqué ci-dessous :

* **MinGW base tools :** contient les éléments basiques pour compiler du C ;
* **MinGW Make :** pour faciliter la compilation et l'édition des liens. CDT en aura besoin.

Si l'installation s'est effectuée sans problème, vous devriez avoir un répertoire MinGW à la racine du lecteur C. Pour finaliser l'installation de MinGW, il faut procéder au renommage de l'outil *mingw32-make.exe* en *make.exe* pour qu'Eclipse CDT puisse retrouver sans problème cet outil qu'il utilise.

### C/C++ Development Tools (CDT)

Eclipse CDT (C/C++ Developement Tools) est un environnement pour la gestion de projets C/C++. Il offre toutes les fonctionnalités pour associer un compilateur et un linkeur à un projet C/C++. Il s'occupe également de toute la gestion de la construction d'exécutable et de bibliothèque dynamique. Concernant l'installation, deux solutions sont possibles.

**Installer CDT dans un environnement Eclipse préinstallé :** une première solution s'appuie sur un environnement Eclipse existant puisque le projet CDT repose sur un Eclipse. Si vous suivez cette solution, l'installation pourra se faire via le gestionnaire de mises à jour appelé *update manager*.

Vous trouverez ci-dessous les différents écrans pour installer CDT via l'outil de mise à jour :

![Ouvrir l'outil de mise à jour](/images/executer-code-natif-avec-jni-jna/updateMgtMenu.jpg)

Pour ouvrir l'outil de mise à jour, sélectionner le menu *Help* --> *Software Updates* --> *Find and Install*.

![Sélectionner type de mise à jour](/images/executer-code-natif-avec-jni-jna/updateOrInstall.jpg)

Choisissez ensuite la recherche de nouvelles *features*. Une feature peut être vue comme un groupe spécifique de plugins. Elle contient également un ensemble de métadonnées pour donner une description au groupe. Ici, nous installons la feature CDT.

![Sélectionner le site de mise à jour](/images/executer-code-natif-avec-jni-jna/updateSite.jpg)

Sélectionnez ensuite le site de mise à jour *Europa Discovery Site* utilisé pour installer de nouvelles features propres à la version Eclipse Europa.

![Sélectionner le serveur pour le téléchargement](/images/executer-code-natif-avec-jni-jna/mirror.jpg)

Choisissez le serveur de téléchargement : soit le site officiel de *Europa Discovery Site* soit un site miroir.

![Sélectionner la feature CDT pour l'installer](/images/executer-code-natif-avec-jni-jna/features.jpg)

Sélectionner la feature *Eclipse C/C++ Development Tools* pour l'installer. Remarquez sur la capture d'écran que les features sont regroupées par catégorie.

![Accepter la license de la feature CDT](/images/executer-code-natif-avec-jni-jna/license.jpg)

Acceptez ensuite les termes de la licence d'agrément concernant la feature CDT.

![Choisir le répertoire d'installation](/images/executer-code-natif-avec-jni-jna/location.jpg)

Choisissez le répertoire d'installation, laissez par défaut le répertoire de votre environnement Eclipse.

![Attendre la fin du téléchargement](/images/executer-code-natif-avec-jni-jna/download.jpg)

Le téléchargement des plugins de CDT est alors lancé.

![Accepter le certificat](/images/executer-code-natif-avec-jni-jna/certificat.jpg)

Veuillez accepter le contrat avant l'installation de CDT.

![Redémarrer Eclipse](/images/executer-code-natif-avec-jni-jna/reboot.jpg)

Après l'installation de la feature CDT, un redémarrage de l'environnement Eclipse est nécessaire.

**Installer un environnement Eclipse CDT :** une seconde solution consiste à télécharger un environnement spécialisé uniquement pour le développement de projets C/C++. Il ne contiendra donc pas les plugins liés à la plateforme JDT (Java Development Tool).

Le téléchargement de l'environnement de développement est obtenu sur le site de la fondation Eclipse : [www.eclipse.org/cdt/downloads.php](https://www.eclipse.org/cdt/downloads.php).

Le compilateur C/C++ et les environnements de développement (Java et C/C++) sont installés. La configuration de MingW depuis Eclipse est automatique. Eclipse CDT reconnaît automatiquement le compilateur.

Dans le cadre de la mise en place des exemples de cet article nous employons la première solution puisque nous travaillons à la fois sur des projets Java et C/C++. Il suffira donc de changer de perspective pour passer d'une plateforme de développement Java à C/C++ et vice et versa.

Comme à chaque fois qu'un nouvel environnement de développement est installé, le réflexe du développeur (je parle en mon nom) est de le tester via l'exemple tout simple : *hello world*. Vous trouverez donc ci-dessous un minitutoriel sur la manière de créer l'éternelle application *hello world* en C/C++ avec Eclipse CDT et MingW.

![Création d'un projet C++ via le wizard d'Eclipse CDT](/images/executer-code-natif-avec-jni-jna/wizardcplusplus.jpg)

Sélectionnez à partir de l'assistant d'Eclipse, la création d'un nouveau projet C++.

![Création d'un exécutable via l'exemple Hello World](/images/executer-code-natif-avec-jni-jna/createhelloworld.jpg)

Cet écran vous propose de définir le nom du projet et le type de projet. Pour l'exemple *HelloWorld*, choisissez le wizard *Hello Wold C++ project*. Dans la partie [JNI](https://dico.developpez.com/html/1020-Langages-JNI-Java-Native-Interface.php), nous choisirons un projet de type *Shared Library* pour construire une DLL. Notez enfin que sur la partie droite, le compilateur peut être choisi.

![Définir les propriétés du projet](/images/executer-code-natif-avec-jni-jna/properties.jpg)

Définissez des propriétés liées à l'auteur essentiellement concernant le projet en construction.

![Sélectionner la plateforme et la configuration pour le déploiement](/images/executer-code-natif-avec-jni-jna/configurations.jpg)

Choisissez enfin la configuration pour le déploiement (*Debug* et/ou *Release*).

La fin de l'assistant génère le projet *HelloWorld* et un fichier *helloworld.c* présenté ci-dessus :

```cpp
#include <iostream>
using namespace std;

int main() {
    cout << "!!!Hello World!!!" << endl; // prints !!!Hello World!!!
    return 0;
}
```

La compilation est gérée par Eclipse CDT soit de manière automatique (à chaque sauvegarde d'une modification) soit de manière explicite (compilation demandée par le développeur). Si aucune erreur n'est trouvée, il ne vous reste plus qu'à exécuter l'exemple qui a été généré dans le répertoire du projet *HelloWorld*.

### Java Native Interface (JNI)

[JNI](https://dico.developpez.com/html/1020-Langages-JNI-Java-Native-Interface.php) (Java Native Interface) est une couche de programmation qui permet à du code Java d'appeler ou d'être appelé par du code natif. Il n'existe pas réellement de bibliothèque à télécharger pour faire du JNI puisque cette couche de programmation est fournie par défaut dans le [JDK](https://dico.developpez.com/html/1015-Langages-JDK-Java-Development-Kit.php). Toutefois, au moment de la création de projets [JNI](https://dico.developpez.com/html/1020-Langages-JNI-Java-Native-Interface.php), des fichiers header (identification de la [JVM](https://dico.developpez.com/html/3-Langages-JVM-Java-Virtual-Machine.php) par exemple) devront être liés lors de la phase de liaison.

Les fichiers header sont disponibles à la racine du répertoire [JDK](https://dico.developpez.com/html/1015-Langages-JDK-Java-Development-Kit.php) dans les répertoires *%JAVA_HOME%\include* et *%JAVA_HOME%\include\win32* suivant le type de système d'exploitation que vous utilisez. Dans notre cas il s'agit de la plateforme Win32.

### Java Native Access (JNA)

[JNA](https://dico.developpez.com/html/3165-Langages-JNA-Java-Native-Access.php) (Java Native Access) est une [API](https://dico.developpez.com/html/1453-Langages-API-Application-Programming-Interface.php) permettant d'accéder à du code natif sans faire appel explicitement à la couche de programmation [JNI](https://dico.developpez.com/html/1020-Langages-JNI-Java-Native-Interface.php). Le développement nécessite une interface Java pour décrire le prototype, les fonctions et les structures contenues dans le code natif à appeler.

Ce projet est en incubation et pourrait être disponible dans les prochaines versions de Java.

Contrairement à [JNI](https://dico.developpez.com/html/1020-Langages-JNI-Java-Native-Interface.php), l'utilisation de [JNA](https://dico.developpez.com/html/3165-Langages-JNA-Java-Native-Access.php) nécessite le téléchargement d'une bibliothèque spécifique. Vous trouverez donc sur le site la bibliothèque [JNA](https://dico.developpez.com/html/1020-Langages-JNI-Java-Native-Interface.php) à télécharger puis de nombreux exemples mettant en œuvre cette bibliothèque.


* Site de [JNA](https://dico.developpez.com/html/3165-Langages-JNA-Java-Native-Access.php) : [github.com/java-native-access/jna](https://github.com/java-native-access/jna).
* Bibliothèque [JNA](https://dico.developpez.com/html/3165-Langages-JNA-Java-Native-Access.php) : [maven.java.net/content/repositories/releases/net/java/dev/jna/jna/](https://maven.java.net/content/repositories/releases/net/java/dev/jna/jna/).

### Bibliothèques Dynamiques

Par défaut, Java respecte les conventions du système hôte pour le chargement des bibliothèques natives, c'est-à-dire :

* sous **Windows**, les bibliothèques seront recherchées dans le **PATH **;
* sous **Unix/Linux**, elles sont recherchées dans le **LD_LIBRARY_PATH **;
* sous **Mac OS**, c'est la variable d'environnement **DYLD_LIBRARY_PATH** qui est utilisée.

Il est possible d'outrepasser cela en modifiant la variable système *java.library.path* (ou *jna.library.path* pour [JNA](https://dico.developpez.com/html/3165-Langages-JNA-Java-Native-Access.php) que nous verrons un peu plus loin). Si la bibliothèque ne fait pas partie d'un des répertoires spécifiés, l'exécution du programme génèrera une *UnsatisfiedLinkError*.

De même, chaque système possède ses propres conventions pour le nommage des fichiers représentant les bibliothèques, par exemple pour une bibliothèque nommée *hello* :

* sous **Windows**, on lui ajoute simplement l'extension *.dll*, soit *hello.dll *;
* sous **Unix/Linux**, on utilise le préfixe lib couplé à l'extension *.so*, soit *libhello.so *;
* sous **Mac OS**, on utilise le préfixe lib couplé à l'extension *.jnilib*, soit *libhello.jnilib*.

## Exemple

Cet article est illustré via un exemple simpliste montrant l'utilisation de fonctions natives permettant la gestion de la transparence pour les fenêtres et boîtes de dialogues.

La fonctionnalité de transparence des fenêtres existe sur la plupart des systèmes récents : Windows (à partir de XP), MacOSX et Linux. La démarche d'utilisation de [JNI](https://dico.developpez.com/html/1020-Langages-JNI-Java-Native-Interface.php) et [JNA](https://dico.developpez.com/html/3165-Langages-JNA-Java-Native-Access.php) étant la même sur toutes les plateformes, nous nous limiterons donc à la plateforme Windows.

La mise en transparence d'une fenêtre pour la plateforme Windows est obtenue en appelant dans un premier temps la fonction *SetWindowLong* pour extraire de le handle Window la couche qui deviendra transparente. Dans un second temps il faut faire appel à la fonction *SetLayeredWindowAttributes* pour choisir le type de transparence et activer la transparence.

Deux types de transparence sont à distinguer :

* locale à une couleur, en indiquant la couleur en question ;
* globale à toute la fenêtre, en indiquant le niveau d'opacité.

Du côté client Java, nous utiliserons la boîte à outils SWT de la plateforme Eclipse. L'[API](https://dico.developpez.com/html/1453-Langages-API-Application-Programming-Interface.php) SWT manipule des composants graphiques de type *heavyheight*. Il devient relativement facile d'accéder aux handles des composants et par conséquent à l'handle window de la fenêtre à rendre transparente.

Nous montrons ci-dessous deux captures d'écran de l'application que nous souhaitons rendre transparentes. La première capture représente l'interface sans activation de la transparence tandis que la seconde présente la même interface avec la transparence activée. Il est à noter que le composant du dessous (un conteneur) a une couleur non conventionnelle. En effet, nous souhaitons isoler cette zone pour la rendre totalement transparente. Par contre concernant le reste de la fenêtre nous définirons un niveau d'opacité de manière à voir à travers la fenêtre.

![Transparence non activée](/images/executer-code-natif-avec-jni-jna/noTransparency.jpg)

![Transparence activée](/images/executer-code-natif-avec-jni-jna/withTransparency.jpg)

Vous trouverez ci-dessous le code de l'application utilisée comme support aux appels des fonctions natives WIN32.

```java
public class TransparencyExample {

private static final boolean isJNIImplementation = true;

private final byte opacity = (byte)200;

public TransparencyExample() {
    final Display display = new Display();
    final Shell myShell = new Shell(display, SWT.SHELL_TRIM | SWT.ON_TOP);
    myShell.setText("Transparency Example");
    myShell.setLayout(new FillLayout(SWT.VERTICAL));

    final Button myButton = new Button(myShell,SWT.NONE);
    myButton.setText("Go To The Transparency Dream");

    final Composite myComposite = new Composite(myShell, 0x80000);
    Color colorDarkBlue = Display.getDefault().getSystemColor(SWT.COLOR_DARK_BLUE);
    myComposite.setBackground(colorDarkBlue);

    myShell.setSize(400, 200);
    myShell.setLocation(0, 0);
    myShell.open();

    createTransparency(myShell.handle, colorDarkBlue.handle, opacity);

    while(!myShell.isDisposed()) {
        if (!display.readAndDispatch())
            display.sleep();
    }
    display.dispose();
}

private void createTransparency(int hWindow, int hColor, byte opacity) {
    if (isJNIImplementation) {
        // Appel des fonctions déclarées par JNI
    } else {
        // Appel des fonctions déclarées par JNA
    }
}

public static void main(String[] argv) {
    new TransparencyExample();
}
```

Dans un premier temps nous avons réalisé la construction de l'interface utilisateur (un bouton et un conteneur). La couleur *COLOR_DARK_BLUE* dans la zone du conteneur va nous permettre d'isoler cette zone et la rendre transparente. L'activation de la transparence est obtenue en appelant la méthode *createTransparency* en lui passant le handle de la fenêtre, la couleur à rendre transparente (zone totalement transparente) et le niveau d'opacité (transparence du reste de la fenêtre).

Concernant la méthode *createTransparency*, son rôle est d'appeler les fonctions natives selon la logique définie précédemment. L'appel aux fonctions natives sera effectué soit via [JNI](https://dico.developpez.com/html/1020-Langages-JNI-Java-Native-Interface.php) soit via [JNA](https://dico.developpez.com/html/3165-Langages-JNA-Java-Native-Access.php). Ici, l'aiguilleur est représenté par un booléen *isJNIImplementation*.

L'intérêt de cet article est de montrer comment définir le pont entre la partie native et la partie Java en employant deux technologies : [JNI](https://dico.developpez.com/html/1020-Langages-JNI-Java-Native-Interface.php) et [JNA](https://dico.developpez.com/html/3165-Langages-JNA-Java-Native-Access.php).

Les sources de l'exemple sont disponibles à l'adresse suivante : [jnijna.zip](https://mbaron.developpez.com/javase/jnijna/fichiers/jnijna.zip).

Deux projets Eclipse sont fournis. Le premier *developpez.jnijna* contient la partie Java. Le second *developpez.jnijna.native* implémente la partie native. Copiez les deux répertoires dans le workspace de votre Eclipse et importez-les à partir de l'assistant d'Eclipse.

## JNI (Java Native Interface)

Rappelons que [JNI](https://dico.developpez.com/html/1020-Langages-JNI-Java-Native-Interface.php) est une passerelle qui permet de faire un appel à une fonction native. Toutefois, l'appel n'est pas direct. Il est ainsi obligatoire de définir une méthode native qui respecte un prototype précis. De ce fait il devient obligatoire de passer par une méthode intermédiaire qui englobera cet appel.

La décomposition de cette section est réalisée comme suit :

* déclarer les méthodes natives : définir les méthodes intermédiaires qui permettent d'appeler les fonctions natives ;
* générer le header c/c++ : générer l'en-tête du fichier C/C++ correspondant aux fonctions natives à exporter tout en respectant le prototype défini précédemment ;
* implémenter le code natif : implémentation des méthodes déclarées dans le fichier header ;
* compiler et générer la bibliothèque native : construire la dll dont la fonctionnalité est de fournir les services définis par l'en-tête ;
* charger la bibliothèque native : charger la bibliothèque dans le programme Java, le pont est maintenant construit.

### Déclarer les méthodes natives

La première étape consiste donc à écrire le prototype Java des méthodes natives. Dans le code de la classe *JNIUser32* qui suit, trois méthodes correspondant respectivement aux méthodes natives à appeler ont été définies (*GetWindowLong*, *SetWindowLong* et *SetLayeredWindowAttributes*). Ainsi, la logique d'appel aux différentes fonctions natives pour activer la transparence de la fenêtre est à la charge de la partie Java. Au contraire, nous aurions pu fournir une seule méthode native qui aurait eu à sa charge d'effectuer les différents traitements de gestion de la transparence.

```java
package developpez.jnijna;

public final class JNIUser32 {

    public static final int LWA_COLORKEY = 1;

    public static final int LWA_ALPHA = 2;

    public static final int WS_EX_LAYERED = 0x80000;

    public static final int GWL_EXSTYLE = -20;

    public static final native int GetWindowLong(int hWnd, int nIndex);

    public static final native int SetWindowLong(int hWnd, int nIndex, int dwNewLong);

    public static final native boolean SetLayeredWindowAttributes(int hwnd, int crKey, byte bAlpha, int dwFlags);
}
```

Ce code peut être compilé normalement sans problème puisque le compilateur ne vérifie pas les liens vers les méthodes natives (ne charge pas la bibliothèque dynamique), par contre l'exécution génèrera une belle exception puisque les méthodes natives correspondantes n'existent pas encore…

### Générer le header C/C++

Une fois cette classe compilée, il faut utiliser l'outil *javah* sur la classe générée et non sur le code source. L'outil *javah*, fourni avec le [JDK](https://dico.developpez.com/html/1015-Langages-JDK-Java-Development-Kit.php), permet de générer un fichier d'en-tête C/C++. Ce dernier s'utilise comme la commande *java* et nécessite donc un nom de classe complet (c'est-à-dire avec le package) :

```java
javah developpez.jnijna.JNIUser32
```

Ce qui nous génèrera dans le cas présent un fichier nommé *developpez_jnijna_JNIUser32.h* contenant le code suivant :

```cpp
/* DO NOT EDIT THIS FILE - it is machine generated */
#include <jni.h>
/* Header for class developpez_jnijna_JNIUser32 */

#ifndef _Included_developpez_jnijna_JNIUser32
#define _Included_developpez_jnijna_JNIUser32
#ifdef __cplusplus
extern "C" {
#endif
#undef developpez_jnijna_JNIUser32_LWA_COLORKEY
#define developpez_jnijna_JNIUser32_LWA_COLORKEY 1L
#undef developpez_jnijna_JNIUser32_LWA_ALPHA
#define developpez_jnijna_JNIUser32_LWA_ALPHA 2L
#undef developpez_jnijna_JNIUser32_WS_EX_LAYERED
#define developpez_jnijna_JNIUser32_WS_EX_LAYERED 524288L
#undef developpez_jnijna_JNIUser32_GWL_EXSTYLE
#define developpez_jnijna_JNIUser32_GWL_EXSTYLE -20L
/*
 * Class:     developpez_jnijna_JNIUser32
 * Method:    GetWindowLong
 * Signature: (II)I
 */
JNIEXPORT jint JNICALL Java_developpez_jnijna_JNIUser32_GetWindowLong
    (JNIEnv *, jclass, jint, jint);

/*
 * Class:     developpez_jnijna_JNIUser32
 * Method:    SetWindowLong
 * Signature: (III)I
 */
JNIEXPORT jint JNICALL Java_developpez_jnijna_JNIUser32_SetWindowLong
    (JNIEnv *, jclass, jint, jint, jint);

/*
 * Class:     developpez_jnijna_JNIUser32
 * Method:    SetLayeredWindowAttributes
 * Signature: (IIBI)Z
 */
JNIEXPORT jboolean JNICALL Java_developpez_jnijna_JNIUser32_SetLayeredWindowAttributes
    (JNIEnv *, jclass, jint, jint, jbyte, jint);

#ifdef __cplusplus
}
#endif
#endif
```

### Implémenter le code natif

Il est maintenant nécessaire de coder les fonctions natives correspondant au prototype généré, ce qui donne pour notre étude de cas le résultat suivant :

```cpp
#define WINVER 0x0500
#include <jni.h>
#include <stdio.h>
#include <windows.h>
#include "developpez_jnijna_JNIUser32.h"

JNIEXPORT jint JNICALL Java_developpez_jnijna_JNIUser32_GetWindowLong
  (JNIEnv *env, jclass theClass, jint windowHandle, jint nIndex) {
    jint rc = 0;
    rc = (jint)GetWindowLongA((HWND)windowHandle, nIndex);
    return rc;
}

JNIEXPORT jint JNICALL Java_developpez_jnijna_JNIUser32_SetWindowLong
  (JNIEnv *env, jclass theClass, jint windowHandle, jint nIndex, jint dwNewLong) {
    jint rc = 0;
    rc = (jint)SetWindowLongA((HWND)windowHandle, nIndex, dwNewLong);
    return rc;
}

JNIEXPORT jboolean JNICALL Java_developpez_jnijna_JNIUser32_SetLayeredWindowAttributes
  (JNIEnv *env, jclass theClass, jint windowHandle, jint hColor, jbyte alpha, jint flags) {
     SetLayeredWindowAttributes((HWND)windowHandle,hColor,alpha,flags);
    return( 0 );
}
```

### Compiler et générer la bibliothèque native (en ligne de commande)

Il nous faut désormais compiler ce bout de code. Pour cela il faut spécifier au compilateur l'emplacement des headers natifs de [JNI](https://dico.developpez.com/html/1020-Langages-JNI-Java-Native-Interface.php) qui se trouvent dans le répertoire include du [JDK](https://dico.developpez.com/html/1015-Langages-JDK-Java-Development-Kit.php), ce qui nous donne (la variable d'environnement *JAVA_HOME* pointant vers le chemin d'installation du [JDK](https://dico.developpez.com/html/1015-Langages-JDK-Java-Development-Kit.php)) :

```console
g++ -I"%JAVA_HOME%\include" -I"%JAVA_HOME%\include\win32" -c developpez_jnijna_JNIUser32.cpp
```

La bibliothèque dynamique peut enfin être générée, que l'on nommera *transparency.dll*

```console
g++ -Xlinker --add-stdcall-alias -shared -otransparency.dll developpez_jnijna_JNIUser32.o
```

L'option supplémentaire *--add-stdcall-alias* indique au linkeur qu'il ne doit pas décorer le nom des fonctions exportées, car cela empêcherait [JNI](https://dico.developpez.com/html/1020-Langages-JNI-Java-Native-Interface.php) de faire correspondre les noms des méthodes définis dans le prototype et ceux de la bibliothèque dynamique.

La seconde option *-otransparency.dll* impose un nom à la bibliothèque lors de la sortie de la compilation et à la liaison.

### Compiler et générer la bibliothèque native (via CDT)

Avant de procéder à la compilation, il faut paramétrer le linkeur de manière à ce qu'il ne décore pas le nom des fonctions exportées (comme montré dans la section précédente).

Ouvrez le menu *propriétés* de projet et sélectionnez les options *C/C++ Build -> Settings*. Vous devrez obtenir l'écran ci-dessous. Ajouter les deux options à la configuration de votre projet.

![Propriétés d'un projet CDT](/images/executer-code-natif-avec-jni-jna/cdttool.jpg)

Enfin concernant la compilation via l'outil CDT, elle est pilotée par l'outil. Elle est réalisée soit de manière implicite, si l'option *Build Automatically* est activée (menu *Project*), soit de manière explicite, si l'action *Build Project* est utilisée (également dans le menu *Project*).

### Charger la bibliothèque native

Il reste une petite modification à effectuer sur le code source de notre classe Java : **il est impératif de charger cette bibliothèque pendant le chargement de la classe afin que les méthodes natives puissent être utilisées sans problème**.

Pour cela il suffit d'ajouter un bloc static dans le corps de la classe avec l'instruction *System.loadLibrary :*

```java
package developpez.jnijna;

public final class JNIUser32 {

    static {
        System.loadLibrary("libdeveloppez.jnijna.native");
    }

    public static final int LWA_COLORKEY = 1;

    public static final int LWA_ALPHA = 2;

    public static final int WS_EX_LAYERED = 0x80000;

    public static final int GWL_EXSTYLE = -20;

    public static final native int GetWindowLong(int hWnd, int nIndex);

    public static final native int SetWindowLong(int hWnd, int nIndex,
            int dwNewLong);

    public static final native boolean SetLayeredWindowAttributes(int hwnd,
            int crKey, byte bAlpha, int dwFlags);
}
```

On peut désormais utiliser nos méthodes natives directement dans notre code java de manière tout à fait standard :

```java
private void createTransparency(int hWindow, int hColor, byte opacity) {
    if (isJNIImplementation) {
        int flags = JNIUser32.GetWindowLong(hWindow, JNIUser32.GWL_EXSTYLE);
        flags |= JNIUser32.WS_EX_LAYERED;
        JNIUser32.SetWindowLong(hWindow, JNIUser32.GWL_EXSTYLE, flags);
        JNIUser32.SetLayeredWindowAttributes(hWindow, hColor, opacity, 
            JNIUser32.LWA_COLORKEY | JNIUser32.LWA_ALPHA);
    } else {
        // Appel des fonctions déclarées par JNA
    }
}
```

### Bilan JNI

Même si le code natif est relativement simple, il est quand même dommage de sortir l'artillerie. Pour un simple appel de méthode, on se retrouve à suivre un protocole en cinq étapes :

* déclarer des méthodes natives ;
* générer le header C/C++ ;
* implémenter le code natif ;
* compiler et générer la bibliothèque native ;
* charger la bibliothèque native.

Par ailleurs, il faut également prendre en compte les aspects logistiques :

* installation d'un compilateur C/C++ ;
* disposer d'un environnement de développement pour le langage C/C++ ;
* de connaissance sur un autre langage que Java même si le code écrit ci-dessus n'est pas d'une grande complexité.

Tout ceci est d'autant plus rageant lorsqu'on se contente d'appeler une fonction existante comme dans le cas présent, et que ce type de code tient sur une ligne dans n'importe quel langage natif (et généralement totalement transparent). Sans compter que l'on devra générer et déployer une bibliothèque par système supporté. Bref rien de très intéressant à coder, mais une source de problème potentiellement…

## JNA (Java Native Access)

[JNA](https://dico.developpez.com/html/3165-Langages-JNA-Java-Native-Access.php) se présente comme un choix beaucoup plus simple d'accès, en permettant d'accéder dynamiquement à n'importe quelle bibliothèque partagée du système sans utiliser [JNI](https://dico.developpez.com/html/1020-Langages-JNI-Java-Native-Interface.php). En fait il s'agit de la bibliothèque fournie avec [JNA](https://dico.developpez.com/html/3165-Langages-JNA-Java-Native-Access.php) qui s'occupe du chargement des bibliothèques dynamiques, de l'appel des fonctions, de la définition des structures et de la conversion des types… si bien que toutes les étapes fastidieuses liées à la manipulation de code C/C++ pour réaliser la passerelle entre Java et le code natif sont rendues très simples.

### Déclarer les méthodes natives dans une interface

Contrairement à [JNI](https://dico.developpez.com/html/1020-Langages-JNI-Java-Native-Interface.php), la démarche à respecter est assez différente puisqu'il ne faut plus marquer les méthodes avec le mot-clé native d'une part et qu'il est impératif d'utiliser une interface qui contiendra les définitions des fonctions natives d'autre part (et seulement celles-ci). Cette interface doit obligatoirement étendre l'interface *com.sun.jna.Library* (ou toute autre sous interface fournie par l'[API](https://dico.developpez.com/html/1453-Langages-API-Application-Programming-Interface.php)) qui fait office de marqueur.

À l'exécution une instance valide de cette interface pourra être récupérée. Cette instance sera automatiquement liée à la bibliothèque native et elle sera utilisée pour réaliser directement les appels aux méthodes natives.

Appliquons dès à présent cette description à notre exemple. Nous déclarons toutes les fonctions dans l'interface particulière *JNAUser32* décrite ci-dessous :

```java
package developpez.jnijna;

public interface JNAUser32 extends StdCallLibrary {

    public static final int GWL_EXSTYLE = -20;
    public static final int WS_EX_LAYERED = 0x80000;

    public static final int LWA_COLORKEY = 1;
    public static final int LWA_ALPHA = 2;

    int GetWindowLong(int hWnd, int nIndex);
    int SetWindowLong(int hWnd, int nIndex, int dwNewLong);

    boolean SetLayeredWindowAttributes(int hwnd, int crKey, byte bAlpha, int dwFlags);
}

```

*JNAUser32* étend l'interface *StdCallLibrary* qui permet de préciser que les fonctions sont déclarées suivant la convention d'appel *stdcall*. Pour faire simple, cette convention d'appel, propre à la gestion des bibliothèques Win32, permet d'indiquer que l'ordre des paramètres des fonctions est défini de gauche à droite.

Au niveau du contenu de cette interface, nous définissons de la même manière que pour [JNI](https://dico.developpez.com/html/1020-Langages-JNI-Java-Native-Interface.php) les constantes utilisées lors de l'appel aux fonctions natives. La déclaration des fonctions natives est elle aussi similaire à la démarche hormis le fait que le mot-clé native n'est plus utilisé.

Enfin, la bibliothèque s'occupe elle-même de faire toutes les conversions de type et de rechercher les fonctions natives à appeler dynamiquement selon la définition de la méthode Java, si bien qu'il n'y a pas besoin d'écrire une seule ligne de code natif !

### Instancier dynamiquement l'interface de déclaration

Il ne reste plus qu'à créer une instance de l'interface *JNAUser32* qui sera automatiquement liée à la bibliothèque native. Pour cela la méthode *Native.loadLibraty* est utilisée en lui précisant le type Java de l'interface, le nom de la bibliothèque dynamique native et quelques paramètres d'initialisation du chargement. Premier constat et pas des moindres, cette solution via [JNA](https://dico.developpez.com/html/3165-Langages-JNA-Java-Native-Access.php) permet donc de charger directement une bibliothèque dynamique dépourvue de tout artifice nécessaire pour une utilisation dans Java. Il est par conséquent tout à fait possible d'utiliser n'importe quelle bibliothèque native sous condition de connaître son [API](https://dico.developpez.com/html/1453-Langages-API-Application-Programming-Interface.php).

Vous trouverez ci-dessous la modification apportée à l'interface *JNAUser32* permettant le chargement de la bibliothèque et l'instanciation de l'interface.

```java
package developpez.jnijna;

public interface JNAUser32 extends StdCallLibrary {

    Map UNICODE_OPTIONS = new HashMap() {
        {
            put(OPTION_TYPE_MAPPER, W32APITypeMapper.UNICODE);
            put(OPTION_FUNCTION_MAPPER, W32APIFunctionMapper.UNICODE);
        }
    };

    Map ASCII_OPTIONS = new HashMap() {
        {
            put(OPTION_TYPE_MAPPER, W32APITypeMapper.ASCII);
            put(OPTION_FUNCTION_MAPPER, W32APIFunctionMapper.ASCII);
        }
    };


    Map DEFAULT_OPTIONS = Boolean.getBoolean("w32.ascii") ? ASCII_OPTIONS : UNICODE_OPTIONS;

    JNAUser32 INSTANCE = (JNAUser32) Native.loadLibrary("user32", JNAUser32.class, DEFAULT_OPTIONS);
}
```

Enfin, il suffit d'utiliser l'instance ainsi créée pour appeler les fonctions natives. La méthode *createTransparency* pourra être complétée par le code suivant.

```java
private void createTransparency(int hWindow, int hColor, byte opacity) {
    if (isJNIImplementation) {
        // Appel des fonctions déclarées par JNI
    } else {
        JNAUser32 lib = JNAUser32.INSTANCE;
        int flags = lib.GetWindowLong(hWindow, JNAUser32.GWL_EXSTYLE);
        flags |= JNAUser32.WS_EX_LAYERED;                
        lib.SetWindowLong(hWindow, JNAUser32.GWL_EXSTYLE, flags);        
        lib.SetLayeredWindowAttributes(hWindow, hColor, opacity, 
            JNAUser32.LWA_COLORKEY | JNAUser32.LWA_ALPHA);
    }
}
```

Veuillez noter que la logique d'appel des différentes fonctions natives est similaire que ce soit pour [JNI](https://dico.developpez.com/html/1020-Langages-JNI-Java-Native-Interface.php) ou pour [JNA](https://dico.developpez.com/html/3165-Langages-JNA-Java-Native-Access.php). Toutefois, pour [JNI](https://dico.developpez.com/html/1020-Langages-JNI-Java-Native-Interface.php) les appels aux méthodes se font comme des méthodes de classe tandis que les appels aux méthodes natives via [JNA](https://dico.developpez.com/html/3165-Langages-JNA-Java-Native-Access.php) se font d'une manière tout à fait classique.

### Bilan JNA

Si nous partons du même schéma de comparaison que pour le bilan de la solution [JNI](https://dico.developpez.com/html/1020-Langages-JNI-Java-Native-Interface.php), pour réaliser un simple appel de méthode via [JNA](https://dico.developpez.com/html/3165-Langages-JNA-Java-Native-Access.php), nous nous retrouvons à suivre un protocole en deux étapes :

* déclarer les méthodes natives dans une interface ;
* instancier dynamiquement l'interface.

Concernant les aspects logistiques :

* pas besoin d'installer un compilateur C/C++ ;
* pas besoin de disposer d'un environnement de développement pour le langage C/C++ ;
* pas besoin de connaissance dans un autre langage.

Tout cela est bien sûr relatif et dépend fortement du besoin à traiter. Si vous souhaitez utiliser une bibliothèque dynamique déjà existante, [JNA](https://dico.developpez.com/html/3165-Langages-JNA-Java-Native-Access.php) conviendra à votre besoin. Par contre, si vous devez développer obligatoirement une brique de votre logiciel en langage natif C/C++, les aspects logistiques vous seront nécessaires.

Même si nous n'avons fait que survoler les possibilités qu'offre [JNA](https://dico.developpez.com/html/3165-Langages-JNA-Java-Native-Access.php), et bien qu'il n'y ait qu'une documentation succincte pour le moment, différents aspects pourront être traités dans un article plus approfondi sur le sujet, entre autres les aspects suivants :

* mapping Java/natif automatique des types primitifs et des *String *;
* mapping des struct et des union vers des types Java spécifiques (*Structure* et *Union*) ;
* mapping des pointeurs vers un type Java (*ByReference*) ;
* mapping des pointeurs de fonctions (ou *callback*) en utilisant une interface Java ;
* possibilité de définir un mapping personnalisé pour ses propres objets Java ;
* mapping automatique de la méthode Java vers la fonction native du même nom, mais en gardant la possibilité d'utiliser une classe qui se chargera de cela (par exemple pour utiliser des noms de méthodes Java différents afin de respecter les règles de nommage Java) ;
* gestion des bibliothèques Win32 qui utilisent la convention d'appel *__stdcall*.

## Conclusion

Nous avons étudié dans cet article deux solutions pour appeler du code natif. Une solution basée sur [JNI](https://dico.developpez.com/html/1020-Langages-JNI-Java-Native-Interface.php) fournie initialement par la [JDK](https://dico.developpez.com/html/1015-Langages-JDK-Java-Development-Kit.php) et une seconde basée sur la bibliothèque externe [JNA](https://dico.developpez.com/html/3165-Langages-JNA-Java-Native-Access.php). Ces deux solutions ont été appliquées sur un exemple simple qui fait appel à des fonctions natives WIN32 : activation de la transparence d'une fenêtre.

Nous avons montré que pour la solution [JNI](https://dico.developpez.com/html/1020-Langages-JNI-Java-Native-Interface.php) la difficulté était de devoir manipuler du code C/C++ (problématique liée également à l'installation d'outils supplémentaires) alors que la solution [JNA](https://dico.developpez.com/html/3165-Langages-JNA-Java-Native-Access.php) offrait l'avantage de s'abstraire de cette couche de programmation. fait office de pont implicite entre la bibliothèque dynamique et le code Java.

À l'heure du choix entre [JNI](https://dico.developpez.com/html/1020-Langages-JNI-Java-Native-Interface.php) et [JNA](https://dico.developpez.com/html/3165-Langages-JNA-Java-Native-Access.php), nous ne pouvons pas être catégoriques. L'exemple utilisé dans cet article n'est pas représentatif de toute la couverture des besoins rencontrés. Le choix doit donc s'opérer selon les cas rencontrés. Des besoins spécifiques amèneront à utiliser obligatoirement une solution à base de [JNI](https://dico.developpez.com/html/1020-Langages-JNI-Java-Native-Interface.php). Nous ne l'avons pas montré, car cela sort du sujet de cet article, mais il est parfois possible de communiquer dans la bibliothèque avec la machine virtuelle : communication C/C++ vers Java. De ce fait seule [JNI](https://dico.developpez.com/html/1020-Langages-JNI-Java-Native-Interface.php) le permet.

Mais il est indéniable que [JNA](https://dico.developpez.com/html/3165-Langages-JNA-Java-Native-Access.php) permet de simplifier largement les appels aux fonctions natives.

## Pour aller plus loin

Pour plus d'informations sur le sujet, vous pouvez consulter les liens suivants :

* [Java Native Interface](https://docs.oracle.com/javase/6/docs/technotes/guides/jni/index.html), la documentation officielle ;
* [Java Native Access](https://github.com/java-native-access/jna), la page du projet sur github ;
* [NativeCall](https://johannburkard.de/software/nativecall/) un projet similaire à [JNA](https://dico.developpez.com/html/3165-Langages-JNA-Java-Native-Access.php).

## Remerciements

Cet article est disponible sur le site de [Developpez.com](https://mbaron.developpez.com/tutoriels/java/executer-code-natif-avec-jni-jna/).

Nous tenons à remercier [Baptiste Wicht](https://www.developpez.net/forums/u75080/baptiste-wicht/) et [Ricky81](https://www.developpez.net/forums/u24613/ricky81/) pour leur relecture technique et [Claude Leloup](https://www.developpez.net/forums/u124512/claudeleloup/) pour ses corrections orthographiques.