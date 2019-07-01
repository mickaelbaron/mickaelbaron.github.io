---
title: 'Développer une application web avec Vue.js et Vue CLI, présentation des généralités (partie 1)'
tags: [Java]
direct_link:
image: /images/vuejs.jpg
description: Cette première partie s'intéresse à présenter les principaux concepts qu'un framework web JavaScript nouvelle génération doit proposer et comment ils ont été intégrés dans Vue.js.
category: Article
date: 2019-07-01
weight: 1
toc: true
---

L'objectif de cet article en plusieurs parties est de vous présenter le framework web JavaScript [Vue.js](https://vuejs.org/) en se focalisant sur les principaux concepts au travers d'un exemple unique.

Les différentes parties de cet article sont détaillées ci-dessous :

* [Généralités sur les frameworks web JavaScript et présentation de Vue.js](https://mbaron.developpez.com/tutoriels/vuejs/developper-application-web-vuejs-vuecli-generalites) ; 
* mise en œuvre des concepts de Vue.js ; 
* déploiement d'une application web développée avec Vue.js. 

Lors de l'écriture de l'article, nous avons utilisé la version 2 de [Vue.js](https://vuejs.org/) et la version 3 de [Vue CLI](https://cli.vuejs.org/).

Cette première partie s'intéresse donc à présenter les principaux concepts qu'un framework web JavaScript nouvelle génération doit proposer et comment ils ont été intégrés dans [Vue.js](https://vuejs.org/).

Le plan est le suivant :

* présentation des frameworks web JavaScript (en général) afin de connaître les principales fonctionnalités qu'ils doivent fournir à un développeur ;
* présentation des grandes lignes du framework web [Vue.js](https://vuejs.org/) ; 
* présentation des prérequis logiciels pour développer avec [Vue.js](https://vuejs.org/). 

Pour réagir au contenu de cet article, un espace de dialogue vous est proposé sur le forum [forumdvp][1986169].

## Un framework web JavaScript, c'est quoi ?

Le développement d'applications web a connu trois évolutions majeures. Ces évolutions ont vu naître différentes technologies comme le montre la figure ci-dessous (source figure : [https://twitter.com/lofidewanto/...](https://twitter.com/lofidewanto/status/1128981965632364544)).

![Historique des frameworks web](/images/vuejs-generalites-part1/webframeworkhistory.jpg)

> La suite de ces propos est issue d'une réflexion et de vécus personnels. Des raccourcis peuvent avoir été réalisés, n'hésitez pas à nous signaler toutes incohérences.

La première période se situe depuis la naissance du web jusqu'au milieu des années 2000. Il s'agissait de développer des applications classiques présentant des documents et des formulaires. Les technologies clientes utilisées se limitaient souvent au langage HTML et pour la fin de la période à l'utilisation de feuilles de style avec CSS.

La deuxième période se situe entre 2005 et 2010. Cette période se distingue par l'arrivée des applications web riches (RIA : Rich Internet Application). La couche logique a été grandement déportée vers le serveur (grâce à la popularisation du langage côté serveur PHP). C'est aussi pendant cette période que le développement d'AJAX est apparu avec le style d'architecture REST (services web). De cette période, la technologie la plus utilisée a été la bibliothèque JQuery. Cette bibliothèque a facilité la manipulation de la partie de la structure HTML afin d'obtenir des applications qui réagissaient sans avoir à rafraichir l'intégralité d'une page complète. Malheureusement, c'est aussi à cette période que le nombre de navigateurs a explosé. Le développement était donc un peu chaotique, car il fallait supporter toutes les subtilités des navigateurs qui ne se conformaient pas forcément aux standards existants. Des initiatives via des bibliothèques comme GWT sont apparues pour tenter de résoudre ce problème, mais cela restait quand même du bricolage.

La troisième période se situe après 2010 jusqu'à nos jours. Nous sommes passés du terme applications web riches à applications web monopage (plus connu, en anglais sous le nom de SPA pour Single-Page application). Il s'agit désormais d'une application web où tout est accessible sur une page web unique afin de rendre l'expérience utilisateur la plus fluide possible. Pour obtenir ce résultat soit tout le contenu est chargé en avance soit à la demande, mais en tâche de fond. Il y a eu aussi un déport important de la logique vers le client afin de libérer des ressources côté serveur. Les effets de bord à ce transfert de code côté client a naturellement obligé les développeurs à structurer leur code et de facto à utiliser des outils adaptés (Grunt, Gulp, Yeoman, Webpack) pour réaliser des opérations sur cette masse de code (compilation, qualité de code, minification…). C'est ainsi que des frameworks web JavaScript sont apparus.

Les frameworks JavaScript du marché sont les suivants (sans être exhaustifs) :

* [Angular](https://angular.io/) ;
* [React.js](https://angular.io/) ;
* [Vue.js](https://vuejs.org/) ;
* [Meteo.js](https://www.meteor.com/) ;
* [Ember.js](https://www.emberjs.com/) ;
* [Backbone.js](http://backbonejs.org/) ;
* [Knockout](https://knockoutjs.com/).

Après analyse rapide des différents frameworks ci-dessus, quatre fonctionnalités que doit posséder un framework web JavaScript de nos jours ont été identifiées. Détaillons dans la suite ces quatre fonctionnalités.

### Liaison entre le modèle et la vue : binding

La plupart des frameworks web JavaScript implémentent le modèle d'architecture MVVM (pour *Movel-View-ViewModel*) qui est une déclinaison du très populaire modèle d'architecture MVC (*Model-View-Controler*). Sur le modèle d'architecture MVVM, la partie contrôleur a été supprimée afin de rapprocher les parties vue et modèle. Ainsi, la nouvelle partie *ViewModel* permet de consommer les éléments du modèle et de les afficher dans la partie vue et inversement (mettre à jour le modèle à partir de la vue). C'est donc dans la partie *ViewModel* que cette notion de *binding* se retrouve.

Pour résumer le *binding*, il s'agit d'un mécanisme qui permet de lier des objets de manière dynamique. Si deux objets `obj1` et `obj2` sont liés par un *binding*, le fait de modifier `obj1` va automatiquement modifier `obj2` et inversement.

À titre d'exemple, `obj1` est un champ de texte et `obj2` une propriété du modèle de type chaîne de caractères, si une valeur est saisie dans le champ de texte, `obj2` récupérera automatiquement cette valeur. Par ailleurs, si `obj2` est modifié par la récupération d'un appel à un service web, le champ de texte identifié par `obj1` sera mis à jour.

### Templating

L'utilisation de *template* permet d'enrichir le code HTML d'informations supplémentaires afin de faciliter par exemple la mise en place du *binding*.

Deux types d'informations supplémentaires sont disponibles pour le développeur.

La première concerne les **interpolations** qui se présentent sous la forme d'une notation *mustache* `{% raw %}{{ }}{% endraw %}`. À l'intérieur de cette notation moustache, une expression qui peut-être du texte, des propriétés du modèle et même des expressions JavaScript. Dans l'exemple ci-dessous, `question` désigne une propriété du modèle.

```html
{% raw %}{{ }}{% endraw %}
```

La seconde concerne les **directives** qui sont des attributs supplémentaires aux balises HTML. Dans le code ci-dessous, les directives `v-model` et `@keypress.enter` sont présentées.

```html
<input
  type="text"
  placeholder="Polldle Option"
  v-model="newPolldleOptionText"
  class="large-input mx-auto d-block"
  @keypress.enter="addPolldleOption"
>
```

### Composant

Les frameworks web JavaScript offrent la possibilité de créer des composants réutilisables au sein de son application ou via d'autres applications. Ils permettent de construire une hiérarchisation des composants en désignant un parent et des enfants. Ainsi, la construction de l'interface graphique devient structurée et elle est calquée sur le modèle des interfaces graphiques que nous développions pour les applications bureau (du moins pour mon cas personnel).

Certains frameworks web JavaScript permettent de construire des composants respectant la spécification [Web Components](https://www.w3.org/TR/components-intro/) en cours de normalisation par le W3C.

### Routage

Les applications de type *Single-Page application* partent du principe qu'il n'y a qu'une seule page à télécharger et que le changement s'opère à l'intérieur de cette page. Toutefois, l'URL (qui est contenue dans la barre d'adresse) doit pouvoir évoluer afin de préciser l'état de l'application. Avec cet état, il est possible de gérer le changement des composants à afficher et l'historique de l'application.

Les frameworks web JavaScript offrent ce mécanisme en interceptant le changement de valeur dans l'URL, en récupérant d'éventuels paramètres (paramètres de chemin et de requêtes) et de réaliser une opération spécifique.

## Présentation du framework web Vue.js

De nos jours pour développer des applications web, le choix du framework se limite souvent à [Angular](https://angular.io/) ou [React.js](https://angular.io/). C'est un raccourci rapide, mais c'est une réalité du marché, il n'y a qu'à voir les offres d'emploi ou les conférences autour de [Angular](https://angular.io/) et [React.js](https://angular.io/). Et pourtant, il existe de nombreux frameworks de très bonne qualité, et [Vue.js](https://vuejs.org/) en fait partie.

[Vue.js](https://vuejs.org/) est un framework JavaScript pour le développement d'interfaces web. La première version a été publiée en 2014 par Evan You, un ancien de chez Google. Dans la suite de cette section, nous allons montrer ce que peut apporter ou pas [Vue.js](https://vuejs.org/) face à ces deux ténors du marché.

### Facilité d'apprentissage

La plupart des développeurs de sites web connaissent au moins les trois technologies suivantes : HTML, CSS et JavaScript. L'avantage de [Vue.js](https://vuejs.org/) est de se limiter à ces technologies et il n'est pas nécessaire de monter en compétence sur un nouveau langage comme pourrait l'être [React.js](https://angular.io/) avec le langage JSX. Même si JSX est similaire à HTML, il incombe aux développeurs de se familiariser avec ce nouveau langage.



```html
<div id="editor">
  <textarea :value="input" @input="update"></textarea>
  <div v-html="compiledMarkdown"></div>
</div>
```

Comme montré sur le code ci-dessus, [Vue.js](https://vuejs.org/) réutilise les balises HTML classiques en ajoutant de nouvelles façons d'enrichir le code (`:value`, `@input` et `v-html`).

### Approche par composant

[Vue.js](https://vuejs.org/) est un framework qui permet de construire son application par un assemblage de plusieurs composants. Ce composant permet de créer de nouvelles balises HTML avec un comportement spécifique. La finalité est de pouvoir facilement réutiliser un composant.

Pour définir un composant, un fichier portant l'extension *.vue* doit être défini. Ce fichier se décompose en trois parties distinctes.

Ci-dessous le code source du fichier *helloworld.vue* ( [source](https://vuejs.org/v2/guide/single-file-components.html)).



```html
<template>
    <p>{% raw %}{{ greeting }}{% endraw %} World!</p>
</template>
<script>
  module.exports = {
    data() : {
      return {
        greeting: 'Hello'
      }
    }
  }
</script>

<style scoped>
p {
  front-size: 2em;
  text-align: center;
}
</style>
```

Les trois parties définissent le composant, à savoir :


* un template constitué de balises HTML qui définit la structure du composant ;
* un code JavaScript qui détermine le comportement du composant ;
* des styles CSS qui définissent l’apparence du composant.

Pour utiliser ce composant *hellowolrd* depuis un autre composant, nous l'utilisons comme une simple balise HTML ayant pour identifiant le nom du fichier *.vue*.



```html
<template>
  <helloworld/>
</template>
...
```

### DOM Virtuel

Pour rappel le DOM (Document Object Model) est un objet représentant un document HTML et une API pour manipuler cet objet. Dans le cas d'une modification sur le DOM (par exemple ajouter une entrée `<li>...</li>` à une liste `<ul>`), il sera nécessaire d'utiliser l'API pour trouver l'élément `<ul>`, créer un nouvel élément `<li>...</li>`, ajouter cet élément à l'élément liste `<ul>` et effectuer la mise à jour du DOM. Comme on peut le comprendre, cela est très couteux et historiquement cette API n'était pas taillée pour gérer de nombreuses modifications qui peuvent intervenir fréquemment (toutes les secondes). Pour cette raison entre autres, le DOM virtuel a été mis en place.

La notion de DOM virtuel a été popularisée par [React.js](https://angular.io/). Il s'agit d'une copie du DOM original. Les modifications apportées sur cette copie peuvent être réalisées sans passer par le DOM et surtout sans utiliser l'API initiale. Ainsi, l'intérêt d'un DOM virtuel est de pouvoir faciliter la mise à jour du rendu de la vue sur des fréquences plus élevées.

### Popularité et communauté

Vous trouverez ci-dessous quelques statistiques concernant les trois frameworks et bibliothèques les plus répandus. Le site [stackshare.io](https://stackshare.io/) a permis d'obtenir les informations pour la colonne *Emplois*.

|  Framework  |  GitHub Stars  |  GitHub Forks  |  Emplois  |
+============+=================+================+===========+
|   Angular   |     46,316     |     12,168     |   4870    |
|   React.js  |    124,921     |     22,701     |   9080    |
|   Vue.js    |    131,609     |     18,786     |    548    |

Comme vous pouvez le constater, Vue.js se positionne bien au niveau popularité Github par rapport à [Angular](https://angular.io/) ou [React.js](https://angular.io/). Pour [Angular](https://angular.io/), cela s'explique puisqu'une première version sous le nom de [Angular.js](https://angularjs.org/) est aussi disponible, toujours en développement et en production. Par contre côté offres d'emploi, [Vue.js](https://vuejs.org/) est largement en dessous.

Au niveau des entreprises qui utilisent [Vue.js](https://vuejs.org/), voici une liste non exhaustive de grandes entreprises : Netflix, Adobe, Xiaomi, Alibaba, WizzAir, EuroNews, Grammarly, Laracasts, GitLab. Vous pourrez trouver sur ce [site](https://www.netguru.com/blog/13-top-companies-that-have-trusted-vue.js-examples-of-applications) un complément des entreprises qui utilisent cette bibliothèque.

Au niveau des ressources pour l'apprentissage de [Vue.js](https://vuejs.org/), nous avons constaté qu'elles étaient moins nombreuses que pour [Angular](https://angular.io/) ou [React.js](https://angular.io/). D'un autre côté, comme [Vue.js](https://vuejs.org/) est simple à comprendre et à prendre en main, a-t-on besoin d'autant de ressources ?

Enfin, le dernier concerne la disponibilité de bibliothèques externes (en gros des composants) qui permettent de faciliter le développement avec [Vue.js](https://vuejs.org/). C'est assez difficile à estimer. Vous trouverez sur ce lien ( [awesome-vue](https://github.com/vuejs/awesome-vue) des composants externes pour enrichir vos développements.

### Intégration progressive

Un des avantages de [Vue.js](https://vuejs.org/) est de pouvoir l'utiliser soit comme une bibliothèque pour s'intégrer dans un code existant soit comme un framework web JavaScript pour bâtir une application entièrement.

Dans le cas d'une utilisation de [Vue.js](https://vuejs.org/) comme une bibliothèque, cela vous permettra de profiter du *binding* modèle/vue dans une simple page HTML ou de pouvoir expérimenter rapidement dans un outil en ligne comme JSFiddle ou CodePen. Ci-dessous est présenté un code minimaliste pour utiliser [Vue.js](https://vuejs.org/) comme une bibliothèque.



```html
<html>
  <head>
    <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
  </head>

  <body>
    <div id="app">
      <span v-if="seen">Now you see me</span>
    </div>

    <script>
      Vue.config.devtools = true;
      var app = new Vue({
        el: '#app',
        data: {
          seen: true
        }
      })
    </script>
  </body>
</html>
```

Comme vous pouvez le remarquer, il suffira de déclarer dans la balise `head` l'URL de la version de distribution de [Vue.js](https://vuejs.org/) et d'initialiser un objet `Vue` dans la partie JavaScript. L'instruction `Vue.config.devtools = true;` permet de profiter de l'outil de débogage **Vue-DevTools**.

Dans le cas d'une utilisation comme un framework web JavaScript (ce qui nous intéresse dans cet article), le développeur se fera aider par l'outil en ligne de commande Vue CLI que nous présenterons dans la section suivante.

## Outillage et installation pour Vue.js

Avant de démarrer ce tutoriel, nous allons préparer notre environnement de développement en installant un ensemble d'outils.

Nous distinguons deux types d'outils : les **outils « classiques »** pour le développement web et les **outils spécifiques** pour le développement avec le framework Vue.js.

> Pour les expérimentations, nous avons utilisé un environnement de développement sous macOS et Windows. Tous les outils présentés ci-dessous sont disponibles sous Windows, macOS et Linux.

### Outils pour le développeur web

* [Chrome](https://www.google.com/chrome/) ou [Firefox](https://www.mozilla.org/fr/firefox/) : comme nous développons une application web, un navigateur sera nécessaire ; 
* [Visual Studio Code](https://code.visualstudio.com/) : un très bon éditeur de texte facilement modulable ;
* [npm](https://www.npmjs.com/) : l'outil ultime pour le développement avec JavaScript ; 
* [node.js](https://nodejs.org/en/) : le complément à npm pour fournir un serveur web ; 
* [Java](http://jdk.java.net/) : le langage qui sera utilisé pour le développement de l'exemple concernant la couche service côté backend ; 
* [Maven](https://maven.apache.org/) : pour faciliter la construction du projet Java ; 
* [Docker et Docker Compose](https://www.docker.com/) : pour tester le déploiement de l'exemple. 

Dans la liste ci-dessus, les trois derniers éléments (Java, Maven et Docker) ne sont pas obligatoires pour le développeur web. [Java](http://jdk.java.net/) et [Maven](https://maven.apache.org/) nous serviront pour la couche service web de l'exemple et [Docker et Docker Compose](https://www.docker.com/) seront utilisés pour le déploiement de ce même exemple.

### Outils pour le développeur Vue.js

* [Vetur](https://github.com/vuejs/vetur) : une extension pour développer avec [Vue.js](https://vuejs.org/) sous Visual Studio Code.
* [Vue-DevTools](https://github.com/vuejs/vue-devtools) : extension pour le navigateur web pour faciliter le débogage des applications [Vue.js](https://vuejs.org/).
* [Vue CLI](https://cli.vuejs.org/) : outillage standard pour développer avec [Vue.js](https://vuejs.org/).

#### Vetur

[Vetur](https://github.com/vuejs/vetur) est une extension pour Visual Studio Code. Elle permet d'ajouter de nombreuses fonctionnalités pour faciliter le développement. Voici quelques fonctionnalités que nous avons retenues :

* affichage d'aide contextuelle s'il y a un problème de syntaxe ;
* autocomplétion sur les directives, modèle d'un composant ;
* création de snippets avec une intégration de Emmet ;
* intégration avec ESLint pour afficher les erreurs JavaScript à ne pas commettre.

#### Vue-DevTools

[Vue-DevTools](https://github.com/vuejs/vue-devtools) est une extension pour les navigateurs web Chrome et Firefox pour faciliter le débogage des applications Vue.js. Cette extension va permettre d'introspecter les composants et afficher la liste des événements qui ont été émis par un composant.

L'installation est simple, il suffit de se rendre sur à l'adresse correspondante à votre navigateur web préféré :

* [Extension DevTools pour Chrome](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) ;
* [Extension DevTools pour Firefox](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/).

> Il existe également une version dite « standalone » basée sur Electron. Pour en savoir plus, se référer à cette [documentation](https://github.com/vuejs/vue-devtools/blob/master/shells/electron/README.md).

Cette extension permet de visualiser et de naviguer à travers les différents composants développés avec Vue.js. Nous illustrons cela sur la figure ci-dessous. Quand un composant est sélectionné depuis la partie gauche, les propriétés et les données de ce composant sont affichées sur la partie droite.

![Utilisation de DevTools pour afficher le contenu d'un composant Vue.js](/images/vuejs-generalites-part1/vue-devtools.jpg)

#### Vue CLI

[Vue CLI](https://cli.vuejs.org/) est un outil en ligne de commande pour faciliter la construction, le test et le déploiement de son application web. C'est un utilitaire de développement qui se place au-dessus de nombreux outils (webpack par exemple) pour rendre plus accessible le développement web avec [Vue.js](https://vuejs.org/).

La version 3 a été revue en profondeur avec :

* absence de fichier de configuration webpack, adieu donc le répertoire *config* contenant plein de fichiers **.js* ;
* intégration de plugins ;
* ajout d'une interface web de configuration.

Pour installer cet outil, suivre les instructions ci-dessous.

```console
npm install -g @vue/cli
npm install -g @vue/cli-service-global
```

Pour s'assurer que tout a été correctement installé.

```console
$ npm list -g --depth 0
/usr/local/lib
├── @vue/cli@3.8.2
├── @vue/cli-service-global@3.8.0
├── @vue/cli-init@3.8.0
├── vue-cli@2.9.6
└── ...
```

> Il est possible d'utiliser Vue CLI version 3 pour la version 2 de Vue.js. À ce moment-là, vous devriez avoir en plus les packages suivants : *vue-cli@x.y.z* et *@vue/cli-init@3.5.1*.

## Conclusion et remerciements

Cette partie a présenté les principaux concepts qu'un framework web JavaScript nouvelle génération doit proposer et comment ils ont été intégrés dans [Vue.js](https://vuejs.org/).

Dans la partie suivante, nous nous intéresserons à utiliser ces concepts dans [Vue.js](https://vuejs.org/) au travers d'un exemple.

Je tiens à remercier [Claude Leloup](https://www.developpez.net/forums/u124512/claudeleloup/) pour sa relecture orthographique.

## Ressources

* [Vue.js](https://vuejs.org/) : documentation officielle, traduite en plusieurs langues. 
* [Alligator](https://alligator.io/vuejs/) : Alligator est un très bon site pour trouver des astuces pour Vue.js.
* [Vue.js: Good, Bad, and Choice](https://hackernoon.com/vue-js-good-bad-and-choice-dcc1d27f82c6) : une bonne analyse sur Vue.js.
* [I created the exact same app in React and Vue. Here are the differences](https://medium.com/javascript-in-plain-english/i-created-the-exact-same-app-in-react-and-vue-here-are-the-differences-e9a1ae8077fd) : une même application développée avec Vue.js et React.js. 
* [State of Vue.js 2019](https://www.monterail.com/state-of-vuejs-report) : une analyse sur Vue.js.
* [Programmaon Web Avancée et Mobile - Bibliothèques et frameworks côté client](https://aurelient.github.io/mif13/2018/cours/cm2-frameworks.pdf) : un support de cours sur les frameworks web JavaScript.
* [Awesome Vue.js](https://github.com/vuejs/awesome-vue) : la page Awesome Github pour Vue.js.