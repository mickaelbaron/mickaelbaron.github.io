---
title: J'ai besoin de... sauvegarder et charger la description XML d'une perspective
tags: [Eclipse]
blogger_orig_url: https://keulkeul.blogspot.com/2008/11/jai-besoin-de-sauvegarder-et-charger-la.html
category: technical
---

Dans la série des « J'ai besoin de ... », je m'intéresse aujourd'hui à montrer au travers d'un prototype comment sauvegarder et charger la description XML d'une perspective dans le cadre d'une application Eclipse.

Tout l'intérêt de manipuler la description d'une perspective est de pouvoir la stocker autre part que dans le répertoire d'exécution d'une application Eclipse.

Lorsqu'un utilisateur modifie l'agencement des vues et des éditeurs d'une perspective, les modifications sont sauvegardées à l'arrêt de l'application Eclipse dans le répertoire d'exécution. De même, un utilisateur peut créer une nouvelle perspective basée sur une perspective existante en sauvegardant sa description. Au chargement d'une application Eclipse, les descriptions des perspectives sauvegardées (celles modifiées et les nouvelles) sont chargées. Malheureusement, ce chargement ne s'effectue qu'au démarrage de l'application Eclipse.  

Le prototype présenté dans ce billet offre la possibilité de charger à tout moment une description et de visualiser le résultat dans le Workbench. Si la description est modifiée (pour l'instant nous modifions un fichier XML d'une perspective) et le chargement demandé, la perspective dans l'application Eclipse sera mise à jour. En allant plus loin dans l'utilité de la mécanique portée par ce prototype, il est de ce fait envisageable de sauvegarder à distance pour un compte utilisateur (base de données, LDAP, ...) ses perspectives. À tout moment, la description des perspectives est modifiable et un mécanisme de mise à jour peut être utilisé pour prendre en compte les modifications de manière transparente, mais ce dernier point fait parti des ouvertures du prototype, attachons-nous maintenant à décrire sa mécanique.

Mais avant de commencer, je tiens à préciser que le prototype utilise des APIs internes. La version de ce prototype fonctionne pour Eclipse 3.4 Ganymede et je ne garantis en rien son fonctionnement et sa mécanique pour les versions antérieures et futures. Ce prototype entre dans le cadre du cours sur le Workbench d'Eclipse que je suis en train de préparer au moment de l'écriture de ce billet.

Un exemple de description de perspective est donné ci-dessous. Cette description est stockée dans le fichier *perspectivePerso.xml*.

```xml
<?xml version="1.0" encoding="UTF-8"?>  
<perspective editorAreaTrimState="2" editorAreaVisible="1" fixed="0" version="0.016">  
<descriptor descriptor="eclipse.workbench.SaveLoadPerspectiveExample.perspective1" id="UnTest" label="UnTest" />  
<window height="742" width="1024" x="0" y="22" />  
<alwaysOnActionSet id="eclipse.workbench.SaveLoadPerspectiveExample.actionSet" />  
<alwaysOnActionSet id="org.eclipse.ui.actionSet.keyBindings" />  
<alwaysOnActionSet id="org.eclipse.ui.actionSet.openFiles" />  
<view id="org.eclipse.ui.views.ResourceNavigator" />  
<fastViewBars />  
<viewLayoutRec id="org.eclipse.ui.views.ResourceNavigator" showTitle="true" standalone="true" />  
<layout>  
 <mainWindow>  
  <info folder="true" part="org.eclipse.ui.internal.ViewStack@c8b6ee">  
   <folder activePageID="org.eclipse.ui.views.ResourceNavigator" appearance="3" expanded="2">  
    <page content="org.eclipse.ui.views.ResourceNavigator" label="Navigator" />  
    <presentation id="org.eclipse.ui.presentations.WorkbenchPresentationFactory">  
    <part id="0" />  
    </presentation>  
   </folder>  
  </info>  
  <info folder="true" part="stickyFolderRight" ratio="0.75" ratioLeft="762" ratioRight="254" relationship="2" relative="org.eclipse.ui.internal.ViewStack@c8b6ee">  
   <folder appearance="2" expanded="2">  
    <page content="org.eclipse.help.ui.HelpView" label="LabelNotFound" />  
    <page content="org.eclipse.ui.internal.introview" label="LabelNotFound" />  
    <page content="org.eclipse.ui.cheatsheets.views.CheatSheetView" label="LabelNotFound" />  
   </folder>  
  </info>  
  <info part="org.eclipse.ui.editorss" ratio="0.3149062" ratioLeft="500" ratioRight="694" relationship="2" relative="org.eclipse.ui.internal.ViewStack@c8b6ee" />  
 </mainWindow>  
</layout>  
</perspective>  
```

Cet exemple décrit une nouvelle perspective qui a été créée (via l'action **Save Perspective As ... du menu Window**) appelée *UnTest* (attribut `label`) à partir d'une perspective (attribut `descriptor`) définie via un point d'extension (identifiant de la perspective `eclipse.workbench.SaveLoadPerspectiveExample.perspective1`). Une fois la perspective sauvegardée, la plateforme Eclipse place la description de la nouvelle perspective dans le fichier `org.eclipse.ui.workbench.prefs` du répertoire *.metadata/.plugins/org.eclipse.core.runtime/.settings*. Pour ma part, j'ai récupérée cette description et je l'ai placée dans le fichier *perspectivePerso.xml* disponible à la racine du prototype. Dans la suite, ce fichier sera chargé et son contenu intégré dans l'application Eclipse. Nous effectuerons des modifications directement sur le contenu de ce fichier et le prototype l'intégrera dans l'application Eclipse.  

Vous trouverez ci-dessous le code de l'action *Load Perspective* de la méthode `void run(IAction action) (voir classe LoadPerspectiveAction)`.

```java
// Récupération de la description de la perspective.  
String xmlString = this.extractPerspectiveDescriptionFromFile("perspectivePerso.xml");  
Reader reader = null;  
  
if (xmlString != null && xmlString.length() != 0) {  
 reader = new StringReader(xmlString.toString());  
} else {  
 return;  
}  
  
// Transforme la description de String à XMLMemento  
XMLMemento memento = null;  
try {  
 memento = XMLMemento.createReadRoot(reader);  
} catch (WorkbenchException e) {  
 e.printStackTrace();  
 return;  
}  
  
// Création d'un descripteur de perspective vide.  
PerspectiveDescriptor newPersp = new PerspectiveDescriptor(null, null, null);  
// From a perspective descriptor, restore the state of the perspective.  
newPersp.restoreState(memento);  
  
// Récupération de l'implémentation du registre d'extension.  
PerspectiveRegistry perspectiveRegistry = (PerspectiveRegistry) PlatformUI.getWorkbench().getPerspectiveRegistry();  
  
String id = newPersp.getId();  
  
// Récupère s'il existe déjà une perspective ayant le même id.  
IPerspectiveDescriptor oldPersp = perspectiveRegistry.findPerspectiveWithId(id);  
  
if (oldPersp != null) {  
 System.out.println("Remove old perspective in order to replace it.");  
 // Si existe, on la supprime  
 perspectiveRegistry.deletePerspective(oldPersp);  
}  
  
// Récupère la référence du PreferenceStore associé à org.eclipse.ui.workbench.  
// Ceci permettra de stocker dans le fichier org.eclipse.ui.workbench.prefs  
IPreferenceStore workbenchStore = getWorkbenchPreferenceStore();  
  
// Stock la nouvelle description de la perspective.  
workbenchStore.putValue(newPersp.getLabel() + PERSP, xmlString.toString());  
// Stock le nom de la perspective.  
workbenchStore.putValue("perspectives", newPersp.getLabel());  
  
// Modifie la perspective de la page active.  
PlatformUI.getWorkbench().getActiveWorkbenchWindow().getActivePage().setPerspective(newPersp);  
  
// Réinitialise la perspective de la page active.  
PlatformUI.getWorkbench().getActiveWorkbenchWindow().getActivePage().resetPerspective();
```

La mécanique est très simple. Ci-dessous les principaux points.

* La description de la perspective est récupérée du fichier perspectivePerso.xml qui est transformée en XMLMemento (API pour les manipulations de contenus XML de la plateforme Eclipse).  
* Un descripteur de perspective vide (IPerspectiveDescriptor) est créé dont le contenu est restauré au travers de l'XMLMemento.  
* Il est ensite vérifié qu'il n'existe pas de perspective ayant le même identifiant. Dans le cas contraire la perspective est retirée du registre d'extension.  
* La description de la perspective chargée est stockée dans les préférences org.eclipse.ui.workbench de manière à ré-utiliser le mécanisme de chargement de perspectives de la plateforme Eclipse.
* Enfin pour valider les modifications, la perspective est affectée à la page active et une ré-initialisation est provoquée pour forcer la mise à jour.

Pour vérifier le fonctionnement, téléchargez le code source du prototype (projet [SaveLoadPerspectiveExample](/files/saveloadperspectiveexample.zip)), démarrez une application Eclipse en incluant le plugin du projet et réalisez les actions suivantes.

* Sélectionner l'action **Load Perspective Action** disponible dans la barre de menu et dans la barre d'outils. La perspective *UnTest* apparaîtra.
* Modifier le contenu du fichier *perspectivePerso.xml*.