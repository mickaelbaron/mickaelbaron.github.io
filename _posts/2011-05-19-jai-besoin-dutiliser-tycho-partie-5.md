---
title: 'J''ai besoin ... d''utiliser Tycho - Partie 5 : Construction d''un product Eclipse'
tags: [Eclipse, Tycho]
category: technical
description: Ce billet se propose d'utiliser Tycho pour construire automatiquement un product Eclipse avec Maven 3 et son plugin Tycho.
blogger_orig_url: https://keulkeul.blogspot.com/2011/05/jai-besoin-dutiliser-tycho-partie-5.html
twitter: 71265110626271232
---

Je reviens dans la série des J'ai besoin ... d'utiliser Tycho pour vous décrire cette fois-ci comment construire automatiquement un product Eclipse avec Maven 3 et son plugin Tycho.

Pour rappel, il y a presque un an j'expliquais dans un [billet](% post_url 2010-05-09-jai-besoin-dutiliser-tycho-partie-4 %}) comment construire automatiquement un bundle OSGi à partir d'un entrepôt p2. Depuis tout ce temps que s'est-il passé ? Tycho a évolué, de nombreux billets d'explication sont apparues sur la toile, des projets sont passés à Tycho et finalement Tycho est devenu un projet de la fondation Eclipse. Par conséquent de nombreuses sources d'inspiration sont à disposition.  

De nombreux problèmes sur la manière d'utiliser Tycho ont été résolus via le [tutoriel](http://www.eclipsecon.org/2011/sessions/sessions?id=2049) proposé à l'EclipseCON 2011. C'est pour cette raison que la première partie de ce billet se veut être une mise à jour des précédents billets relatifs à Tycho.

## Pré-requis logiciel  

Au niveau des pré-requis logiciel pour rejouer cet atelier veuillez installer les outils suivants :

* [Maven 3](http://maven.apache.org/download.html) ;
* [Eclipse 3.6](http://www.eclipse.org/) (voir Eclipse 3.7 M6) ;
* [M2Eclipse](http://m2eclipse.sonatype.org/).

* Démarrer Eclipse en choisissant un nouveau Workspace et configurer le plugin M2Eclipse de façon à pointer sur le bon fichier settings.xml.  

## Création d'un projet Agrégateur (keulkeul.tychorcpdemo.aggregator)

Ce projet Agrégateur aura comme seul but de contenir tous les sous projets (plugins, feature, tests, repository p2...). Du point de vue Maven il s'agira de décrire dans le fichier pom.xml tous les sous modules.  

Veuillez suivre la démarche ci-dessous :

* Ouvrir l'assistant de création de projet *File -> New -> Other ...*.

* Choisir l'élément Maven Project de la catégorie Maven, l'écran ci-dessous doit apparaître

![/images/01-NewMavenProjectAggregator.jpg](/files/01-NewMavenProjectAggregator.jpg)

* Cocher l'option Create a simple project (*skip archetype selection*), puis faire *Next*.

![/images/02-NewMavenProjectAggregator.jpg](/images/02-NewMavenProjectAggregator.jpg)

* Dans le champ de texte *Group Id* saisir la valeur `tychorcpdemo`.

* Dans le champ de texte *Artifact Id* saisir la valeur `keulkeul.tychorcpdemo.aggregator`.

* Au niveau de la sélection *Packaging* sélectionner la valeur `pom` puis faire *Finish*.

Un nouveau projet Maven sera créé contenant un fichier *pom.xml*. Nous modifierons ce fichier à chaque fois que nous ajouterons un nouveau module.

## Création du plugin RCP (keulkeul.tychorcpdemo.rcp)  

Ce plugin est particulier dans le sens où il s'agit d'un Rich Client Application ce qui signifie qu'il peut être utilisé seul. Comme l'idée n'est pas d'apprendre à créer un plugin RCP nous utiliserons un exemple patron.

* Ouvrir l'assistant de création de projet *File -> New -> Other ...*.

* Choisir l'élément *Plug-in Project* depuis la catégorie *Plug-in Development*, puis faire *Next*. L'écran ci-dessous doit apparaître.

![/images/03-NewRCPProject.jpg](/images/03-NewRCPProject.jpg)

* Dans le champ *Project Name* saisir la valeur `keulkeul.tychorcpdemo.rcp`.

* Décocher l'option *Use default location*.

* Créer un répertoire *keulkeul.tychorcpdemo.rcp* à la racine du répertoire du projet agrégateur créé précédemment, puis faire *Next*. L'écran suivant doit apparaître.

![/images/04-NewRCPProject.jpg](/images/04-NewRCPProject.jpg)

* Cocher la case *Would you like to create a rich client application* ? puis faire *Next*. L'écran suivant doit apparaître.

![/images/05-NewRCPProject.jpg](/images/05-NewRCPProject.jpg)

* Choisir comme patron RCP application with a view puis faire Next. L'écran suivant doit apparaître.  

![/images/06-NewRCPProject.jpg](/images/06-NewRCPProject.jpg)

* Dans le champ *Application window title* saisir la valeur `Keulkeul Tycho RCP Demo Application`.

* Sélectionner l'option *Add branding* ce qui permettra d'être identifié comme un product lors de la création de la configuration d'exécution, puis faire *Finish*.

Un nouveau projet *keulkeul.tychorcpdemo.rcp* vient d'être créé. Pour s'assurer que ce plugin RCP fonctionne nous allons créer une configuration d'exécution.

* Ouvrir l'écran de création des configurations. Depuis le menu principal *Run -> Run Configurations ...*, l'écran suivant doit apparaitre.

![/images/09-CreateRCPConfiguration.jpg](/images/09-CreateRCPConfiguration.jpg)

* Créer une nouvelle configuration de type *Eclipse Application* dont le nom sera *TychoRCPDemo*.

* Choisir depuis *Run a product* la valeur `keulkeul.tychorcpdemo.rcp.product` (uniquement disponible si vous aviez coché l'option *Add branding*. Sélectionner l'onglet *Plug-ins* et vous devriez obtenir l'écran suivant.

![/images/10-CreateRCPConfiguration.jpg](/images/10-CreateRCPConfiguration.jpg)

* Choisir depuis *Launch* with la valeur `plug-ins selected below only`.

* Décocher tous les plugins présents depuis le noeud racine *Target Platform*.

* Sélectionner uniquement le plugin *keulkeul.tychorcpdemo.rcp* depuis le nœud racine *Workspace*.

* Cliquer sur *Add Required Plug-ins* pour ajouter uniquement les plugins requis à l'exécution de ce plugin RCP.

* Faire *Run*. Vous devriez obtenir l'écran suivant :  

![/images/11-ExecuteRCPConfiguration.jpg](/images/11-ExecuteRCPConfiguration.jpg)

* Ajouter un nouveau fichier Maven *pom.xml* à la racine de ce projet (*keulkeul.tychorcpdemo.rcp*) dont le contenu est le suivant :

```xml
<project>  
 <modelversion>4.0.0</modelversion>  
 <parent>  
  <groupid>tychorcpdemo</groupid>  
  <artifactid>keulkeul.tychorcpdemo.parent</artifactid>  
  <version>1.0.0-SNAPSHOT</version>  
  <relativepath>../keulkeul.tychorcpdemo.parent/pom.xml</relativepath>  
 </parent>  
 <groupid>tychorcpdemo</groupid>  
 <artifactid>keulkeul.tychorcpdemo.rcp</artifactid>  
 <version>1.0.0-SNAPSHOT</version>  
 <packaging>eclipse-plugin</packaging>  
</project>
```

* Comme vous pouvez le constatez ce fichier *pom.xml* fait référence à un *pom.xml* parent que nous définirons plus tard. Intéressons-nous avant à ajouter le projet *keulkeul.tychorcpdemo.rcp* comme module au projet *keulkeul.tychorcpdemo.aggregator*. Par conséquent modifier le fichier *pom.xml* du projet *keulkeul.tychorcpdemo.aggregator* de cette manière.

```xml
<project>  
 <modelVersion>4.0.0</modelVersion>  
 <groupId>tychorcpdemo</groupId>  
 <artifactId>keulkeul.tychorcpdemo.aggregator</artifactId>  
 <version>1.0.0-SNAPSHOT</version>  
 <packaging>pom</packaging>  
 <modules>  
  <module>keulkeul.tychorcpdemo.parent</module>  
  <module>keulkeul.tychorcpdemo.rcp</module>  
 </modules>  
</project>  
```

* De même nous profitons de cette modification pour ajouter un autre module *keulkeul.tychorcpdemo.parent*.

## Création d'un projet parent (keulkeul.tychorcpdemo.parent)  

Le projet parent a pour objectif de contenir toutes les configurations propres à Tycho dont tous les plugins auront besoin. Il contiendra également les liens vers les entrepôts p2.
  
La démarche de création de ce projet est identique à celle utilisée pour créer le projet *keulkeul.tychorcpdemo.aggregator* à la différence que ce projet doit être placé à la racine du projet agrégateur. Pour les valeurs à donner dans le nouveau fichier pom.xml, suivre les indications données ci-dessous.

* Dans le champ de texte *Group Id* saisir la valeur `tychorcpdemo`.

* Dans le champ de texte *Artifact Id* saisir la valeur `keulkeul.tychorcpdemo.parent`.

* Au  niveau de la sélection *Packaging* sélectionner la valeur `pom` puis faire *Finish*.

* Compléter le fichier *pom.xml* généré par les informations liées à la configuration de Tycho.

```xml
<project>  
 <modelVersion>4.0.0</modelVersion>  
 <groupId>tychorcpdemo</groupId>  
 <artifactId>keulkeul.tychorcpdemo.parent</artifactId>  
 <version>1.0.0-SNAPSHOT</version>  
 <packaging>pom</packaging>  
  
 <properties>  
  <tycho-version>0.11.0</tycho-version>  
 </properties>  
  
 <repositories>  
  <!-- configure p2 repository to resolve against -->  
  <repository>  
   <id>helios</id>  
    <layout>p2</layout>  
    <url>http://download.eclipse.org/releases/helios/</url>  
  </repository>  
 </repositories>  
 <build>  
 <plugins>  
  <plugin>  
   <!-- enable tycho build extension -->  
   <groupId>org.sonatype.tycho</groupId>  
   <artifactId>tycho-maven-plugin</artifactId>  
   <version>${tycho-version}</version>  
   <extensions>true</extensions>  
  </plugin>  
 </plugins>  
 </build>  
</project>  
```

À ce niveau, vous devriez obtenir la structure de fichiers suivante.

```console
keulkeul.tychorcpdemo.aggregator \\-  
 pom.xml  
 keulkeul.tychorcpdemo.parent \\-  
  pom.xml  
 keulkeul.tychorcpdemo.rcp \\-  
  src \\-  
 pom.xml  
```

## Démarrer une construction du projet via Maven  

* Ouvrir l'invite de commandes de Windows et se placer à la racine du répertoire parent. Saisir la ligne de commande ci-dessous :  

```console
mvn clean install  
```

Normalement si tout se passe bien vous devriez obtenir le message suivant :  

![/images/12-RunMavenBuild.jpg](/images/12-RunMavenBuild.jpg)

## Création d'un projet feature (keulkeul.tychorcpdemo.feature)  

Ce projet de type feature va nous permettre de regrouper dans une feature l'ensemble des plugins de notre application. Il faut admettre que pour l'instant il y en a pas énormément. L'idée est que si vous souhaitez ajouter de nouveaux plugins, vous n'aurez qu'à modifier cette feature.

* Ouvrir l'assistant de création de projet *File -> New -> Other ...*.

* Choisir l'élément *Feature Project* depuis la catégorie *Plug-in Development*, puis faire *Next*. L'écran ci-dessous doit apparaître.

![/images/13-NewFeatureProject.jpg](/images/13-NewFeatureProject.jpg)

* Choisir comme nom de projet *keulkeul.tychorcpdemo.feature*.

* Personnaliser le répertoire de travail pour être à la racine du projet *keulkeul.tychorcpdemo.aggregator*.

* Choisir depuis la liste des plugins disponibles (Initialize from the plug-ins list) le plugin *keulkeul.tychorcpdemo.rcp* puis faire *Finish*.

Un nouveau projet *keulkeul.tychorcpdemo.feature* vient d'être créé.  

* Ajouter un nouveau fichier Maven *pom.xml* à la racine de ce projet dont le contenu est le suivant.

```xml
<project>  
 <modelVersion>4.0.0</modelVersion>  
 <parent>  
  <groupId>tychorcpdemo</groupId>  
  <artifactId>keulkeul.tychorcpdemo.parent</artifactId>  
  <version>1.0.0-SNAPSHOT</version>  
  <relativePath>../keulkeul.tychorcpdemo.parent/pom.xml</relativePath>  
 </parent>  
 <groupId>tychorcpdemo</groupId>  
 <artifactId>keulkeul.tychorcpdemo.feature</artifactId>  
 <version>1.0.0-SNAPSHOT</version>  
 <packaging>eclipse-feature</packaging>  
</project>
```

* Ajouter ce nouveau projet comme module en complétant le *pom.xml* du projet *keulkeul.tychorcpdemo.aggregator*.

* Vérifier que l'application se construit correctement via un `$ mvn clean install`.

## Création d'un projet update site (keulkeul.tychorcpdemo.repository)

Nous attaquons maintenant la partie intéressante de ce billet. A ce stade rien de nouveau par rapport aux autres billets hormis peut être la ré-organisation des différents plugins. Ce nouveau projet a but de créer un update site de notre projet. Cela permettra ainsi d'utiliser l'outil de mise à jour pour installer nos nouveaux plugins.  

* Ouvrir l'assistant de création de projet *File -> New -> Other ...*.

* Choisir l'élément *Plug-in Project* depuis la catégorie *Plug-in Development*, puis faire *Next*. L'écran ci-dessous doit apparaître.

![/images/14-NewUpdateSiteProject.jpg](/images/14-NewUpdateSiteProject.jpg)

* Choisir comme nom de projet *keulkeul.tychorcpdemo.repository*.

* Personnaliser le répertoire de travail pour être à la racine du projet *keulkeul.tychorcpdemo.aggregator*.

* Cocher l'option *Generate a web page listing all available features within the site* puis faire *Finish*.

* Depuis le nouveau projet généré, renommer le fichier *site.xml* en *category.xml*.

* Ouvrir le fichier *site.xml* et depuis l'onglet *Site Map* créer une catégorie une nouvelle catégorie appelée *TychoRCPDemo*.

* Depuis cette nouvelle catégorie ajouter la feature *keulkeul.tychorcpdemo.feature* créée précédemment (voir capture d'écran ci-dessous).

![/images/15-NewUpdateSiteProject.jpg](/images/15-NewUpdateSiteProject.jpg)

* Ajouter un nouveau fichier Maven *pom.xml* à la racine de ce projet dont le contenu est le suivant :

```xml
<project>  
 <modelVersion>4.0.0</modelVersion>  
 <parent>  
  <groupId>tychorcpdemo</groupId>  
  <artifactId>keulkeul.tychorcpdemo.parent</artifactId>  
  <version>1.0.0-SNAPSHOT</version>  
  <relativePath>../keulkeul.tychorcpdemo.parent/pom.xml</relativePath>  
 </parent>  
 <groupId>tychorcpdemo</groupId>  
 <artifactId>fr.ensma.lisi.tychorcpdemo.repository</artifactId>  
 <version>1.0.0-SNAPSHOT</version>  
 <packaging>eclipse-repository</packaging>  
</project>
```

* Ajouter ce nouveau projet comme module en complétant le *pom.xml* du projet *keulkeul.tychorcpdemo.aggregator*.

* Vérifier que l'application se construit correctement via un `$ mvn clean install`.

## Création d'un fichier product (keulkeul.tychorcpdemo.repository)

Le fichier *product* contient toutes les informations relatives à la construction d'un exécutable Eclipse (plateformes supportées, le splashscreen, le nom de l'application, les images...).  

* Ouvrir l'assistant de création de projet *File -> New -> Other ...*.

* Choisir l'élément *Product Configuration* depuis la catégorie *Plug-in Development*, puis faire *Next*. L'écran ci-dessous doit apparaître.

![/images/17-CreateRCPProduct.jpg](/images/17-CreateRCPProduct.jpg)

* Choisir le projet *keulkeul.tychorcpdemo.repository*.

* Saisir la valeur `tychorcpdemo.product` dans le champ *File name*.

* Choisir pour l'option *Use a launch configuration* la valeur `TychoRCPDemo` puis faire *Finish*.

* Éditer en mode texte le fichier *tychorcpdemo.product* (sans l'éditeur de configuration de product) et ajouter les instructions suivantes qui permettront de démarrer les plugins adéquates au lancement de l'application RCP.

```xml
<configurations>  
 <plugin id="org.eclipse.core.runtime" autoStart="true" startLevel="0" />  
 <plugin id="org.eclipse.equinox.common" autoStart="true" startLevel="2" />  
 <plugin id="org.eclipse.osgi" autoStart="true" startLevel="-1" />  
</configurations>
```

* Depuis l'onglet *Overview* du mode édition du fichier *tychorcpdemo.product*, saisir la valeur *TychoRCPDemo.product*.

* Modifier l'option *The Product configuration is based on* par la valeur `features`.

* S'assurer que la valeur `keulkeul.tychorcpdemo.rcp.product` est sélectionnée pour l'option *Product* et que la valeur `keulkeul.tychorcpdemo.rcp.application` est sélectionnée pour l'option *Application*. Voir capture d'écran ci-dessous.

![/images/18-CreateRCPProduct.jpg](/images/18-CreateRCPProduct.jpg)

* Depuis l'onglet *Dependencies* choisir la valeur `keulkeul.tychorcpdemo.feature`. Voir capture d'écran ci-dessous.

![/images/19-CreateRCPProduct.jpg](/images/19-CreateRCPProduct.jpg)

* Pour construire un product Eclipse selon un environnement donné (OS/WS/Arch) compléter le fichier pom.xml du projet keulkeul.tychorcpdemo.repository comme présenté ci-dessous :  

```xml
...
 <build>  
  <plugins>  
   <plugin>  
    <groupId>org.sonatype.tycho</groupId>  
    <artifactId>tycho-p2-director-plugin</artifactId>  
    <version>${tycho-version}</version>  
    <executions>  
     <execution>  
      <id>materialize-products</id>  
      <goals>  
       <goal>materialize-products</goal>  
      </goals>  
     </execution>  
    </executions>  
   </plugin>  
  </plugins>  
 </build>  
</project>
```

Finalement depuis le projet *feature* (*keulkeul.tychorcpdemo.feature*), il nous reste à ajouter le fragment SWT correspondant à la plateforme Windows de façon à construire le product pour cette plateforme.

* Ouvrir le fichier *feature.xml* et afficher l'onglet *Plug-ins*.

* Ajouter la feature *org.eclipse.swt.win32.win32.x86* et définir la valeur `win32` dans le champ *Operating Systems*, la valeur `win32` dans le champ *Window Systems* et la valeur `x86` dans le champ *Architecture*. Voir capture d'écran ci-dessous pour voir le résultat attendu.

![/images/20-AddSWTFeature.JPG](/images/20-AddSWTFeature.JPG)

* Vérifier que l'application se construit correctement via un `$ mvn clean install`. Depuis le répertoire *keulkeul.tychorcpdemo.repository/target/products/TychoRCPDemo.product/win32/win32/x86* vous devriez obtenir le résultat de cette construction. Un product Eclipse construit automatiquement à l'aide de Maven/Tycho.

## À suivre

L'ensemble des sources de ce billet sont disponibles à cette [adresse](/files/keulkeul.tychorcpdemo.aggregator.zip).
  
Dans le prochain billet, je montrerai différents paramétrages concernant le product Eclipse, comment utiliser différents entrepôts p2, comment construire un product Eclipse pour différentes plateformes...