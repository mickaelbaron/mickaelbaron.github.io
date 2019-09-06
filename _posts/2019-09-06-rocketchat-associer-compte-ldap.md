---
title: J'ai besoin de... associer un compte utilisateur Rocket.chat à un LDAP
tags: [Rocket.chat]
description: Dans ce billet, j'explique comment créer un compte utilisateur sous Rocket.chat et comment l'associer à postériori à LDAP.
category: technical
---

Au niveau de la structure où je travaille et après une forte demande des utilisateurs de disposer d'un outil de discussions à la [Slack](https://slack.com), j'ai fait une analyse des solutions gratuites et open source de discussion pour voir ce que je pouvais mettre en place. Après une étude des différentes solutions du marché, je suis arrivé au choix d'utiliser l'application [Rocket.chat](https://rocket.chat/).

[Rocket.chat](https://rocket.chat/) propose une version open source qui est déployable sur un serveur. Plusieurs points m'ont fait choisir [Rocket.chat](https://rocket.chat/) que je liste ci-dessous :

* forte communauté sur Github (24000 étoiles) ;
* clients mobiles ;
* facilité d'installation à partir de Docker ;
* interface utilisateur très agréable ;
* installable sur un serveur ;
* documentation détaillée.

L'installation de [Rocket.chat](https://rocket.chat/) est simple et je me suis basé sur cette page : <https://rocket.chat/docs/installation/docker-containers>. Je ne détaillerai pas cette partie puisque la documentation est très bien faite.

Je me suis toutefois heurté à un problème lors de la création des comptes utilisateurs. [Rocket.chat](https://rocket.chat/) permet de se connecter à un LDAP et de lancer un processus de création automatique de comptes utilisateurs. Je ne peux pas intervenir directement sur le LDAP (lecture seule) pour restreindre le sous ensemble de comptes que je souhaite créer (par exemple via un champ spécifique). Ainsi, via la création automatique, je me suis retrouvé à créer un grand nombre de comptes utilisateurs qui pour la plupart n'auront pas le droit d'accéder à ce serice de discussion. Des outils comme [Redmine](https://www.redmine.org/) par exemple font les choses bien car ils peuvent créer à la volée les comptes utilisateurs depuis LDAP.

Dans ce billet, j'explique comment créer un compte utilisateur sous [Rocket.chat](https://rocket.chat/) et comment l'associer à postériori à LDAP sans avoir à passer par une étape d'importation et de création de comptes massives. Attention, c'est une procédure manuelle, mais dans mon cas, le faible nombre de comptes utilisateurs n'est pas gênant et je peux me permettre de le faire (moins de 10 comptes par an).

## Étape 0 : configuration de LDAP (à faire une fois)

> Cette configuration est à adapter selon les préférences de votre serveur LDAP. À ne faire qu'une seule fois.

* Ouvrir l'interface Administration de [Rocket.chat](https://rocket.chat/) (sous entendu que vous avez un accès administrateur), puis choisir LDAP.

* Configurer LDAP comme précisé ci-dessous (en adpatant par rapport à votre existant).
  * **Général**
    * _Enable_: `True`
    * _Host_: `ldap.mycompagny.fr`
    * _Base DN_: `ou=people, dc=mycompany, dc=fr`
  * **Sync / Import**
    * _Username Field_: `uid`
    * _Default Domain_: `mycompagny.fr`
    * _Merge Existing Users_: `False`
    * _User Data Field Map_: `{"cn":"name", "mail":"email"}`
  * **User Search**
    * _Filter_:
    * _Search Field_: `uid`

## Étape 1 : création du compte classique

Pour la suite, on considère que sur le LDAP, il existe un compte contenant les informations suivantes :

* _uid_: `duponto`
* _cn_: `DUPONT Olivier`
* _mail_: `olivier.dupont@mycompagny.fr`

Les champs précédents, si différents dans votre LDAP, devront correspondre aux informations saisies dans la configuration.

* Ouvrir l'interface Administration, puis choisir Users.

* Créer le nouvel utilisateur Olivier DUPONT en respectant les informations contenues dans le LDAP.
  * _Name_: `DUPONT Olivier`
  * _Username_: `duponto`
  * _Password_: cliquer sur le bouton Random

## Étape 2 : modification du compte depuis la base Mongo

[Rocket.chat](https://rocket.chat/) stocke les informations dans une base de données [Mongo](https://www.mongodb.com). Pour connecter le compte utilisateur créé sous [Rocket.chat](https://rocket.chat/) avec le compte sous LDAP, il suffira d'ajouter pour le compte un nouveau champ `ldap` avec la valeur à `true`.

Ci-desous la requête Mongo permettant d'ajouter ce champ.

```console
db.users.update({username:"duponto"}, {"$set":{'ldap':true}})
```

La même requête si vous utilisez [Docker](https://www.docker.com/) pour le déploiement où `rocketchat_mongo_1` est le nom du conteneur Mongo pour [Docker](https://www.docker.com/).

```console
docker exec -it rocketchat_mongo_1 mongo --eval 'db.users.update({username:"duponto"}, {"$set":{'ldap':true}})' rocketchat
```

Pour vérifier que le champ a été correctement ajouté, exécuter la requête suivante.

```console
db.users.find({username:"duponto"}).pretty()
```

La même requête si vous utilisez [Docker](https://www.docker.com/) pour le déploiement où `rocketchat_mongo_1` est le nom du conteneur Mongo pour [Docker](https://www.docker.com/).

```console
docker exec -it rocketchat_mongo_1 mongo --eval 'db.users.find({username:"duponto"}).pretty()' rocketchat
```

## Conclusion

Pour se connecter, l'utilisateur pourra soit utiliser son _Username_ (`duponto`) soit utiliser son _email_ (`olivier.dupont@mycompagny.fr`) comme identifiant. Pour le mot de passe, il pourra utiliser soit le mot de passe du LDAP soit le mot de passe du compte.

Pour chaque nouvel utilisateur à créer, il faudra réitérer les étapes 1 et 2.

C'est une solution qui fonctionne bien depuis la mise en production du service. L'avantage est de pouvoir mélanger des comptes qui ne sont pas sur le LDAP et des comptes sur LDAP.

Bien entendu, l'idée serait de pouvroir profiter d'une boite à cocher `LDAP` directement lors de la création du compte depuis [Rocket.chat](https://rocket.chat/).