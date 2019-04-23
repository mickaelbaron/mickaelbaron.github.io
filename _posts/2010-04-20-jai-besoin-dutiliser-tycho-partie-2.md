---
title: 'J''ai besoin ... d''utiliser Tycho - Partie 2 : Générer les poms Maven'
tags: [Eclipse, Tycho]
blogger_orig_url: https://keulkeul.blogspot.com/2010/04/jai-besoin-dutiliser-tycho-partie-2.html
category: technical
description: Ce billet se propose de vous montrer comment générer à partir de n'importe quel projet OSGi (bundle et plugin) les descripteurs pom.xml utilisés par Maven.
---

Dans le [billet précédent]({% post_url 2010-04-11-jai-besoin-dutiliser-tycho-partie-1 %}), nous avons présenté l'installation de Maven 3. Toutefois, pour l'instant nous n'avons pas encore exploité Tycho. Ce billet se propose de vous montrer comment générer à partir de n'importe quel projet OSGi (bundle et plugin) les descripteurs pom.xml utilisés par Maven.  

Au niveau des logiciels utilisés en plus de Maven 3, nous trouvons Eclipse 3.5.2 avec le plugin m2eclipse pour faciliter l'édition des pom.xml. A noter que seul Maven 3 est obligatoire. Par ailleurs, l'expérimentation se fera sous Windows 7 64bits.  
  
Pour commencer en douceur, nous allons utiliser un bundle OSGi dont l'objectif est d'afficher sur la console "HelloWorld Tycho". Dans la suite de cette série des J'ai besoin ..., nous développerons également une application RCP basée sur plusieurs plugins.  
  
## Construire un bundle OSGi

Une application à base OSGi est définie par un ensemble de bundles OSGi. Par conséquent nous définissons un répertoire parent contenant un ensemble de sous répertoires. Chaque sous répertoire est un bundle OSGi. Du point de vue Maven le répertoire parent va contenir un pom.xml qui listera des modules. Chaque module sera défini par un pom.xml localisé à la racine de chaque répertoire.  
  
Dans la suite, nous montrons comment construire le répertoire parent et le répertoire du bundle OSGi.

* Ouvrir l'assistant de création de bundle OSGI (File -> New -> Project ... et choisir Plug-in Project).

![/images/newosgibundle1-tychopart2.jpg](/images/newosgibundle1-tychopart2.jpg)

* Dans le nom du projet choisir `eclipse.tycho.osgifirstbundle`.

* Pour l'emplacement de sauvegarde du contenu du bundle choisir un répertoire situé sous un répertoire parent. Exemple : *D:\\workspaceTycho\\eclipse.tycho.osgifirstexample\\eclipse.tycho.osgifirstbundle* où `eclipse.tycho.osgifirstexample` désigne le nom du répertoire parent et où `eclipse.tycho.osgifirstbundle` désigne le répertoire du bundle.

* Choisir Equinox comme plateforme cible et faire Next.

![/images/newosgibundle2-tychopart2.jpg](/images/newosgibundle2-tychopart2.jpg)

* Laisser les paramètres par défaut de cet écran puis faire Next

![/images/newosgibundle3-tychopart2.jpg](/images/newosgibundle3-tychopart2.jpg)

* Choisir comme patron de développement le patron Hello OSGi Bundle puis faire Next

![/images/newosgibundle4-tychopart2.jpg](/images/newosgibundle4-tychopart2.jpg)

* Modifier le message Hello World!! en Hello World Tycho!! puis faire Finish

Le bundle est maintenant créé et vous devriez obtenir l'arborescence suivante sur votre disque.  

```console
d: \\-  
 workspaceTycho \\-  
  eclipse.tycho.osgifirstexample \\-  
   eclipse.tycho.osgifirstbundle \\-  
    META-INF \\-  
     MANIFEST.MF  
    src \\-  
     eclipse \\-  
      tycho \\-  
       osgifirstbundle \\-  
        Activator.java  
    .classpath  
    .project  
```

## Générer les pom.xml  

Nous allons compléter cette arborescence en ajoutant deux fichiers *pom.xml* localisés respectivement dans le répertoire *parent* et le répertoire *bundle*.
  
Deux solutions disponibles : soit vous les ajoutez manuellement soit vous les générez via un plugin Maven fourni par Tycho : `maven-tycho-plugin:generate-poms`. Nous choisirons la seconde solution pour créer les fichiers *pom.xml*.
  
* Pour ce faire, ouvrir l'invite de commande de Windows puis se placer dans le répertoire parent *eclipse.tycho.osgifirstexample*.

```console
mvn3 org.sonatype.tycho:maven-tycho-plugin:generate-poms -DgroupId=eclipse.tycho
```

Cette ligne de commande va tout d'abord télécharger toutes les dépendances nécessaire à l'exécution du plugin Tycho sous Maven.

* Examiner le répertoire *repoMaven3* (défini lors de l'installation de Maven 3) pour remarquer toutes les dépendances téléchargées.  
  
Une fois ces dépendances téléchargées, les deux fichiers *pom.xml* sont générés.  
  
Ci-dessous le fichier de description Maven du répertoire parent.  

```xml
<?xml version="1.0" encoding="UTF-8"?>  
<project xsi:schemaLocation="http://maven.apache.org/POM/4.0.0...>  
 <modelVersion>4.0.0</modelVersion>  
 <groupId>eclipse.tycho</groupId>  
 <artifactId>eclipse.tycho.osgifirstexample</artifactId>  
 <version>0.0.1-SNAPSHOT</version>  
 <packaging>pom</packaging>  
 <modules>  
  <module>eclipse.tycho.osgifirstbundle</module>  
 </modules>  
 <build>  
  <plugins>  
   <plugin>  
    <groupId>org.sonatype.tycho</groupId>  
    <artifactId>tycho-maven-plugin</artifactId>  
    <version>0.8.0</version>  
    <extensions>true</extensions>  
   </plugin>  
  </plugins>  
 </build>  
</project>  
```

Vous remarquerez que le descripteur du répertoire parent défini le type de packaging (dans quel but le projet doit être construit) comme étant pom. Il liste également l'ensemble des modules qu'il assemble. Par ailleurs, il est précisé que le plugin Tycho est à utiliser.
  
Ci-dessous le fichier de description *pom.xml* du bundle *eclipse.tycho.osgifirstbundle* (défini comme un module Maven).  

```xml
<?xml version="1.0" encoding="UTF-8"?>  
<project xsi:schemaLocation="http://maven.apache.org/POM/4.0.0... >  
 <modelVersion>4.0.0</modelVersion>  
 <parent>  
  <artifactId>eclipse.tycho.osgifirstexample</artifactId>  
  <groupId>eclipse.tycho</groupId>  
  <version>0.0.1-SNAPSHOT</version>  
 </parent>  
 <groupId>eclipse.tycho</groupId>  
 <artifactId>eclipse.tycho.osgifirstbundle</artifactId>  
 <version>1.0.0-SNAPSHOT</version>  
 <packaging>eclipse-plugin</packaging>  
</project>  
```

Ce descripteur *pom.xml* définit le type de packaging comme étant un `eclipse-plugin`.  

Comme vous pouvez constater les fichiers de description sont réduits au minimum. Aucune information concernant des dépendances n'a été donnée. En fait le descripteur du bundle *eclipse.tycho.osgifirstbundle* s'appuie sur le descripteur OSGi *MANIFEST.MF* pour établir les dépendances nécessaires.  
  
## À suivre ...

Dans le prochain billet, nous montrerons comment construire le bundle *eclipse.tycho.osgifirstbundle* à partir d'une plateforme cible localisée physiquement sur le disque.