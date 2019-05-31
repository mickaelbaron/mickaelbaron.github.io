---
title: 'Tutoriel pour exécuter du code natif à partir de Java avec JNA, en 5 minutes'
tags: [Java]
direct_link:
image: /images/jnalogo.jpg
description: JNI et JNA sont deux technologies qui permettent d'adresser du code natif dans du code Java. Nous explorerons dans cet article une comparaison de ces deux technologies en les appliquant à un même exemple dans le but de dresser un bilan de leur utilisation.
category: Article
date: 2009-09-28
update: 2013-05-24
weight: 7
toc: true
---

Ce tutoriel s'intéresse à présenter l'utilisation de la bibliothèque JNA pour adresser du code natif dans du code Java. Alors que le précédent tutoriel ([lien](/java/executer-code-natif-avec-jni-jna)) se focalisait sur les différences entre JNA et JNI, ce nouveau tutoriel se propose de montrer via un exemple complet comment utiliser exclusivement JNA en 5 minutes.

Les expérimentations se feront à partir de Mac OS X. Bien entendu, tout système supportant la plateforme Java peut être utilisé pour reproduire cette expérimentation.

## Présentation de JNA

Avant de présenter JNA, focalisons-nous rapidement sur JNI qui est historiquement le premier moyen d'adresser du code natif avec la plateforme Java. JNI (Java Native Interface) est une couche de programmation qui permet à du code Java d'appeler ou d'être appelé par du code natif. Il n'existe pas réellement de bibliothèque à télécharger pour faire du JNI puisque cette couche de programmation est fournie par défaut dans le JDK. Toutefois, au moment de la création de projets JNI, des fichiers header C (identification de la JVM par exemple) devront être liés lors de la phase de liaison. Ces fichiers header sont disponibles à la racine du répertoire JDK dans le répertoire *%JAVA_HOME%\include*. En fonction du système d'exploitation vous trouverez un sous-répertoire proposant des fichiers header spécifiques. Par exemple pour Windows *%JAVA_HOME%\include\win32* ou pour Mac OS *%JAVA_HOME%\include\darwin*.

JNA (Java Native Access) est une API permettant d'accéder à du code natif sans faire appel explicitement à la couche de programmation JNI. Le développement nécessite une interface Java pour décrire le prototype, les fonctions et les structures contenus dans le code natif à appeler.

Contrairement à JNI, l'utilisation de JNA nécessite le téléchargement d'une bibliothèque spécifique. Vous trouverez donc sur le site de JNA la bibliothèque à télécharger, puis de nombreux exemples mettant en œuvre cette bibliothèque.

* Site de JNA : [github.com/java-native-access/jna](https://github.com/java-native-access/jna). 
* Bibliothèque JNA : [maven.java.net/content/repositories/releases/net/java/dev/jna/jna/](https://maven.java.net/content/repositories/releases/net/java/dev/jna/jna/).

## Développer une bibliothèque native via le langage C

Nous allons réaliser un programme *C* minimaliste qui affiche un texte sur la console.

* Commencer par créer et éditer le fichier *helloworld.h*.

```h
void display(char* ch);
```

* Créer la partie implémentation en éditant ce fichier *helloworld.c*.

```c
#include "helloworld.h"
#include <stdlib.h>
#include <stdio.h>

void display(char* ch) {
    printf("%s", ch);
}
```

* Depuis la ligne de commande, compiler l'exemple

```console
gcc -c helloworld.c
```

* Puis fabriquer la bibliothèque

```console
gcc -dynamiclib helloworld.o -o helloworld.dylib
```

À la fin de cette section vous devriez avoir un fichier *helloworld.dylib*. Si bien entendu vous êtes sur un autre système que Mac OS X vous devriez avoir un fichier *helloworld.so* pour Linux, et *helloworld.dll* pour Windows.

## Développer un programme Java qui appelle la bibliothèque native

Nous allons maintenant créer un projet Java, ajouter la dépendance Maven, et faire le lien avec la bibliothèque :

* Créer un projet Maven à partir de votre environnement de développement préféré.

* Ajouter la dépendance vers la bibliothèque JNA.

```xml
<dependency>
  <groupId>net.java.dev.jna</groupId>
  <artifactId>jna</artifactId>
  <version>4.3.0</version>
</dependency>
```

* Créer une interface qui permettra de faire le lien entre les fonctions définies dans le C et les méthodes Java.

```java
public interface CHelloWorld extends Library {
  CHelloWorld INSTANCE = (CHelloWorld) Native.loadLibrary("helloworld",    CHelloWorld.class);

  void display(String g);

  int printf(String format, Object... args); // From stdio
}
```

La première instruction permet de charger en mémoire la bibliothèque native et d'associer les fonctions présentes dans le fichier .h avec les méthodes Java de l'interface `CHelloWorld`. Deux méthodes ont été définies : La première permet de se mapper sur la fonction `hello(char* ch)`. La seconde se mappe sur une fonction non définie par nos soins mais définie dans la bibliothèque *stdlib*. Le fichier *helloworld.dylib* que nous avons créé dans la section précédente doit être à la racine du classpath du projet.

* Créer un programme principal qui appelle les fonctions natives

```java
public class Launcher {
  public static void main(String[] args) {
    CHelloWorld.INSTANCE.display("Bonjour tout le monde\n");
    CHelloWorld.INSTANCE.printf("J'ai %d chats", 2);
  }
}
```

* Exécuter le programme principal. Vous devriez obtenir ce résultat

```console
Bonjour tout le monde
J'ai 2 chats
```

## Conclusion et remerciements

Nous venons de réaliser une première expérimentation avec JNA. Cette solution est plus simple que celle de JNI car elle n'impose pas de compiler des dépendances de JNI dans son projet C. Par ailleurs, l'utilisation de JNA est pratique si vous avez déjà une bibliothèque native existante. Malheureusement il y aura un coût en terme de performance. Une réponse à cela a été apportée ici : [https://github.com/java-native-access/jna/blob/master/www/FrequentlyAskedQuestions.md#how-does-jna-performance-compare-to-custom-jni](https://github.com/java-native-access/jna/blob/master/www/FrequentlyAskedQuestions.md#how-does-jna-performance-compare-to-custom-jni). Le choix entre JNA ou JNI devra se poser quand la bibliothèque que vous souhaitez réaliser nécessite de hautes performances. Clairement dans notre exemple jouet, cela n'aura pas un grand impact d'utiliser JNI.

Bien entendu nous avons rapidement survolé la bibliothèque JNA. Il reste encore beaucoup de choses à étudier comme la conversion de type entre le langage Java et le langage C. Nous invitons les lecteurs à se rendre sur la page officielle de JNA pour plus de détails : [github.com/java-native-access/jna](https://github.com/java-native-access/jna).

Cet article est disponible sur le site de [Developpez.com](https://mbaron.developpez.com/tutoriels/java/executer-code-natif-jna-5-minutes/).

Nous tenons à remercier [fearyourself](https://www.developpez.net/forums/u78956/fearyourself/) pour la relecture technique et [Maxy35](https://www.developpez.net/forums/u1015211/maxy35/) pour la correction orthographique.
