---
title: J'ai besoin d'... installer le client SVN Subversive sous Eclipse Galileo
tags: [Eclipse]
thumbnail: http://3.bp.blogspot.com/_azmyBJVJ09E/SkSKfdQTiCI/AAAAAAAAENw/O3xytkd88AM/s72-c/svn1.jpg
blogger_orig_url: https://keulkeul.blogspot.com/2009/06/jai-besoin-d-installer-le-client-svn.html
description: Installation du client SVN (Subversive) sous Eclipse Galileo.
category: technical
---

Dans la série des J'ai besoin de... je m'intéresse aujourd'hui à l'installation du client SVN (Subversive) sous Eclipse Galileo. A la sortie d'Eclipse Ganymede, un [billet](http://blog.developpez.com/djo-mos/p5979/eclipse/installer-le-support-svn-dans-eclipse-ga/) sur [Developpez.com](http://www.developpez.com/) détaillait la procédure d'installation de Subversive sous cette version. La procédure présentée ici reste assez similaire.  

Pré-requis : installer une version Eclipse Galileo ([page](http://www.eclipse.org/downloads/) de téléchargement). Je suis parti d'une distribution pour le développement de plugins Eclipse. Il s'agit d'une version anglaise.

* Démarrer Eclipse Galileo.
* Ouvrir l'outil de mise à jour (*Help -> Install New Software ...*), voir capture d'écran ci-dessous.

![/images/svn1.jpg](/images/svn1.jpg)

* Choisir l'update site officiel Galileo (Galileo - http://download.eclipse.org/releases/galileo) comme indiqué ci-dessous.

![/images/svn2.jpg](/images/svn2.jpg)

* Dans la zone de recherche, saisir le mot clé SVN, ceci a pour effet de filtrer les éléments proposés par l'update site. Les éléments SVN de la catégorie Collaboration sont disponibles. Sélectionner Subversive SVN Team Provider (Incubation) comme indiqué ci-dessous.

![/images/svn3.jpg](/images/svn3.jpg)

Il reste à installer le connecteur SVN fourni par la société Polarion.

* Ouvrir de nouveau l'outil de mise à jour (*Help -> Install New Software ...*) puis ajouter (via le bouton add) l'adresse suivante : Polarion - http://community.polarion.com/projects/subversive/download/eclipse/2.0/galileo-site/. Ceci a pour effet de lister les éléments qui peuvent être installés.
* Choisir les éléments suivants : Subversive SVN Connectors et SVNKit 1.2.2 Implementation (Optional) comme indiqué sur la figure ci-dessous.

![/images/svn4.jpg](/images/svn4.jpg)

* À noter que la version du SVNKit vous permet de choisir la version de SVN. SVNKit 1.2.2 correspond à SVN 1.5.x et SVNKit 1.3.0 correspond à SVN 1.6.x.
* Une fois les éléments installés, redémarrer votre Eclipse.
* Après le redémarrage, ouvrir l'outil de préférence de SVN (*Window -> Preferences -> Team -> SVN*). Dans l'onglet SVN Connector, choisir dans la liste SVN Connector la valeur SVNKit 1.2.2 comme montré sur la figure ci-dessous.

![/images/svn5.jpg](/images/svn5.jpg)

Normalement le client SVN Subversive pour Eclipse doit être correctement installé. Récupérerz un ancien Workspace avec des projets connectés avec SVN et tout fonctionnera comme avant.