---
title: J'ai besoin d'... installer le client SVN Subversive sous Eclipse Helios via Eclipse Marketplace
tags: [Eclipse]
category: technical
description: cette série des J'ai besoin de ... va s'intéresser à l'installation du plugin SVN en utilisant l'outil Eclipse Marketplace.
---

À la sortie d'Eclipse Galileo, j'avais publié un [billet]({% post_url 2009-06-26-jai-besoin-d-installer-le-client-svn %}) concernant l'installation du plugin SVN (Subversive) sous Eclipse Galileo. Comme [Eclipse Helios]({% post_url 2010-06-23-eclipse-36-helios-est-sortie %}) vient tout juste de sortir, cette série des J'ai besoin de ... va s'intéresser à l'installation du plugin SVN en utilisant l'outil Eclipse Marketplace. À noter que la procédure d'installation du plugin SVN via l'update site fonctionne très bien.  
  
**Pré-requis logiciels** : installer une version Eclipse Helios ([page](http://www.eclipse.org/downloads/) de téléchargement). Je suis parti d'une distribution pour le développement de plugins Eclipse. Il s'agit d'une version anglaise.  

* Démarrer Eclipse Helios.

* Ouvrir l'outil Eclipse *Marketplace. Help -> Eclipse Marketplace...*.

![/images/svnhelios1.jpg](/images/svnhelios1.jpg)

* Choisir *Eclipse Marketplace* comme catalogue, puis faire *Next*.

* Dans l'écran suivant, saisir dans le champ de texte *Find* la valeur svn pour effectuer un tri sur l'ensemble du catalogue. Vous devriez obtenir le résultat suivant.

![/images/svnhelios2.jpg](/images/svnhelios2.jpg)  

* Cliquer sur *Install pour l'élément Subversive - SVN Team Provider* pour procéder à l'installation du plugin SVN Subversive.

* Des options liées à l'installation du plugin Subversive vous seront demandées. Dans mon cas, j'ai désactivé les modules pour Mylyn et l'internationalisation (j'ai l'habitude de ma version anglaise), puis faire *Next*.

![/images/svnhelios3.jpg](/images/svnhelios3.jpg)

* Une confirmation liée à la licence d'utilisation vous sera demandée, accepter puis faire *Finish*.

* L'installation est en cours, malheureusement pour un aussi petit plugin, ce n'est pas si rapide que cela.

* Il vous sera demandé de redémarrer Eclipse, faire *Restart Now*.

Attention à cette étape l'installation n'est pas encore terminée, il va falloir installer les connecteurs SVN.

* Ouvrir la perspective *SVN Repository Exploring*, une boite de dialogue apparaît en vous proposant de choisir les connecteurs à installer. Dans mon cas, je n'installe que les connecteurs pour la version 1.5.x de SVN, puis faire *Finish*.

![/images/svnhelios4.jpg](/images/svnhelios4.jpg)

* Une confirmation des modules à installer vous sera alors demandée, faire *Next*.  

![/images/svnhelios5.jpg](/images/svnhelios5.jpg)

* Refaire *Next* pour re-confirmer.

* Une nouvelle confirmation liée à la licence d'utilisation vous sera demandée, acceptez puis faire Finish.

* L'installation des connecteurs est lancée, attendre la fin de l'installation. À noter qu'il peut vous être demandé d'accepter l'installation de plugins non signés, accepter sans quoi qu'il arrive...

* Redémarrer Eclipse une fois l'installation terminée.

Voilà, la procédure d'installation du plugin SVN Subversive terminée. C'est tout de même un peu plus long qu'en passant via l'update site, non ?