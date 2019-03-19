---
title: Eclipse RAP
tags: [Eclipse, RAP]
blogger_orig_url: https://keulkeul.blogspot.com/2007/09/eclipse-rap.html
category: technological-watch
---

Le projet Eclipse RAP (Rich Ajax Platform) permet le développement d'applications serveur comme si vous développiez une application Eclipse RCP (composition de plugins). 

La bibliothèqe SWT a son équivalent pour cette plateforme, elle s'appelle RWT (RAP Widget Toolkit). L'API est très très proche de SWT et par conséquent la conversion d'une application Eclipse RCP en RAP demande très peu d'investissement (enfin ça c'est dans la pratique).  

![/images/webworkbench.jpg](/images/webworkbench.jpg)

Par conséquent, le développeur n'a donc pas besoin de connaître l'HTML ou le JavaScript pour développer. Un concurrent de plus pour [GWT](http://code.google.com/webtoolkit/). Sans entrer dans les détails, la majeure partie des traitements sont effectués sur le serveur. Un événement sur l'IHM est transmis au serveur qui retourne le feedback associé, un peu à comme le cycle de vie de JSF. Ces nombreux aller/retour entre le client et le serveur amèneront logiquement à se poser des questions de performance. Je suis curieux de savoir comment employer [TPTP](http://www.eclipse.org/tptp/) pour tester les IHM d'une application Eclipse RAP ?

À noter que le version 1.0 devrait sortir aux alentours de l'[Eclipse Summit Europe](http://eclipsesummit.org/summiteurope2007/index.php?page=detail/&id=29) où une [session](http://eclipsesummit.org/summiteurope2007/index.php?page=detail/&id=29) « Eclipse RAP » doit se dérouler.

Voici quelques liens :

* le site officiel du projet [Eclipse RAP](http://www.eclipse.org/rap/) ;
* des démos : [RAP EclipseCon Demo](http://rap.innoopract.com/rapdemo/rap), [RWT Widget Demo](http://rap.innoopract.com/rapdemo/rap?w4t_startup=controls) ;
* une [présentation](https://admin.adobe.acrobat.com/_a300965365/p86217246/) de RAP ;
* une [vidéo](http://www.volanakis.de/nuggets/RCP_Mail_goes_RAP/index.html) montrant le portage de l'exemple RCP Mail en RAP Mail.

Il se pourrait que dans un prochain cours je m'intéresse à ce projet...
  
(Modification apportée le 16 octobre 2007) : la version 1.0 d'Eclipse RAP vient de sortir