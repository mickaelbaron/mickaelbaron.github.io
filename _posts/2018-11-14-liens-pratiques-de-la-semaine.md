---
title: Liens pratiques de la semaine 46 (novembre 2018)
tags: [Java,Docker]
blogger_orig_url: https://keulkeul.blogspot.com/2018/11/liens-pratiques-de-la-semaine.html
category: technological-watch
twitter: 1062617208155791360
---

Vous trouverez dans ce billet une sélection de liens pratiques autour des technologies Java et autres qui m'ont particulièrement intéressées cette semaine 46 (novembre 2018).

Java

* La spécification [MicroProfile 2.1](https://github.com/eclipse/microprofile/releases/tag/2.1) est disponible.
* Java 11 est disponible. Voici deux liens intéressants pour apprendre rapidement ce qu'il y a de nouveau : [lien 1](https://www.developpez.com/actu/226307/Oracle-annonce-la-sortie-officielle-de-Java-11-tour-d-horizon-des-principales-nouveautes-de-cette-version-LTS/) et [lien 2](https://blog.takipi.com/java-11-will-include-more-than-just-features/).
* Un [sondage](https://snyk.io/blog/jvm-ecosystem-report-2018) des habitudes des développeurs Java pour l'année 2018. On apprend que 80% des interrogés utilisent Java 8 en production et que 45% des interrogés utilisent l'IDE IntelliJ IDEA et 38% Eclipse.
* Pour installer Java depuis une version fournie par OpenJDK sous macOS, il suffit de décompresser l'archive dans le répertoire _/Library/Java/JavaVirtualMachines_. Par défaut, la version la plus récente sera utilisée. Pour désactiver une version récente, il suffit de renommer le fichier _Info.plist_ dans _/Library/Java/JavaVirtualMachines/JAVA\_VERSION/Contents_ en _Info.plist.disabled_.
* Un [article](https://winterbe.com/posts/2018/08/29/migrate-maven-projects-to-java-11-jigsaw/) qui montre comment migrer ses projets Java avec Maven vers Java 11.

Docker

* **Dockly (**[https://github.com/lirantal/dockly](https://github.com/lirantal/dockly)) et **Docker-Compose-Command-Center** ([https://www.npmjs.com/package/docker-compose-command-center](https://www.npmjs.com/package/docker-compose-command-center)) sont deux outils pour piloter ses conteneurs Docker via une interface graphique en mode console.

JavaScript/HTML/CSS

* Un [exemple](https://codepen.io/alvaromontoro/pen/bmwmKJ) intéressant d'une interface de login/password faite en JS/HTML/CSS.
* Un [article](https://scotch.io/tutorials/creating-vue-apps-with-the-vue-ui-tool) qui présente comment utiliser la nouvelle interface graphique de VueCli3 pour construire et configurer (plugins, dépendances...) un projet Vue.js.
* Un [article](https://medium.com/@js_tut/flexbox-the-animated-tutorial-8075cbe4c1b2) qui montre comment utiliser Flex Box, un standard CSS3 de disposition des éléments dans une page web.
* Comprendre en détail le fichier [package.json](http://package.json/).

Divers

* Un [résumé](https://www.datasciencecentral.com/profiles/blogs/how-to-choose-a-machine-learning-model-some-guidelines) intéressant des différentes algorithmes d'apprentissage automatique à utiliser selon le contexte.
* [Mole](https://davrodpin.github.io/mole/) est une application en ligne de commande pour faciliter la création de tunnels SSH.
* [htrace.sh](http://htrace.sh/) est un script Shell pour débogguer les traces de connexion HTTP/HTTPS et analyser les en-têtes...
* Un [site web](https://www.foldnfly.com/) qui fournit une base pour apprendre à fabriquer des avions en papier.
* Les [slides](https://mghignet.github.io/git-dammit-talk) d'une présentation sur des cas de scénarios de Git.
* Le [projet Common Voice](https://voice.mozilla.org/fr) est une initiative de Mozilla pour aider à apprendre aux machines à parler comme tout un chacun. Les interfaces sont très simplistes et efficace. Vous dictez un texte ou vous confirmez qu'un texte a été correctement lu.
* Un [article](https://linuxize.com/post/getting-started-with-tmux/) pour comprendre rapidement Tmux, un multiplexeur de terminaux.
* Un [aide mémoire](https://ndpsoftware.com/git-cheatsheet.html) interactif sur Git.
* Une commande Linux a échoué car vous n'étiez pas sudo, rappelez la dernière commande via sudo !! ou sudo !-1.
* [lazyGit](https://github.com/jesseduffield/lazygit) est une interface graphique en ligne de commande pour Git.