---
title: Java Native Access (JNA)
tags: [Java]
blogger_orig_url: https://keulkeul.blogspot.com/2007/06/java-native-access-jna.html
category: technical
---

Il y a des projets qui font plaisirs quand on les découvre et, JNA en fait partie.

Ce projet actuellement dans l'incubateur des prochaines JDK offre la possibilité d'appeler des fonctions natives sans avoir besoin de passer explicitement par du JNI. Fini le temps où pour exploiter une fonction Win32 existante il fallait sortir l'arme lourde. J'entends par là qu'il fallait se munir d'un compilateur C, générer un .h et développer du C. Par contre si vous avez besoin de passer par du code natif vous avez simplement besoin de construire une DLL. La partie avec Javah n'est plus nécessaire.  

Ce projet s'occupe donc de masquer le développement de la couche JNI pour appeler du code natif.  

Bref voici un exemple tiré du site du projet. L'objectif étant de faire appel à la fonction `GetSystemTime` qui se trouve dans la DLL *kernel32.lib*.

On commence par définir une interface dont le but et la définition des fonctions et structure à exploiter. Noter l'héritage de StdCallLibrary qui précise l'ordre des paramètres. Enfin, on récupère une référence sur l'ouverture de la bibliothèque concernée.

```java
public interface Kernel32 extends StdCallLibrary {  
    Kernel32 INSTANCE = (Kernel32)Native.loadLibrary("kernel32", Kernel32.class);
  
    public static class SYSTEMTIME extends Structure {
        public short wYear;
        public short wMonth;
        public short wDayOfWeek;
        public short wDay;
        public short wHour;
        public short wMinute;
        public short wSecond;
        public short wMilliseconds;
    }  
  
    void GetSystemTime(SYSTEMTIME result);
    }
}
```

Au niveau utilisation de l'interface précédente voilà un petit exemple :

```java
public class Kernel32Impl {
    public static void main(String\[\] argv) {
        Kernel32 lib = Kernel32.INSTANCE;
        Kernel32.SYSTEMTIME time = new Kernel32.SYSTEMTIME();
        lib.GetSystemTime(time);
        System.out.println("Today's integer value is " + time.wDay);
    }
}
```

Le projet JNA se trouve ici : [JNA](https://github.com/java-native-access/jna).

Les sources du projet JNA sont disponibles. Vous trouverez par ailleurs un ensemble d'exemples.

Il y a également sur le [blog de Romain Guy](http://www.curious-creature.org/2007/04/10/translucent-swing-windows-on-mac-os-x/) un billet qui en parle.
  
Dans le même style que JNA, on peut trouver :

* [NLink](https://nlink.dev.java.net/) ;
* [NativeCall](http://johannburkard.de/software/nativecall/).

À noter que JNA est dans l'incubateur de la JDK donc potentiellement disponible dans les prochaines versions de Java.