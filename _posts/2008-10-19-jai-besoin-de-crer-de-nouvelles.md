---
title: J'ai besoin de... créer de nouvelles extensions dynamiquement
tags: [Eclipse]
blogger_orig_url: https://keulkeul.blogspot.com/2008/10/jai-besoin-de-crer-de-nouvelles.html
category: technical
---

Dans la série des « J'ai besoin de ... », je m'intéresse ici à toutes les solutions apportées par la plateforme Eclipse pour créer de nouvelles extensions de manière dynamique. 

Il s'agit de construire des extensions de façon programmative et non déclarative comme cela est obtenue avec l'outil PDE lors de la construction du fichier *plugin.xml*. Toutefois, les API de la plateforme Eclipse manquent de finition et malheureusement on se retrouve à devoir manipuler des implémentations internes pour réussir à créer programmatiquement les extensions. Dans les exemples qui vont suivre, nous allons nous intéresser à créer dynamiquement des vues via le point d'extension `org.eclipse.ui.views`.

La première solution repose essentiellement sur l'utilisation d'API Internes via la classe `ExtensionRegistry` et sa méthode `addExtension`. Je l'accorde, ce n'est pas la meilleure des solutions puisque l'implémentation interne peut changer à tout moment, mais elle mérite d'être présentée pour comprendre les rouages du fonctionnement de l'ajout d'extension dans le registre d'extension.

Ci-dessous est présenté un exemple permettant de créer une extension de type View.

```java
Bundle bundle = Activator.getDefault().getBundle();  
IContributor contributor = ContributorFactoryOSGi.createContributor(bundle);  

ConfigurationElementAttribute\[\] conf = new ConfigurationElementAttribute\[6\];  
conf\[0\] = new ConfigurationElementAttribute("id", "genericViewId" +sequenceId);  
conf\[1\] = new ConfigurationElementAttribute("name", "GenericView" + sequenceId);  
conf\[2\] = new ConfigurationElementAttribute("class",  "eclipse.extension.dynamicextensionexamples.views.GenericView");  
conf\[3\] = new ConfigurationElementAttribute("category", "eclipse.extension.DynamicExtensionExamples");  
conf\[4\] = new ConfigurationElementAttribute("restorable", "true");  
conf\[5\] = new ConfigurationElementAttribute("allowMultiple", "true");  

String extensionPointId = "org.eclipse.ui.views";
ConfigurationElementDescription configurationElements = newConfigurationElementDescription("view", conf, null, null);
Object token = reg.getTemporaryUserToken();  

ExtensionRegistry reg = (ExtensionRegistry)Platform.getExtensionRegistry();  
reg.addExtension("", contributor, false, "", extensionPointId, configurationElements, token);  

sequenceId++;  
```

La méthode `addExtension(String id, IContributor contributor, boolean persist, String label, String extensionId, ConfigurationElementDescription configuration, Object token)` requiert plusieurs paramètres dont la configuration utilisée est la suivante : l'identifiant `id` et le nom de l'extension `label` sont généralement vide (attention ne pas mettre `null`), contributor désigne le plug-in en charge de la création de l'extension, persist précise si les informations seront stockées à l'arrêt d'Eclipse et rechargées au démarrage, `extensionId` indique l'identifiant du point d'extension, `configuration` désigne les informations de l'extension généralement saisies à partir de PDE, finalement token est un clé utilisée pour contrôler les permissions. La séquence sequenceId permet d'obtenir un identifiant différent à chaque création.

Une évolution à cette première solution consiste à ne pas récupérer le Token via la méthode `getTemporaryUserToken()`. Un échappatoire est présenté dans cet [article](http://www-128.ibm.com/developerworks/opensource/library/os-ecl-dynext/) et dans ce [billet](http://michaelscharf.blogspot.com/2007/02/no-real-support-for-dynamic-extensions.html). L'idée est de placer à null la valeur du paramètre token de la méthode addExtension. Il faut cependant ajouter ce paramètre système `\-Declipse.registry.nulltoken=true` au démarrage de l'application Eclipse. 

Une évolution du code précédent est donné ci-dessous :

```java
...
String extensionPointId = "org.eclipse.ui.views";  
ConfigurationElementDescription configurationElements = newConfigurationElementDescription("view", conf, null, null);  
  
ExtensionRegistry reg = (ExtensionRegistry)Platform.getExtensionRegistry();  
reg.addExtension("",contributor,false,"",extensionPointId,configurationElements, null);  
sequenceId++;
```

Une seconde solution consiste à se refuser d'utiliser des APIs internes et d'utiliser les méthodes fournies par `IExtensionRegistry`. Il s'agit en fait de la solution qui doit être normalement retenue.

```java
Bundle bundle = Activator.getDefault().getBundle();  
IContributor contributor = ContributorFactoryOSGi.createContributor(bundle);  
  
String extension = "<plugin><extension point=\\"org.eclipse.ui.views\\">" +  
"<view category=\\"eclipse.extension.DynamicExtensionExamples\\"" +  
"class=\\"eclipse.extension.dynamicextensionexamples.views.GenericView\\"" +  
"icon=\\"icons/sample.gif\\"" +  
"id=\\"genericViewId" + sequenceId + "\\"" +  
"name=\\"GenericView" + sequenceId + "\\">" +  
"</view></extension></plugin>";  
  
InputStream is = new ByteArrayInputStream(extension.getBytes());  
  
IExtensionRegistry registry = RegistryFactory.getRegistry( );  
registry.addContribution(is, contributor, false, null, null, null);  
sequenceId++;
```

Aucune implémentation interne n'a été utilisée dans cette seconde solution. La méthode `addContribution( InputStream is, IContributor contributor, boolean persist, String name, ResourceBundle translationBundle, Object token)` requiert plusieurs paramètres dont la configuration utilisée est la suivante : `is` est le flux qui contient la description de l'extension; `contributor`, `persist` et `token` même utilisation que pour la méthode `addExtension`, `translationBundle` désigne le resource bundle pour d'éventuels besoins de traduction. À noter également que le paramètre `token` est `null` et pour rappel il faudra ajouter le paramètre système `\-Declipse.registry.nulltoken=true` au démarrage de l'application Eclipse.

Il est possible par ailleurs de construire dynamiquement des points d'extensions à partir de cette seconde solution.

Les sources de ces solutions sont disponibles [ici](/files/dynamicextensionexamples.zip).