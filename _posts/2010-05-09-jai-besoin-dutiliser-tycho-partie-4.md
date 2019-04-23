---
title: 'J''ai besoin ... d''utiliser Tycho - Partie 4 : Construction d''un bundle OSGi via p2'
tags: [Eclipse, Tycho]
blogger_orig_url: https://keulkeul.blogspot.com/2010/05/jai-besoin-dutiliser-tycho-partie-4.html
category: technical
description: Ce billet se propose de vous montrer comment générer à partir de n'importe quel projet OSGi (bundle et plugin) les descripteurs pom.xml utilisés par Maven.
---

Dans le précédent [billet]({% post_url 2010-04-30-jai-besoin-dutiliser-tycho-partie-3%}) nous avons montré comment construire un bundle OSGi en se basant sur une plateforme locale pour récupérer les dépendances nécessaires. Cette solution impose que toutes les versions des plateformes soient disponibles physiquement sur le disque. Ceci a comme contrainte de devoir télécharger manuellement les plateformes en fonction des versions souhaitées. Par pratique quand il y a besoin de tester sur des versions type SNAPSHOT.  
  
Le plugin Tycho permet d'utiliser un repository p2 pour récupérer les dépendances nécessaires à la construction du bundle. A noter que les dépendances dans le monde OSGi correspondent à des bundles. Dans le cas de l'exemple que nous construisons depuis le début, le bundle org.eclipse.osgi dans sa version 3.5.2 est utilisé (3.5.2.R35x\_v20100126 pour être exact puisque nous utilisons la plateforme Galileo). Tycho se chargera donc de télécharger à partir d'un repository p2 (à définir dans les paramètres du pom.xml) les dépendances requises et les stockera dans le repository local utilisé par Maven 3.  
  
## Cibler un repository p2  

Le plugin target-platform-configuration est utilisé pour aller chercher les dépendances vers un repository p2. Ce plugin permet de paramétrer les informations concernant la plateforme à utiliser.  
  
Ci-dessous, le fichier pom.xml du répertoire parent qui a été modifié par rapport au précédent billet :  

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
 <plugin>  
  <groupId>org.sonatype.tycho</groupId>  
  <artifactId>target-platform-configuration</artifactId>  
  <configuration>  
   <resolver>p2</resolver>  
  </configuration>  
 </plugin>  
</plugins>  
</build>  
<repositories>  
 <repository>  
  <id>galileo</id>  
  <layout>p2</layout>  
  <url>http://download.eclipse.org/releases/galileo/</url>  
 </repository>  
</repositories>  
</project>
```

D'une part, nous indiquons que le plugin target-platform-configuration est utilisé et qu'il doit s'appuyer sur un repository p2. D'autre part, nous donnons dans la balise `repository` (connue des utilisateurs de Maven) l'emplacement du repository p2 pour la version Eclipse Galileo.

* Ouvrir l'invite de commandes de Windows et se placer à la racine du répertoire parent. Saisir la ligne de commande ci-dessous :

```console
mvn3 clean package
```

Pendant le traitement de la construction du bundle, vous remarquerez que Maven via Tycho récupère la dépendance org.eclipse.osgi dans sa version 3.5.2.  

* Cibler plusieurs repository p2  

Un point intéressant est d'exploiter les profiles Maven pour choisir le repository p2 qui sera utilisé pour récupérer les dépendances nécessaires.  
  
Ci-dessous, le fichier pom.xml du répertoire parent qui a été complété.  

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
 <plugin>  
  <groupId>org.sonatype.tycho</groupId>  
  <artifactId>target-platform-configuration</artifactId>  
  <configuration>  
   <resolver>p2</resolver>  
  </configuration>  
 </plugin>  
</plugins>  
</build>  
<profiles>  
 <profile>  
  <id>galileo</id>  
  <activation>  
   <activeByDefault>true</activeByDefault>  
  </activation>  
  <repositories>  
   <repository>  
    <id>galileo</id>  
    <url>http://download.eclipse.org/releases/galileo/</url>  
    <layout>p2</layout>  
   </repository>  
  </repositories>  
 </profile>  
 <profile>  
  <id>helios</id>  
  <repositories>  
   <repository>  
    <id>helios</id>  
    <url>http://download.eclipse.org/releases/helios/</url>  
    <layout>p2</layout>  
   </repository>  
  </repositories>  
 </profile>  
</profiles>  
</project>  
```

* Pour choisir tel ou tel repository p2 il suffit d'indiquer le profile à exploiter. Ainsi pour utiliser le repository p2 dédié à Helios, saisir la ligne de commande ci-dessous :  

```console
mvn3 clean package -Phelios  
```

Les codes sources sont disponibles [ici](/files/eclipse.tycho.osgifirstexample.zip) pour la version sans profile et [ici](/files/eclipse.tycho.osgifirstexamplewithprofile.zip) pour la version avec profile.  
  
## À suivre...

Dans le prochain billet nous nous attaquerons à la construction d'applications Eclipse RCP qui à la différence des bundles OSGi nécessitent des paramétrages supplémentaires liés à la plateforme d'exécution (OS, type de processeur \[32 ou 64 bits\]...).