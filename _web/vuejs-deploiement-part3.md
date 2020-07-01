---
title: 'Développer une application web avec Vue.js et Vue CLI, déploiement avec Docker (partie 3)'
tags: [Vue.js, Docker]
direct_link:
image: /images/vuejsdockerjava.jpg
description: Cette troisième partie s'intéresse aux problématiques de déploiement d'une application Vue.js en utilisant Docker pour créer des conteneurs.
category: Article
date: 2019-07-09
weight: 3
toc: true
twitter: 1148586483495972866
---

L'objectif de cet article en plusieurs parties est de vous présenter le framework web JavaScript [Vue.js](https://vuejs.org/) en se focalisant sur les principaux concepts au travers d'un exemple unique.

Les différentes parties de cet article sont détaillées ci-dessous :

* [généralités sur les frameworks web JavaScript et présentation de Vue.js](/web/vuejs-generalites-part1) ;
* [mise en œuvre des concepts de Vue.js](/web/vuejs-miseenoeuvre-part2) ;
* **déploiement d'une application web développée avec Vue.js**.

Lors de l'écriture de l'article, nous avons utilisé la version 2 de [Vue.js](https://vuejs.org/) et la version 4 de [Vue CLI](https://cli.vuejs.org/).

Cette troisième partie s'intéresse aux problématiques de déploiement d'une application [Vue.js](https://vuejs.org/) en utilisant massivement la brique technologique Docker pour créer des conteneurs.

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

> Nous supposons pour les prochaines expérimentations que vous avez installé [Docker](https://www.docker.com/). Si ce n'est pas le cas, nous vous encourageons à consulter la documentation officielle : [https://docs.docker.com/](https://docs.docker.com/). [Docker](https://www.docker.com/) est disponible pour macOS, Linux et Windows.

## Déploiement des composants : client, serveur et reverse-proxy

Nous étudions dans cette section la construction d'images [Docker](https://www.docker.com/) pour les trois composants de notre architecture logicielle. Pour chaque composant, nous montrerons comment configurer les sources pour paramétrer l'exécution (une exécution en production et différente d'une exécution pour le test en développement), comment construire les binaires et comment « exécuter » les binaires.

Les avantages de la construction des binaires par [Docker](https://www.docker.com/) sont multiples.

* Éviter d'installer les outils ([Java](http://jdk.java.net/), [Maven](https://maven.apache.org/) et [npm](https://www.npmjs.com/)) sur son poste de travail. En effet, si vous souhaitez simplement tester PollDLE pour admirer cette magnifique application, vous n'aurez besoin que de récupérer les sources et lancer une commande [Docker](https://www.docker.com/) pour utiliser les outils de compilation lors de la phase de création d'images [Docker](https://www.docker.com/).
* Maîtriser la construction des binaires dans un environnement connu (les versions des outils sont les mêmes). En effet, vous pourriez déjà posséder sur votre poste de travail des versions différentes des outils et cela pourrait amener des problèmes de compilation.
* Contrôler l'exécution des binaires en production. Les versions des outils pour l'exécution des binaires seront les mêmes, quel que soit le système hôte utilisé.

### Composant serveur (Java)

Le composant serveur (Java) qui sert à diffuser les services web REST s'appuie sur la spécification [MicroProfile](https://microprofile.io/). Nous n'utiliserons que deux composants de cette spécification : JAX-RS (service web REST) et CDI (injection de dépendances). Nous avons opté pour [KumuluzEE](https://ee.kumuluz.com/) comme implémentation de la spécification [MicroProfile](https://microprofile.io/). Lors de l'écriture de cet article, la version 2.1 de [MicroProfile](https://microprofile.io/) était supportée par [KumuluzEE](https://ee.kumuluz.com/). De nombreuses autres implémentations de [MicroProfile](https://microprofile.io/) sont également disponibles. Le choix de [KumuluzEE](https://ee.kumuluz.com/) a été motivé par sa simplicité, sa documentation, sa longévité (cinq ans) et qu'il est toujours enrichissant de s'intéresser aux bibliothèques qui ne font pas de vague, mais qui apportent de grands services. À noter que j'ai découvert [KumuluzEE](https://ee.kumuluz.com/) en 2015 puisque cette bibliothèque avait gagné le prix « Duke's Choice Award Winner », c'est aussi à cette époque que je me suis intéressé à [MicroProfile](https://microprofile.io/).

Dans la suite de cette section dédiée au composant serveur (Java), nous vous invitons à ouvrir un terminal et vous positionner à la racine du répertoire *polldle-backend*.

#### Construction des binaires du composant serveur (Java)

La construction des binaires se fait par l'intermédiaire de [Maven](https://maven.apache.org/).

* Exécuter la ligne de commande suivante pour compiler la couche serveur à partir de [Maven](https://maven.apache.org/).

```console
$ mvn clean package
...
[INFO] ------------------------------------------------------------------------
[INFO] Reactor Summary for polldle-parent 0.4-SNAPSHOT:
[INFO]
[INFO] polldle-parent ..................................... SUCCESS [  0.127 s]
[INFO] poddle-api ......................................... SUCCESS [  1.040 s]
[INFO] polldle-server ..................................... SUCCESS [  5.746 s]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  7.028 s
[INFO] Finished at: 2020-06-30T21:28:55+02:00
[INFO] ------------------------------------------------------------------------
```

[Maven](https://maven.apache.org/) compilera le code source, exécutera les tests unitaires et préparera les binaires finals. Ces derniers sont disponibles dans le répertoire *polldle-server/target*, nous les détaillons ci-dessous :

```console
polldle-server/target
├── classes
│   ├── fr
│   ├── META-INF
│   ...
├── dependency
│   ├── HikariCP-2.7.9.jar
│   ├── activation-1.1.1.jar
│   ├── alpn-api-1.1.3.v20160715.jar
│   ├── aopalliance-repackaged-2.5.0.jar
│   ├── asm-7.0.jar
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

```console
export KUMULUZEE_SERVER_HTTP_PORT=9991
export KUMULUZEE_SERVER_BASEURL=http://0.0.0.0
```

Ces variables d'environnement devront être initialisées avant l'exécution du programme Java.

#### Exécution du composant serveur (Java)

Comme vu dans la partie construction des binaires, les fichiers nécessaires à l'exécution sont disponibles dans le répertoire *polldle/polldle-server/target*. Nous passerons par une exécution classique d'une application Java puisque le composant serveur (Java) a intégré un serveur web Jetty pour diffuser les services web à l'adresse [http://0.0.0.0:9991](http://0.0.0.0:9991/).

* Démarrer l'exécution du composant serveur (Java) via la ligne de commande ci-dessous.

```console
$ java -cp "polldle-server/target/dependency/*:polldle-server/target/classes" com.kumuluz.ee.EeApplication
...
2020-06-30 21:29:53.508 INFO -- org.eclipse.jetty.server.AbstractConnector -- Started ServerConnector@4c402120{HTTP/1.1, (http/1.1)}{0.0.0.0:9991}
2020-06-30 21:29:53.508 INFO -- org.eclipse.jetty.server.Server -- Started @1932ms
2020-06-30 21:29:53.508 INFO -- com.kumuluz.ee.EeApplication -- KumuluzEE started successfully
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

Ce fichier *Dockerfile* est décomposé en deux étapes de construction appelée multi*stage*. La première étape consiste à créer une image temporaire à partir du résultat de la compilation du composant serveur (Java) tandis que la seconde étape consiste à créer l'image finale qui servira pour l'exécution. Le résultat de la première étape servira pour construire la seconde étape. L'intérêt de décomposer en deux étapes est avant tout de pouvoir limiter la taille de l'image finale. En effet, pour la compilation, il est nécessaire de s'appuyer sur une image [Docker](https://www.docker.com/) avec JDK et Maven (`FROM maven:3-jdk-11 AS build-java-stage`). De nombreuses dépendances Java seront téléchargées, mais pas forcément utiles pour l'exécution (plugin Maven, dépendances Java pour les tests unitaires…).

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

```console
$ docker build --tag mickaelbaron/polldle-backend .
Sending build context to Docker daemon  16.53MB
Step 1/12 : FROM maven:3-jdk-11 AS build-java-stage
 ---> 918519009705
Step 2/12 : LABEL maintainer="Mickael BARON"
 ---> Using cache
 ---> 3fafd8d7ffaf
Step 3/12 : WORKDIR /polldle
 ---> Using cache
 ---> 8c77daa432e6
Step 4/12 : COPY polldle-api polldle-api
 ---> Using cache
 ---> 9dfda02b9f5c
Step 5/12 : COPY polldle-server polldle-server
 ---> Using cache
 ---> fb55878a2bb5
Step 6/12 : COPY pom.xml .
 ---> Using cache
 ---> a97354e88cac
Step 7/12 : RUN mvn -f pom.xml clean package
 ---> Using cache
 ---> 7ea2e436ca8e
Step 8/12 : FROM adoptopenjdk/openjdk11:alpine-jre
 ---> e6a63aa27f97
Step 9/12 : COPY --from=build-java-stage /polldle/polldle-server/target/classes /polldle/classes
 ---> Using cache
 ---> 6fdf5002cca8
Step 10/12 : COPY --from=build-java-stage /polldle/polldle-server/target/dependency/*.jar /polldle/dependency/
 ---> Using cache
 ---> 655ab9c47799
Step 11/12 : EXPOSE 9991
 ---> Using cache
 ---> 677fda6a6431
Step 12/12 : ENTRYPOINT ["java", "-cp", "/polldle/classes:/polldle/dependency/*", "com.kumuluz.ee.EeApplication"]
 ---> Using cache
 ---> c976b72dafd3
Successfully built c976b72dafd3
Successfully tagged mickaelbaron/polldle-backend:latest
```

On remarque que le nombre d'étapes est identique au nombre de lignes contenues dans le fichier *Dockerfile*. Chaque étape correspondra à une couche spécifique de l'image résultante.

* Exécuter la ligne de commande suivante pour s'assurer que l'image intitulée *mickaelbaron/polldle-backend* a été construite.

```console
$ docker images
REPOSITORY                     TAG                 IMAGE ID            CREATED             SIZE
mickaelbaron/polldle-backend   latest              c976b72dafd3        2 seconds ago       165MB
```

On constate clairement que l'image est d'une taille réduite (165MB). Cela est dû à l'utilisation du multi*stage* d'une part et à l'image [Docker](https://www.docker.com/) `adoptopenjdk/openjdk11:alpine-jre` qui offre une empreinte de disque réduite.

#### Créer un conteneur du composant serveur (Java)

Nous pouvons désormais créer un conteneur afin de tester l'image construite pour le composant serveur (Java). Bien entendu, il s'agit d'une première étape, car dans cette section, seul le composant serveur (Java) sera déployé par un conteneur. Le composant client ([Vue.js](https://vuejs.org/)) devra être démarré sans conteneur.

* Se positionner dans le répertoire *polldle-vue* et créer un conteneur basé sur l'image [Docker](https://www.docker.com/) précédente.

```console
$ docker run -d --name backend -e KUMULUZEE_SERVER_HTTP_PORT=9991 -p 9991:9991 mickaelbaron/polldle-backend
b3c5fd42962cee0dd0cd45f2c6ed35ca1926ab0d9a9efbedb3cea0241062bc9e
```

Un conteneur nommé `backend` sera créé sur la base de l'image `mickaelbaron/polldle-backend`. L'option `-d` indique que le conteneur est créé en mode détaché. L'option `-e KUMULUZEE_SERVER_HTTP_PORT=9991` est utilisée pour modifier la valeur du port d'écoute via l'initialisation d'une variable d'environnement. L'option `-p 9991:9991` est utilisée pour la redirection de port.

* Exécuter la ligne de commande suivante pour s'assurer que le contenu a été correctement créé et qu'il est toujours en exécution.

```console
$ docker ps
CONTAINER ID        IMAGE                          COMMAND                  STATUS              PORTS                    NAMES
2cc90d113638        mickaelbaron/polldle-backend   "java -cp /polldle/c…"   Up 52 seconds       0.0.0.0:9991->9991/tcp   backend
```

* Toujours depuis le répertoire *polldle-vue*, démarrer l'exécution en mode développement de la couche client ([Vue.js](https://vuejs.org/)).

```console
$ npm run serve
...
```

### Composant client (Vue.js)

Le développement du composant client ([Vue.js](https://vuejs.org/)) a déjà été présenté dans le [deuxième article](/web/vuejs-miseenoeuvre-part2) de ce tutoriel.

Pour le déploiement de ce composant, nous allons devoir changer l'adresse du composant serveur. En effet, l'adresse du composant serveur pour le développement `http://127.0.0.1:9991` est différente de celle pour le déploiement en production `/server`.

Que l'on souhaite tester lors de la phase de développement ou construire une version déployable pour la phase de mise en production, nous montrerons à la fin de cette section que vous n'aurez plus besoin d'intervenir dans le code du composant client. Des variables d'environnement seront utilisées directement dans le code.

#### Variables d'environnement

> Nous vous invitons à vous positionner dans le répertoire *polldle-vue-15* pour profiter des codes qui vont illustrer cette section.

Nous montrons dans cette sous-section comment stocker les variables d'environnement et comment les utiliser dans le code des composants.

Depuis, la version 3 de [Vue CLI](https://cli.vuejs.org/), les variables d'environnement sont déclarées et initialisées dans des fichiers préfixés par *.env[.mode]* où *mode* correspond à *development* ou *production*. Ces fichiers doivent être placés à la racine de votre projet.

À titre d'exemple, voici les fichiers que vous pourriez trouver à la racine d'un projet [Vue.js](https://vuejs.org/).

```console
.env             : variables d'environnement disponibles quel que soit le mode ;
.env.development : variables d'environnement disponibles pour le développement (npm run server) ;
.env.production  : variables d'environnement disponibles pour la production (npm run build).
```

Ces fichiers *.env[.mode]* contiennent des paires de clé=valeur. Généralement, les clés des variables d'environnement seront identiques dans les différents fichiers *.env[.mode]* par contre les valeurs seront différentes.

Pour qu'une clé soit utilisable dans le code des composants, elle doit commencer par `VUE_APP`.

* Créer un fichier *.env.development* pour le mode développement et éditer le fichier de façon à ajouter le contenu ci-dessous.

```properties
VUE_APP_SERVER_URL = http://localhost:9991
```

* Créer un fichier *.env.production* pour le mode production et éditer le fichier de façon à ajouter le contenu ci-dessous.

```properties
VUE_APP_SERVER_URL = /server
```

Une seule variable d'environnement sera définie et sa valeur changera selon le mode utilisé (*development* ou *production*). Ainsi `VUE_APP_SERVER_URL` vaudra `http://localhost:9991` pour le mode développement et `/server` pour le mode production.

Pour utiliser ces variables d'environnement dans le code des composants, il suffira d'utiliser le code suivant : `process.env.VUE_APP_SERVER_URL`. Le code des trois composants sera impacté afin d'utiliser cette variable d'environnement.

* Éditer le fichier *CreatePolldle.vue* en remplaçant le commentaire `// Use environment variable to define REST web service URL` par le code présenté ci-dessous.

```javascript
      // Use environment variable to define REST web service URL
      var request = new Request(process.env.VUE_APP_SERVER_URL + "/polldles", {
        method: "POST",
        body: JSON.stringify(polldleObject),
        headers: {
          'Content-Type': 'application/json'
        }
      })
```

* Éditer le fichier *VotePolldle.vue* en remplaçant les deux commentaires `// Use environment variable to define REST web service URL` par les codes présentés ci-dessous.

```javascript
  created() {
    // Use environment variable to define REST web service URL
    axios.get(process.env.VUE_APP_SERVER_URL + "/polldles", {
      params : {
        pathURL: this.$route.params.pathurl
      }
    }).then(response => {
    ...
  },
  methods: {
    vote() {
      ...
      axios({
        method: 'post',
        // Use environment variable to define REST web service URL
        baseURL: process.env.VUE_APP_SERVER_URL + "/polldles/" + this.$route.params.pathurl + "/votes",
        data: JSON.stringify(polldleVote),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => {
      ...
    }
  }
```

* Éditer le fichier *ResultPolldle.vue* en remplaçant le commentaire `// Use environment variable to define REST web service URL` par le code présenté ci-dessous.

```javascript
  created() {
    // Use environment variable to define REST web service URL
    var source = new EventSource(
      process.env.VUE_APP_SERVER_URL +
      "/polldles/" +
      this.$route.params.pathurl +
      "/votes/sse"
    );
    ...
  }
```

Comme montré dans les codes précédents, l'ancienne valeur `http://127.0.0.1:9991` a été transformée en `process.env.VUE_APP_SERVER_URL`. Lors de la phase construction des binaires, le code `process.env.VUE_APP_SERVER_URL` sera remplacé par la valeur contenue soit dans le fichier *.env.development* soit dans le fichier *.env.production*.

#### Construction des binaires du composant client (Vue.js)

Pour l'instant, nous avons vu comment tester le projet [Vue.js](https://vuejs.org/) en exécutant : `npm run server`.

```console
npm run server
> polldle-vue-15@0.1.0 serve .../polldle/polldle-vue-15
> vue-cli-service serve

 INFO  Starting development server...
 98% after emitting CopyPlugin

 DONE  Compiled successfully in 2410ms


  App running at:
  - Local:   http://localhost:8080/
  - Network: unavailable

  Note that the development build is not optimized.
  To create a production build, run npm run build.
```

Nous allons maintenant construire les *binaires* pour la version qui sera déployée en production.

* Exécuter `npm run build` où `build` est un script défini dans le fichier *package.json*.

```console
npm run build
> polldle-vue-15@0.1.0 build /Users/baronm/workspacejava/polldle/polldle-vue-15
> vue-cli-service build

⠹  Building for production...

 WARNING  Compiled with 2 warnings     10:23:29

 warning

entrypoint size limit: The following entrypoint(s) combined asset size exceeds the recommended limit (244 KiB). This can impact web performance.
Entrypoints:
  app (278 KiB)
      css/chunk-vendors.0cbd351a.css
      js/chunk-vendors.86498fa6.js
      css/app.f351e9c1.css
      js/app.f1a0f2ea.js


 warning

webpack performance recommendations:
You can limit the size of your bundles by using import() or require.ensure to lazy load some parts of your application.
For more info visit https://webpack.js.org/guides/code-splitting/

  File                                   Size              Gzipped

  dist/js/chunk-vendors.86498fa6.js      82.85 KiB         29.96 KiB
  dist/js/app.f1a0f2ea.js                2.62 KiB          1.26 KiB
  dist/css/chunk-vendors.0cbd351a.css    191.84 KiB        26.80 KiB
  dist/css/app.f351e9c1.css              0.46 KiB          0.26 KiB

  Images and other types of assets omitted.

 DONE  Build complete. The dist directory is ready to be deployed.
 INFO  Check out deployment instructions at https://cli.vuejs.org/guide/deployment.html
```

Le résultat de cette construction est disponible dans le répertoire *dist* où l'on retrouve le contenu CSS, JavaScript et le fichier *index.html*

```console
.
├── css
│   ├── app.f351e9c1.css
│   └── chunk-vendors.0cbd351a.css
├── index.html
└── js
    ├── app.f1a0f2ea.js
    ├── app.f1a0f2ea.js.map
    ├── chunk-vendors.86498fa6.js
    └── chunk-vendors.86498fa6.js.map
```

Toutes les bibliothèques (Bootstrap, Vue.js, Highcharts…) utilisées dans notre projet PollDLE sont regroupées et minifiées (réduites au strict minimum) dans les fichiers CSS et JavaScript.

Pour s'assurer que la variable d'environnement a été utilisée dans le code, examinons le contenu du fichier *dist/js/app.XYZ.js*.

```javascript
...var o=new Request("/server/polldles",{method:"POST",body:JSON.stringify(e),headers:{"Content-Type":"application/json"}})...
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
    try_files $uri $uri/ @rewrites;
  }

  location @rewrites {
    rewrite ^(.+)$ /index.html last;
  }

  location ~* \.(?:ico|css|js|gif|jpe?g|png)$ {
    # Some basic cache-control for static files to be sent to the browser
    expires max;
    add_header Pragma public;
    add_header Cache-Control "public, must-revalidate, proxy-revalidate";
  }
}
```

La réécriture des requêtes est réalisée par l'instruction `try_files $uri $uri/ @rewrites;` et `rewrite ^(.+)$ /index.html last;`. Il est précisé que, quelles que soient les requêtes sur `/` (exemples : [http://localhost/1/result](http://localhost/1/result)), elles aboutiront vers *index.html*, ce qui est logique, car nous développons une *Single-Page application*.

Nous allons tester le déploiement sur un serveur [NGINX](https://www.nginx.com/) disponible dans un conteneur [Docker](https://www.docker.com/).

* Éditer le fichier *.env.production* afin de changer l'URL du serveur. En effet, le composant serveur (Java) sera démarré sur un port différent, car actuellement nous n'avons pas configuré le *Reverse-Proxy*.

```properties
VUE_APP_SERVER_URL = http://localhost:9991
```

> Cette modification est réalisée à des fins de test et ne sera pas conservée par la suite.

* Installer les modules requis et construire les binaires pour notre projet [Vue.js](https://vuejs.org/).

```console
$ npm install
$ npm run build
```

* Si le conteneur du composant serveur (Java) est toujours en exécution (`$ docker ps`), vous pouvez passer à l'étape suivante, sinon, exécuter la ligne de commande suivante.

```console
$ docker run -d --name backend -e KUMULUZEE_SERVER_HTTP_PORT=9991 -p 9991:9991 mickaelbaron/polldle-backend
b3c5fd42962cee0dd0cd45f2c6ed35ca1926ab0d9a9efbedb3cea0241062bc9e
```

* Créer un conteneur [Docker](https://www.docker.com/) basé sur une image [NGINX](https://www.nginx.com/).

```console
$ docker run -d --rm -p 80:80 --name frontend -v $(pwd)/dist:/usr/share/nginx/html -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf nginx:stable-alpine nginx -g "daemon off;"
60f1489e822c794477b322dbfa4df79794769480206c11fae42f3c5f113c992e
```

Un conteneur [Docker](https://www.docker.com/) sera créé, en mode détaché (`-d`), automatiquement supprimé (`--rm`), avec une redirection de port (`-p 80:80`), portant le nom (`--name frontent`) et partageant le répertoire *dist* et le fichier *nginx.conf* (`-v`).

* Ouvrir un navigateur et tester l'URL suivante : [http://localhost:80](http://localhost:80/).

* Une fois testée, arrêter et détruire le conteneur nommé *frontend*.

```console
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
COPY public ./public
COPY src ./src
COPY .env.production ./

RUN npm run build

# Run env
FROM nginx:stable-alpine
COPY --from=build-npm-stage /polldle-vue/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
```

Ce fichier *Dockerfile* est également décomposé en deux étapes de construction appelée multi*stage*. La première étape consiste à créer une image temporaire à partir du résultat de la construction des binaires du composant client tandis que la seconde étape consiste à créer l'image finale qui servira pour l'exécution.

Détaillons le contenu de ce fichier *Dockerfile* qui propose deux étapes.

**Étapes de compilation :**

* `FROM node:lts-alpine as build-npm-stage` : partir d'une image [Docker](https://www.docker.com/) pour la compilation, elle contient [npm](https://www.npmjs.com/) ;
* `LABEL maintainer="Mickael BARON"` : préciser l'auteur du fichier ;
* `WORKDIR /polldle-vue` : fixer le répertoire de travail ;
* `COPY package*.json ./` : copier le fichier de description du projet dans le répertoire de travail ;
* `RUN npm install` : installer les modules requis par le projet ;
* `COPY public ./public` : copier le contenu du répertoire *public* dans le répertoire de travail ;
* `COPY src ./src` : copier le contenu du répertoire *src* dans le répertoire de travail ;
* `COPY .env.production ./` : copier le fichier d'initialisation des variables d'environnement dans le répertoire de travail ;
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

```console
docker build --tag mickaelbaron/polldle-vue .
Sending build context to Docker daemon  57.34kB
Step 1/14 : FROM node:lts-alpine as build-npm-stage
 ---> 057fa4cc38c2
Step 2/14 : LABEL maintainer="Mickael BARON"
 ---> Using cache
 ---> 91543748447a
Step 3/14 : WORKDIR /polldle-vue
 ---> Using cache
 ---> 5ea22eb50079
Step 4/14 : COPY package*.json ./
 ---> Using cache
 ---> fa6f61549b13
Step 5/14 : RUN npm install
 ---> Using cache
 ---> 32e9f4fca085
Step 6/14 : COPY public ./public
 ---> Using cache
 ---> e139a5f93f2b
Step 7/14 : COPY src ./src
 ---> Using cache
 ---> 4654c326d25d
Step 8/14 : COPY .env.production ./
 ---> Using cache
 ---> 8351a516d016
Step 9/14 : RUN npm run build
 ---> Using cache
 ---> 2b589148ec8a
Step 10/14 : FROM nginx:stable-alpine
 ---> ab94f84cc474
Step 11/14 : COPY --from=build-npm-stage /polldle-vue/dist /usr/share/nginx/html
 ---> Using cache
 ---> 454d3333fb1a
Step 12/14 : COPY nginx.conf /etc/nginx/conf.d/default.conf
 ---> Using cache
 ---> 89ff6d70d7d2
Step 13/14 : EXPOSE 80
 ---> Using cache
 ---> d0d44708c4c8
Step 14/14 : ENTRYPOINT ["nginx", "-g", "daemon off;"]
 ---> Using cache
 ---> f34078d6c901
Successfully built f34078d6c901
Successfully tagged mickaelbaron/polldle-vue:latest
```

* S'assurer que l'image intitulée *mickaelbaron/polldle-vue* a été construite.

```console
$ docker images
REPOSITORY                     TAG                 IMAGE ID            CREATED             SIZE
mickaelbaron/polldle-backend   latest              c976b72dafd3        60 seconds ago      165MB
mickaelbaron/polldle-vue       latest              f34078d6c901        34 seconds ago      23.2MB
```

#### Créer un conteneur du composant client (Vue.js)

> Nous vous invitons à vous positionner dans le répertoire *polldle-vue-18* pour profiter des codes qui vont illustrer cette section.

Nous pouvons désormais créer un conteneur afin de tester l'image [Docker](https://www.docker.com/) construite pour le composant client ([Vue.js](https://vuejs.org/)). Le composant serveur (Java) doit normalement toujours être disponible dans un conteneur.

* Se positionner dans le répertoire *polldle-vue-18* et exécuter la ligne de commande suivante pour créer un conteneur basé sur l'image *mickaelbaron/polldle-vue*.

```console
$ docker run -d --name frontend -p 80:80 mickaelbaron/polldle-vue
0e65e7ad22e68856f81c2aacbbbc9686dc1a209fae11d848488ed050b7acb237
```

Un conteneur nommé `frontend` sera créé sur la base de l'image `mickaelbaron/polldle-vue`. L'option `-p 80:80` est utilisée pour la redirection de port.

* S'assurer que le contenu a été correctement créé et qu'il est toujours en exécution.

```console
$ docker ps
CONTAINER ID        IMAGE                          COMMAND                  STATUS              PORTS                    NAMES
0e65e7ad22e6        mickaelbaron/polldle-vue       "nginx -g 'daemon of…"   6 minutes ago       0.0.0.0:80->80/tcp       frontend
346e0d4413ce        mickaelbaron/polldle-backend   "java -cp /polldle/c…"   6 minutes ago       0.0.0.0:9991->9991/tcp   backend
```

Malheureusement, si vous testez l'application PollDLE à l'adresse [http://localhost](http://localhost/), l'accès au service web REST ne fonctionnera pas puisque la variable d'environnement `VUE_APP_SERVER_URL` est initialisée à `/server`. Ainsi, l'URL [http://localhost/server/polldles](http://localhost/server/polldles) ne sera pas accessible.

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

```console
docker build --tag mickaelbaron/polldle-rp .
Step 1/5 : FROM nginx:stable-alpine
 ---> ef04b00b089d
Step 2/5 : LABEL maintainer="Mickael BARON"
 ---> Using cache
 ---> 550f0316e86d
Step 3/5 : COPY build.conf /etc/nginx/conf.d/default.conf
 ---> Using cache
 ---> 6047c791e509
Step 4/5 : EXPOSE 80
 ---> Using cache
 ---> 6e1e911835f9
Step 5/5 : ENTRYPOINT ["nginx", "-g", "daemon off;"]
 ---> Using cache
 ---> f9f2abc08cea
Successfully built f9f2abc08cea
Successfully tagged mickaelbaron/polldle-rp:latest
```

* Exécuter la ligne de commande suivante pour s'assurer que l'image [Docker](https://www.docker.com/) intitulée *mickaelbaron/polldle-vue* a été construite.

```console
$ docker images
REPOSITORY                     TAG                 IMAGE ID            CREATED             SIZE
mickaelbaron/polldle-rp        latest              0c244aebbac3        18 seconds ago      21.3MB
mickaelbaron/polldle-backend   latest              c976b72dafd3        20 hours ago        165MB
mickaelbaron/polldle-vue       latest              f34078d6c901        22 minutes ago      23.2MB
```

#### Créer un conteneur du composant reverse-proxy (NGINX)

Comme les conteneurs [Docker](https://www.docker.com/) basés sur les images *mickaelbaron/polldle-vue* et *mickaelbaron/polldle-backend* exposent les ports `80` et `9991`, nous allons les recréer.

* Exécuter la ligne de commande suivante pour supprimer les conteneurs en cours d'exécution.

```console
$ docker rm -f frontend
$ docker rm -f backend
```

* Exécuter la ligne de commande suivante pour créer les conteneurs [Docker](https://www.docker.com/) basés sur les images *mickaelbaron/polldle-vue* et *mickaelbaron/polldle-backend*.

```console
$ docker run -d --name frontend mickaelbaron/polldle-vue
a7891762c6b6960ff781dd30063f1111991711f3675e60ad140eef022e1c84e7
$ docker run -d --name backend -e KUMULUZEE_SERVER_HTTP_PORT=9991 mickaelbaron/polldle-backend
52702cfe48e5f84825fb241b74d18557140123c3a77e9178ea87d51e6217ac3f
```

* Créer ensuite un conteneur basé sur l'image [Docker](https://www.docker.com/) *mickaelbaron/polldle-rt*.

```console
$ docker run -d --name rp -p 80:80 mickaelbaron/polldle-rp
78bd18008796758326eb9f48ae57279cef17d96c319478b3a2fc1c541fd3cee4
```

* Afficher la liste des conteneurs avec la commande suivante :

```console
$ docker ps -a
CONTAINER ID        IMAGE                          COMMAND                  STATUS                      PORTS       NAMES
78bd18008796        mickaelbaron/polldle-rp        "nginx -g 'daemon of…"   Exited (1) 19 minutes ago               rp
781f589d49eb        mickaelbaron/polldle-vue       "nginx -g 'daemon of…"   Up 22 hours                 80/tcp      frontend
fc9c5c3ca3a0        mickaelbaron/polldle-backend   "java -cp /polldle/c…"   Up 22 hours                 9991/tcp    backend
```

Nous constatons que le conteneur *rp* ne fonctionne pas correctement. Pour connaître les causes de ce dysfonctionnement, nous allons examiner les *logs* du conteneur.

* Examiner les logs du conteneur *rp*.

```console
$ docker logs rp
2019/06/26 15:35:50 [emerg] 1#1: host not found in upstream "backend" in /etc/nginx/conf.d/default.conf:5
nginx: [emerg] host not found in upstream "backend" in /etc/nginx/conf.d/default.conf:5
```

Cette erreur indique que le nom de domaine *backend* n'est pas connu. Il en va de même pour le nom de domaine *frontend*. Pour résoudre ce problème, il va donc falloir lier le conteneur *rp* avec les conteneurs *backend* et *frontend*. Pour cela, nous utiliserons un sous-réseau [Docker](https://www.docker.com/). Tout conteneur dans un sous-réseau [Docker](https://www.docker.com/) est identifiable par les autres conteneurs via son nom de conteneur.

* Créer un sous-réseau [Docker](https://www.docker.com/) appelé *polldlenetwork*.

```console
$ docker network create polldlenetwork
3605b7022d16414a2855fde4101052e7f36e43ba94a41dbc83659b9a9d351386
```

* Ajouter les conteneurs *frontend* et *backend* à ce nouveau sous-réseau [Docker](https://www.docker.com/).

```console
docker network connect polldlenetwork backend
docker network connect polldlenetwork frontend
```

* Supprimer le conteneur *rp* et le recréer dans le sous-réseau [Docker](https://www.docker.com/) *polldlenetwork*.

```console
docker run -d --name rp --network polldlenetwork -p 80:80 mickaelbaron/polldle-rp
66bc312c2579cba754dc1649bf5f976d061e680fd5a4b1e34772c70425032565
```

* Ouvrir un navigateur et tester l'URL suivante : [http://localhost](http://localhost/).

## Déploiement via un sous-chemin

Le déploiement peut vouloir être réalisé au travers d'un sous-chemin de la forme [https://mycompany.com/polldle](https://mycompany.com/polldle). Cela implique que les URL d'accès aux composants client et serveur soient différentes. Cette modification n'est pas si anodine, puisque le code des composants *reverse-proxy* (NGINX) et client ([Vue.js](https://vuejs.org/)) devront être impactés. Plus précisément, il s'agira pour le composant *reverse-proxy* (NGINX) du fichier de configuration, et pour le composant client ([Vue.js](https://vuejs.org/)) d'une nouvelle URL pour accéder aux services web REST, de la configuration du routage et de l'accès aux ressources CSS et JavaScript.

Le changement (avec ou sans sous-chemin) sera indiqué lors de la création des images [Docker](https://www.docker.com/). Ce changement pourrait se faire directement lors de l'exécution, mais je ne le traiterai pas dans ce tutoriel.

Dans la suite de cette section, nous montrons une solution pour automatiser la construction des images [Docker](https://www.docker.com/) du composant *reverse-proxy* (NGINX) et du composant client ([Vue.js](https://vuejs.org/)).

### Sous-chemin pour le composant client (Vue.js)

> Nous vous invitons à vous positionner dans le répertoire *polldle-vue-19* pour profiter des codes qui vont illustrer cette section.

Au niveau du composant client ([Vue.js](https://vuejs.org/)), nous allons devoir renseigner :

* une nouvelle URL pour accéder aux services web REST (variables d'environnement) ;
* la configuration du routage (fichier *src/router/index.js*) ;
* l'accès aux ressources CSS et JavaScript (fichier de configuration).

#### Mode (variables d'environnement) sous-chemin (Vue.js)

Actuellement, deux modes sont utilisés pour initialiser les variables d'environnement : *development* et *production*.

Nous montrons dans cette section comment créer un nouveau mode personnalisé appelé *subpath* qui donnera une nouvelle valeur à la variable d'environnement `VUE_APP_SERVER_URL` et ajoutera une nouvelle variable d'environnement pour préciser le sous-chemin.

* Créer un fichier *.env.subpath* à la racine du dossier *polldle-vue-19/* et copier le contenu ci-dessous.

```properties
NODE_ENV = production
VUE_APP_SUBPATH = /polldle/
VUE_APP_SERVER_URL = /polldle/server
```

La première propriété `MODE_ENV` explique que ce nouveau mode sera basé sur le mode *production*. La seconde `VUE_APP_SUBPATH` est une nouvelle variable d'environnement pour fixer la valeur du sous-chemin. La troisième `VUE_APP_SERVER_URL` est celle qui précise la valeur de l'URL du serveur.

Quand un sous-chemin n'est pas requis, c'est-à-dire pour les modes *development* et *production*, la variable d'environnement `VUE_APP_SUBPATH` doit être au moins fixée à `/`.

* Ajouter dans les fichiers `.env.development` et `.env.production` la variable d'environnement `VUE_APP_SUBPATH` fixée à `/` (commentaire `# Add new environment variable VUE_APP_SUBPATH`).

```properties
# Fichier .env.development
VUE_APP_SERVER_URL = http://localhost:9991
# Add new environment variable VUE_APP_SUBPATH
VUE_APP_SUBPATH = /
```

```properties
# Fichier .env.production
VUE_APP_SERVER_URL = /server
# Add new environment variable VUE_APP_SUBPATH
VUE_APP_SUBPATH = /
```

Pour construire des binaires avec le mode personnalisé *subpath*, il faudra exécuter la commande suivante : `vue-cli-service build --mode subpath`. `vue-cli-service` n'est pas exécutée directement, mais via un script défini dans le fichier *package.json*.

* Éditer le fichier *package.json* et ajouter un nouveau script appelé *subpath* dans le contenu de `scripts`.

```javascript
...
  "scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "subpath": "vue-cli-service build --mode subpath",
    "lint": "vue-cli-service lint"
  },
...
```

* S'assurer que tout fonctionne correctement.

```console
npm install
npm run subpath

> polldle-vue-19@0.1.0 subpath /Users/baronm/workspacejava/polldle/polldle-vue-19
> vue-cli-service build --mode subpath


⠼  Building for subpath...
...
  File                                   Size              Gzipped

  dist/js/chunk-vendors.e3058ce2.js      346.38 KiB        120.10 KiB
  dist/js/app.d169298e.js                12.09 KiB         3.88 KiB
  dist/css/chunk-vendors.0cbd351a.css    191.84 KiB        26.80 KiB
  dist/css/app.42f644cf.css              0.82 KiB          0.40 KiB

  Images and other types of assets omitted.

 DONE  Build complete. The dist directory is ready to be deployed.
 INFO  Check out deployment instructions at https://cli.vuejs.org/guide/deployment.html
```

Le mode *subpath* a bien été pris en compte. Vous pouvez examiner le contenu généré pour vous assurer que les valeurs sont au bon endroit.

#### Routage avec un sous-chemin (Vue.js)

Éditer le fichier *polldle-vue-19/src/router/index.js* afin de configurer la nouvelle valeur du routage en remplaçant le commentaire `// Change base value.` par le code présenté ci-dessous.

```javascript
...
export default new Router({
  mode: 'history',
  // Change base value.
  base: process.env.VUE_APP_SUBPATH,
  routes: [
    {
      path: '/',
      name: 'CreatePolldle',
      component: CreatePolldle
    },
    {
      path: '/:pathurl',
      name: 'VotePolldle',
      component: VotePolldle
    },
    {
      path: '/:pathurl/result',
      name: 'ResultPolldle',
      component: ResultPolldle
    }
  ]
})
```

#### Fichier de configuration (Vue.js)

Des paramètres globaux sont disponibles pour configurer certains éléments d'un projet [Vue.js](https://vuejs.org/). Dans le cas de la configuration d'un sous-chemin, nous allons modifier le paramètre `publicPath`. Les paramètres globaux ont des valeurs par défaut (`publicPath=/`) et sont modifiables depuis un fichier *vue.config.js*.

* Créer un fichier *vue.config.js* et ajouter le contenu ci-dessous.

```javascript
module.exports = {
  publicPath: process.env.VUE_APP_SUBPATH,
  productionSourceMap: false
}
```

La valeur donnée à `publicPath` est la valeur obtenue par la variable d'environnement `VUE_APP_SUBPATH`. Nous en profitons également pour ajouter `productionSourceMap: false` qui permet d'éviter d'ajouter les fichiers SourceMap lors de la construction des binaires. Pour information, les fichiers SourceMap aident à déboguer une application JavaScript.

> Vous trouverez une liste des paramètres globaux disponibles à cette adresse : [https://cli.vuejs.org/config/](https://cli.vuejs.org/config/).

#### Dockerfile du composant client (Vue.js) avec un sous-chemin

> Nous vous invitons à vous positionner dans le répertoire *polldle-vue-20* pour profiter des codes qui vont illustrer cette section.

Pour rappel, voici les deux commandes pour construire les binaires du composant client ([Vue.js](https://vuejs.org/)) :

* sans sous-chemin : `$ npm run build` ;
* avec sous-chemin : `$ npm run subpath`.

Le choix de la commande dépend donc de ce qu'on veut obtenir comme binaire. Nous allons modifier le fichier *Dockerfile* afin de pouvoir choisir la commande lors de la construction de l'image [Docker](https://www.docker.com/).

* Éditer le fichier *polldle-vue-20/Dockerfile* en ajoutant le code présenté au niveau des commentaires `# Use ARG instruction to create script_name variable` et `# Inject script_name variable into the command`.

```dockerfile
FROM node:lts-alpine as build-npm-stage
LABEL maintainer="Mickael BARON"
# Use ARG instruction to create script_name variable
ARG script_name=build

WORKDIR /polldle-vue
COPY package*.json ./
RUN npm install
COPY public ./public
COPY src ./src
COPY .env.production ./

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

* Depuis l'invite de commande, se positionner dans le répertoire *polldle/polldle-vue-20* et exécuter la ligne de commande suivante pour démarrer la construction de l'image [Docker](https://www.docker.com/) du composant client ([Vue.js](https://vuejs.org/)).

```console
$ docker build --tag mickaelbaron/polldle-vue . --build-arg script_name=build
...
$ docker build --tag mickaelbaron/polldle-vue . --build-arg script_name=subpath
```

Pour passer une valeur à la variable `script_name`, l'option `--build-arg` a été utilisée.

### Sous-chemin pour le composant reverse-proxy (NGINX)

> Nous vous invitons à vous positionner dans le répertoire *polldle-rp* pour profiter des codes qui vont illustrer cette section.

Au niveau du composant *reverse-proxy* (NGINX), nous allons devoir renseigner :

* un nouveau fichier de configuration spécifique à [NGINX](https://www.nginx.com/).

#### Configuration du composant reverse-proxy (NGINX) avec un sous-chemin

* Éditer le fichier *polldle-rp/subpath.conf* puis examiner le contenu.

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

* Éditer le fichier *polldle-rp/Dockerfile* puis examiner le contenu.

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

```console
$ docker build --tag mickaelbaron/polldle-rp . --build-arg script_name=build
...
$ docker build --tag mickaelbaron/polldle-rp . --build-arg script_name=subpath
...
```

### Résumé pour définir un sous-chemin

Pour changer le sous-chemin, vous devrez impacter les fichiers suivants :

* *.env.subpath :* les clés `VUE_APP_SUBPATH` et `VUE_APP_SERVER_URL` ;
* *subpath.conf :* modifier les valeurs dans `location`.

Ensuite, reconstruire les images associées aux composants Client ([Vue.js](https://vuejs.org/)) et *reverse-proxy*.

## Composer les images Docker

Actuellement, nous disposons de trois composants qui ont chacun une image [Docker](https://www.docker.com/). La construction des images [Docker](https://www.docker.com/) et la création des conteneurs associés se font manuellement. Pour automatiser ce processus, nous utiliserons **docker-compose** via la mise en place d'un fichier *docker-compose.yml*. Bien entendu, nous garderons les bénéfices de création d'un sous-chemin ou pas.

### Fichier de composition

* Éditer le fichier *docker-compose.yml* disponible à la racine du projet puis examiner le contenu.

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

L'outil *docker-compose* permet de construire toutes les images [Docker](https://www.docker.com/) et de créer les trois conteneurs dans le sous-réseau *polldlenetwork*. Vous trouverez ci-dessous toutes les configurations possibles :

* `docker-compose up -d` : créer les trois conteneurs en mode détaché (si les images [Docker](https://www.docker.com/) ne sont pas créées, elles seront construites avant) ;
* `docker-compose build` : construire toutes les images [Docker](https://www.docker.com/) ;
* `docker-compose build --build-arg script_name=subpath` : construire toutes les images [Docker](https://www.docker.com/) en précisant avec ou sans sous-chemin ;
* `docker-compose build --build-arg script_name=subpath COMPONENT` : construire l'image [Docker](https://www.docker.com/) du composant `COMPONENT` (*frontend*, *backend* ou *rp*).

Dans l'hypothèse, où aucune image [Docker](https://www.docker.com/) n'a été construite, la commande `$ docker-compose up -d` est suffisante.

* Ouvrir un terminal et exécuter la ligne de commande suivante :

```console
docker-compose up -d
Creating network "polldle_polldlenetwork" with the default driver
Building backend
Step 1/12 : FROM maven:3-jdk-11 AS build-java-stage
...
Step 12/12 : ENTRYPOINT ["java", "-cp", "/polldle/classes:/polldle/dependency/*", "com.kumuluz.ee.EeApplication"]
 ---> Running in d3dbb1a0a276
Removing intermediate container d3dbb1a0a276
 ---> 96b6334c959f
Successfully built 96b6334c959f
Successfully tagged mickaelbaron/polldle-backend:latest
Building frontend
Step 1/17 : FROM node:lts-alpine as build-npm-stage
...
Step 17/17 : CMD ["nginx", "-g", "daemon off;"]
 ---> Running in 2013f589151d
Removing intermediate container 2013f589151d
 ---> b5e48d02d21d
Successfully built b5e48d02d21d
Successfully tagged mickaelbaron/polldle-vue:latest
Building rp
Step 1/6 : FROM nginx:stable-alpine
 ---> ef04b00b089d
...
Successfully built 345d741aa693
Successfully tagged mickaelbaron/polldle-rp:latest
Creating polldle_frontend_1 ... done
Creating polldle_backend_1  ... done
Creating polldle_rp_1       ... done
```

* Pour vérifier que les trois conteneurs ont été créés.

```console
$ docker-compose ps
       Name                     Command               State           Ports
------------------------------------------------------------------------------------
polldle_backend_1    java -cp /polldle/classes: ...   Up      0.0.0.0:9991->9991/tcp
polldle_frontend_1   nginx -g daemon off;             Up      80/tcp
polldle_rp_1         nginx -g daemon off;             Up      0.0.0.0:80->80/tcp
```

## Conclusion et remerciements

Cette troisième partie a présenté les problématiques de déploiement d'une application [Vue.js](https://vuejs.org/) en utilisant [Docker](https://www.docker.com/) pour la création de conteneurs.

Pour le composant client ([Vue.js](https://vuejs.org/)) qui était au centre de cette étude, nous avons montré comment utiliser les variables d'environnement dans le code, comment configurer les paramètres globaux et comment utiliser un sous-chemin.

Pour [Docker](https://www.docker.com/), cette solution de conteneurisation a permis de rendre le développement plus proche de la production. La taille des images [Docker](https://www.docker.com/) construites a été optimisée via l'utilisation du multi*stage*.

Cette troisième partie clôture également cette série consacrée à [Vue.js](https://vuejs.org/). De nombreux concepts n'ont pas été présentés, mais pourront faire l'objet de prochains tutoriels [Vuex](https://vuex.vuejs.org/) pour gérer l'état de l'application, [Vue-Native](https://vue-native.io/) pour la création d'applications natives à déployer sur le mobile et [WebComponents](https://www.webcomponents.org/) pour utiliser des WebComponents existants et pourquoi pas transformer des composants [Vue.js](https://vuejs.org/) en [WebComponents](https://www.webcomponents.org/).

[Vue.js](https://vuejs.org/) est une constante évolution. Lors de l'écriture de cet article, nous utilisions la version 2 de [Vue.js](https://vuejs.org/) et la version 4 de [Vue CLI](https://cli.vuejs.org/). La version 3 de [Vue.js](https://vuejs.org/) est en cours d'élaboration et devrait sortir en version officielle, fin 2020. J’essaierai, dans la mesure du possible, d'adapter le code du projet PollDLE afin de tenir un cas d'étude à jour des avancées de [Vue.js](https://vuejs.org/).

Je tiens à remercier [Claude Leloup](https://www.developpez.net/forums/u124512/claudeleloup/) pour sa relecture orthographique.

## Ressources

* [Apprendre à utiliser Docker avec Vue.js](https://vuejs.org/v2/cookbook/dockerize-vuejs-app.html) : une aide qui explique comment utiliser [Docker](https://www.docker.com/) avec [Vue.js](https://vuejs.org/) ;
* [Paramètres globaux pour Vue CLI](https://cli.vuejs.org/config/) : liste des paramètres globaux à utiliser dans le fichier *vue.config.js ;*
* [Configurations serveur](https://router.vuejs.org/fr/guide/essentials/history-mode.html#exemple-de-configurations-serveur) : exemples de configuration serveur.
