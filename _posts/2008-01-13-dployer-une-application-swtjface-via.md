---
title: Déployer une application SWT/JFace via Java Web Start
tags: [Java, JWS]
blogger_orig_url: https://keulkeul.blogspot.com/2008/01/dployer-une-application-swtjface-via.html
category: technical
---

Depuis le début de ce blog, un ensemble de démonstrations ont été fournies et malheureusement pour les tester il fallait télécharger les sources et les compiler dans son environnement préféré.

De manière à tester directement les démonstrations, j'ai décidé de les déployer via [Java Web Start](http://java.sun.com/products/javawebstart/) (voir mon cours sur le sujet [Java Web Start](/java/intro-jws)).

Je vous présente ci-dessous la démarche à suivre pour déployer une application « pure » SWT/JFace. À noter que le déploiement d'une application RCP (qui viendra lors de la diffusion du cours) est expliquer [ici](http://help.eclipse.org/help33/index.jsp?topic=/org.eclipse.platform.doc.isv/guide/java_web_start.htm).  
  
Démarche en plusieurs étapes (à automatiser via une tâche ANT) appliquée sur la démonstration "[Astuce du Jour" en SWT](http://keulkeul.blogspot.com/2008/01/composant-astuce-du-jour-en-swt.html). A noter également qu'une description plus complète via un tutoriel est proposée sur le site de [Developpez.com](http://www.developpez.com/) ([Comment déployer une application SWT via Java Web Start](http://lfe.developpez.com/Java/SWT/WebStart/)).  
  
Exporter dans un JAR le projet à déployer :

* à partir d'Eclipse IDE, exporter le projet à déployer dans une archive JAR ;
* ne pas inclure les bibliothèques dépendantes ;
* définir la classe principale dans le fichier *MANIFEST.MF* (option Main-Class). Exemple, Main-Class: eclipse.swt.SWTTipOfTheDay.SWTTipOfTheDayTest ;
* définir le classpath des bibliothèques utilisées (option Class-Path). Exemple, Class-Path: swt.jar, jface.jar.

Signer tous les JAR

* signer le JAR généré (*swttipofthedaydemo.jar*) ;
* signer tous les autres JAR (*swt.jar*). Il se peut que certaines bibliothèques soient déjà signées. Pour éviter tous problèmes relatifs à des incohérences de signature (erreur de type : Les ressources JAR définies dans le fichier JNLP n'ont pas été signées à l'aide du même certificat), je n'ai pas trouver d'autres moyens que de supprimer les signatures déjà présentes. Dans le cas de la bibliothèque SWT, la suppression des fichiers avec l'extension SF et RSA du répertoire META-INF a été suffisant.

Décrire le fichier de déploiement JNLP

* décrire dans un fichier JNLP, le déploiement Java Web Start du projet ;

Déployer les fichiers sur un serveur WEB  

* déposer le fichier JNLP, le JAR signé de la démo et toutes les bibliothèques JAR signées sur un serveur web.
