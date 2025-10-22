---
title: 'Développer une application web avec Vue.js 3 et Vite, déploiement avec Docker (partie 3)'
tags: [Vue.js, Docker]
direct_link:
image: /images/vuejsdockerjava.jpg
description: Cette troisième partie s'intéresse aux problématiques de déploiement d'une application Vue.js en utilisant Docker pour créer des conteneurs.
category: Article
date: 2019-07-09
update: 2022-07-21
weight: 6
toc: true
comments: utterances
---

L'objectif de cet article en plusieurs parties est de vous présenter le framework web JavaScript [Vue.js](https://vuejs.org/) en se focalisant sur les principaux concepts au travers d'un exemple unique.

Les différentes parties de cet article sont détaillées ci-dessous :

* [généralités sur les frameworks web JavaScript et présentation de Vue.js](/web/vuejs-generalites-part1) ;
* [mise en œuvre des concepts de Vue.js](/web/vuejs-miseenoeuvre-part2) ;
* **déploiement d'une application web développée avec Vue.js**.

La version 3 de [Vue.js](https://vuejs.org/) a été utilisée pour cette série d'articles.

Cette troisième partie s'intéresse aux problématiques de déploiement d'une application [Vue.js](https://vuejs.org/) en utilisant massivement la brique technologique [Docker](https://www.docker.com/) pour créer des conteneurs.

Le plan est le suivant :

* construction d'images Docker des différents composants (Java et [Vue.js](https://vuejs.org/)) ;
* création de conteneurs Docker ;
* gestion d'un déploiement avec un sous-chemin ;
* tester l'application PollDLE.

Les codes source pour les exercices sont disponibles sur le dépôt Git suivant : [https://github.com/mickaelbaron/vuejs-polldle-tutorial-src](https://github.com/mickaelbaron/vuejs-polldle-tutorial-src) (pour récupérer le code, faire : `git clone <https://github.com/mickaelbaron/vuejs-polldle-tutorial-src>`).

## Architecture de déploiement

Dans la [deuxième partie](/web/vuejs-miseenoeuvre-part2) de cet article, nous avions détaillé que l'application PollDLE se composait d'une couche cliente développée en [Vue.js](https://vuejs.org/) et d'une couche serveur développée en Java. Nous allons maintenant nous intéresser au déploiement de l'application dans sa globalité pour une mise en production. Au sens production, nous entendons un déploiement sur un serveur et qui sera à l'écoute de requêtes HTTP pour répondre via des réponses HTTP adaptées (changement de composant et appel de services web REST).

Nous illustrons sur la figure ci-dessous, les composants de l'application PollDLE et leurs interactions (requêtes HTTP, isolation via un sous-réseau et reverse-proxy).

![Schéma de déploiement](/images/vuejs-deploiement-part3/schema.png)

Les deux couches client et serveur se retrouvent respectivement sur les serveurs appelés *Back-end* et *Front-end* (situés sur la partie droite du schéma). Un serveur appelé *Reverse-Proxy* (situé au milieu du schéma) se chargera de répondre aux sollicitations du client (situé sur la partie gauche du schéma). Ainsi, si l'URL est de la forme [http://polldle.com/](http://polldle.com/), le *Reverse-Proxy* redirigera les requêtes vers le serveur *Front-end* afin de télécharger le contenu statique développé avec [Vue.js](https://vuejs.org/). Au contraire, si l'URL est de la forme [http://polldle.com/server](http://polldle.com/server), le *Reverse-Proxy* redirigera les requêtes vers le serveur *Back-end* afin d'invoquer les services web REST développés avec Java.

À vrai dire, nous n'allons pas utiliser de serveurs physiques dédiés pour les différents composants de l'architecture présentée ci-dessus. Nous utiliserons des conteneurs par l'intermédiaire de [Docker](https://www.docker.com/) pour faciliter l'isolation de ces composants. Ainsi, les rectangles en pointillé mi-long (couleur rouge) entourant les composants précisent que chaque composant sera créé par des conteneurs [Docker](https://www.docker.com/). Par ailleurs, le rectangle en pointillé long (couleur bleue) nommé *polldlenetwork* est un sous-réseau [Docker](https://www.docker.com/) qui permettra de restreindre les accès aux conteneurs créés. Le conteneur *polldle-rp* en charge du *Reverse-Proxy* pourra donc accéder aux conteneurs *polldle-backend* et *polldle-frontend* en utilisant leur nom de domaine du sous-réseau à savoir [http://backend:9991](http://backend:9991/) et [http://frontend](http://frontend/). Tout conteneur n'appartenant pas à ce sous-réseau *polldlenetwork* ne pourra pas communiquer avec les conteneurs de l'application PollDLE.

Enfin, [Docker](https://www.docker.com/) sera aussi utilisé pour construire les binaires de la couche client et de la couche serveur. Lors de l'élaboration des images [Docker](https://www.docker.com/) des trois composants (client, serveur et *reverse-proxy*) de notre architecture, les entrées correspondront aux codes source Java et [Vue.js](https://vuejs.org/). L'avantage sera d'éviter d'installer les outils ([Java](http://jdk.java.net/), [Maven](https://maven.apache.org/) et [npm](https://www.npmjs.com/)) sur son poste de travail pour construire les binaires.

Dans la suite, comme vous avez pu le lire, nous allons utiliser [Docker](https://www.docker.com/) pour construire des images et créer des conteneurs. Nous verrons aussi comment mettre en œuvre un *Reverse-Proxy*.

> Nous supposons pour les prochaines expérimentations que vous avez installé [Docker](https://www.docker.com/). Si ce n'est pas le cas, nous vous encourageons à consulter la documentation officielle : [https://docs.docker.com/](https://docs.docker.com/). [Docker](https://www.docker.com/) est disponible pour macOS, Windows et Linux.

## Déploiement des composants : client, serveur et reverse-proxy

Nous étudions dans cette section la construction d'images [Docker](https://www.docker.com/) pour les trois composants de notre architecture logicielle. Pour chaque composant, nous montrerons comment configurer les sources pour paramétrer l'exécution (une exécution en production et différente d'une exécution pour le test en développement), comment construire les binaires et comment « exécuter » les binaires.

Les avantages de la construction des binaires par [Docker](https://www.docker.com/) sont multiples.

* Éviter d'installer les outils ([Java](http://jdk.java.net/), [Maven](https://maven.apache.org/) et [npm](https://www.npmjs.com/)) sur son poste de travail. En effet, si vous souhaitez simplement tester PollDLE pour admirer cette magnifique application, vous n'aurez besoin que de récupérer les sources et lancer une commande [Docker](https://www.docker.com/) pour utiliser les outils de compilation lors de la phase de création d'images [Docker](https://www.docker.com/).
* Maîtriser la construction des binaires dans un environnement connu (les versions des outils sont les mêmes). En effet, vous pourriez déjà posséder sur votre poste de travail des versions différentes des outils et cela pourrait amener des problèmes de compilation.
* Contrôler l'exécution des binaires en production. Les versions des outils pour l'exécution des binaires seront les mêmes, quel que soit le système hôte utilisé.

### Composant serveur (Java)

Le composant serveur (Java) qui sert à diffuser les services web REST s'appuie sur la spécification [MicroProfile](https://microprofile.io/). Nous n'utiliserons que deux composants de cette spécification : JAX-RS (service web REST) et CDI (injection de dépendances). Nous avons opté pour [KumuluzEE](https://ee.kumuluz.com/) comme implémentation de la spécification [MicroProfile](https://microprofile.io/). Lors de l'écriture de cet article, la version 3.3 de [MicroProfile](https://microprofile.io/) était supportée par [KumuluzEE](https://ee.kumuluz.com/). De nombreuses autres implémentations de [MicroProfile](https://microprofile.io/) sont également disponibles. Le choix de [KumuluzEE](https://ee.kumuluz.com/) a été motivé par sa simplicité, sa documentation, sa longévité (sept ans) et qu'il est toujours enrichissant de s'intéresser aux bibliothèques qui ne font pas de vague, mais qui apportent de grands services. À noter que j'ai découvert [KumuluzEE](https://ee.kumuluz.com/) en 2015 puisque cette bibliothèque avait gagné le prix « Duke's Choice Award Winner », c'est aussi à cette époque que je me suis intéressé à [MicroProfile](https://microprofile.io/).

Dans la suite de cette section dédiée au composant serveur (Java), nous vous invitons à ouvrir un terminal et vous positionner à la racine du répertoire *polldle-backend*.

#### Construction des binaires du composant serveur (Java)

La construction des binaires se fait par l'intermédiaire de [Maven](https://maven.apache.org/).

* Exécuter la ligne de commande suivante pour compiler la couche serveur à partir de [Maven](https://maven.apache.org/).

```bash
mvn clean package
``` 

La sortie console attendue :

```bash
...
[INFO] ------------------------------------------------------------------------
[INFO] Reactor Summary for polldle-parent 0.4-SNAPSHOT:
[INFO]
[INFO] polldle-parent ..................................... SUCCESS [  0.143 s]
[INFO] poddle-api ......................................... SUCCESS [  1.312 s]
[INFO] polldle-server ..................................... SUCCESS [  6.106 s]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  7.694 s
[INFO] Finished at: 2022-07-20T11:33:16+02:00
[INFO] ------------------------------------------------------------------------
```

[Maven](https://maven.apache.org/) compilera le code source, exécutera les tests unitaires et préparera les binaires finals. Ces derniers sont disponibles dans le répertoire *polldle-server/target*, nous les détaillons ci-dessous :

```bash
polldle-server/target
├── classes
│   ├── fr
│   ├── META-INF
│   ...
├── dependency
│   ├── HikariCP-3.4.5.jar
│   ├── activation-1.1.1.jar
│   ├── agroal-api-1.9.jar
│   ├── agroal-hikari-1.9.jar
│   ├── agroal-pool-1.9.jar
│   ├── aopalliance-repackaged-2.6.1.jar
│   ├── asm-9.2.jar
│   ...
├── generated-sources
├── generated-test-sources
├── maven-archiver
├── maven-status
├── polldle-server.jar
├── surefire-reports
└── test-classes
```

Les répertoires qui nous intéressent sont *classes* qui contient les ressources et les fichiers *.class* puis *dependency* qui liste l'ensemble des bibliothèques nécessaires à l'exécution du programme Java.

#### Configuration de l'exécution du composant serveur (Java)

Le composant serveur (Java) n'offre pas de grandes possibilités de configuration excepté le port d'écoute du serveur et l'URL de déploiement. Ces informations sont modifiables via des variables d'environnement et font partie intégrante de l'implémentation [KumuluzEE](https://ee.kumuluz.com/).

* Exécuter les lignes de commande suivantes pour initialiser deux variables d'environnement.

```bash
export KUMULUZEE_SERVER_HTTP_PORT=9991
export KUMULUZEE_SERVER_BASEURL=http://0.0.0.0
```

Ces variables d'environnement devront être initialisées avant l'exécution du programme Java.

#### Exécution du composant serveur (Java)

Comme vu dans la partie construction des binaires, les fichiers nécessaires à l'exécution sont disponibles dans le répertoire *polldle/polldle-server/target*. Nous passerons par une exécution classique d'une application Java puisque le composant serveur (Java) a intégré un serveur web Jetty pour diffuser les services web à l'adresse [http://0.0.0.0:9991](http://0.0.0.0:9991/).

* Démarrer l'exécution du composant serveur (Java) via la ligne de commande ci-dessous.

```bash
java -cp "polldle-server/target/dependency/*:polldle-server/target/classes" com.kumuluz.ee.EeApplication
```

La sortie console attendue :

```bash
...
2022-07-20 11:35:53.394 INFO -- com.kumuluz.ee.jetty.JettyFactory -- Starting KumuluzEE on Jetty with 5 minimum and 100 maximum threads
2022-07-20 11:35:53.454 INFO -- com.kumuluz.ee.jetty.JettyFactory -- Starting KumuluzEE on port(s): 9991 [http/1.1]
2022-07-20 11:35:55.184 INFO -- com.kumuluz.ee.EeApplication -- KumuluzEE started successfully
```

L'ensemble des bibliothèques Java nécessaires à l'exécution du programme Java et le code compilé du projet sont passés au *classpath* de l'exécution. La classe principale (le point d'entrée de l'application Java) est celle fournie par [KumuluzEE](https://ee.kumuluz.com/) à savoir `com.kumuluz.ee.EeApplication`.

Le résultat obtenu permet de voir que le composant est déployé et les services web REST sont disponibles à l'adresse [http://0.0.0.0:9991](http://0.0.0.0:9991/).

#### Dockerfile pour le composant serveur (Java)

Précédemment, nous avons vu comment compiler, configurer l'exécution et exécuter le composant serveur (Java). Nous allons réexploiter ces trois étapes lors de la création de l'image [Docker](https://www.docker.com/) pour le composant serveur (Java).

La création d'une image sous [Docker](https://www.docker.com/) passe par l'écriture d'un fichier *Dockerfile*. Ce fichier est disponible à la racine du répertoire *polldle-backend*.

```dockerfile
# Build env
FROM maven:3-jdk-11 AS build-java-stage
LABEL maintainer="Mickael BARON"
WORKDIR /polldle
COPY polldle-api polldle-api
COPY polldle-server polldle-server
COPY pom.xml .
RUN mvn -f pom.xml clean package

# Run env
FROM adoptopenjdk/openjdk11:alpine-jre
COPY --from=build-java-stage /polldle/polldle-server/target/classes /polldle/classes
COPY --from=build-java-stage /polldle/polldle-server/target/dependency/*.jar /polldle/dependency/
EXPOSE 9991
ENTRYPOINT ["java", "-cp", "/polldle/classes:/polldle/dependency/*", "com.kumuluz.ee.EeApplication"]
```

Ce fichier *Dockerfile* est décomposé en deux étapes de construction appelée *multi-stage*. La première étape consiste à créer une image temporaire à partir du résultat de la compilation du composant serveur (Java) tandis que la seconde étape consiste à créer l'image finale qui servira pour l'exécution. Le résultat de la première étape servira pour construire la seconde étape. L'intérêt de décomposer en deux étapes est avant tout de pouvoir limiter la taille de l'image finale. En effet, pour la compilation, il est nécessaire de s'appuyer sur une image [Docker](https://www.docker.com/) avec JDK et Maven (`FROM maven:3-jdk-11 AS build-java-stage`). De nombreuses dépendances Java seront téléchargées, mais pas forcément utiles pour l'exécution (plugin Maven, dépendances Java pour les tests unitaires…).

Détaillons le contenu de ce fichier *Dockerfile* qui propose deux étapes.

**Étapes de compilation :**

* `FROM maven:3-jdk-11 AS build-java-stage` : partir d'une image [Docker](https://www.docker.com/) Java pour la compilation, elle contient [Maven](https://maven.apache.org/) et [JDK](http://jdk.java.net/) ;
* `LABEL maintainer="Mickael BARON"` : préciser l'auteur du fichier ;
* `WORKDIR /polldle` : fixer le répertoire de travail ;
* `COPY polldle-api polldle-api` : copier le contenu du répertoire *polldle/polldle-backend/polldle-api* (contient l'API du projet) de l'hôte à la racine du répertoire courant du conteneur ;
* `COPY polldle-server polldle-server` : copier le contenu du répertoire *polldle/polldle-backend/polldle-server* (contient l'implémentation ) de l'hôte à la racine du répertoire courant du conteneur ;
* `COPY pom.xml .` : copier le fichier de configuration [Maven](https://maven.apache.org/) de l'hôte à la racine du répertoire courant du conteneur ;
* `RUN mvn -f pom.xml clean package` : exécuter la compilation, les tests et la construction des binaires à partir de [Maven](https://maven.apache.org/).

**Étapes d'exécution :**

* `FROM adoptopenjdk/openjdk11:alpine-jre` : partir d'une image [Docker](https://www.docker.com/) Java pour l'exécution. On s'appuie ici sur une version JRE de Java fournie par la distribution AdoptOpenJDK ;
* `COPY --from=build-java-stage .../classes /polldle/classes` : copier le résultat de la compilation de la précédente étape vers le conteneur de la seconde étape ;
* `COPY --from=build-java-stage .../dependency/*.jar /polldle/dependency/` : copier le contenu du répertoire des dépendances obtenu lors de la précédente étape vers le conteneur de la seconde étape ;
* `EXPOSE 9991` : préciser que le port `9991` pourra être exposé. Cette instruction ne publie pas automatiquement ce port lors de la construction du conteneur. Il s'agit d'une simple documentation à utiliser quand vous souhaitez comprendre quels ports sont à exposer.
* `ENTRYPOINT ["java", "-cp", "...", "com.kumuluz.ee.EeApplication"]` : préciser la commande par défaut à utiliser lors de l'exécution du conteneur.

#### Construction de l'image du composant serveur (Java)

La construction de l'image du composant serveur (Java) se base sur le fichier *Dockerfile* défini précédemment.

* Exécuter la ligne de commande suivante (toujours depuis le répertoire *polldle-backend*) pour démarrer la construction de l'image [Docker](https://www.docker.com/) du composant serveur (Java).

```bash
docker build --tag mickaelbaron/polldle-backend .
```

La sortie console attendue :

```bash
[+] Building 79.6s (16/16) FINISHED
 => [internal] load build definition from Dockerfile                                                                                        0.1s
 => => transferring dockerfile: 651B                                                                                                        0.0s
 => [internal] load .dockerignore                                                                                                           0.1s
 => => transferring context: 2B                                                                                                             0.0s
 => [internal] load metadata for docker.io/adoptopenjdk/openjdk11:alpine-jre                                                                2.8s
 => [internal] load metadata for docker.io/library/maven:3-jdk-11                                                                           3.1s
 => [auth] sharing credentials for chub.lias-lab.fr                                                                                         0.0s
 => [build-java-stage 1/6] FROM docker.io/library/maven:3-jdk-11@sha256:d6f678c90afa3c014db0114bb671f8bc1d1861ea63adc6d6116ed6f2b07a25ad   27.3s
 => => resolve docker.io/library/maven:3-jdk-11@sha256:d6f678c90afa3c014db0114bb671f8bc1d1861ea63adc6d6116ed6f2b07a25ad                     0.0s
 => => sha256:60bb3341f53d4dc35ef23912223f130c49440199be00db1214489d33ae56e251 2.42kB / 2.42kB                                              0.0s
 => => sha256:46fe39189cc86b297e92ed81fc9b2604c1a5e1ad40abb5eda4736dd04f5beb14 8.91kB / 8.91kB                                              0.0s
 => => sha256:d6f678c90afa3c014db0114bb671f8bc1d1861ea63adc6d6116ed6f2b07a25ad 549B / 549B                                                  0.0s
 => => sha256:d836772a1c1f9c4b1f280fb2a98ace30a4c4c87370f89aa092b35dfd9556278a 55.00MB / 55.00MB                                            5.6s
 => => sha256:66a9e63c657ad881997f5165c0826be395bfc064415876b9fbaae74bcb5dc721 5.16MB / 5.16MB                                              3.6s
 => => sha256:d1989b6e74cfdda1591b9dd23be47c5caeb002b7a151379361ec0c3f0e6d0e52 10.88MB / 10.88MB                                            5.2s
 => => sha256:c28818711e1ed38df107014a20127b41491b224d7aed8aa7066b55552d9600d2 54.58MB / 54.58MB                                            8.1s
 => => sha256:0dec79474efa527dac51b382e80c81f8f9230637bbe5b08b169a099e32c01325 5.42MB / 5.42MB                                              5.8s
 => => sha256:d4acb92eeea147f46c6b35f61ef0261fcb8752699e2e702b22234f0b22c0b467 211B / 211B                                                  6.2s
 => => sha256:bdae57af428e6a86fa5eac1142e1deb21db257e35fbf3c67ac7cac8e2424c95b 203.97MB / 203.97MB                                         12.4s
 => => extracting sha256:d836772a1c1f9c4b1f280fb2a98ace30a4c4c87370f89aa092b35dfd9556278a                                                   8.8s
 => => sha256:7fc7c48c025e8e968381fe3c3eef0bf7a362d18fe95e6a406f3b2451b3057331 8.74MB / 8.74MB                                              8.2s
 => => sha256:2270994903c5fd9b2026e86c821b33907c706c12ee27f4cb1e214ae922a48a8b 855B / 855B                                                  8.5s
 => => sha256:617f8adc325bd50a29b169cb8af08a49486be1a7ab5de55c6769fc3194e9663e 359B / 359B                                                  8.7s
 => => extracting sha256:66a9e63c657ad881997f5165c0826be395bfc064415876b9fbaae74bcb5dc721                                                   0.4s
 => => extracting sha256:d1989b6e74cfdda1591b9dd23be47c5caeb002b7a151379361ec0c3f0e6d0e52                                                   0.3s
 => => extracting sha256:c28818711e1ed38df107014a20127b41491b224d7aed8aa7066b55552d9600d2                                                   3.6s
 => => extracting sha256:0dec79474efa527dac51b382e80c81f8f9230637bbe5b08b169a099e32c01325                                                   0.2s
 => => extracting sha256:d4acb92eeea147f46c6b35f61ef0261fcb8752699e2e702b22234f0b22c0b467                                                   0.0s
 => => extracting sha256:bdae57af428e6a86fa5eac1142e1deb21db257e35fbf3c67ac7cac8e2424c95b                                                   6.1s
 => => extracting sha256:7fc7c48c025e8e968381fe3c3eef0bf7a362d18fe95e6a406f3b2451b3057331                                                   0.2s
 => => extracting sha256:2270994903c5fd9b2026e86c821b33907c706c12ee27f4cb1e214ae922a48a8b                                                   0.0s
 => => extracting sha256:617f8adc325bd50a29b169cb8af08a49486be1a7ab5de55c6769fc3194e9663e                                                   0.0s
 => [internal] load build context                                                                                                           1.1s
 => => transferring context: 16.07MB                                                                                                        1.0s
 => [stage-1 1/3] FROM docker.io/adoptopenjdk/openjdk11:alpine-jre@sha256:4ed388a7b5240a2a1bbec063a9903eb22457088643c96bad749384b6d801fced 14.2s
 => => resolve docker.io/adoptopenjdk/openjdk11:alpine-jre@sha256:4ed388a7b5240a2a1bbec063a9903eb22457088643c96bad749384b6d801fced          0.0s
 => => sha256:efa8a6afafab9edde0bd78f6cadaf4e0da5adbf4c380b637382ae8964aa5a5e8 951B / 951B                                                  0.0s
 => => sha256:79e1d9e1afc59d7e96fc41ba620e90a76ab68da5589738611965c5f51f71b35a 6.12kB / 6.12kB                                              0.0s
 => => sha256:8663204ce13b2961da55026a2034abb9e5afaaccf6a9cfb44ad71406dcd07c7b 2.82MB / 2.82MB                                              0.9s
 => => sha256:812afdc1fd7f6ac33c0633d588c1395bb9419daafda4d3f383104d2b3771384c 6.49MB / 6.49MB                                              1.4s
 => => sha256:4ed388a7b5240a2a1bbec063a9903eb22457088643c96bad749384b6d801fced 433B / 433B                                                  0.0s
 => => sha256:e776d836de0bdce4f3becfe1ce457778ed661cc0f00819eedef00591658f5a90 43.40MB / 43.40MB                                            5.1s
 => => extracting sha256:8663204ce13b2961da55026a2034abb9e5afaaccf6a9cfb44ad71406dcd07c7b                                                   4.9s
 => => extracting sha256:812afdc1fd7f6ac33c0633d588c1395bb9419daafda4d3f383104d2b3771384c                                                   1.6s
 => => extracting sha256:e776d836de0bdce4f3becfe1ce457778ed661cc0f00819eedef00591658f5a90                                                   5.6s
 => [build-java-stage 2/6] WORKDIR /polldle                                                                                                 0.1s
 => [build-java-stage 3/6] COPY polldle-api polldle-api                                                                                     0.1s
 => [build-java-stage 4/6] COPY polldle-server polldle-server                                                                               0.1s
 => [build-java-stage 5/6] COPY pom.xml .                                                                                                   0.0s
 => [build-java-stage 6/6] RUN mvn -f pom.xml clean package                                                                                47.9s
 => [stage-1 2/3] COPY --from=build-java-stage /polldle/polldle-server/target/classes /polldle/classes                                      0.1s
 => [stage-1 3/3] COPY --from=build-java-stage /polldle/polldle-server/target/dependency/*.jar /polldle/dependency/                         0.1s
 => exporting to image                                                                                                                      0.1s
 => => exporting layers                                                                                                                     0.1s
 => => writing image sha256:40b9c0f37a528a94bac82662ce757a6342a993eda6b36f7ccae74b76a2d43322                                                0.0s
 => => naming to docker.io/mickaelbaron/polldle-backend                                                                                     0.0s
```

On remarque que le nombre d'étapes est identique au nombre de lignes contenues dans le fichier *Dockerfile*. Chaque étape correspondra à une couche spécifique de l'image résultante.

* Exécuter la ligne de commande suivante pour s'assurer que l'image intitulée *mickaelbaron/polldle-backend* a été construite.

```bash
docker images
```

La sortie console attendue :

```bash
REPOSITORY                            TAG             IMAGE ID       CREATED          SIZE
mickaelbaron/polldle-backend          latest          40b9c0f37a52   10 minutes ago   164MB
```

On constate clairement que l'image est d'une taille réduite (164MB). Cela est dû à l'utilisation du *multi-stage* d'une part et à l'image [Docker](https://www.docker.com/) `adoptopenjdk/openjdk11:alpine-jre` qui offre une empreinte de disque réduite.

#### Créer un conteneur du composant serveur (Java)

Nous pouvons désormais créer un conteneur afin de tester l'image construite pour le composant serveur (Java). Bien entendu, il s'agit d'une première étape, car dans cette section, seul le composant serveur (Java) sera déployé par un conteneur. Le composant client ([Vue.js](https://vuejs.org/)) devra être démarré sans conteneur.

* Se positionner dans le répertoire *polldle-vue* et créer un conteneur basé sur l'image [Docker](https://www.docker.com/) précédente.

```bash
docker run -d --name backend -e KUMULUZEE_SERVER_HTTP_PORT=9991 -p 9991:9991 mickaelbaron/polldle-backend
```

La sortie console attendue :

```bash
b3c5fd42962cee0dd0cd45f2c6ed35ca1926ab0d9a9efbedb3cea0241062bc9e
```

Un conteneur nommé `backend` sera créé sur la base de l'image `mickaelbaron/polldle-backend`. L'option `-d` indique que le conteneur est créé en mode détaché. L'option `-e KUMULUZEE_SERVER_HTTP_PORT=9991` est utilisée pour modifier la valeur du port d'écoute via l'initialisation d'une variable d'environnement. L'option `-p 9991:9991` est utilisée pour la redirection de port.

* Exécuter la ligne de commande suivante pour s'assurer que le contenu a été correctement créé et qu'il est toujours en exécution.

```bash
docker ps
```

La sortie console attendue : 

```bash
CONTAINER ID   IMAGE                          COMMAND                    STATUS              PORTS                     NAMES
a7710eea60e9   mickaelbaron/polldle-backend   "java -cp /polldle/c…"     Up About a minute   0.0.0.0:9991->9991/tcp    backend
```

* Toujours depuis le répertoire *polldle-vue*, démarrer l'exécution en mode développement de la couche client ([Vue.js](https://vuejs.org/)).

```bash
npm install
npm run dev
```

La sortie console attendue :

```bash
> polldle-vue@0.0.0 dev
> vite


  VITE v3.0.0  ready in 674 ms

  ➜  Local:   http://127.0.0.1:5173/
  ➜  Network: use --host to expose
...
```

* Ouvrir un navigateur est saisir l'URL suivante : [http://localhost:5173/](http://localhost:5173/).

### Composant client (Vue.js)

Le développement du composant client ([Vue.js](https://vuejs.org/)) a déjà été présenté dans le [deuxième article](/web/vuejs-miseenoeuvre-part2) de ce tutoriel.

Pour le déploiement de ce composant, nous allons devoir changer l'adresse du composant serveur. En effet, l'adresse du composant serveur pour le développement `http://127.0.0.1:9991` est différente de celle pour le déploiement en production `/server`.

Que l'on souhaite tester lors de la phase de développement ou construire une version déployable pour la phase de mise en production, nous montrerons à la fin de cette section que vous n'aurez plus besoin d'intervenir dans le code du composant client. Des variables d'environnement seront utilisées directement dans le code.

#### Variables d'environnement

> Nous vous invitons à vous positionner dans le répertoire *polldle-vue-15* pour profiter des codes qui vont illustrer cette section.

Nous montrons dans cette sous-section comment stocker les variables d'environnement et comment les utiliser dans le code des composants.

Des variables d'environnement sont déclarées et initialisées dans des fichiers préfixés par *.env[.mode]* où *mode* correspond à *development* ou *production*. Ces fichiers doivent être placés à la racine de votre projet.

À titre d'exemple, voici les fichiers que vous pourriez trouver à la racine d'un projet [Vue.js](https://vuejs.org/).

```bash
.env             : variables d'environnement disponibles quel que soit le mode ;
.env.development : variables d'environnement disponibles pour le développement (npm run dev) ;
.env.production  : variables d'environnement disponibles pour la production (npm run build).
```

Ces fichiers *.env[.mode]* contiennent des paires de clé=valeur. Généralement, les clés des variables d'environnement seront identiques dans les différents fichiers *.env[.mode]* par contre les valeurs seront différentes.

Pour qu'une clé soit utilisable dans le code des composants, elle doit commencer par `VITE_APP`.

* Créer un fichier *.env.development* pour le mode développement et éditer le fichier de façon à ajouter le contenu ci-dessous.

```properties
VITE_APP_SERVER_URL = http://localhost:9991
```

* Créer un fichier *.env.production* pour le mode production et éditer le fichier de façon à ajouter le contenu ci-dessous.

```properties
VITE_APP_SERVER_URL = /server
```

Une seule variable d'environnement sera définie et sa valeur changera selon le mode utilisé (*development* ou *production*). Ainsi `VITE_APP_SERVER_URL` vaudra `http://localhost:9991` pour le mode développement et `/server` pour le mode production.

Pour utiliser ces variables d'environnement dans le code des composants, il suffira d'utiliser le code suivant : `import.meta.env.VITE_APP_SERVER_URL`. Le code des trois composants sera impacté afin d'utiliser cette variable d'environnement.

* Éditer le fichier *CreatePolldle.vue* en remplaçant le commentaire `// Use environment variable to define REST web service URL` par le code présenté ci-dessous.

```javascript
<script setup>
...
function createPolldle() {
  let polldleObject = {
    question: polldle.question,
    polldleOptions: []
  }

  polldle.polldleOptions.forEach((element) => {
    var newPollOptionElement = { name: element.text }
    if (element.text !== '') {
      polldleObject.polldleOptions.push(newPollOptionElement)
    }
  })

  // Use environment variable to define REST web service URL
  let request = new Request(import.meta.env.VITE_APP_SERVER_URL + '/polldles', {
    method: 'POST',
    body: JSON.stringify(polldleObject),
    headers: {
      'Content-Type': 'application/json'
    }
  })
...
</script>
<template>
  ...
</template>
```

* Éditer le fichier *VotePolldle.vue* en remplaçant les deux commentaires `// Use environment variable to define REST web service URL` par les codes présentés ci-dessous.

```javascript
<script setup>
...
// Use environment variable to define REST web service URL
const url =
  import.meta.env.VITE_APP_SERVER_URL + '/polldles/' + route.params.pathurl
...
</script>
<template>
  ...
</template>
```

* Éditer le fichier *ResultPolldle.vue* en remplaçant le commentaire `// Use environment variable to define REST web service URL` par le code présenté ci-dessous.

```javascript
<script setup>
...
// Use environment variable to define REST web service URL
let source = new EventSource(
  import.meta.env.VITE_APP_SERVER_URL +
    '/polldles/' +
    route.params.pathurl +
    '/votes/sse'
)
...
</script>
<template>
  ...
</template>
```

Comme montré dans les codes précédents, l'ancienne valeur `http://127.0.0.1:9991` a été transformée en `import.meta.env.VITE_APP_SERVER_URL`. Lors de la phase construction des binaires, le code `import.meta.env.VITE_APP_SERVER_URL` sera remplacé par la valeur contenue soit dans le fichier *.env.development* soit dans le fichier *.env.production*.

#### Construction des binaires du composant client (Vue.js)

Pour l'instant, nous avons vu comment tester le projet [Vue.js](https://vuejs.org/) en exécutant : `npm run dev`.

```bash
npm run dev
```

La sortie console attendue :

```bash
> polldle-vue-15@0.0.0 dev
> vite


  VITE v3.0.2  ready in 444 ms

  ➜  Local:   http://127.0.0.1:5173/
  ➜  Network: use --host to expose
```

Nous allons maintenant construire les *binaires* pour la version qui sera déployée en production.

* Exécuter `npm run build` où `build` est un script défini dans le fichier *package.json*.

```bash
npm run build
```

La sortie console attendue :

```
> polldle-vue-16@0.0.0 build
> vite build

vite v3.0.2 building for production...
✓ 91 modules transformed.
dist/index.html                  0.66 KiB
dist/assets/index.e06742e7.css   0.73 KiB / gzip: 0.38 KiB
dist/assets/index.d2ce934b.js    436.06 KiB / gzip: 155.19 KiB
```

Le résultat de cette construction est disponible dans le répertoire *dist* où l'on retrouve le contenu CSS, JavaScript et le fichier *index.html*

```bash
.
├── assets
│   ├── index.d2ce934b.js
│   └── index.e06742e7.css
├── index.html
└── vite.svg
```

Toutes les bibliothèques (Bootstrap, Vue.js, Highcharts, etc.) utilisées dans notre projet PollDLE sont regroupées et minifiées (réduites au strict minimum) dans les fichiers CSS et JavaScript.

Pour s'assurer que la variable d'environnement a été utilisée dans le code, examinons le contenu du fichier *dist/js/app.XYZ.js*.

```javascript
...let M=new Request("/server/polldles",{method:"POST",body:JSON.stringify(D),headers:{"Content-Type":"application/json"}});...
```

#### Déploiement du composant client (Vue.js)

> Nous vous invitons à vous positionner dans le répertoire *polldle-vue-16* pour profiter des codes qui vont illustrer cette section.

Les binaires obtenus seront déployés sur le serveur web [NGINX](https://www.nginx.com/). C'est un choix totalement personnel puisque je l'utilise depuis de nombreuses années [NGINX](https://www.nginx.com/). Bien entendu de nombreux autres serveurs auraient pu faire le même travail.

Dans le cas d'une application développée avec [Vue.js](https://vuejs.org/) et l'utilisation du mode `history` pour le routage (pour rappel transformer [http://localhost/#/3/result](http://localhost/#/3/result) en [http://localhost/3/result](http://localhost/3/result)), il est nécessaire de procéder à une réécriture des requêtes reçues. [NGINX](https://www.nginx.com/) s'appuie sur des fichiers de configuration pour paramétrer le déploiement d'une application web. C'est donc dans ce fichier de configuration que sera précisée la réécriture. Des informations complémentaires peuvent être trouvées [ici](https://router.vuejs.org/guide/essentials/history-mode.html#example-server-configurations).

* Créer un fichier *nginx.conf* à la racine du dossier *polldle-vue-16* et ajouter le code ci-dessous.

```yaml
server {
  listen 80 default_server;
  listen [::]:80 default_server;

  root /usr/share/nginx/html;

  index index.html;

  server_name localhost;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location ~* \.(?:ico|css|js|gif|jpe?g|png)$ {
    # Some basic cache-control for static files to be sent to the browser
    expires max;
    add_header Pragma public;
    add_header Cache-Control "public, must-revalidate, proxy-revalidate";
  }
}
```

La réécriture des requêtes est réalisée par l'instruction `try_files $uri $uri/ /index.html;`. Il est précisé que, quelles que soient les requêtes sur `/` (exemples : [http://localhost/1/result](http://localhost/1/result)), elles aboutiront vers *index.html*, ce qui est logique, car nous développons une *Single-Page application*.

Nous allons tester le déploiement sur un serveur [NGINX](https://www.nginx.com/) disponible dans un conteneur [Docker](https://www.docker.com/).

* Éditer le fichier *.env.production* afin de changer l'URL du serveur. En effet, le composant serveur (Java) sera démarré sur un port différent, car actuellement nous n'avons pas configuré le *Reverse-Proxy*.

```properties
VUE_APP_SERVER_URL = http://localhost:9991
```

> Cette modification est réalisée à des fins de test et ne sera pas conservée par la suite.

* Installer les modules requis et construire les binaires pour notre projet [Vue.js](https://vuejs.org/).

```bash
npm install
npm run build
```

* Si le conteneur du composant serveur (Java) est toujours en exécution (`docker ps`), vous pouvez passer à l'étape suivante, sinon, exécuter la ligne de commande suivante.

```bash
docker run -d --name backend -e KUMULUZEE_SERVER_HTTP_PORT=9991 -p 9991:9991 mickaelbaron/polldle-backend
```

La sortie console attendue : 

```bash
b3c5fd42962cee0dd0cd45f2c6ed35ca1926ab0d9a9efbedb3cea0241062bc9e
```

* Créer un conteneur [Docker](https://www.docker.com/) basé sur une image [NGINX](https://www.nginx.com/).

```bash
docker run -d --rm -p 80:80 --name frontend -v $(pwd)/dist:/usr/share/nginx/html -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf nginx:stable-alpine nginx -g "daemon off;"
```

Un conteneur [Docker](https://www.docker.com/) sera créé, en mode détaché (`-d`), automatiquement supprimé (`--rm`), avec une redirection de port (`-p 80:80`), portant le nom (`--name frontent`) et partageant le répertoire *dist* et le fichier *nginx.conf* (`-v`).

* Ouvrir un navigateur et tester l'URL suivante : [http://localhost:80](http://localhost:80/).

* Une fois testée, arrêter et détruire le conteneur nommé *frontend*.

```bash
docker rm -f frontend
```

#### Dockerfile pour le composant client (Vue.js)

> Nous vous invitons à vous positionner dans le répertoire *polldle-vue-17* pour profiter des codes qui vont illustrer cette section.

Nous avons vu comment configurer le code pour utiliser des variables d'environnement, produire les binaires pour le composant client ([Vue.js](https://vuejs.org/)) et déployer sur le serveur web [NGINX](https://www.nginx.com/).

Tout comme le composant serveur (Java), les binaires du composant client seront produits lors de la création de l'image [Docker](https://www.docker.com/).

Pour rappel, la création d'une image sous [Docker](https://www.docker.com/) passe par l'écriture d'un fichier *Dockerfile*.

* Créer un fichier *Dockerfile* à la racine du dossier *polldle-vue-17* et le compléter par le code présenté ci-dessous.

```dockerfile
# Build env
FROM node:lts-alpine as build-npm-stage
LABEL maintainer="Mickael BARON"

WORKDIR /polldle-vue
COPY package*.json ./
RUN npm install
COPY index.html ./
COPY public ./public
COPY src ./src
COPY .env.production ./
COPY vite.config.js ./

RUN npm run build

# Run env
FROM nginx:stable-alpine
COPY --from=build-npm-stage /polldle-vue/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
```

Ce fichier *Dockerfile* est également décomposé en deux étapes de construction appelée *multi-stage*. La première étape consiste à créer une image temporaire à partir du résultat de la construction des binaires du composant client tandis que la seconde étape consiste à créer l'image finale qui servira pour l'exécution.

Détaillons le contenu de ce fichier *Dockerfile* qui propose deux étapes.

**Étapes de compilation :**

* `FROM node:lts-alpine as build-npm-stage` : partir d'une image [Docker](https://www.docker.com/) pour la compilation, elle contient [npm](https://www.npmjs.com/) ;
* `LABEL maintainer="Mickael BARON"` : préciser l'auteur du fichier ;
* `WORKDIR /polldle-vue` : fixer le répertoire de travail ;
* `COPY package*.json ./` : copier le fichier de description du projet dans le répertoire de travail ;
* `RUN npm install` : installer les modules requis par le projet ;
* `COPY index.html ./` : copier le fichier racine *index.html* ;
* `COPY public ./public` : copier le contenu du répertoire *public* dans le répertoire de travail ;
* `COPY src ./src` : copier le contenu du répertoire *src* dans le répertoire de travail ;
* `COPY .env.production ./` : copier le fichier d'initialisation des variables d'environnement dans le répertoire de travail ;
* `COPY vite.config.js ./` : copier le fichier de configuration de [Vite](https://vitejs.dev/) ;
* `RUN npm run build` : construire les binaires qui seront déposés dans le répertoire *dist*.

**Étapes d'exécution :**

* `FROM nginx:stable-alpine` : partir d'une image [Docker](https://www.docker.com/) pour l'exécution. On s'appuie sur [Nginx](https://www.nginx.com/) comme serveur de déploiement ;
* `COPY --from=build-npm-stage /polldle-vue/dist /usr/share/nginx/html` : copier le résultat de la construction des binaires *dist* dans le répertoire usuel de [Nginx](https://www.nginx.com/) ;
* `COPY nginx.conf /etc/nginx/conf.d/default.conf` : copier le fichier de déploiement de notre application pour [Nginx](https://www.nginx.com/) dans le répertoire de configuration de [Nginx](https://www.nginx.com/) ;
* `EXPOSE 80` : préciser que le port `80` pourra être exposé ;
* `ENTRYPOINT ["nginx", "-g", "daemon off;"]` : préciser la commande par défaut à utiliser lors de l'exécution du conteneur.

#### Construction de l'image Docker du composant client (Vue.js)

La construction de l'image [Docker](https://www.docker.com/) du composant client ([Vue.js](https://vuejs.org/)) se base sur le fichier *Dockerfile* défini précédemment.

* Toujours depuis le répertoire *polldle/polldle-vue-17*, exécuter la ligne de commande suivante pour démarrer la construction de l'image [Docker](https://www.docker.com/) du composant client ([Vue.js](https://vuejs.org/)).

```bash
docker build --tag mickaelbaron/polldle-vue .
```

La sortie console attendue :

```bash
[+] Building 21.4s (20/20) FINISHED
 => [internal] load build definition from Dockerfile                                                                                                   0.0s
 => => transferring dockerfile: 84B                                                                                                                    0.0s
 => [internal] load .dockerignore                                                                                                                      0.0s
 => => transferring context: 2B                                                                                                                        0.0s
 => [internal] load metadata for docker.io/library/nginx:stable-alpine                                                                                 0.6s
 => [internal] load metadata for docker.io/library/node:lts-alpine                                                                                     0.7s
 => [auth] sharing credentials for chub.lias-lab.fr                                                                                                    0.0s
 => [build-npm-stage  1/10] FROM docker.io/library/node:lts-alpine@sha256:da32af0cf608622b1550678b2552b7d997def7d0ada00e0eca0166ed2ea42186             0.0s
 => CACHED [stage-1 1/3] FROM docker.io/library/nginx:stable-alpine@sha256:6e0d2cc5c4c8841ff6b8fc47a375f210e83069d038e1b8d1a6fd8f8ebe57ea2a            0.0s
 => => resolve docker.io/library/nginx:stable-alpine@sha256:6e0d2cc5c4c8841ff6b8fc47a375f210e83069d038e1b8d1a6fd8f8ebe57ea2a                           0.0s
 => [internal] load build context                                                                                                                      0.0s
 => => transferring context: 1.89kB                                                                                                                    0.0s
 => CACHED [build-npm-stage  2/10] WORKDIR /polldle-vue                                                                                                0.0s
 => [build-npm-stage  3/10] COPY package*.json ./                                                                                                      0.0s
 => [build-npm-stage  4/10] RUN npm install                                                                                                           10.3s
 => [build-npm-stage  5/10] COPY index.html ./                                                                                                         0.1s
 => [build-npm-stage  6/10] COPY public ./public                                                                                                       0.1s
 => [build-npm-stage  7/10] COPY src ./src                                                                                                             0.1s
 => [build-npm-stage  8/10] COPY .env.production ./                                                                                                    0.1s
 => [build-npm-stage  9/10] COPY vite.config.js ./                                                                                                     0.0s
 => [build-npm-stage 10/10] RUN npm run build                                                                                                          9.7s
 => [stage-1 2/3] COPY --from=build-npm-stage /polldle-vue/dist /usr/share/nginx/html                                                                  0.0s
 => [stage-1 3/3] COPY nginx.conf /etc/nginx/conf.d/default.conf                                                                                       0.1s
 => exporting to image                                                                                                                                 0.0s
 => => exporting layers                                                                                                                                0.0s
 => => writing image sha256:974752a8aff15cdf7981b7719ed5c0863348ba71fd8104ef815f6d94d4571972                                                           0.0s
 => => naming to docker.io/mickaelbaron/polldle-vue                                                                                                    0.0s
```

* S'assurer que l'image intitulée *mickaelbaron/polldle-vue* a été construite.

```bash
docker images
```

La sortie console attendue :

```bash
REPOSITORY                     TAG                 IMAGE ID            CREATED             SIZE
mickaelbaron/polldle-backend   latest              c976b72dafd3        60 seconds ago      165MB
mickaelbaron/polldle-vue       latest              f34078d6c901        34 seconds ago      23.2MB
```

#### Créer un conteneur du composant client (Vue.js)

Nous pouvons désormais créer un conteneur afin de tester l'image [Docker](https://www.docker.com/) construite pour le composant client ([Vue.js](https://vuejs.org/)). Le composant serveur (Java) doit normalement toujours être disponible dans un conteneur.

* Se positionner dans le répertoire *polldle-vue-17* et exécuter la ligne de commande suivante pour créer un conteneur basé sur l'image *mickaelbaron/polldle-vue*.

```bash
docker run -d --name frontend -p 80:80 mickaelbaron/polldle-vue
```

Un conteneur nommé `frontend` sera créé sur la base de l'image `mickaelbaron/polldle-vue`. L'option `-p 80:80` est utilisée pour la redirection de port.

* S'assurer que le contenu a été correctement créé et qu'il est toujours en exécution.

```bash
docker ps
```

```bash
CONTAINER ID        IMAGE                          COMMAND                  STATUS              PORTS                    NAMES
0e65e7ad22e6        mickaelbaron/polldle-vue       "nginx -g 'daemon of…"   6 minutes ago       0.0.0.0:80->80/tcp       frontend
346e0d4413ce        mickaelbaron/polldle-backend   "java -cp /polldle/c…"   6 minutes ago       0.0.0.0:9991->9991/tcp   backend
```

Malheureusement, si vous testez l'application PollDLE à l'adresse [http://localhost](http://localhost/), l'accès au service web REST ne fonctionnera pas puisque la variable d'environnement `VITE_APP_SERVER_URL` est initialisée à `/server`. Ainsi, l'URL [http://localhost/server/polldles](http://localhost/server/polldles) ne sera pas accessible.

### Composant reverse-proxy (NGINX)

> Nous vous invitons à vous positionner dans le répertoire *polldle-rp-without_subpath* pour profiter des codes qui vont illustrer cette section.

Le composant *reverse-proxy* est en charge de répondre aux sollicitations du client. Ainsi, si l'URL est de la forme [http://localhost/](http://localhost/), le *reverse-proxy* redirigera les requêtes vers le composant client ([Vue.js](https://vuejs.org/)) afin de télécharger le contenu statique développé avec [Vue.js](https://vuejs.org/). Au contraire, si l'URL est de la forme [http://localhost/server](http://localhost/server), le composant *reverse-proxy* redirigera les requêtes vers le composant serveur (Java) afin d'invoquer les services web REST développés avec Java.

[NGINX](https://www.nginx.com/), déjà employé comme serveur web, sera également utilisé comme *Reverse-Proxy*.

#### Configuration du composant reverse-proxy (NGINX)

La configuration du composant *polldle-rp-without_subpath/reverse-proxy* est disponible dans le fichier *build.conf*.

```yaml
server {
    listen 80;

    location /server/ {
        proxy_pass http://backend:9991/;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }

    location / {
        rewrite ^(/.*)$ $1 break;
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Deux configurations sont disponibles : celle pour accéder au composant server (Java) via `/server/` et celle pour accéder au composant client ([Vue.js](https://vuejs.org/)) via `/`. À noter que les requêtes sont redirigées vers les deux serveurs qui portent les noms respectifs de [http://backend:9991/](http://backend:9991/) et [http://frontend](http://frontend/). Nous verrons plus tard comment associer ces noms.

#### Dockerfile pour le composant reverse-proxy (NGINX)

Le fichier *Dockerfile* pour la création de l'image [Docker](https://www.docker.com/) du composant *reverse-proxy* est présenté ci-dessous.

```dockerfile
FROM nginx:stable-alpine
LABEL maintainer="Mickael BARON"
COPY build.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
```

Détaillons le contenu de ce fichier *Dockerfile :*

* `FROM nginx:stable-alpine` : partir d'une image [Docker](https://www.docker.com/) pour le déploiement statique d'application web avec [NGINX](https://www.nginx.com/) ;
* `LABEL maintainer="Mickael BARON"` : préciser l'auteur du fichier ;
* `COPY build.conf /etc/nginx/conf.d/default.conf` : copier le fichier de configuration dans le répertoire dédié de [NGINX](https://www.nginx.com/) ;
* `EXPOSE 80` : préciser que le port `80` pourra être exposé ;
* `ENTRYPOINT ["nginx", "-g", "daemon off;"]` : préciser la commande par défaut à utiliser lors de l'exécution du conteneur.

#### Construction de l'image Docker du composant reverse-proxy (NGINX)

La construction de l'image [Docker](https://www.docker.com/) du composant *reverse-proxy* se base sur le fichier *Dockerfile* défini précédemment.

* Exécuter la ligne de commande suivante (toujours depuis le répertoire *polldle-rp-without_subpath*).

```bash
docker build --tag mickaelbaron/polldle-rp .
```

La sortie console attendue :

```bash
[+] Building 1.8s (8/8) FINISHED
 => [internal] load build definition from Dockerfile                                                                                                   0.0s
 => => transferring dockerfile: 247B                                                                                                                   0.0s
 => [internal] load .dockerignore                                                                                                                      0.0s
 => => transferring context: 2B                                                                                                                        0.0s
 => [internal] load metadata for docker.io/library/nginx:stable-alpine                                                                                 1.6s
 => [auth] sharing credentials for chub.lias-lab.fr                                                                                                    0.0s
 => CACHED [1/2] FROM docker.io/library/nginx:stable-alpine@sha256:6e0d2cc5c4c8841ff6b8fc47a375f210e83069d038e1b8d1a6fd8f8ebe57ea2a                    0.0s
 => => resolve docker.io/library/nginx:stable-alpine@sha256:6e0d2cc5c4c8841ff6b8fc47a375f210e83069d038e1b8d1a6fd8f8ebe57ea2a                           0.0s
 => [internal] load build context                                                                                                                      0.0s
 => => transferring context: 555B                                                                                                                      0.0s
 => [2/2] COPY build.conf /etc/nginx/conf.d/default.conf                                                                                               0.0s
 => exporting to image                                                                                                                                 0.0s
 => => exporting layers                                                                                                                                0.0s
 => => writing image sha256:bbf1d8de51df1295cd3489781163efa61ef3c9776225b53e1ebcb57b11d2e7cd                                                           0.0s
 => => naming to docker.io/mickaelbaron/polldle-rp                                                                                                     0.0s
```

* Exécuter la ligne de commande suivante pour s'assurer que l'image [Docker](https://www.docker.com/) intitulée *mickaelbaron/polldle-rp* a été construite.

```bash
docker images
```

La sortie console attendue :

```bash
REPOSITORY                     TAG          IMAGE ID       CREATED          SIZE
mickaelbaron/polldle-rp        latest       bbf1d8de51df   45 seconds ago   23.5MB
mickaelbaron/polldle-backend   latest       c976b72dafd3   20 hours ago     165MB
mickaelbaron/polldle-vue       latest       f34078d6c901   22 minutes ago   23.2MB
```

#### Créer un conteneur du composant reverse-proxy (NGINX)

Comme les conteneurs [Docker](https://www.docker.com/) basés sur les images *mickaelbaron/polldle-vue* et *mickaelbaron/polldle-backend* exposent les ports `80` et `9991`, nous allons les recréer.

* Exécuter la ligne de commande suivante pour supprimer les conteneurs en cours d'exécution.

```bash
docker rm -f frontend
docker rm -f backend
```

* Exécuter la ligne de commande suivante pour créer les conteneurs [Docker](https://www.docker.com/) basés sur les images *mickaelbaron/polldle-vue* et *mickaelbaron/polldle-backend*.

```bash
docker run -d --name frontend mickaelbaron/polldle-vue
docker run -d --name backend -e KUMULUZEE_SERVER_HTTP_PORT=9991 mickaelbaron/polldle-backend
```

* Créer ensuite un conteneur basé sur l'image [Docker](https://www.docker.com/) *mickaelbaron/polldle-rt*.

```bash
docker run -d --name rp -p 80:80 mickaelbaron/polldle-rp
```

* Afficher la liste des conteneurs avec la commande suivante :

```bash
docker ps -a
```

La sortie console attendue :

```bash
CONTAINER ID        IMAGE                          COMMAND                  STATUS                      PORTS       NAMES
78bd18008796        mickaelbaron/polldle-rp        "nginx -g 'daemon of…"   Exited (1) 19 minutes ago               rp
781f589d49eb        mickaelbaron/polldle-vue       "nginx -g 'daemon of…"   Up 22 hours                 80/tcp      frontend
fc9c5c3ca3a0        mickaelbaron/polldle-backend   "java -cp /polldle/c…"   Up 22 hours                 9991/tcp    backend
```

Nous constatons que le conteneur *rp* ne fonctionne pas correctement. Pour connaître les causes de ce dysfonctionnement, nous allons examiner les *logs* du conteneur.

* Examiner les logs du conteneur *rp*.

```bash
docker logs rp
```

La sortie console attendue :

```bash
2022/07/20 15:02:36 [emerg] 1#1: host not found in upstream "backend" in /etc/nginx/conf.d/default.conf:5
nginx: [emerg] host not found in upstream "backend" in /etc/nginx/conf.d/default.conf:5
```

Cette erreur indique que le nom de domaine *backend* n'est pas connu. Il en va de même pour le nom de domaine *frontend*. Pour résoudre ce problème, il va donc falloir lier le conteneur *rp* avec les conteneurs *backend* et *frontend*. Pour cela, nous utiliserons un sous-réseau [Docker](https://www.docker.com/). Tout conteneur dans un sous-réseau [Docker](https://www.docker.com/) est identifiable par les autres conteneurs via son nom de conteneur.

* Créer un sous-réseau [Docker](https://www.docker.com/) appelé *polldlenetwork*.

```bash
docker network create polldlenetwork
```

* Ajouter les conteneurs *frontend* et *backend* à ce nouveau sous-réseau [Docker](https://www.docker.com/).

```bash
docker network connect polldlenetwork backend
docker network connect polldlenetwork frontend
```

* Supprimer le conteneur *rp* et le recréer dans le sous-réseau [Docker](https://www.docker.com/) *polldlenetwork*.

```bash
docker rm -f rp
docker run -d --name rp --network polldlenetwork -p 80:80 mickaelbaron/polldle-rp
```

* Ouvrir un navigateur et tester l'URL suivante : [http://localhost](http://localhost/).

## Déploiement via un sous-chemin

Le déploiement peut vouloir être réalisé au travers d'un sous-chemin de la forme [https://mycompany.com/polldle](https://mycompany.com/polldle). Cela implique que les URL d'accès aux composants client et serveur soient différentes. Cette modification n'est pas si anodine, puisque le code des composants *reverse-proxy* (NGINX) et client ([Vue.js](https://vuejs.org/)) devront être impactés. Plus précisément, il s'agira pour le composant *reverse-proxy* (NGINX) du fichier de configuration, et pour le composant client ([Vue.js](https://vuejs.org/)) d'une nouvelle URL pour accéder aux services web REST, de la configuration du routage et de l'accès aux ressources CSS et JavaScript.

Le changement (avec ou sans sous-chemin) sera indiqué lors de la création des images [Docker](https://www.docker.com/). Ce changement pourrait se faire directement lors de l'exécution, mais cette solution ne sera pas traitée dans ce tutoriel.

Dans la suite de cette section, nous montrons une solution pour automatiser la construction des images [Docker](https://www.docker.com/) du composant *reverse-proxy* (NGINX) et du composant client ([Vue.js](https://vuejs.org/)).

### Sous-chemin pour le composant client (Vue.js)

> Nous vous invitons à vous positionner dans le répertoire *polldle-vue-18* pour profiter des codes qui vont illustrer cette section.

Au niveau du composant client ([Vue.js](https://vuejs.org/)), nous allons devoir renseigner :

* une nouvelle URL pour accéder aux services web REST (variables d'environnement) ;
* l'accès aux ressources CSS et JavaScript (fichier de configuration).

#### Mode (variables d'environnement) sous-chemin (Vue.js)

Actuellement, deux modes sont utilisés pour initialiser les variables d'environnement : *development* et *production*.

Nous montrons dans cette section comment créer un nouveau mode personnalisé appelé *subpath* qui donnera une nouvelle valeur à la variable d'environnement `VITE_APP_SERVER_URL` et ajoutera une nouvelle variable d'environnement pour préciser le sous-chemin.

* Créer un fichier *.env.subpath* à la racine du dossier *polldle-vue-18/* et copier le contenu ci-dessous.

```properties
VITE_APP_SERVER_URL = /polldle/server
VITE_APP_SUBPATH = /polldle/
NODE_ENV = production
```

La première propriété `MODE_ENV` explique que ce nouveau mode sera basé sur le mode *production*. La seconde `VITE_APP_SUBPATH` est une nouvelle variable d'environnement pour fixer la valeur du sous-chemin. La troisième `VITE_APP_SERVER_URL` est celle qui précise la valeur de l'URL du serveur.

Quand un sous-chemin n'est pas requis, c'est-à-dire pour les modes *development* et *production*, la variable d'environnement `VITE_APP_SUBPATH` doit être au moins fixée à `/`.

* Ajouter dans le fichier `.env.development` la variable d'environnement `VITE_APP_SUBPATH` fixée à `/`.

```properties
VITE_APP_SERVER_URL = http://localhost:9991
VITE_APP_SUBPATH = /
```

* Ajouter dans le fichier `.env.production` la variable d'environnement `VITE_APP_SUBPATH` fixée à `/`.

```properties
VITE_APP_SERVER_URL = /server
VITE_APP_SUBPATH = /
```

Pour construire des binaires avec le mode personnalisé *subpath*, il faudra exécuter la commande suivante : `vite build --mode subpath`. `vite` n'est pas exécutée directement, mais via un script défini dans le fichier *package.json*.

* Éditer le fichier *package.json* et ajouter un nouveau script appelé *subpath* dans le contenu de `scripts`.

```javascript
...
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "subpath": "vite build --mode subpath"
  },
...
```

#### Fichier de configuration (Vue.js)

Dans le cas de la configuration d'un sous-chemin et pour permettre l'accès aux ressources CSS et JavaScript, nous devons modifier la valeur du chemin de base (actuellement à */*). La valeur du chemin de base est modifiable depuis le fichier *vite.config.js*.

* Éditer le fichier *vue.config.js* avec le contenu ci-dessous.

```javascript
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  process.env = {...loadEnv(mode, process.cwd())};

  return {
    plugins: [vue()],
    base: process.env.VITE_APP_SUBPATH,
    build: {
      sourcemap: 'true'
    }
  }
})
```

La valeur du chemin de base est déterminée par la propriété `base`. Cette valeur sera obtenue par la variable d'environnement `VITE_APP_SUBPATH` définie dans la section précédente. Pour accéder aux variables d'environnement, nous utilisons la fonction `loadEnv` qui prend en paramètre le mode courant `mode` et le chemin courant `process.cmd()`. À titre d'illustration, nous montrons comment activer les fichiers SourceMap lors de la construction des binaires. Pour information, les fichiers SourceMap aident à déboguer une application JavaScript en cours d'exécution, ils aident à maintenir la correspondance entre le code généré et le code source.

> Vous trouverez une liste des paramètres globaux disponibles à cette adresse : [https://vitejs.dev/config/](https://vitejs.dev/config/).

* S'assurer que les modifications apportées fonctionnent correctement.

```bash
npm install
npm run subpath
```

La sortie console attendue : 

```bash
> polldle-vue-18@0.0.0 subpath
> vite build --mode subpath

vite v3.0.2 building for subpath...
✓ 91 modules transformed.
dist/index.html                  0.69 KiB
dist/assets/index.e06742e7.css   0.73 KiB / gzip: 0.38 KiB
dist/assets/index.b88a0803.js    436.09 KiB / gzip: 155.19 KiB
dist/assets/index.b88a0803.js.map 1512.38 KiB
```

Le mode *subpath* a bien été pris en compte. Vous pouvez examiner le contenu généré pour vous assurer que les valeurs sont au bon endroit.

#### Dockerfile du composant client (Vue.js) avec un sous-chemin

> Nous vous invitons à vous positionner dans le répertoire *polldle-vue-19* pour profiter des codes qui vont illustrer cette section.

Pour rappel, voici les deux commandes pour construire les binaires du composant client ([Vue.js](https://vuejs.org/)) :

* sans sous-chemin : `npm run build` ;
* avec sous-chemin : `npm run subpath`.

Le choix de la commande dépend donc de ce qu'on veut obtenir comme binaire. Nous allons modifier le fichier *Dockerfile* afin de pouvoir choisir la commande lors de la construction de l'image [Docker](https://www.docker.com/).

* Éditer le fichier *Dockerfile* en ajoutant le code présenté au niveau des commentaires `# Use ARG instruction to create script_name variable` et `# Inject script_name variable into the command`.

```dockerfile
FROM node:lts-alpine as build-npm-stage
LABEL maintainer="Mickael BARON"
# Use ARG instruction to create script_name variable
ARG script_name=build

WORKDIR /polldle-vue
COPY package.json ./
RUN npm install
COPY index.html ./
COPY public ./public
COPY src ./src
COPY .env.production ./
COPY .env.subpath ./
COPY vite.config.js ./
RUN ls /polldle-vue

# Inject script_name variable into the command
RUN npm run $script_name

# Run env
FROM nginx:stable-alpine
COPY --from=build-npm-stage /polldle-vue/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
```

L'instruction `ARG script_name=build` permet de créer une variable `script_name` qui prend comme valeur par défaut `build`. Lors de la construction de l'image [Docker](https://www.docker.com/), une valeur pourra être donnée. L'idée est de donner soit `build` soit `subpath`.

#### Construction de l'image Docker du composant client (Vue.js) avec un sous-chemin

* Depuis l'invite de commande, se positionner dans le répertoire *polldle/polldle-vue-19* et exécuter la ligne de commande suivante pour démarrer la construction de l'image [Docker](https://www.docker.com/) du composant client ([Vue.js](https://vuejs.org/)).

```bash
docker build --tag mickaelbaron/polldle-vue . --build-arg script_name=subpath
```

Pour passer une valeur à la variable `script_name`, l'option `--build-arg` a été utilisée.

### Sous-chemin pour le composant reverse-proxy (NGINX)

> Nous vous invitons à vous positionner dans le répertoire *polldle-rp* pour profiter des codes qui vont illustrer cette section.

Au niveau du composant *reverse-proxy* (NGINX), nous allons devoir renseigner :

* un nouveau fichier de configuration spécifique à [NGINX](https://www.nginx.com/).

#### Configuration du composant reverse-proxy (NGINX) avec un sous-chemin

* Examiner le contenu du fichier *polldle-rp/subpath.conf*.

```yaml
server {
    listen 80;

    location /polldle/server/ {
        proxy_pass http://backend:9991/;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }

    location /polldle/ {
        rewrite ^/polldle(/.*)$ $1 break;
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Le sous-chemin */polldle/* est spécifié dans ce fichier.

#### Dockerfile du composant reverse-proxy (NGINX) avec un sous-chemin

* Examiner le contenu du fichier *polldle-rp/Dockerfile*.

```dockerfile
FROM nginx:stable-alpine
LABEL maintainer="Mickael BARON"
ARG script_name=build
COPY $script_name.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Tout comme le fichier *Dockerfile* du composant client (Vue.js), une variable est utilisée pour donner le nom de la configuration à appeler.

#### Construction de l'image Docker du composant reverse-proxy (NGINX) avec un sous-chemin

* Depuis l'invite de commande, se positionner dans le répertoire *polldle-rp* et exécuter la ligne de commande suivante pour démarrer la construction de l'image [Docker](https://www.docker.com/) du composant *reverse-proxy* (NGINX).

```bash
docker build --tag mickaelbaron/polldle-rp . --build-arg script_name=subpath
```

### Résumé pour définir un sous-chemin

Pour changer le sous-chemin, vous devrez impacter les fichiers suivants :

* *.env.subpath :* les clés `VITE_APP_SUBPATH` et `VITE_APP_SERVER_URL` ;
* *polldle-rp/subpath.conf :* modifier les valeurs dans `location`.

Nous pouvons désormais tester notre application composée de trois composants (*backend*, *frontend* et *reverse-proxy*). Nous supposons que les trois images [Docker](https://www.docker.com/) correspondantes aux composants sont présentes, si ce n'est pas le cas, merci de revoir les sections précédentes.

* Exécuter la ligne de commande suivante pour supprimer les conteneurs en cours d'exécution.

```bash
docker rm -f rp backend frontend
```

* Exécuter les trois lignes de commande suivante pour créer les conteneurs des composants.

```bash
docker run -d --name backend --network polldlenetwork -e KUMULUZEE_SERVER_HTTP_PORT=9991 mickaelbaron/polldle-backend
docker run -d --name frontend --network polldlenetwork mickaelbaron/polldle-vue
docker run -d --name rp --network polldlenetwork -p 80:80 mickaelbaron/polldle-rp
```

* Ouvrir un navigateur et tester l'URL suivante : [http://localhost/polldle](http://localhost/polldle).

## Composer les images Docker

Actuellement, nous disposons de trois composants qui ont chacun une image [Docker](https://www.docker.com/). La construction des images [Docker](https://www.docker.com/) et la création des conteneurs associés se font manuellement. Pour automatiser ce processus, nous utiliserons l'option *compose* [Docker](https://www.docker.com/) via la mise en place d'un fichier *docker-compose.yml*. Bien entendu, nous garderons les bénéfices de prise en compte ou pas d'un sous-chemin.

### Fichier de composition

* Examiner le contenu du fichier *docker-compose.yml* disponible à la racine du projet.

```yaml
version: '3'

services:

  backend:
    build: polldle-backend/
    image: mickaelbaron/polldle-backend
    environment:
      KUMULUZEE_SERVER_HTTP_PORT: 9991
    ports:
      - "9991:9991"
    networks:
      - polldlenetwork

  frontend:
    build: polldle-vue/
    image: mickaelbaron/polldle-vue
    networks:
      - polldlenetwork

  rp:
    build: polldle-rp/
    image: mickaelbaron/polldle-rp
    depends_on:
      - frontend
      - backend
    ports:
      - "80:80"
    networks:
      - polldlenetwork

networks:
  polldlenetwork:
```

Ce fichier est divisé en deux parties : la configuration des conteneurs d'une part et la configuration du sous-réseau *polldlenetwork* d'autre part. Tous les paramétrages des conteneurs ont déjà été étudiés dans les sections précédentes.

### Construire et tester

L'option *compose* permet de construire toutes les images [Docker](https://www.docker.com/) et de créer les trois conteneurs dans le sous-réseau *polldlenetwork*. Vous trouverez ci-dessous toutes les configurations possibles :

* `docker compose up -d` : créer les trois conteneurs en mode détaché (si les images [Docker](https://www.docker.com/) ne sont pas créées, elles seront construites avant) ;
* `docker compose build` : construire toutes les images [Docker](https://www.docker.com/) ;
* `docker compose build COMPONENT` : construire l'image [Docker](https://www.docker.com/) du composant `COMPONENT` (*frontend*, *backend* ou *rp*) ;
* `docker compose build --build-arg script_name=subpath` : construire toutes les images [Docker](https://www.docker.com/) en précisant avec ou sans sous-chemin.

Dans l'hypothèse, où aucune image [Docker](https://www.docker.com/) n'a été construite, la commande `docker compose up -d` est suffisante.

* Ouvrir un terminal et exécuter la ligne de commande suivante :

```bash
docker compose up -d
```

La sortie console attendue :

```bash
[+] Running 0/3
 ⠿ rp Error                                                         3.0s
 ⠿ backend Error                                                    2.0s
 ⠿ frontend Error                                                   3.0s
[+] Building 8.6s (41/41) FINISHED
...
[+] Running 4/4
 ⠿ Network vuejs3-polldle-tutorial-src_polldlenetwork  Created      0.1s
 ⠿ Container vuejs3-polldle-tutorial-src-frontend-1    Started      0.6s
 ⠿ Container vuejs3-polldle-tutorial-src-backend-1     Started      0.7s
 ⠿ Container vuejs3-polldle-tutorial-src-rp-1          Started      1.6s
```

* Pour vérifier que les trois conteneurs ont été créés.

```bash
docker compose ps
```

La sortie console attendue : 

```bash
NAME                                     COMMAND                  SERVICE      STATUS      PORTS
vuejs3-polldle-tutorial-src-backend-1    "java -cp /polldle/c…"   backend      running     0.0.0.0:9991->9991/tcp
vuejs3-polldle-tutorial-src-frontend-1   "nginx -g 'daemon of…"   frontend     running     80/tcp
vuejs3-polldle-tutorial-src-rp-1         "/docker-entrypoint.…"   rp           running     0.0.0.0:80->80/tcp
```

## Conclusion et remerciements

Cette troisième partie a présenté les problématiques de déploiement d'une application [Vue.js](https://vuejs.org/) en utilisant [Docker](https://www.docker.com/) pour la création de conteneurs.

Pour le composant client ([Vue.js](https://vuejs.org/)) qui était au centre de cette étude, nous avons montré comment utiliser les variables d'environnement dans le code, comment configurer les paramètres globaux et comment utiliser un sous-chemin.

Pour [Docker](https://www.docker.com/), cette solution de conteneurisation a permis de rendre le développement plus proche de la production. La taille des images [Docker](https://www.docker.com/) construites a été optimisée via l'utilisation du *multi-stage*.

Cette troisième partie clôture également cette série consacrée à [Vue.js](https://vuejs.org/). De nombreux concepts n'ont pas été présentés, mais pourront faire l'objet de prochains tutoriels : [Pinia](https://pinia.vuejs.org/) pour gérer l'état de l'application et [WebComponents](https://www.webcomponents.org/) pour utiliser des WebComponents existants et pourquoi pas transformer des composants [Vue.js](https://vuejs.org/) en [WebComponents](https://www.webcomponents.org/).

[Vue.js](https://vuejs.org/) est une constante évolution. Cette série d'article est la seconde édition. Pour la première édition, nous avions utilisé la version 2 de [Vue.js](https://vuejs.org/) et la version 4 de [Vue CLI](https://cli.vuejs.org/). Pour cette seconde édition, nous avons utilisé la version 3 de [Vue.js](https://vuejs.org/) (en production depuis avril 2022) et la version 5 de [Vite](https://vitejs.dev/). J’essaierai, dans la mesure du possible, d'adapter le code du projet PollDLE en fonction des améliorations de [Vue.js](https://vuejs.org/).

## Ressources

* [Paramètres globaux pour Vite](https://vitejs.dev/config/) : liste des paramètres globaux à utiliser dans le fichier *vite.config.js ;*
* [Configurations serveur](https://router.vuejs.org/guide/essentials/history-mode.html#example-server-configurations) : exemples de configuration serveur.
