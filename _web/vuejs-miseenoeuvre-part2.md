---
title: 'Développer une application web avec Vue.js 3 et Vite, mise en œuvre des concepts via un exemple (partie 2)'
tags: [Vue.js, Java]
direct_link:
image: /images/vuejs.jpg
description: Cette deuxième partie présente les principaux concepts de Vue.js au travers d'un exemple complet appelé PollDLE.
category: Article
date: 2019-07-04
update: 2022-07-20
weight: 5
toc: true
twitter: 1550375134384496640
---

L'objectif de cet article en plusieurs parties est de vous présenter le framework web JavaScript [Vue.js](https://vuejs.org/) en se focalisant sur les principaux concepts au travers d'un exemple unique.

Les différentes parties de cet article sont détaillées ci-dessous :

* [généralités sur les frameworks web JavaScript et présentation de Vue.js](/web/vuejs-generalites-part1) ;
* **mise en œuvre des concepts de Vue.js** ;
* [déploiement d'une application web développée avec Vue.js](/web/vuejs-deploiement-part3).

La version 3 de [Vue.js](https://vuejs.org/) a été utilisée pour cette série d'articles.

Cette deuxième partie présente les principaux concepts de [Vue.js](https://vuejs.org/) au travers d'un exemple.

Le plan est le suivant :

* présentation de l'exemple qui servira de fil rouge ;
* création du squelette du projet PollDLE avec [Vue.js](https://vuejs.org/) et [Vite](https://vitejs.dev/) ;
* initialisation des modèles et des vues pour les différents composants ;
* mise en place des bindings entre les modèles et les vues via l'utilisation du *templating* (interpolation et les directives) ;
* utilisation des propriétés calculées (*computed*) et des observateurs (*watch*) ;
* détail du fonctionnement d'un composant pour savoir développer, instancier et dialoguer avec un composant ;
* invocation d'un service web Rest pour modifier ou retourner la valeur d'un modèle ;
* paramétrage du système de routage pour les changements de valeurs d'URL.

Les codes source pour les exercices sont disponibles sur le dépôt Git suivant : [https://github.com/mickaelbaron/vuejs-polldle-tutorial-src](https://github.com/mickaelbaron/vuejs-polldle-tutorial-src) (pour récupérer le code, faire : `git clone <https://github.com/mickaelbaron/vuejs-polldle-tutorial-src>`).

> L'article initialement écrit pour la version 2 de [Vue.js](https://vuejs.org/) est également disponible : [https://mickael-baron.fr/web/vuejs2-miseenoeuvre-part2](/web/vuejs2-miseenoeuvre-part2).

## Présentation de l'exemple : PollDLE

L'exemple qui nous servira de fil rouge est appelé PollDLE pour *Poll* (Sondage) et la dernière partie de *Doodle* (un outil de planification très simple d'emploi). Il s'agira donc d'une application pour créer un sondage (un titre et des options), voter à un sondage (un choix possible) et afficher les résultats d'un sondage.

La couche client (*front-end*) sera réalisée avec [Vue.js](https://vuejs.org/) et [Bootstrap](https://getbootstrap.com/) pour le CSS tandis que la couche serveur (*back-end*) est écrite en Java. Pour cette dernière partie, nous ne détaillerons pas sa mise en place, elle est déjà codée. Elle s'appuie sur la spécification [MicroProfile](https://microprofile.io/) en utilisant les composants JAX-RS et CDI et en s'appuyant sur l'implémentation fournie par [KumuluzEE](https://ee.kumuluz.com/).

Concernant la partie graphique, il y aura trois écrans pour la création, le vote et la consultation d'un sondage.

Ci-dessous est présenté l'écran pour la création d'un sondage. Un premier champ de texte permet de saisir le titre du PollDLE. Un second champ de texte permet de saisir une nouvelle option d'un PollDLE. La modification d'une option n'est pas autorisée. Pour cela il faudra la supprimer via les boutons situés sur la droite de chaque option d'un PollDLE. Un bouton intitulé « Clear All PollDLE Options » permet de supprimer l'intégralité des options d'un PollDLE. Le titre et le nombre d'options d'un PollDLE sont résumés sur le panneau intitulé « Summary of your PollDLE ». Enfin pour valider la création d'un PollDLE, il suffira de cliquer sur le bouton « Create PollDLE » qui redirigera automatiquement l'utilisateur vers le deuxième écran.

![Ecran pour la création d'un PollDLE](/images/vuejs-miseenoeuvre-part2/create_polldle.png)

Ci-dessous est présenté l'écran pour voter à un sondage. Cet écran reprend le titre du PollDLE et transforme les différentes réponses sous la forme de bouton radio à choix unique. Un bouton « Vote » permet de valider son vote. Veuillez remarquer dans la barre d'adresse, la valeur `1` qui correspond à l'identifiant fonctionnel donné à ce PollDLE. Pour accéder au vote d'un PollDLE, il suffira donc de spécifier dans la barre d'adresse son identifiant.

![Ecran pour vôter à un sondage PollDLE](/images/vuejs-miseenoeuvre-part2/poll_polldle.png)

Ci-dessous est présenté l'écran pour l'affichage des résultats d'un sondage. Le résultat est présenté sous deux formes. La première sous forme d'un graphique circulaire et la seconde via une liste avec les différentes options et le nombre de résultats obtenus. Pour accéder à cette page, il suffira de spécifier dans la barre d'adresse l'identifiant du PollDLE suivi de `result`.

![Ecran pour l'affichage des résultats d'un sondage PollDLE](/images/vuejs-miseenoeuvre-part2/consult_polldle.png)

Dans la suite, nous donnerons les codes HTML et JavaScript des différents composants au fur et à mesure de la lecture de l'article. L'intérêt de cet article n'est pas d'apprendre à construire une interface graphique, mais de comprendre comment rendre dynamique une interface avec [Vue.js](https://vuejs.org/).

Avant chaque concept présenté, nous fournirons un état du code (via des répertoires de la forme *polldle-vue-x*) afin que vous puissiez directement tester par vous-même. 

## Création d'un projet Vue.js

Nous allons montrer dans cette section comment créer un projet [Vue.js](https://vuejs.org/) en utilisant l'outil [Vite](https://vitejs.dev/) et nous examinerons le squelette du projet obtenu après création.

### Création d'un projet Vue.js avec l'outil Vite

* Nous allons créer notre premier projet [Vue.js](https://vuejs.org/) avec [Vite](https://vitejs.dev/) en mode console. Depuis la racine du dossier *vuejs-polldle-tutorial-src* (obtenu en récupérant les codes source depuis le dépôt [https://github.com/mickaelbaron/vuejs-polldle-tutorial-src](https://github.com/mickaelbaron/vuejs-polldle-tutorial-src)), saisir la ligne de commande suivante, une série de questions vous seront posées. 

```console
$ npm create vite@latest polldle-vue-00
```

* Sélectionner le framework [Vue.js](https://vuejs.org/) : *vue*. Vous remarquerez que [Vite](https://vitejs.dev/) n'est pas uniquement réservé à [Vue.js](https://vuejs.org/).

```console
? Select a framework: › - Use arrow-keys. Return to submit.
    vanilla
❯   vue
    react
    preact
    lit
    svelte
```

* Sélectionner ensuite la première option *vue* qui permet de développement avec le langage Javascript. La seconde option *vue-ts* permet d'utiliser le langage TypeScript.

```console
? Select a variant: › - Use arrow-keys. Return to submit.
❯   vue
    vue-ts
```

* La création de votre projet est terminée.

```console
✔ Select a framework: › vue
✔ Select a variant: › vue

Scaffolding project in /Users/baronm/workspacepersowebsite/vuejs3-polldle-tutorial-src/polldle-vue-00...

Done. Now run:

  cd polldle-vue-00
  npm install
  npm run dev
```

* Exécuter la commande suivante pour télécharger toutes les dépendances requises.

```console
$ npm install

added 33 packages, and audited 34 packages in 5s

4 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

### Inventaire des fichiers générés

Intéressons-nous à détailler les différents fichiers et répertoires qui ont été générés lors de la précédente section.

```console
polldle-vue-00
├── README.md
├── index.html
├── node_modules/...
├── package.json
├── public
│   └── favicon.ico
├── src
│   ├── App.vue
│   ├── assets
│   │   └── logo.png
│   ├── components
│   │   └── HelloWorld.vue
│   └── main.js
└── vite.config.js
```

Le fichier *README.md* donne des informations sommaires sur la création de ce projet. 

Le fichier *package.json* est donné en exemple ci-dessous. Des métadonnées sont utilisées pour décrire le projet : `name` et `version`. Des scripts **npm** sont définis pour tester, construire la version finale et vérifier la qualité du code. La clé `dependencies` sert à préciser les bibliothèques utilisées par le projet alors que la clé `devDependencies` sert à préciser les bibliothèques utilisées pour le développement. Les versions des bibliothèques sont identifiées par trois nombres : MAJOR.MINOR.PATCH. Le caractère `^` indique que **npm** est autorisé à mettre à jour le numéro de version de la bibliothèque par des versions MINOR et PATCH sans changer de version MAJOR. On peut également rencontrer le caractère `~`. Il indique que **npm** est autorisé à mettre à jour le numéro de version PATCH sans changer de version MAJOR et MINOR. Par comparaison, c'est très ressemblant à Maven de l'univers Java où *pom.xml* correspond au fichier *package.json*.

```javascript
{
  "name": "polldle-vue-00",
  "private": true,
  "version": "0.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.2.37",
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^3.0.0",
    "vite": "^3.0.0"
  }
}
```

L'outil **npm** se base sur le fichier *package.json* pour télécharger les dépendances directs et transitifs vers la répertoire *node_modules*. Avant toute exécution de votre projet, ce dossier devra être présent. Il est à noter que ce dossier est généralement volumineux et peut être supprimé sans risque.

Le répertoire *public* est utilisé pour stocker les fichiers statiques. 

Le fichier *index.html* est le point d'entrée de votre application (voir ci-après). Tout le code que vous allez développer sera injecté dans `<div id="app"></div>`.

* De façon à intégrer la bibliothèque CSS [Bootstrap](https://getbootstrap.com/) à toute l'application, ajouter le lien CDN de [Bootstrap](https://getbootstrap.com/) après la balise de titre (`<title>`).

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Polldle UI Vue.js 3</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
      integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

Le répertoire *src* contient le code [Vue.js](https://vuejs.org/) à proprement parler. Nous le détaillons en détail ci-après.

#### Fichier main.js

Le fichier *main.js* sert à configurer notre projet. Il précise les composants à utiliser (`import App from './App.vue'`), initialiser des variables globales et précise où le rendu doit être effectué (`createApp(App).mount('#app')`). Ce fichier *main.js* est en quelque sorte le point d'entrée de l'application pour activer les fonctionnalités de [Vue.js](https://vuejs.org/).

```javascript
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

#### Fichier App.vue

Le fichier *App.vue* est le premier composant de votre application qui va contenir tous les autres composants. Il est en quelque sorte le composant racine d'une application de type *Single-Page application*. Tout est localisé à l'intérieur de ce composant. Comme il s'agit d'un composant, nous détaillerons son contenu plus tard.

#### Répertoire assets

C'est dans ce répertoire que vous déposerez vos ressources (images, vidéos et fichiers à télécharger).

#### Répertoire components

Ce répertoire contiendra tous les composants que vous allez développer. Tous les fichiers porteront l'extension `*.vue`.

### Tester le projet généré

* Pour tester ce nouveau projet, se déplacer à la racine du dossier *polldle-vue-00* et exécuter la ligne de commande suivante.

```console
$ npm run dev

> polldle-vue-00@0.0.0 dev
> vite


  VITE v3.0.0  ready in 338 ms

  ➜  Local:   http://127.0.0.1:5173/
  ➜  Network: use --host to expose
```

> La commande `$ npm run dev` est un alias défini dans *package.json* qui exécute l'outil [Vite](https://vitejs.dev/).

* Ouvrir un navigateur est saisir l'URL suivante : [http://localhost:5173/](http://localhost:5173/).

![Ecran pour la création d'un PollDLE](/images/vuejs-miseenoeuvre-part2/first_vuejs.png)

Tout au long de cet article et à chaque fois qu'il vous sera demandé de compléter des fichiers dans un nouveau répertoire de la forme *polldle-vue-x*, pensez à faire `$ npm install` pour installer les modules et `$ npm run dev` pour démarrer l'exécution en mode développement.

> Si des problèmes de ce genre se produisent : *npm WARN Local package.json exists, but node_modules missing, did you mean to install?* ou *vite: command not found*, assurez-vous d'avoir fait un `$ npm install` pour télécharger l'ensemble des modules nécessaires. Les fichiers téléchargés seront déposés dans le répertoire *node_modules*.

## Modèle et vue

> Nous vous invitons à vous positionner dans le répertoire *polldle-vue-01* pour profiter des codes qui vont illustrer cette section. Pensez à faire `$ npm install` pour installer les modules et `$ npm run dev` pour démarrer l'exécution en mode développement.

Nous allons initialiser les différents modèles et vues des composants *CreatePolldle* et *FooterPolldle* de l'application PollDLE sans effectuer aucun binding, c'est-à-dire sans relier les vues aux modèles et inversement. En effet, nous voulons montrer qu'un composant est constitué d'une partie vue (HTML classique) et d'une partie modèle (JavaScript) et que l'intérêt de [Vue.js](https://vuejs.org/) est de fournir un ensemble d'outillages (les différentes sections qui vont suivre) pour rendre dynamique l'interface graphique. Par ailleurs, nous ne nous attarderons pas sur les spécificités d'un composant (communication entre des composants ou son cycle de vie) puisque nous y reviendrons plus tard dans une section dédiée.

À cette étape voici le contenu du répertoire *src/components*.

```console
polldle-vue-01
...
    ├── components
    │   ├── CreatePolldle.vue
    │   └── FooterPolldle.vue
...
```

Le fichier *CreatePolldle.vue* concerne le composant décrivant l'écran de création d'un PollDLE et le fichier *FooterPolldle.vue* désigne le composant pour le bas de page de l'application. Les autres composants seront étudiés quand nous aborderons le concept de composant.

Le fichier *CreatePolldle.vue* contient le strict minimum et fait apparaitre la partie modèle (localisée dans le contenu de la balise `<script>`) de la partie vue (localisée dans le contenu de la balise `<template>`).

```html
<script setup>
</script>

<template>
</template>

<style>
.large-input {
  box-sizing: border-box;
  width: 500px;
  max-width: 80%;
  border-radius: 7px;
  border: 1px solid #bdc3c7;
  padding: 10px 20px;
  outline: none;
  text-align: center;
  line-height: 42px;
  font-size: 15px;
  margin: 20px;
  margin-top: 0;
  font-size: 20px;
}

.clear-button {
  margin-bottom: 25px;
}

.error-message {
  font-size: 125%;
  font-weight: bold;
}
</style>
```

* Compléter la partie vue `<template>`, en ajoutant le code HTML suivant :

```html
<script setup>
</script>

<template>
  <div class="container">
    <!-- Titre + description -->
    <h1>PollDLE</h1>
    <h2>Voting done simply in real-time</h2>

    <!-- PollDLE name -->
    <div class="row">
      <div class="col">
        <input
          type="text"
          class="large-input mx-auto d-block"
          placeholder="Add your question here"
        />
      </div>
    </div>

    <h3>Add your PollDLE options</h3>

    <div class="row">
      <div class="col">
        <input
          type="text"
          placeholder="Polldle Option"
          class="large-input mx-auto d-block"
        />
      </div>
    </div>
    <div class="row">
      <div class="col">
        <button
          type="button"
          class="clear-button btn-lg btn-danger mx-auto d-block"
        >
          Clear all PollDLE Options
        </button>
      </div>
    </div>

    <!-- PollDLE option -->
    <div
      class="row justify-content-center"
    >
    </div>

    <!-- Button Action -->
    <div class="row">
      <div class="col">
        <button
          type="button"
          class="validate-button btn-lg btn-primary mx-auto d-block"
        >
          Create PollDLE
        </button>
      </div>
    </div>

    <div class="alert alert-primary" role="alert">
      <h4 class="alert-heading">Summary of your PollDLE</h4>
      <hr />
      <p>
        The question is: <strong>TODO</strong>
      </p>
      <p>Number of PollDLE options: TODO</p>
    </div>

    <div
      class="error-message alert alert-danger"
      role="alert"
    ></div>
  </div>
</template>

<style>
...
</style>
```

Vous remarquerez pour ceux qui utilisent la bibliothèque [Bootstrap](https://getbootstrap.com/) les styles spécifiques tels `row` et `col`. À ce niveau, il s'agit d'une interface graphique développée en HTML des plus classiques. Il n'y a pour l'instant aucune directive [Vue.js](https://vuejs.org/).

* Compléter le début de la partie modèle `<script setup>`, en ajoutant le code JavaScript suivant correspondant aux propriétés réactives du modèle.

```javascript
<script setup>
import { ref, reactive } from 'vue'

const errorMessage = ref('')
const buttonShown = ref(false)
const polldle = reactive({
  question: '',
  polldleOptions: []
})
const newPolldleOptionText = ref('')

... // code présenté ci-après
</script>

<template>
  ... // code précédent
</template>
...
```

L'écriture `<script setup>` permet d'utiliser la syntaxe de l'API Composition introduite dans la version 3 de [Vue.js](https://vuejs.org/). Précédemment l'API Options était utilisée dans les versions 1 et 2 de [Vue.js](https://vuejs.org/). Les différentes API (Options et Composition) peuvent cohabiter. Pour garder une homogénité dans le code nous utiliserons uniquement l'API Composition.

La partie modèle est définie par les propriétés suivantes :

* `errorMessage` : message d'erreur ;
* `buttonShown` : état activé ou pas du bouton de suppression des options d'un PollDLE ;
* `polldle` : titre du Polldle (`question`) et ensemble des options d'un PollDLE (`polldleOptions`). Pour ce dernier, il s'agit d'un objet avec une propriété `text` qui contient la valeur de l'option ;
* `newPolldleOptionText` : valeur temporaire d'une option de PollDLE avant sa création.

Deux mots clés sont disponibles pour rendre les propriétés réactives : `ref` et `reactive`. Il est d'usage d'utiliser `ref` pour des propriétés de type primitives et `reactive` pour des propriétés de type objet. Ces mots clés doivent être déclarés avant leur utilisation `import { ref, reactive } from 'vue'`.

Des fonctions JavaScript peuvent être utilisées pour regrouper des fonctionnalités ou effectuer des traitements plus complexes.

* Compléter la fin de la partie modèle `script`, en ajoutant le code JavaScript correspondant aux méthodes du modèle.

```javascript
...
<script setup>
... // Voir code ci-dessus.

function isCreatePolldleDisabled() {
  return polldle.polldleOptions.length < 2 || polldle.question === ''
}

function clearAllPolldleOptions() {
  polldle.polldleOptions = []
  errorMessage.value = ''
}

function addPolldleOption() {
  polldle.polldleOptions.push({
    text: newPolldleOptionText.value
  })
  newPolldleOptionText.value = ''
}

function removedPolldleOption(polldleOption) {
  let index = polldle.polldleOptions.indexOf(polldleOption)
  polldle.polldleOptions.splice(index, 1)
  errorMessage.value = ''
}

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

  // Call REST web service with fetch API
}
</script>
...
```

Nous détaillons ci-dessous l'objectif de ces fonctions JavaScript.

* `isCreatePolldleDisabled()` : pour savoir si un PollDLE peut être créé (qu'il existe des options de PollDLE, au moins deux, et qu'un titre soit présent) ;
* `clearAllPolldleOptions()` : pour supprimer toutes les options du PollDLE ;
* `addPolldleOption()` : pour ajouter une nouvelle option au PollDLE ;
* `removedPolldleOption(polldleOption)` : pour supprimer une option au PollDLE, l'élément à supprimer est passé en paramètre ;
* `createPolldle()` : pour créer le PollDLE et appeler le service web côté serveur (présentation faite plus tard dans l'article).

N'hésitez par à consulter les autres fichiers *.vue* pour découvrir comment les modèles et les vues ont été construits.

## Templating avec Vue.js

> Nous vous invitons à vous positionner dans le répertoire *polldle-vue-02* pour profiter des codes qui vont illustrer cette section. Pensez à faire `$ npm install` pour installer les modules et `$ npm run dev` pour démarrer l'exécution en mode développement.

Dans cette section, nous allons apprendre à réaliser le binding entre la vue et le modèle via le *templating*. Pour cela et comme précisé en première partie de cet article, deux outillages sont disponibles : l'interpolation via la notation moustache (`{% raw %}{{ ... }}{% endraw %}`) et les directives qui sont des attributs enrichissant les balises HTML (`v-... ou :... ou @...`).

### Interpolation

La forme la plus basique pour réaliser un binding est une interpolation de texte en utilisant une moustache qui est une double accolade entourant l'expression à évaluer : `{% raw %}{{ ... }}{% endraw %}`. Le rendu va consister à utiliser la moustache pour injecter la valeur de l'expression.

À titre d'exemple, dans le composant *CreatePolldle*, la zone située en bas de la page donne un résumé des données saisies (titre, nombre d'options et message d'erreur si existant).

* Compléter le code du fichier *CreatePolldle.vue* en remplaçant la balise de commentaire `<!-- Mustache with question -->` par une notation moustache associée à la propriété `polldle.question`.

```html
<template>
  ...
    <div class="alert alert-primary" role="alert">
      <h4 class="alert-heading">Summary of your PollDLE</h4>
      <hr>
      <p>
        The question is: 
        <strong>
          <!-- Mustache with question -->
          {% raw %}{{ polldle.question }}{% endraw %}
        </strong>
      </p>
      <p>Number of PollDLE options: TODO</p>
    </div>
  ...
</template>
...
```

À chaque modification de la valeur de la propriété `polldle.question`, la moustache injectera la valeur de la propriété dans le DOM.

Le résultat obtenu après le rendu de cette moustache est donné sur le code HTML suivant où `question` a pour valeur initiale `Aimez-vous les frites ?`.

```html
  ...
    <div class="alert alert-primary" role="alert">
      <h4 class="alert-heading">Summary of your PollDLE</h4>
      <hr />
      <p>
        The question is: <strong>Aimez-vous les frites ?</strong>
      </p>
      <p>Number of PollDLE options: TODO</p>
    </div>
  ...
```

### Directives

**Les moustaches ne peuvent pas être utilisées à l'intérieur d'une balise HTML**. Il faut donc passer par l'utilisation de directives qui utilisent le préfixe `v-`. Dès que l'expression adossée à la directive est modifiée, cette directive va effectuer les changements sur le DOM.

Dans cette section, nous allons étudier les directives suivantes : `v-text`, `v-on`, `v-bind`, `v-model`, `v-once`, les directives conditionnelles `v-show`, `v-if`, `v-else`, `v-else-if` et la directive `v-for` pour le rendu de liste.

#### Directive v-text

La directive `v-text` sert à mettre à jour le contenu textuel d'un élément. Elle joue le même rôle qu'une interpolation moustache.

* Compléter le code du fichier *CreatePolldle.vue* en ajoutant la directive `v-text` pour afficher la propriété `errorMessage` (commentaire `<!-- Directive v-text with errorMessage -->`).

```html
<template>
    ...
    <!-- Directive v-text with errorMessage -->
    <div
      class="error-message alert alert-danger"
      role="alert"
      v-text="errorMessage"
    ></div>
    ...
</template>
...
```

Le résultat obtenu après le rendu de cette directive `v-text` est donné sur le code HTML suivant où `v-text="errorMessage"` permet d'injecter dans le corps de la balise `<div>` la valeur initiale de la propriété `errorMessage` qui est `Problem to create a new Polldle`.

```html
...
<div class="error-message alert alert-danger" role="alert">Problem to create a new Polldle.</div>
...
```

Quand utiliser la directive `v-text` ou l'interpolation moustache ? Si le contenu textuel d'une balise doit être changé dans son intégralité, utiliser la directive `v-text`, si par contre le contenu textuel d'une balise doit être changé en partie, utiliser une interpolation moustache.

#### Directive v-bind

La directive `v-bind` permet de lier un attribut d'une balise à une expression. L'attribut est donné comme argument séparé par un deux-points après la directive `v-bind`. Les attributs `class` et `style` sont considérés naturellement.

* Compléter le code du fichier *CreatePolldle.vue* en ajoutant la directive `v-bind` pour lier l'attribut `disabled` avec la méthode `isCreatePolldleDisabled()` (commentaire `<!-- Directive v-bind with isCreatePolldleDisabled() -->`).

```html
<template>
    ...
    <!-- Button Action -->
    <!-- Directive v-bind with isCreatePolldleDisabled() -->
    <div class="row">
      <div class="col">
        <button
          type="button"
          class="validate-button btn-lg btn-primary mx-auto d-block"
          v-bind:disabled="isCreatePolldleDisabled()"
        >Create PollDLE</button>
      </div>
    </div>
    ...
</template>
...
```

La directive `v-bind` a comme paramètre `disabled` (séparée par un deux-points) et est associée à la fonction `isCreatePolldleDisabled()`. Dès lors que la fonction `isCreatePolldleDisabled()` retourne vrai, l'attribut `disabled` sera évalué à vrai et ainsi l'état du bouton sera désactivé.

Dans le cas où la fonction `isCreatePolldleDisabled()` retourne faux, le code HTML obtenu après le rendu de cette directive `v-bind:disabled` sera le suivant :

```html
...
<div class="row">
  <div class="col">
    <button
      type="button"
      class="validate-button btn-lg btn-primary mx-auto d-block"
      disabled="disabled"
    >Create PollDLE</button>
  </div>
</div>
...
```

[Vue.js](https://vuejs.org/) fournit une écriture simplifiée de la directive `v-bind`. Comme cette directive est largement utilisée, elle peut être remplacée par `:`.

L'exemple précédent pourra être écrit de cette façon.

```html
<template>
    ...
    <!-- Button Action -->
    <div class="row">
      <div class="col">
        <button
          type="button"
          class="validate-button btn-lg btn-primary mx-auto d-block"
          :disabled="isCreatePolldleDisabled()"
        >Create PollDLE</button>
      </div>
    </div>
    ...
</template>
...
```

#### Directive v-model

La directive `v-model` crée une liaison bidirectionnelle entre un composant de saisie (`<input>`, `<select>`, `<textarea>`) est une propriété du modèle.

* Compléter le code du fichier *CreatePolldle.vue* en ajoutant la directive `v-model` pour lier les propriétés `question` et `newPolldleOptionText` au composant de saisie `<input>` (commentaires `<!-- Directive v-model with question -->` et `<!-- Directive v-model with newPolldleOptionText -->`).

```javascript
<template>
    ...
    <!-- PollDLE name -->
    <div class="row">
      <div class="col">
        <!-- Directive v-model with question -->
        <input
          type="text"
          class="large-input mx-auto d-block"
          placeholder="Add your question here"
          v-model="poddle.question"
        >
      </div>
    </div>

    <h3>Add your PollDLE options</h3>

    <div class="row">
      <div class="col">
        <!-- Directive v-model with newPolldleOptionText -->
        <input
          type="text"
          placeholder="Polldle Option"
          class="large-input mx-auto d-block"
          v-model="newPolldleOptionText"
        >
      </div>
    </div>
    ...
</template>
...
```

Le code HTML obtenu après le rendu est le suivant. Nous constatons que la mécanique de la liaison bidirectionnelle n'est pas réalisée côté HTML, mais du côté JavaScript.

```html
...
<div class="row">
  <div class="col">
    <input
      type="text"
      placeholder="Add your question here"
      class="large-input mx-auto d-block"
    >
  </div>
</div>
<h3>Add your PollDLE options</h3>
<div class="row">
  <div class="col">
    <input
      type="text"
      placeholder="Polldle Option"
      class="large-input mx-auto d-block">
  </div>
</div>
```

#### Directive v-on

La directive `v-on` permet d'attacher un écouteur d'événements à un élément et de faire appel à une méthode dès lors qu'un événement est émis. Le type d'événement est donné comme argument séparé par un deux-points après la directive `v-on`.

* Compléter le code du fichier *CreatePolldle.vue* en ajoutant la directive `v-on` pour lier les méthodes `addPolldleOption`, `clearAllPolldleOptions` et `createPolldle` aux écouteurs d'événements liés à la souris et au clavier (commentaires `<!-- Directive v-on with addPolldleOption -->`, `<!-- Directive v-on with clearAllPolldleOptions -->` et `<!-- Directive v-on with createPolldle -->`).

```html
<template>
    ...
    <h3>Add your PollDLE options</h3>

    <div class="row">
      <div class="col">
        <!-- Directive v-on with addPolldleOption -->
        <input
          type="text"
          placeholder="Polldle Option"
          v-model="newPolldleOptionText"
          class="large-input mx-auto d-block"
          v-on:keypress.enter="addPolldleOption"
        >
      </div>
    </div>
    <div class="row">
      <div class="col">
        <!-- Directive v-on with clearAllPolldleOptions -->
        <button
          type="button"
          class="clear-button btn-lg btn-danger mx-auto d-block"
          v-on:click="clearAllPolldleOptions"
        >Clear all PollDLE Options</button>
      </div>
    </div>
    ...
    <!-- Button Action -->
    <div class="row">
      <div class="col">
        <!-- Directive v-on with createPolldle -->
        <button
          type="button"
          class="validate-button btn-lg btn-primary mx-auto d-block"
          v-bind:disabled="isCreatePolldleDisabled()"
          v-on:click="createPolldle"
        >Create PollDLE</button>
      </div>
    </div>
    ...
</template>
...
```

L'abonnement aux événements n'est pas visible depuis le code HTML puisque ce traitement est effectué côté JavaScript. Du côté du rendu HTML, les changements ne seront pas encore visibles. Il faudra attendre l'étude de la directive `v-for`. Cependant, nous pouvons en profiter pour montrer les états des valeurs des propriétés du composant `CreatePolldle` qui changent lors des interactions de l'utilisateur en utilisant l'extension pour les navigateurs web [Vue-DevTools](https://github.com/vuejs/vue-devtools).

* Depuis votre navigateur, afficher la page web du projet, ouvrir l'outil du développeur web puis sélectionner l'onglet **Vue**. Depuis l'arbre des composants, sélectionner ensuite le composant `CreatePolldle`. Vous verrez sur la partie droite les différentes valeurs des propriétés du composant. Dans l'exemple montré sur la figure ci-dessous, nous avons créé trois options.

![Utilisation de l'extension Vue-DevTools pour visualiser l'état du composant CreatePolldle](/images/vuejs-miseenoeuvre-part2/vue-devtools-createpolldle-state.png)

Il est possible de filtrer le type d'événement en indiquant des touches spécifiques de clavier ou des boutons de la souris. C'est le cas par exemple pour la validation d'une option de PollDLE qui doit être faite en pressant la touche *Enter* (`v-on:keypress.enter="addPolldleOption"`).

[Vue.js](https://vuejs.org/) fournit également une écriture simplifiée de la directive `v-on`. Comme cette directive est largement utilisée, elle peut être remplacé par `@`.

Une des parties de l'exemple précédent pourra être écrite de cette façon en utilisant l'écriture simplifiée.

```html
<template>
    ...
    <h3>Add your PollDLE options</h3>

    <div class="row">
      <div class="col">
        <input
          type="text"
          placeholder="Polldle Option"
          v-model="newPolldleOptionText"
          class="large-input mx-auto d-block"
          @keypress.enter="addPolldleOption"
        >
      </div>
    </div>
    ...
</template>
...
```

#### Directive v-once

Il est possible de n'effectuer le rendu d'une balise ou d'un composant qu'une seule fois. Pour cela il faudra utiliser la directive `v-once` depuis la balise englobante. Un exemple est disponible dans le composant *FooterPolldle*.

* Compléter le code du fichier *FooterPolldle.vue* en ajoutant la directive `v-once` à la balise `<p>` (commentaire de type `<!-- Directive v-once -->`).

```html
<script setup>
import { ref } from 'vue'

const description = ref(
  'PollDLE ~= Poll + (last part of famous DooDLE app). PollDLE is an open source project developped by Mickael BARON. Powered by Vue.js (frontend) and Java (backend).'
)
</script>

<template>
  <div class="container">
    <!-- Directive v-once -->
    <!-- Mustache with description -->
    <p class="footer" v-once>
      {% raw %}{{ description }}{% endraw %}
    </p>
  </div>
</template>

<style>
  ...
</style>
```

Dans ce cas, la directive `v-once` prend tout son sens, car le rendu ne sera réalisé qu'une seule fois, même si la description change.

#### Rendu conditionnel

> Nous vous invitons à vous positionner dans le répertoire *polldle-vue-03* pour profiter des codes qui vont illustrer cette section. Pensez à faire `$ npm install` pour installer les modules et `$ npm run dev` pour démarrer l'exécution en mode développement.

Nous allons dans cette section détailler les directives `v-show` et `v-if`. Ces directives permettent d'afficher ou de masquer du contenu HTML soit par une simple permutation basée sur du CSS (`v-show`) soit par un contrôle du rend (`v-if`).

##### Directive v-if

La directive `v-if` permet d'effectuer le rendu ou pas du bloc si l'expression associée à cette directive est vraie. Par ailleurs comme tout bloc de condition, `v-if` peut s'utiliser avec `v-else-if` (où une autre expression peut être évaluée) `v-else` pour le bloc par défaut si aucune expression n'est satisfaite.

Nous donnons un exemple d'utilisation de `v-if` et de `v-else` dans le composant *ResultPolldle*.

* Compléter la partie vue du fichier *ResultPolldle.vue* en remplaçant les balises de commentaire `<!-- Directive v-if ... -->` et `<!-- Directive v-else-if -->` par l'utilisation des directives `v-if` et `v-else-if`.

```html
<script setup>
...
function isResultState() {
  return state.value === stateResult.RESULT
}

function isErrorState() {
  return state.value === stateResult.ERROR
}

function isEmptyState() {
  return state.value === stateResult.EMPTY
}
</script>

<template>
  <div class="container">
    <!-- Directive v-if with isResultState() -->
    <div v-if="isResultState()">
      <!-- Mustache with question -->
      <h1>{{ question }}</h1>
      <div class="row">
        <div class="col-8"></div>
        <div class="col-4">
          <div />
        </div>
      </div>
    </div>
    <!-- Directive v-else-if with isEmptyState() -->
    <div v-else-if="isEmptyState()">
      <h2>
        No vote at this moment, keep in touch.<br />Results update in real-time.
      </h2>
    </div>
    <!-- Directive v-else-if with isErrorState() -->
    <!-- Mustache with errorMessage -->
    <div 
      v-else-if="isErrorState()"
      class="error-message alert alert-danger"
      role="alert"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>
```

> **Avant-propos, vu que c'est la première fois que nous présentons ce composant** : les fonctions `isResultState()`, `isErrorState()` et `isEmptyState()` utilisées comme expression dans les directives conditionnelles `v-if` et `v-else-if` permettent d'accéder à la propriété `state`. La valeur de cette propriété est modifiée lors de l'appel au service web (voir plus tard). Si `state === stateResult.EMPTY` le service web a été invoqué, mais aucune donné n'est transmise. Si `state === stateResult.ERROR` l'invocation au service web a généré une erreur. Si le service web a été invoqué et contient des données alors `state === stateResult.RESULT`.

Le premier rendu conditionnel est affiché s'il n'y a pas eu de problème lors du chargement des résultats du vote. Le deuxième rendu conditionnel est affiché s'il n'y a pas eu de problème et si le contenu retourné par le service web est vide. Enfin, le troisième rendu conditionnel affichera les erreurs causées par l'invocation du service web.

Nous donnons ci-dessous, le rendu HTML dans le cas où l'invocation au service web a provoqué une erreur.

```html
...
  <div class="container">
    <div role="alert" class="error-message alert alert-danger">Problem to retrieve Polldle result.</div>
  </div>
...
```

Comme on peut le remarquer, le premier bloc lié à l'affichage des résultats ne sera pas créé. Seul le dernier bloc sera créé.

##### Directive v-show

La directive `v-show` a le même effet que la directive `v-if` (et sœurs) du point de vue visuel. Toutefois au niveau du code, le rendu d'un bloc avec `v-show` sera réalisé, mais l'affichage sera contrôlé par la propriété CSS `display`.

* Compléter la partie vue du fichier *CreatePolldle.vue* en remplaçant les balises de commentaire `<!-- Directive v-show with buttonShown -->` et `<!-- Directive v-show with errorMessage -->` par une directive `v-show`.

```html
<template>
...
    <!-- Directive v-show with buttonShown -->
    <div class="row" v-show="buttonShown">
      <div class="col">
        <button
          type="button"
          class="clear-button btn-lg btn-danger mx-auto d-block"
          @click="clearAllPolldleOptions"
        >Clear all PollDLE Options</button>
      </div>
    </div>
    ...
    <!-- Directive v-show with errorMessage -->
    <div
      class="error-message alert alert-danger"
      role="alert"
      v-text="errorMessage"
      v-show="errorMessage !== ''"
    ></div>
...
</template>
```

Le premier bloc correspond au bouton « Clear All PollDLE Options » qui ne sera visible que s'il existe des options de Polldle (propriété `buttonShown`). Pour le second bloc où la directive `v-show` est utilisée, nous utilisons une expression JavaScript qui vérifie si la propriété `errorMessage` est vide ou pas.

Nous donnons ci-dessous le rendu HTML correspondant au premier bloc permettant de rendre visible ou pas le bouton « Clear All PollDLE Options ». Pour tester, changer la valeur de la propriété `buttonShown` de `false` à `true` et inversement.

```html
...
  <div class="row" style="display: none;">
    <div class="col">
      <button type="button" class="clear-button btn-lg btn-danger mx-auto d-block">Clear all PollDLE Options</button>
    </div>
  </div>
...
```

Dans cet état de valeur de propriétés où `butonShown` vaut faux, la directive `v-show` injectera la valeur de style `style="display: none;"`.

##### Quand utiliser v-if ou v-show ?

Les directives `v-if` et `v-show` permettent d'obtenir le même résultat visuellement, mais les rendus HTML sont différents.

Si vous avez besoin d'effectuer des permutations fréquemment (visibles ou pas visibles) au cours de l'utilisation de votre composant, il est préférable d'utiliser `v-show`. La directive `v-if` est à utiliser de préférence lors de l'initialisation de votre composant et quand il y a peu de changements. Un changement de CSS (via la directive `v-show`) est toujours moins coûteux que de devoir créer de nouveaux blocs (via la directive `v-if`).

Il faut aussi noter que la directive `v-show` réalise le rendu HTML quoi qu'il arrive, ce qui n'est pas le cas pour la directive `v-if`. Il faut dont prêter attention aux propriétés manipulées dans le rendu qui pourraient ne pas être initialisées. Par conséquent, si vous devez traiter des propriétés qui ne sont pas encore initialisées et qui le seront quand l'affichage devra être visible, il est préférable d'utiliser la directive `v-if`, dans le cas contraire utiliser la directive `v-show`.

#### Rendu de liste

> Nous vous invitons à vous positionner dans le répertoire *polldle-vue-04* pour profiter des codes qui vont illustrer cette section. Pensez à faire `$ npm install` pour installer les modules et `$ npm run dev` pour démarrer l'exécution en mode développement.

Nous étudions dans cette section la directive `v-for` qui permet de réaliser plusieurs fois le rendu d'un élément (où s'applique la directive).

La valeur de la directive `v-for` doit suivre la syntaxe `alias in expression` ou expression peut-être issue d'une donnée source de type **tableau** ou d'**objet** (via les propriétés de l'objet). `alias` permettra d'accéder à l'élément courant.

Nous présentons ci-dessous les différentes syntaxes que vous pourrez retrouver en utilisant `v-for` en fonction du type de source (**tableau** ou **objet**).

```html
<!-- La source items est un tableau. items: [ { text: 'yes' }, { text: 'no'} ... ] -->
<div v-for="item in items">{% raw %}{{ item.text }}{% endraw %}</div> --> item est l'élément courant (yes)
<div v-for="(item, index) in items"></div> --> item est l'élément courant (yes) et index l'indice de l'élément (0)

<!-- La source object est un objet. object: { firstname: 'mickael', familyname: 'baron' ... } -->
<div v-for="(val, key) in object"></div> --> val est la valeur de la propriété (mickael) et key le nom de la propriété (firstname)
<div v-for="(val, key, index) in object"></div> --> val est la valeur de la propriété (mickael), key le nom de la propriété (firstname) et index l'indice de la propriété (0)
```

* Compléter la partie vue du fichier *CreatePolldle.vue* en remplaçant les balises de commentaire `<!-- Directive v-for with polldle.polldleOptions -->` par l'utilisation de la directive `v-for`.

```html
...
    <!-- PollDLE option -->
    <!-- Directive v-for with polldle.polldleOptions -->
    <div
      class="row justify-content-center"
      v-for="currentPolldleOption in polldle.polldleOptions"
      :key="currentPolldleOption.text"
    >
      {% raw %}{{ currentPolldleOption.text }}{% endraw %}
    </div>
...
```

> Dans l'exemple complet, l'élément construit plusieurs fois sera relatif au composant *CreatePolldleOption*. Comme nous n'avons pas encore présenté la notion de composant de [Vue.js](https://vuejs.org/), nous nous limiterons à l'affichage du texte de l'option PollDLE.

Nous donnons ci-dessous le rendu HTML lorsque `polldleOptions` contient deux options `Oui` et `Non`.

```html
...
  <div class="row justify-content-center">
    Oui
  </div>
  <div class="row justify-content-center">
    Non
  </div>
```

L'élément répété est celui où la directive `v-for` est appliquée, dans ce cas `<div class="row justify-content-center">`.

## Composant avec Vue.js

Cette section s'intéresse à la notion de composant. Nous verrons comment **développer** et **instancier** un composant. Nous étudierons les aspects liés au cycle de vie d'un composant. Nous terminerons par les différentes façons pour **communiquer** entre des composants.

### Savoir développer un composant

> Nous vous invitons à vous positionner dans le répertoire *polldle-vue-05* pour profiter des codes qui vont illustrer cette section. Pensez à faire `$ npm install` pour installer les modules et `$ npm run dev` pour démarrer l'exécution en mode développement.

Pour développer un composant avec [Vue.js](https://vuejs.org/), il existe plusieurs façons qui sont parfaitement résumées dans cet article : [https://vuejsdevelopers.com/2017/03/24/vue-js-component-templates/.](https://vuejsdevelopers.com/2017/03/24/vue-js-component-templates/.) Dans le périmètre de notre article, nous nous limiterons au développement du composant via l'utilisation d'un fichier portant l'extension *.vue*. Cette manière de développer est appelée composants monofichiers ou composants à fichier unique (*Single File Components* en anglais). Nous avions déjà évoqué dans la partie introductive de [Vue.js](https://vuejs.org/) la description d'un composant sous cette forme. Pour rappel, ce fichier avec l'extension *.vue* est décomposé en trois parties qui définissent :

1 un code JavaScript qui détermine le comportement du composant (balise `<script>`) ;

2 un template constitué de balises HTML qui définit la structure du composant (balise `<template>`) ;

3 des styles CSS qui définissent l’apparence du composant (balise `<style>`).

* Créer un fichier *CreatePolldleOption.vue* relatif au composant *CreatePolldleOption* et recopier le code ci-dessous.

```html
<script setup>
</script>

<template>
  <div class="polldle-option-input row justify-content-center no-gutters">
    <div class="col col-auto">
      <input
        type="text"
        class="form-control"
        readonly
      />
    </div>
    <div class="col col-auto">
      <button
        class="btn btn-outline-secondary"
        type="button"
      >
        X
      </button>
    </div>
  </div>
</template>

<style>
.polldle-option-input {
  margin-bottom: 5px;
}
</style>
```

Le nom du composant est porté par le nom du fichier correspondant. Dans le cas de cet exemple, le composant est identifié par `CreatePolldleOption` et le fichier contenant le code sera nommé *CreatePolldleOption.vue*. La convention de nommage recommandée peut-être **kebab-case** ou **PascalCase**. C'est cette dernière convention que nous utilisons. La convention de nommage **PascalCase** consiste à mettre en majuscule la première lettre de chaque mot.

Quand un composant est développé via un monofichier, c'est à la charge de [Vite](https://vitejs.dev/) et des outils annexes de transformer le code contenu dans ce fichier unique pour générer un code JavaScript compréhensible par le navigateur. Sans cet outillage, l'utilisation de fichiers portant l'extension *.vue* et avec une décomposition en trois parties n'aurait pas d'utilité.

### Savoir instancier un composant

> Nous vous invitons à vous positionner dans le répertoire *polldle-vue-06* pour profiter des codes qui vont illustrer cette section. Pensez à faire `$ npm install` pour installer les modules et `$ npm run dev` pour démarrer l'exécution en mode développement.

Précédemment, nous avons vu comment **développer** un composant, nous allons maintenant voir comment l'**instancier** au sein d'autres composants [Vue.js](https://vuejs.org/). À ce propos, deux types de composants sont à distinguer : les composants que vous avez développés (c'est le cas du composant *CreatePolldleOption*) et les composants externes (c'est le cas de la bibliothèque Highcharts via le composant [vue-highcharts](https://github.com/weizhenye/vue-highcharts)). Quelle que soit l'origine des composants, la manière de les utiliser au sein d'un composant reste identique.

Pour instancier un composant, trois choses doivent être prises en compte :

* l'importation du monofichier de description du composant ;
* la déclaration locale ou globale ;
* l'instanciation du composant.

Nous prendrons comme exemple le composant *CreatePolldle* défini dans le fichier *CreatePolldle.vue*.

#### Importation du monofichier de description du composant

* Dans le code donné ci-dessous du fichier *CreatePolldle.vue*, remplacer le commentaire `// Import CreatePolldleOption component` en ajoutant la variable `CreatePolldleOption` qui permet de pointer sur le composant *CreatePolldleOption* défini dans le fichier *CreatePolldleOption.vue*.

```javascript
<script setup>
import { ref, reactive } from 'vue'

// Import CreatePolldleOption component
import CreatePolldleOption from "./components/CreatePolldleOption.vue";
...
</script>
<template>
...
</template>
...
```

#### Déclaration locale ou globale

La déclaration locale précise qu'un composant importé n'est visible que par le composant qui en fait la demande. Au contraire, la déclaration globale précise qu'un composant importé est visible par tous les composants du projet. Il y a un risque de rendre globale la déclaration d'un composant. Cela alourdit le code produit et cela empêche d'avoir une visibilité explicite des dépendances entre les composants (qui utilise quoi).

Avec l'utilisation de l'écriture `<script setup>`, les composants importés peuvent être utilisés localement sans avoir besoin de les déclarer. Avec la non syntaxe `<script setup>`, vous auriez eu besoin d'utiliser l'option `components`.

> Pour déclarer globalement un composant, il est préférable de le faire depuis le fichier *main.js*. Malgré le fait que nous n'utilisons pas la déclaration globale dans notre projet, nous montrons à titre d'exemple la manière de faire. Dans le code ci-dessous, il faut d'une part importer le monofichier *CreatePolldleOption.vue* et d'autre part l'ajouter globalement au composant racine décrit par `App`.

```javascript
import { createApp } from 'vue'
import App from './App.vue'

import './assets/polldle.css'

import CreatePolldleOption from './components/CreatePolldleOption.vue'

const app = createApp(App)
app.component('CreatePolldleOption', CreatePolldleOption)

app.mount('#app')
```

#### Instanciation du composant

La dernière étape consiste à utiliser le composant dans la partie template du monofichier. Le composant est vu comme une nouvelle balise dont le nom est identique à la variable utilisée lors de l'importation.

> Il est à noter qu'un composant peut être instancié autant de fois que souhaité. Il n'y a pas de limite, excepté la mémoire utilisée par votre navigateur.

* Compléter la partie template du fichier *CreatePolldle.vue* en remplaçant la balise de commentaire `<!-- Instance CreatePolldleOption component -->` par notre nouvelle balise `<CreatePolldleOption>`.

```html
<template>
  ...
  <div
    class="row justify-content-center"
    v-for="currentPolldleOption in polldleOptions"
    :key="currentPolldleOption.text"
  >
    <!-- Instance CreatePolldleOption component -->
    <CreatePolldleOption/>
  </div>
  ...
</template>
...
```

Le composant *CreatePolldleOption* sera créé autant de fois que précisé dans la boucle.

Ci-dessous est présenté le rendu HTML du composant lorsque deux instances du composant *CreatePolldleOption* ont été créées.

```html
<div class="row justify-content-center">
  <!-- Début du composant CreatePolldleOption -->
  <div class="polldle-option-input row justify-content-center no-gutters">
    <div class="col col-auto">
      <input type="text" class="form-control" readonly="">
    </div>
    <div class="col col-auto">
      <button class="btn btn-outline-secondary" type="button"> X </button>
    </div>
  </div>
  <!-- Fin du composant CreatePolldleOption -->
</div>
<div class="row justify-content-center">
  <!-- Début du composant CreatePolldleOption -->
  <div class="polldle-option-input row justify-content-center no-gutters">
    <div class="col col-auto">
      <input type="text" class="form-control" readonly="">
    </div>
    <div class="col col-auto">
      <button class="btn btn-outline-secondary" type="button"> X </button>
    </div>
  </div>
  <!-- Fin du composant CreatePolldleOption -->
</div>
```

Le contenu généré est conforme au composant *CreatePolldleOption*. Ce code n'est pas complet puisque les champs `input` ne sont pas renseignés. Nous aborderons cet aspect dans la section suivante dédiée à la communication entre des composants.

#### Composant externe ou plugin

> Nous vous invitons à vous positionner dans le répertoire *polldle-vue-07* pour profiter des codes qui vont illustrer cette section. Pensez à faire `$ npm install` pour installer les modules et `$ npm run dev` pour démarrer l'exécution en mode développement.

Au sens de composant externe, nous considérons une bibliothèque développée par un tiers et que l'on souhaite intégrer à notre projet. Au niveau de [Vue.js](https://vuejs.org/), ce type de composant est aussi appelé plugin. C'est le cas pour la bibliothèque JavaScript [Highcharts](https://www.highcharts.com/) et de sa version packagée [highcharts-vue](https://github.com/highcharts/highcharts-vue) pour le rendu des résultats d'un Polldle.

> Pour transformer un composant en un plugin ou composant externe, il faut exposer une méthode `install`. Cela n'étant pas l'objectif de cet article, une indication est donnée dans la [documentation officielle](https://vuejs.org/guide/reusability/plugins.html) de [Vue.js](https://vuejs.org/).

Quand vous souhaitez ajouter une bibliothèque dans votre projet, vous devez généralement ajouter des dépendances dans le fichier *package.json* puis instancier le composant souhaité dans votre code. Examinons ensemble l'ajout de la bibliothèque [Highcharts](https://www.highcharts.com/) et de sa version packagée [highcharts-vue](https://github.com/highcharts/highcharts-vue).

* Saisir la ligne commande suivante permettant d'ajouter la bibliothèque JavaScript [Highcharts](https://www.highcharts.com/) et de sa version packagée [highcharts-vue](https://github.com/highcharts/highcharts-vue) avec l'outil de dépendances **npm**. 

```console
$ npm install highcharts-vue

added 2 packages, and audited 36 packages in 2s

4 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

> Pour trouver précisément le nom des bibliothèques à ajouter, il faut généralement se rendre sur le site web de la bibliothèque qui expliquera comment l'installer. Il n'existe qu'une bibliothèque JavaScript correspondant à [Highcharts](https://www.highcharts.com/), mais plusieurs variantes packagées développées pour [Vue.js](https://vuejs.org/).

La commande précédente va également ajouter dans le fichier *package.json* une entrée puis télécharger les dépendances dans le répertoire *node_modules*. Ci-dessous est présenté une partie du contenu du fichier *package.json*.

```javascript
{
  ...
  "dependencies": {
    "highcharts-vue": "^1.4.0",
    "vue": "^3.2.37"
  },
  ...
}
```

Il faut ensuite ajouter le plugin dans le composant *ResultPolldle* décrit par le fichier *ResultPolldle.vue*.

* Éditer le fichier *ResultPolldle.vue* en remplaçant les commentaires `// Import the Highcharts-Vue plugin` par le code présenté ci-dessous.

```javascript
<script>
<script setup>
import { ref } from 'vue'

// Import the Highcharts-Vue plugin
import { Chart } from 'highcharts-vue'
...
</script>
<template>
  ...
</template>
...
<style>
</style>
```

Le code `import { Chart } from 'highcharts-vue` permet d'utiliser uniquement la fonctionnalité graphe (_Chart_) de [Highcharts](https://www.highcharts.com/). Si vous souhaitiez utiliser toutes les autres fonctionnalités (*Highcharts Stock*, *Highcharts Maps* et *Highcharts Gantt*), veuillez consulter la documentation officielle de [highcharts-vue](https://github.com/highcharts/highcharts-vue).

* Éditer le fichier *ResultPolldle.vue* en remplaçant la balise de commentaire `<!-- Instance of highcharts component -->` par la balise `<highcharts>`.

```html
<template>
...
      <div class="row">
        <div class="col-8">
          <!-- Instance of highcharts component -->
          <Chart :options="options"></Chart>
        </div>
      </div>
...
</template>
```

Le code ajouté n'est pas complet, car il implique la communication entre les composants *CreatePolldle* et *CreatePolldleOption*, nous aborderons cet aspect dans la section suivante dédiée à la communication entre des composants.

### Savoir écouter un composant : propriétés calculées et observateurs

> Nous vous invitons à vous positionner dans le répertoire *polldle-vue-08* pour profiter des codes qui vont illustrer cette section. Pensez à faire `$ npm install` pour installer les modules et `$ npm run dev` pour démarrer l'exécution en mode développement.

Lors de changement des propriétés du modèle, on peut vouloir calculer de nouvelles propriétés (les propriétés calculées) ou déclencher des opérations coûteuses (les observateurs).

#### Propriétés calculées (computed)

Il peut arriver que dans une interpolation ou une directive, l'expression transmise soit complexe ce qui peut alourdir la lisibilité de la partie vue. Par ailleurs, si cette expression est répétée, il devient nécessaire de regrouper le code (code dupliqué == bogue répété).

Prenons l'exemple du résumé du nombre d'options de PollDLE du composant *CreatePolldle* (voir fichier *CreatePolldle.vue*).

```html
<template>
...
    <div class="alert alert-primary" role="alert">
      <h4 class="alert-heading">Summary of your PollDLE</h4>
      <hr>
      <p>
        The question is:
        <strong>{% raw %}{{ polldle.question }}{% endraw %}</strong>
      </p>
      <p>Number of PollDLE options: {% raw %}{{ this.polldleOptions.length }}{% endraw %}</p>
    </div>
...
</template>
```

Pour remplacer le code `this.polldleOptions.length`, nous allons utiliser une propriété calculée qui sera mise à jour à chaque changement de la propriété `polldleOptions`.

* Compléter la partie vue du fichier *CreatePolldle.vue* en remplaçant la balise de commentaire `<!-- Mustache with computed property: listSize -->` par une notation moustache associée à la propriété `listSize`.

```html
<template>
...
    <div class="alert alert-primary" role="alert">
      <h4 class="alert-heading">Summary of your PollDLE</h4>
      <hr>
      <p>
        The question is:
        <strong>{% raw %}{{ question }}{% endraw %}</strong>
      </p>
      <!-- Mustache with computed property: listSize -->
      <p>Number of PollDLE options: {% raw %}{{ listSize }}{% endraw %}</p>
    </div>
...
</template>
```

* Compléter la partie JavaScript du fichier *CreatePolldle.vue* en remplaçant la balise de commentaire `// Computed property listSize when polldle.polldleOptions changes` par une propriété calculée comme présenté ci-dessous. Toutes les propriétés calculées de ce composant devront être placées comme éléments de l'attribut `computed`. Déclarer également le mot clé `computed` dans l'instruction `import`.

```javascript
<script setup>
import { ref, reactive, computed } from 'vue'
...
// Computed property listSize when polldle.polldleOptions changes
const listSize = computed(() => {
  return polldle.polldleOptions.length
})
...
</script>
```

La propriété calculée *listSize* est mise en cache et tant que les propriétés dont elle dépend ne changent pas (ici, il s'agit de `polldle.polldleOptions`), l'expression ne sera pas réévaluée. Ainsi, si un nouveau rendu est effectué côté vue, la valeur de la propriété calculée `listSize` sera prise depuis le cache.

> Le résultat aurait été identique si nous avions utilisé une fonction. Toutefois, à chaque rendu de la vue, l'expression de la fonction déclarée aurait été évaluée. Cette optimisation a son importance quand les expressions des propriétés calculées commencent à devenir complexes.

#### Observateurs (watch)

Lorsqu'une valeur de propriété du modèle est modifiée, on peut vouloir invoquer une fonction JavaScript (en mode asynchrone) ou modifier la valeur d'une propriété. [Vue.js](https://vuejs.org/) fournit un mécanisme appelé Observateurs qui pour chaque changement de valeur d'une propriété ciblée vous permet d'effectuer un traitement.

Nous présentons dans l'exemple de création d'un PollDLE, la mise en place d'un observateur pour la propriété `polldle.polldleOptions` qui, pour chaque changement, modifiera la valeur de la propriété `buttonShown`.

* Compléter la partie JavaScript du fichier *CreatePolldle.vue* en remplaçant la balise de commentaire `// Watcher on polldle.polldleOptions` par un observateur comme présenté ci-dessous. Tous les observateurs de ce composant devront être placés comme éléments de l'attribut `watch`. Déclarer également le mot clé `watch` dans l'instruction `import`.

```javascript
<script setup>
import { ref, reactive, computed, watch } from 'vue'
...
// Watcher on polldle.polldleOptions
watch(
  () => [...polldle.polldleOptions],
  () => {
    buttonShown.value = !(polldle.polldleOptions.length === 0)
  }
)
...
</script>
```

Dans cet exemple, le nom de la fonction observateur prend le même nom que la propriété à observer : `polldle.polldleOptions`. Ainsi tout le code contenu à l'intérieur de cette fonction sera appelé à chaque fois que la valeur de `polldle.polldleOptions` changera. La syntaxe `[...polldle.polldleOptions]` est imposée puisque il s'agit d'observer le changement des valeurs du tableau et non la référence du tableau qui elle ne changerait pas. La syntaxe Spread `...` permet de déstructurer le tableau. 

> Dans ce cas précis, l'utilisation d'un observateur au lieu d'une propriété calculée est discutable. L'utilisation d'une propriété calculée pour obtenir la valeur de `buttonShown` aurait aussi fonctionné.

### Savoir communiquer avec un composant

Précédemment, nous avons vu comment créer une instance d'un composant. Toutefois, nous ne nous étions pas intéressés à expliquer comment transmettre des informations vers le composant créé ou comment ce composant pouvait également communiquer avec d'autres composants. Trois techniques de communication seront étudiées :

* en communication directe via l'utilisation de la référence d'un composant ;
* en transmettant des propriétés à un composant lors de son instanciation ;
* en utilisant des événements.

#### Via la référence

> Nous vous invitons à vous positionner dans le répertoire *polldle-vue-09* pour profiter des codes qui vont illustrer cette section. Pensez à faire `$ npm install` pour installer les modules et `$ npm run dev` pour démarrer l'exécution en mode développement.

La communication directe via la référence permet d'accéder à une partie du DOM HTML ou à la référence d'un composant enfant. Cette solution amène à un couplage fort. En effet, cela suppose d'avoir accès à la référence d'une partie du DOM HTML ou d'un composant et de s'assurer que lors de l'utilisation de cette rérence celle-ci est toujours existante. Si ce n'est plus le cas, il faudra s'assurer de mettre à jour la référence à manipuler ou ne plus l'utiliser si elle n'existe plus.

Dans le cas de notre exemple, la communication par référence est utilisée dans le composant *CreatePolldle* pour accéder au DOM HTML de la partie template. L'idée est de montrer que le DOM HTML est accessible pour effectuer des modifications qui ne pourraient pas être réalisées autrement.

* Éditer le code du composant *CreatePolldle* via le fichier *CreatePolldle.vue* en ajoutant l'attribut `ref` à la première balise `<div>` (voir commentaire `<!-- Declaring ref attribute -->`).

```html
<script setup>
...
</script>
<template>
  <div ref="el" class="container">
    ...
  </div>
</template>
```

* Éditer de nouveau le code du composant *CreatePolldle* via le fichier *CreatePolldle.vue* en remplaçant les commentaires `// Declare attribute ref` et `// Read attribute ref value` par le code présenté ci-dessous.

```javascript
<script setup>
...
const errorMessage = ref('')
const buttonShown = ref(false)
// Declare attribute ref
const el = ref()
...
function addPolldleOption() {
  // Read attribute ref value
  console.log('Root element:' + el.value.innerHTML)

  polldle.polldleOptions.push({
    text: newPolldleOptionText.value
  })
  newPolldleOptionText.value = ''
}
</script>
<template>
  ...
</template>
```

La communication par référence passe par l'utilisation de l'attribut `ref`. Dans notre exemple, la propriété `el` stockera la référence correspondant à l'élément racine `div`. À chaque nouvelle option d'un Polldle, le contenu DOM HTML est affiché sur la console du navigateur. Un exemple de résultat est donné ci-dessous.

```html
Root element:<!-- Titre + description --><h1>PollDLE</h1><h2>Voting done simply in real-time</h2><!-- PollDLE name --><div class="row"><div class="col"><input type="text" class="large-input mx-auto d-block" placeholder="Add your question here"></div></div><h3>Add your PollDLE options</h3><div class="row"><div class="col"><input type="text" placeholder="Polldle Option" class="large-input mx-auto d-block"></div></div><div class="row" style="display: none;"><div class="col"><button type="button" class="clear-button btn-lg btn-danger mx-auto d-block"> Clear all PollDLE Options </button></div></div><!-- PollDLE option --><!-- Button Action --><div class="row"><div class="col"><button type="button" class="validate-button btn-lg btn-primary mx-auto d-block" disabled=""> Create PollDLE </button></div></div><div class="alert alert-primary" role="alert"><h4 class="alert-heading">Summary of your PollDLE</h4><hr><p> The question is: <strong></strong></p><p>Number of PollDLE options: 0</p></div><div class="error-message alert alert-danger" role="alert" style="display: none;"></div>
```

#### Via les Props

> Nous vous invitons à vous positionner dans le répertoire *polldle-vue-10* pour profiter des codes qui vont illustrer cette section. Pensez à faire `$ npm install` pour installer les modules et `$ npm run dev` pour démarrer l'exécution en mode développement.

La communication par **props** (qui sont des propriétés) consiste à transmettre des données d'un composant parent à un composant enfant. Ce type de communication est unidirectionnelle (composant parent vers le composant enfant). La communication par **props** impose d'une part que du côté du composant enfant soit déclarées les propriétés à recevoir et d'autre part que les valeurs des propriétés soient transmises lors de l'instanciation du composant.

Dans notre exemple, nous allons construire des instances du composant *CreatePolldleOption* utilisées pour afficher les différentes options de notre Polldle. La valeur de chaque option de notre Polldle, éditée depuis un champ de texte, sera transmise depuis le composant *CreatePolldle* lors de la création des instances *CreatePolldleOption*.

##### Côté composant enfant

* Éditer le composant *CreatePolldleOption* au niveau de la partie JavaScript en remplaçant le commentaire `// Add properties definition on polldleOption object` par le code présenté dans `defineProps`

```javascript
<script setup>
// Add properties definition on polldleOption object
defineProps({
  polldleOption: {
    type: Object,
    required: true
  }
})
</script>

<template>
  ...
</template>
</scrip>
```

Cela permet de déclarer que le composant *CreatePolldleOption* doit (attribut `required`) accepter une **prop** (propriété) de type `Object` qui s'appelle `polldleOption`.

* Éditer de nouveau le composant *CreatePolldleOption* au niveau de la partie HTML en remplaçant le commentaire `<!-- Bind both value and title attributes with polldleOption property -->` par le code présenté.

```html
<script setup>
...
</script>

<template >
  <div class="polldle-option-input row justify-content-center no-gutters">
    <div class="col col-auto">
      <!-- Bind both value and title attributes with polldleOption property -->
      <input
        type="text"
        class="form-control"
        readonly
        :value="polldleOption.text"
        :title="polldleOption.text"
      />
    </div>
    <div class="col col-auto">
      <button class="btn btn-outline-secondary" type="button">X</button>
    </div>
  </div>
</template>
```

Ici la propriété `polldleOption` est utilisée pour mapper la valeur textuelle avec les attributs `value` et `title` de la balise `<input>`. Tout comme les propriétés réactives définies dans `<script setup>`, la propriété `polldleOption` est déclarée dans le système réactif de [Vue.js](https://vuejs.org/). Ainsi, tout changement de valeur dans la propriété `polldleOption` impactera les valeurs dans les attributs `value` et `title`.

##### Côté composant parent

Du côté du composant parent, lors de l'instanciation d'un composant, les valeurs transmises pour les propriétés déclarées de ce composant enfant doivent être renseignées via des attributs portant le même nom que lesdites propriétés. Ces attributs doivent également utiliser la même convention de nommage.

* Éditer le fichier *CreatePolldle.vue* en ajoutant l'attribut `v-bind:polldleOption="polldleOption"` (voir commentaire `<!-- Send object value for polldleOption property -->`).

```html
<template>
...
    <div
      class="row justify-content-center"
      v-for="currentPolldleOption in polldleOptions"
      :key="currentPolldleOption.text"
    >
      <!-- Send object value for polldleOption property -->
      <CreatePolldleOption v-bind:polldleOption="currentPolldleOption"/>
    </div>
...
</template>
...
```

Dans le code montré ci-dessus, pour chaque instance nouvellement créée du composant *CreatePolldleOption*, un objet de type `PolldleOption` (contenant une seule propriété `String`) est transmis comme propriété à ce composant enfant. Ce mode de transmission est appelé dynamique puisque la valeur transmise se fait via la directive `v-bind`. Ainsi, le système réactif sera également disponible dans le composant *CreatePolldleOption* pour chaque objet transmis.

* À titre d'exemple, voici le même code en utilisant la version simplifiée de la directive `v-bind`.

```html
<template>
...
  <div
      class="row justify-content-center"
      v-for="currentPolldleOption in polldleOptions"
      :key="currentPolldleOption.text"
    ><CreatePolldleOption :polldleOption="currentPolldleOption"/>
  </div>
...
</template>
...
```

> Si nous avions souhaité utiliser le mode de transmission statique (en gros une valeur chaîne de caractères excepté un tableau, un objet, un nombre ou un booléen), il faudrait avant tout impacter le composant *CreatePolldleOption* afin de déclarer la propriété pour qu'elle soit une chaîne de caractères et non un objet. Le code correspondant à la transmission de cette chaîne de caractères aurait ressemblé à cela.

```html
<template>
...
  <div
      class="row justify-content-center"
      v-for="currentPolldleOption in polldleOptions"
      :key="currentPolldleOption.text"
    ><CreatePolldleOption polldleOption="currentPolldleOption.text"/></div>
...
</template>
...
```

> Depuis le composant *ResultPolldle*, il y a aussi une communication par **props** vers le composant *highcharts* en utilisant le code suivant : `<Chart :options="options"></Chart>`. Via` :options="options"`, l'objet `options` qui contient la configuration du graphique et les données est transmis via des propriétés.

#### Via les événements personnalisés

> Nous vous invitons à vous positionner dans le répertoire *polldle-vue-11* pour profiter des codes qui vont illustrer cette section. Pensez à faire `$ npm install` pour installer les modules et `$ npm run dev` pour démarrer l'exécution en mode développement.

Une communication par événements personnalisés (_Custom Event_) amène à un faible couplage entre un composant parent et un composant enfant. Ce type de communication est à choisir dans le cas où vous souhaitez que votre composant enfant puisse communiquer avec le composant parent.

La mise en place de ce type de communication est assez classique. Il y a d'abord la phase de création d'événements avec sa transmission vers le composant parent. Il y a ensuite la phase d'écouteur qui consiste à réagir (appeler un code particulier) suivant l'événement personnalisé reçu. Un événement personnalisé est constitué d'un identifiant (une chaîne de caractères) et de paramètres (cardinalité zéro ou plusieurs).

Dans notre exemple, le composant *CreatePolldleOption* va envoyer un événement `removedPolldleOption` au composant parent *CreatePolldle* lorsque l'utilisateur souhaite supprimer une option (caractère 'X'). L'abonnement à l'événement `removedPolldleOption` est réalisé dans le composant parent *CreatePolldle*. Le traitement à la réception de cet événement consistera à retirer depuis le tableau `polldleOptions` l'élément correspondant à la bonne option. Pour rappel, c'est dans le composant *CreatePolldle* où sont stockés les objets relatifs aux options d'un Polldle.

##### Création d'événements personnalisés et transmission

Comme précisé dans la section précédente, un événement est composé d'une chaîne de caractères et de paramètres. Les paramètres peuvent être de types différents. La transmission de l'événement se fera via la propriété d'instance `$emit`.

> Il est à noter que chaque composant enfant à une relation avec son composant parent pour la transmission d'événement personnalisé via la propriété d'instance `$emit`. Si vous souhaitez communiquer avec n'importe quel composant (pas forcément un composant parent), vous pourriez utiliser un gestionnaire d'état comme [Pinia](https://pinia.vuejs.org/). Nous reparlerons de l'utilisation d'un gestionnaire d'état dans un prochain tutoriel.

* Éditer le code du composant *CreatePolldleOption* en remplaçant le commentaire `<!-- Trigger an event to the parent component -->` par le code suivant.

```html
<script setup>
...
</script>
<template>
  ...
    <div class="col col-auto">
      <!-- Trigger an event to the parent component -->
      <button
        class="btn btn-outline-secondary"
        type="button"
        @click="$emit('removed-polldle-option', polldleOption)"
      >
        X
      </button>
    </div>
  </div>
</template>
```

Le code ci-dessus déclenche l'événement `removed-polldle-option` sur l’instance actuelle en transmettant l'objet `PolldleOption`. Pour rappel cet objet avait été transmis lors de la création de l'instance du composant `PolldleOption` (via les propriétés de transmission).

> Du fait que le nom de l'événement sera utilisé dans le DOM et que les majuscules seront transformées en minuscules, il est d'usage d'utiliser la convention de nommage **kebab-case** pour l'écriture des événements.

##### Abonnement à un événement

Puisque le déclenchement de l'événement se fait sur l'instance du composant *CreatePolldleOption*, il faut que l'abonnement s'effectue sur cette même instance. Nous allons donc utiliser la directive `v-on` dont le nom de l'événement est celui que nous avons déclenché.

* Éditer le code du composant *CreatePolldle* en remplaçant le commentaire `<!-- Listening the removed-polldle-option event -->` par le code suivant.

```html
<template>
    ...
    <div
      class="row justify-content-center"
      v-for="currentPolldleOption in polldleOptions"
      :key="currentPolldleOption.text"
    >
      <!-- Listening the removed-polldle-option event -->
      <CreatePolldleOption :polldleOption="currentPolldleOption" v-on:removed-polldle-option="removedPolldleOption"/>
    </div>
</template>
```

Ce code a pour effet d'appeler la fonction `removedPolldleOption`.

* À titre d'exemple, voici le même code en utilisant la version simplifiée de la directive `v-on`.

```html
<template>
    ...
    <div
      class="row justify-content-center"
      v-for="currentPolldleOption in polldleOptions"
      :key="currentPolldleOption.text"
    >
      <CreatePolldleOption :polldleOption="currentPolldleOption" @removed-polldle-option="removedPolldleOption"/>
    </div>
</template>
```

### Cycle de vie

> Nous vous invitons à vous positionner dans le répertoire *polldle-vue-12* pour profiter des codes qui vont illustrer cette section. Pensez à faire `$ npm install` pour installer les modules et `$ npm run dev` pour démarrer l'exécution en mode développement.

Un cycle de vie est utilisé comportant un ensemble d'étapes de la vie d'un composant. Chaque étape est associée à un *hook* (une sorte de méthode) permettant d'exécuter un code particulier.

Nous présentons ci-dessous un diagramme du cycle de vie qui lister les principales étapes (identifiées par un rectangle rouge).

![Diagramme du cycle de vie de Vue.js](/images/vuejs-miseenoeuvre-part2/lifecyclevuejs.png)

Huit étapes sont décrites : `beforeCreate`, `created`, `beforeMount`, `mounted`, `beforeUpdate`, `updated`, `beforeUnmount`, `unmounted`. À l'exception de `beforeCreate` et `created` qui sont des étapes exécutées directement dans la partie `<script setup>`, les autres étapes sont accessibles depuis des *hooks*. Nous étudierons uniquement les étapes `created` et `mounted`.

#### Étape created

L'étape `created` sera exécutée à la création du composant et toutes les propriétés de ce composant seront initialisées et associées au système réactif. Il en est de même pour les événements que nous aborderons dans la section suivante. Le code défini dans cette étape pourra donc accéder aux propriétés du composant. Toutefois, le rendu du *template* et le DOM virtuel ne sont pas encore effectués. Vous ne devrez donc pas effectuer de modification sur le rendu du composant.

Nous utiliserons un *hook* `created` dans deux composants :

* *VotePolldle* : initialisation des données via l'appel à un service web (utilisation de la bibliothèque JavaScript *Axios*) ;
* *ResultPolldle* : initialisation du SSE (*Server-Sent Event*) pour faire du *push* serveur et récupérer le flux des mises à jour des votes.

Comme nous n'avons pas vu les appels à un service web (via la bibliothèque JavaScript *Axios*), nous allons focaliser notre présentation du *hook* `created` sur le code du composant *ResultPolldle* sans forcément le détailler.

* Éditer le fichier *ResultPolldle.vue* en remplaçant le commentaire `// Use created hook to initialize EventSource object` par le code présenté ci-dessous.

```javascript
<script setup>
...
const question = ref('')
const state = ref(null)
const errorMessage = ref('')
const options = ref(chartOptions)

// Use created hook to initialize EventSource object
let source = new EventSource('http://127.0.0.1:9991' +
    '/polldles/1' +
    '/votes/sse'
)

source.addEventListener(
  'update-polldleresult',
  (e) => {
    var result = JSON.parse(e.data)
    question.value = capitalizeFirstLetter(result.question)

    let total = result.results
      .map((val) => val.counter)
      .reduce((partial_sum, a) => partial_sum + a)

    if (total > 0) {
      state.value = stateResult.RESULT
    } else {
      state.value = stateResult.EMPTY
    }

    options.value.series[0].data = result.results.map((val) => ({
      name: val.name,
      y: val.counter
    }))
  },
  false
)

source.onerror = () => {
  state.value = stateResult.ERROR
  errorMessage.value = 'Problem to retrieve Polldle result.'
}
...
</script>
<template>
...
</template>

```

Le code présenté permet d'initialiser un objet `EventSource` utilisé pour faire du *Server-Sent Event*. La première partie initialise l'objet `EventSource`. La deuxième partie traite les nouvelles données envoyées par le serveur et transforme les données pour les proposer au modèle du composant *Highcharts*. La troisième partie est une fonction qui s'occupera de traiter les erreurs. On aperçoit dans ce code que seules les propriétés du composant sont impactées ce qui est cohérent à l'utilité du scope de l'étape `created`.

> Si vous désirez des informations supplémentaires sur <i>Server-Sent Event</i>, une technique pour faire du push serveur via une communication unidirectionnelle, nous vous recommandons deux supports de cours : [Streaming HTTP : savoir communiquer via des flux](https://speakerdeck.com/mickaelbaron/streaming-http-savoir-communiquer-via-des-flux) et [Streaming HTTP : mise en œuvre avec le langage Java](https://speakerdeck.com/mickaelbaron/streaming-http-mise-en-oeuvre-avec-le-langage-java).

#### Étape beforeMount et mounted

L'étape `mounted` est celle qui vient juste après le premier rendu du *template*. Au niveau de cette étape, le DOM virtuel est construit et des modifications peuvent être réalisées. Pour accéder au DOM HTML, il est possible d'utiliser la communication par référence que nous avons mise en place précédemment. 

* Éditer le fichier *CreatePolldle.vue* en remplaçant le commentaire `// Use onBeforeMount and onMounted hooks to log the text content of the DOM` par le code présenté dans les *hooks* `onBeforeMount` et `onMounted`. Déclarer également les mots clés `onMounted` et `onBeforeMount` dans l'instruction `import`.

```javascript
<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeMount } from 'vue'
...
onBeforeMount(() => {
  console.log('onBeforeMount:' + el.value)
})

onMounted(() => {
  console.log('onMounted:' + el.value.innerHTML)
})
...
</script>
<template>
  ...
</template>
```

Lors de l'exécution des *hooks* `onBeforeMount` et `onMounted`, le résultat suivant sera affiché dans la console du développeur.

```console
onBeforeMount:undefined CreatePolldle.vue:33:11
onMounted:<!-- Titre + description --><h1>PollDLE</h1><h2>Voting done simply in real-time</h2><!-- PollDLE name --><div class="row"><div class="col"><!-- Directive v-model with question --><input type="text" class="large-input mx-auto d-block" placeholder="Add your question here"></div></div><h3>Add your PollDLE options</h3><div class="row"><div class="col"><!-- Directive v-model with newPolldleOptionText --><!-- Directive v-on with addPolldleOption --><input type="text" placeholder="Polldle Option" class="large-input mx-auto d-block"></div></div><!-- Directive v-show with buttonShown --><div class="row" style="display: none;"><div class="col"><!-- Directive v-on with clearAllPolldleOptions --><button type="button" class="clear-button btn-lg btn-danger mx-auto d-block"> Clear all PollDLE Options </button></div></div><!-- PollDLE option --><!-- Directive v-for with polldleOptions --><!-- Button Action --><!-- Directive v-bind with isCreatePolldleDisabled() --><div class="row"><div class="col"><!-- Directive v-on with createPolldle --><button type="button" class="validate-button btn-lg btn-primary mx-auto d-block" disabled=""> Create PollDLE </button></div></div><div class="alert alert-primary" role="alert"><h4 class="alert-heading">Summary of your PollDLE</h4><hr><p> The question is: <strong>Aimez-vous les frites ?</strong></p><!-- Mustache with computed property: listSize --><p>Number of PollDLE options: 0</p></div><!-- Directive v-text with errorMessage --><!-- Directive v-show with errorMessage --><div class="error-message alert alert-danger" role="alert" style="display: none;"></div>
```

Le *hook* `onBeforeMount` ne peut afficher le contenu du DOM HTML puisque celui-ci n'est pas encore construit.

## Invocation de service REST

> Nous vous invitons à vous positionner dans le répertoire *polldle-vue-13* pour profiter des codes qui vont illustrer cette section. Pensez à faire `$ npm install` pour installer les modules et `$ npm run dev` pour démarrer l'exécution en mode développement.

Nous traitons dans cette section de la communication entre la couche web développée avec [Vue.js](https://vuejs.org/) et la couche serveur développée avec le langage Java. Nous avons déjà évoqué cela en montrant l'utilisation de l'objet `EventSource` pour faire du *push* serveur et récupérer le flux des mises à jour des votes. Nous avions alors montré que le code produit ne concernait pas des concepts [Vue.js](https://vuejs.org/), mais JavaScript. Il en est de même pour l'invocation de service web REST. 

Dans la suite, nous allons montrer deux façons pour invoquer un service web REST. La première est d'utiliser l'API JavaScript [fetch](https://fetch.spec.whatwg.org/). La seconde est d'utiliser la bibliothèque [AXIOS](https://github.com/axios/axios).

Dans notre exemple, l'API [fetch](https://fetch.spec.whatwg.org/) sera utilisée pour créer un nouveau PollDLE depuis le composant *CreatePolldle*, tandis que la bibliothèque [AXIOS](https://github.com/axios/axios) sera utilisée dans le composant *VotePolldle*. L'objectif est de vous montrer comment intégrer cette API et cette bibliothèque dans un code [Vue.js](https://vuejs.org/).

### Documentation de l'API REST

Nous présentons dans cette section, un détail de l'API REST de notre exemple afin de nous familiariser avec les différents services que nous allons appeler.

Deux ressources sont identifiées : un **PollDLE** et un **Vote**.

Le format des objets pour l'envoi et la réception sera du JSON pour toutes les méthodes (excepté celle qui s'occupera de l'initialisation du Server-Sent Event).

#### PollDLE

* Création d'un PollDLE
  * POST `/polldles`
  * Entrée : `Polldle`
  * Sortie : `Polldle` (avec l'identifiant renseigné)

* Retrouver un PollDLE par son identifiant
  * GET `/polldles/{PATH_URL}`
  * Entrée : PATH_URL (pathParam) (identifiant du PollDLE)
  * Sortie : Polldle

#### Vote

La ressource **Vote** est une sous-ressource de **PollDLE**.

* Création d'un vote
  * POST `/polldles/{PATH_URL}/votes` (identifiant du PollDLE)
  * Entrée : `PolldleVote`
  * Sortie : Cookie

* Lister tous les votes d'un PollDLE
  * GET `/polldles/{PATH_URL}/votes`
  * Entrée : -
  * Sortie : `PolldleResult`

* Initialisation du flux (Server-Sent Event) pour la mise à jour des votes
  * GET `/polldles/{PATH_URL}/votes/sse`
  * Format : `text/event-stream`

#### Compiler et exécuter le code serveur

L'objectif de cette section est de montrer comment compiler et exécuter le code serveur développé avec Java afin de pouvoir tester les appels aux services web REST depuis l'application web. Les prérequis logiciels pour continuer sont [Java 11](http://jdk.java.net/) et [Maven](https://maven.apache.org/).

* Ouvrir un nouveau terminal, se positionner à la racine du répertoire *polldle-backend* et exécuter la ligne de commande suivante pour compiler la couche serveur à partir de [Maven](https://maven.apache.org/). 

```console
$ mvn clean package
...
[INFO] ------------------------------------------------------------------------
[INFO] Reactor Summary for polldle-parent 0.4-SNAPSHOT:
[INFO]
[INFO] polldle-parent ..................................... SUCCESS [  0.124 s]
[INFO] poddle-api ......................................... SUCCESS [  1.506 s]
[INFO] polldle-server ..................................... SUCCESS [  6.614 s]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  8.372 s
[INFO] Finished at: 2022-07-19T18:41:57+02:00
[INFO] ------------------------------------------------------------------------
```

[Maven](https://maven.apache.org/) compilera le code source, exécutera les tests unitaires et préparera les binaires finals. Ces derniers, disponibles dans le répertoire *polldle-server/target* sont composés des dépendances (ensemble de fichiers au format .jar) et de fichiers au format *.class*.

* Initialiser la variable d'environnement `KUMULUZEE_SERVER_HTTP_PORT` pour modifier le port d'écoute du serveur.

```console
export KUMULUZEE_SERVER_HTTP_PORT=9991
```

* Saisir la ligne de commande suivante pour exécuter le serveur qui diffusera les services web REST.

```console
$ java -cp "polldle-server/target/dependency/*:polldle-server/target/classes" com.kumuluz.ee.EeApplication
...
2022-07-19 18:43:10.150 INFO -- com.kumuluz.ee.jetty.JettyFactory -- Starting KumuluzEE on port(s): 9991 [http/1.1]
...
2022-07-19 18:43:11.760 INFO -- com.kumuluz.ee.EeApplication -- KumuluzEE started successfully
```

Les services web REST sont désormais disponibles à cette adresse [http://0.0.0.0:9991](http://0.0.0.0:9991/).

### API Fetch

* Éditer le fichier *CreatePolldle.vue* en complétant la méthode `createPolldle()` par le code présenté ci-dessous (au niveau du commentaire `// Call REST web service with fetch API`).

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

  // Call REST web service with fetch API
  let request = new Request('http://127.0.0.1:9991' + '/polldles', {
    method: 'POST',
    body: JSON.stringify(polldleObject),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  fetch(request)
    .then((response) => {
      if (response.ok) {
        return response.json()
      } else {
        errorMessage.value = 'Problem to create a new Polldle.'
      }
    })
    .then((data) => {
      console.log(data.pathUrl)
    })
    .catch((error) => {
      console.error(error)

      errorMessage.value = 'Problem to create a new Polldle.'
    })
}
</script>
<template>
  ...
</template>

```

Lors de la création d'un objet `Request`, nous précisons, l'URL du serveur (qui sera remplacée par une variable d'environnement dans la partie 3), que la méthode HTTP utilisée sera du `POST`, que le corps est l'objet `polldleObject` et que le contenu sera au format JSON. Une première promesse retourne l'objet de la réponse si la requête envoyée au serveur s'est correctement déroulée. Une seconde promesse effectue le traitement de l'objet réponse, pour l'instant l'affichage de l'identifiant du Polldle. Dans la section routage, nous modifierons le traitement de la réponse pour rendre visible le composant *VotePolldle*.

> Une documentation exhaustive sur l'API Fetch est disponible à cette adresse : [https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

### AXIOS

[AXIOS](https://github.com/axios/axios) est une bibliothèque JavaScript non disponible par défaut dans un projet [Vue.js](https://vuejs.org/). Il faut donc l'intégrer dans le projet (*package.json*) et télécharger les dépendances.

* Saisir la ligne de commande suivante `$ npm install axios` pour ajouter la bibliothèque [AXIOS](https://github.com/axios/axios) et compléter automatiquement le fichier *package.json*. 

Ci-dessous est présenté une partie du contenu du fichier *package.json* suite à l'ajout de la bibliothèque [AXIOS](https://github.com/axios/axios).

```javascript
{
  ...
  "dependencies": {
    "axios": "^0.27.2",
    "highcharts-vue": "^1.4.0",
    "vue": "^3.2.37"
  },
  ...
}
```

* Éditer ensuite le fichier *VotePolldle.vue* pour ajouter la dépendance de la bibliothèque JavaScript [AXIOS](https://github.com/axios/axios) au composant *VotePolldle* (remplacer le commentaire `// Import AXIOS JavaScript library` par le code présenté ci-dessous). 

```javascript
<script setup>
...
// Import AXIOS JavaScript library
import axios from 'axios';
...
</script>
<template>
  ...
</template>
```

* Compléter le fichier *VotePolldle.vue* au niveau de la partie `<script setup>` en remplaçant le commentaire `// To retrieve PollDLE information from REST web service` par le code présenté ci-dessous.

```javascript
<script setup>
...
// To retrieve PollDLE information from REST web service
axios
  .get('http://127.0.0.1:9991/polldles/1')
  .then((response) => {
    if (response.status === 200) {
      polldle.question = response.data.question
      polldle.polldleOptions = response.data.polldleOptions

      state.value = stateResult.WAITING_VOTE
    } else {
      errorMessage.value = 'Polldle can not be loaded.'
      state.value = stateResult.ERROR
    }
  })
  .catch((error) => {
    console.error(error)

    errorMessage.value = 'Polldle can not be loaded.'
    state.value = stateResult.ERROR
  })
</script>
<template>
  ...
</template>
```

Ce code fait donc un appel au service web REST dédié à la récupération des informations d'un PollDLE.

* Enfin, compléter le fichier *VotePolldle.vue* au niveau de la function `vote()` en remplaçant le commentaire `// To vote for a PollDLE from REST web service` par le code présenté ci-dessous.

```javascript
<script setup>
...
function vote() {
  if (!isWaitingVoteState()) {
    return
  }

  // To vote for a PollDLE from REST web service
  axios({
    method: 'post',
    baseURL: 'http://127.0.0.1:9991/polldles/1/votes',
    data: JSON.stringify({
      polldleOptionResponses: [polldle.polldleOptionResponses]
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((response) => {
      if (response.status === 200) {
        console.log('Voted!')
      } else if (response.status === 204) {
        state.value = stateResult.VOTE_ERROR
        errorMessage.value = 'Already voted!'
      }
    })
    .catch((error) => {
      console.error(error)

      state.value = stateResult.VOTE_ERROR
      errorMessage.value = 'Problem to vote for this Polldle.'
    })
}
</script>
```

Le code ajouté permet d'invoquer le service web REST dédié au vote (création d'une ressource **Vote**).

## Routage avec Vue.js

> Nous vous invitons à vous positionner dans le répertoire *polldle-vue-14* pour profiter des codes qui vont illustrer cette section. Pensez à faire `$ npm install` pour installer les modules et `$ npm run dev` pour démarrer l'exécution en mode développement.

Cette dernière section s'intéresse au routage de notre application *Single-Page application*. En fonction de l'état de l'URL, nous allons pouvoir choisir quel sera le composant à afficher.

* / : la création d'un PollDLE (afficher le composant *CreatePolldle*) ;
* /{id} : le vote d'un PollDLE ou `{id}` désigne l'identifiant du PollDLE (afficher le composant *VotePolldle*);
* /{id}/result : le résultat des votes d'un PollDLE ou `{id}` désigne l'identifiant du PollDLE (afficher le composant *ResultPolldle*).

[Vue.js](https://vuejs.org/) propose un module appelé [Vue-Router](https://github.com/vuejs/vue-router) qui offre un mécanisme de gestion du routage. [Vue-Router](https://github.com/vuejs/vue-router) s'appuie sur un fichier de routage pour établir les différentes règles qui permettent de passer d'un composant à un autre en fonction de la valeur de l'URL.

### Initialisation et activation du routage

* Saisir la ligne de commande suivante `$ npm install vue-router` pour ajouter le module [Vue-Router](https://github.com/vuejs/vue-router) et compléter automatiquement le fichier *package.json*. 

Ci-dessous est présenté une partie du contenu du fichier *package.json* suite à l'ajout de la bibliothèque [Vue-Router](https://github.com/vuejs/vue-router).

```javascript
{
  ...
  "dependencies": {
    "axios": "^0.27.2",
    "highcharts-vue": "^1.4.0",
    "vue": "^3.2.37",
    "vue-router": "^4.1.2"
  },
  ...
}
```

* Créer un dossier *router* à la racine du dossier *src* puis ajouter un fichier *index.js* en recopiant le code ci-dessous.

```javascript
import { createRouter, createWebHistory } from 'vue-router'

import CreatePolldle from '../components/CreatePolldle.vue'
import VotePolldle from '../components/VotePolldle.vue'
import ResultPolldle from '../components/ResultPolldle.vue'

const router = createRouter({
  // Règles de routage seront complétées dans la section suivante
})
```

Ce fichier *index.js* contrôle le routage de l'application. Les composants développés précédemment sont importés pour être utilisés dans les règles de routage (voir dans la section suivante). 

* Éditer le fichier *App.vue* afin de déléguer au routage le choix du composant en remplaçant le commentaire `<!-- Add RouterView component -->` par le code présenté ci-dessous.

```javascript
<script setup>
import FooterPolldle from './components/FooterPolldle.vue'
// Import RouterView component
import { RouterView } from 'vue-router'
</script>

<template>
  <!-- Add RouterView component -->
  <RouterView />
  <FooterPolldle />
</template>
```

Contrairement à la version précédente du fichier *App.vue*, le composant *CreatePolldle* ne sera pas explicitement utilisé. Cela sera le rôle du composant de routage disponible via la balise `<RouterView />`.

* Éditer le fichier *main.js* en remplaçant les commentaires `// Import routing configuration` et `// Enable routing` par le code présenté ci-dessous.

```javascript
import { createApp } from 'vue'
import App from './App.vue'
// Import routing configuration
import router from './router'
import './assets/polldle.css'

const app = createApp(App)

// Global Registration of CreatePolldleOption component
//import CreatePolldleOption from './components/CreatePolldleOption.vue'
//app.component('CreatePolldleOption', CreatePolldleOption)

// Enable routing
app.use(router)

app.mount('#app')
```

Le code ajouté permettra d'utiliser le système de routage dans l'application complète.

### Création de la table de routage

Le composant routage est désormais configuré et activé. Nous allons détailler comment définir des règles de routage.

* Éditer le fichier *router/index.js* en complétant par le code présenté dans l'objet `Router`.

```javascript
import { createRouter, createWebHistory } from 'vue-router'

import CreatePolldle from '../components/CreatePolldle.vue'
import VotePolldle from '../components/VotePolldle.vue'
import ResultPolldle from '../components/ResultPolldle.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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

export default router

```

Trois règles de routage ont été définies dans `routes` correspondant aux besoins exprimés en début de section. Pour chaque élément d'une route, trois propriétés sont utilisées : `path`, `name` et `component`. La valeur proposée dans la propriété `path` correspond à un *pattern* qui doit être satisfait pour activer une route. Si la route est activée alors c'est le composant donné par la propriété `component` qui sera retourné. À titre d'exemple, pour la règle de routage définie par `path: '/:pathurl/result`, si elle est active (*/123/result*), c'est le rendu du composant *ResultPolldle* qui sera intégré à la place de la balise `<RouterView>` du fichier *App.vue*.

L'option `mode: 'history'` permet d'utiliser l'API `history.pushState` et les URL ressembleront à cela [http://localhost:8080/3/result](http://localhost:8080/3/result). Dans le cas contraire, le mode par défaut de *vue-router* est le mode *hash* qui utilise la partie hash de l'URL pour simuler une URL complète. Les URL ressembleraient à cela [http://localhost:8080/#/4/result](http://localhost:8080/#/4/result). L'utilisation du mode `history` aura un impact pour le déploiement de l'application puisque, quelle que soit l'URL utilisée, un code d'erreur 404 sera retourné. Nous reviendrons sur cet aspect dans la dernière partie de cet article.

### Forcer le changement de route

À cet instant si vous testez l'application, vous ne pourrez changer l'affichage de l'application que par l'intermédiaire de la barre d'adresse. Nous aimerions activer une route quand une opération se termine. Par exemple, à la fin de la création d'un PollDLE, nous aimerions voter (composant *VotePolldle*) ou, à la fin d'un vote, nous aimerions visualiser les résultats des votes (*ResultPolldle*). Nous allons utiliser programmatiquement le mécanisme de navigation.

* Éditer le fichier *CreatePolldle.vue* en remplaçant les commentaires `// Import useRouter`, `// Declare useRouter object` et `// Programmatic navigation to display VotePolldle component` par le code présenté ci-dessous.

```javascript
<script setup>
...
// Import useRouter
import { useRouter } from 'vue-router'
...
// Declare useRouter object
const router = useRouter()
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

  // Call REST web service with fetch API
  let request = new Request('http://127.0.0.1:9991' + '/polldles', {
    method: 'POST',
    body: JSON.stringify(polldleObject),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  fetch(request)
    .then((response) => {
      if (response.ok) {
        return response.json()
      } else {
        errorMessage.value = 'Problem to create a new Polldle.'
      }
    })
    .then((data) => {
      console.log(data.pathUrl)
      // Programmatic navigation to display VotePolldle component
      router.push({
        name: 'VotePolldle',
        params: { pathurl: data.pathUrl }
      })
    })
    .catch((error) => {
      console.error(error)

      errorMessage.value = 'Problem to create a new Polldle.'
    })
}
</script>
<template>
  ...
</template>
```

Lors de la réception de la réponse du service web REST, une nouvelle entrée est ajoutée dans la pile de l'historique `router.push`. Le nom de la règle de routage est transmis `name: "VotePolldle"` ainsi que l'identifiant du PollDLE nouvellement créé `pathurl: data.pathUrl` (par exemple `3`). *vue-router* va donc rechercher une règle portant ce nom et l'activer. Dans ce cas, c'est la règle permettant de retourner le composant `VotePolldle` qui sera déclenchée.

* Éditer le fichier *VotePolldle.vue* en remplaçant les commentaires `// Import useRouter and useRoute`, `// Declare useRouter and userRoute objects` et `// Programmatic navigation to display ResultPolldle component` par le code ci-dessous.

```javascript
<script setup>
...
// Import useRouter and useRoute
import { useRouter, useRoute } from 'vue-router'
...
// Declare useRouter and userRoute objects
const router = useRouter()
const route = useRoute()

const url = 'http://127.0.0.1:9991' + '/polldles/' + route.params.pathurl

// To retrieve PollDLE information from REST web service
axios
  .get(url)
  .then((response) => {
    if (response.status === 200) {
      polldle.question = response.data.question
      polldle.polldleOptions = response.data.polldleOptions

      state.value = stateResult.WAITING_VOTE
    } else {
      errorMessage.value = 'Polldle can not be loaded.'
      state.value = stateResult.ERROR
    }
  })
  .catch((error) => {
    console.error(error)

    errorMessage.value = 'Polldle can not be loaded.'
    state.value = stateResult.ERROR
  })

function vote() {
  if (!isWaitingVoteState()) {
    return
  }

  // To vote for a PollDLE from REST web service
  axios({
    method: 'post',
    baseURL: url + '/votes,
    data: JSON.stringify({
      polldleOptionResponses: [polldle.polldleOptionResponses]
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((response) => {
      if (response.status === 200) {
        console.log('Voted!')

        // Programmatic navigation to display ResultPolldle component
        router.push({
          name: 'ResultPolldle',
          params: { pathurl: route.params.pathurl }
        })
      } else if (response.status === 204) {
        state.value = stateResult.VOTE_ERROR
        errorMessage.value = 'Already voted!'
      }
    })
    .catch((error) => {
      console.error(error)

      state.value = stateResult.VOTE_ERROR
      errorMessage.value = 'Problem to vote for this Polldle.'
    })
}
...
</script>
<template>
  ...
</template>
```

Le même code est obtenu que pour le composant *CreatePolldle.vue*. L'accès à la route actuelle est réalisé par `route.params.pathurl`. Ainsi l'objet `router` sera utilisé pour le changement de route et l'objet `route` sera utilisé pour connaître l'état de la route actuelle. À noter que le paramètre transmis `params: { pathurl: route.params.pathurl }` n'est pas issu de la réponse, mais de la valeur de la route courante. Veuillez noter également le changement pour transmettre l'URL du service web REST. Une constante `url` a été déclarée et utilise la valeur de la route actuelle.

## Conclusion et remerciements

Cette deuxième partie a présenté les principaux concepts de [Vue.js](https://vuejs.org/) au travers d'un exemple complet *PollDLE*. La solution de toutes les étapes décrites dans cette deuxième partie est disponible dans le répertoire *polldle-vue-15* qui sera le point de départ pour le prochain article.

Dans le prochain article, nous nous intéresserons à la problématique de déploiement d'une application [Vue.js](https://vuejs.org/) via l'utilisation de [Docker](https://www.docker.com/).

## Ressources

* [Découvrez ou approfondissez votre connaissance de Vue 3](https://ninja-squad.fr/projects#Vue) : un livre avec des exercices régulièrement mis à jour.
* [Introduction au framework Vue.js par l'exemple](https://tahe.developpez.com/tutoriels-cours/vuejs/) : un TP complet sur Vue.js proposé par Serge Tahé.
* [Vue.js Tutorials From The Official Vue Docs](https://scrimba.com/playlist/pXKqta) : des tutoriels basés sur des exemples de la documentation officielle (Vue.js 2). 
* [The Vue.js Cheat Sheet](https://flaviocopes.com/vue-cheat-sheet/) : un aide mémoire sur [Vue.js](https://vuejs.org/). 
* [Workshop Materials for my Introduction to Vue.js Workshop](https://github.com/sdras/intro-to-vue) : un dépôt Github contenant des exemples pratiques. 
* [Programmation : Conventions de nommage et d’écriture de code](https://wprock.fr/blog/conventions-nommage-programmation/) : un article sur les différentes conventions de nommage. 
* [Creating Vue.js Component Instances Programmatically](https://css-tricks.com/creating-vue-js-component-instances-programmatically/) : un article qui explique comment créer un composant programmatiquement. 
