---
title: J'ai besoin d'... installer l'outil de gestion de projets Redmine sous Windows
tags: [Redmine]
blogger_orig_url: https://keulkeul.blogspot.com/2009/12/jai-besoin-d-installer-loutil-de.html
category: technical
description: Redmine est un outil de gestion de projets, je profite de ce billet pour décrire les étapes de cette installation
---

Redmine est un outil de gestion de projets à la Trac ou Mantis. Il fournit une interface graphique Web très agréable. Je l'utilise depuis plus d'un an pour la gestion des projets au travail et j'en suis très satisfait. Depuis peu, j'ai réalisé une installation sur un nouveau serveur et je profite de ce billet pour décrire les étapes de cette installation.

Redmine est développé en Ruby et je présente un manuel d'installation pour Windows et le SGBD PostgreSQL.

Le plan de cette installation est le suivant  

* Téléchargement
* Pré-requis logiciels  
* Pré-installation
  * Ruby
  * RubyGems
  * Ruby modules
  * Préparation de la base de données
* Installation
* Utilisation Apache 2.2 comme Proxy

## Téléchargement

La distribution officielle de Redmine est disponible à cette adresse ([http://rubyforge.org/frs/?group\_id=1850](http://rubyforge.org/frs/?group_id=1850)).

## Pré-requis logiciels

Vous devez installer et configurer les outils suivant avant d'installer Redmine.

* Ruby (procédure d'installation est décrite dans ce billet) ;
* Apache 2.2 HTTP ;
* PostgreSQL 8.2.

### Pré-installation / Ruby

Ruby est un langage _open-source_ dynamique qui met l'accent sur la simplicité et la productivité. Sa syntaxe élégante en facilite la lecture et l'écriture : [http://www.ruby-lang.org/fr](http://www.ruby-lang.org/fr/).

Pour l'installation, la version 1.8.6 a été utilisée.

* Télécharger le langage de programmation Ruby à cette adresse : [http://www.ruby-lang.org/](http://www.ruby-lang.org/).

* Exécuter l'outil d'installation.

### Pré-installation / RubyGems

RubyGems est l'outil de gestion de package de Ruby.

* Télécharger le package RubyGems ([http://rubyforge.org/frs/?group\_id=126](http://rubyforge.org/frs/?group_id=126)).

* Extraire l'archive dans un répertoire temporaire.

* Ouvrir un invite de commande, se placer dans le répertoire créé précédemment et exécuter l'instruction suivante.

```console
ruby setup.rb
```

### Pré-installation / Ruby Modules

Certains modules pour le langage Ruby doivent être installés (prise en compte de PostgreSQL par exemple), exécuter l'instruction suivante.

```console
gem install rails mongrel mongrel\_cluster postgres-pr mongrel\_service
```

### Pré-installation / Préparation de la base de données

Les instructions suivantes concernent le SGBD PostgreSQL.

* Créer un utilisateur Redmine.

```console
createuser redmine --no-superuser --no-createdb --no-createrole --login --pwprompt --encrypted -U postgres  
```

* Créer un nouveau schéma de base de données.

```console
createdb --owner=redmine --encoding=utf-8 redmine -U postgres
```

## Installation  

* Décompresser l'archive de Redmine dans un répertoire d'installation (exemple : d:\\tools\\redmine).

* Créer une copie du fichier _database.yml.example_ en le renommant database.yml.

* Modifier le contenu du fichier _database.yml_ file de façon à paramétrer les informations de connexion à la base de données.

```yaml
production:
adapter: postgresql
database: redmine
host: localhost
username: redmine
password: redmine
encoding: utf8
```

* Ouvrir un invite de commande Windows, se placer dans le répertoire de Redmine et suivre les instructions suivantes.

* Pour initialiser la session.

```console
rake config/initializers/session\_store.rb
```

* Pour utiliser la configuration de production.

```console
rake db:migrate RAILS\_ENV="production"
```

* Pour paramétrer la configuration de production.

```console
rake redmine:load\_default\_data RAILS\_ENV="production"
```

* À la question relative au langage, choisir l'option fr.

* Créer une copie du fichier _email.yml.example_ en le renommant _email.yml_.

* Modifier le contenu du fichier _email.yml_ file de façon à paramétrer les informations d'envoi d'emails.

```yaml
production:  
delivery\_method: :smtp  
smtp\_settings:  
address: "monserveur.email.fr"  
port: 25  
domain: "monserveur.email.fr"  
authentication: :plain  
  
development:  
delivery\_method: :smtp  
smtp\_settings:  
address: "monserveur.email.fr"  
port: 25  
domain: "monserveur.email.fr"  
authentication: :plain  
```

* Démarrer le serveur Ruby via la commande suivante.

```console
mongrel\_rails start --environment=production
```

* Pour tester l'application Redmine, ouvrir un navigateur et saisir l'URL suivante.

http://localhost:3000  

## Utiliser Apache 2.2 comme Proxy

* Créer ou mettre à jour le fichier *http-proxy.conf* situé dans le répertoire *apache/conf*.

* Saisir le contenu suivant en l'adaptant à votre configuration.

```console
LoadModule proxy\_module modules/mod\_proxy.so  
LoadModule proxy\_http\_module modules/mod\_proxy\_http.so  
ProxyRequests Off  
<proxy>  
Order deny,allow  
Allow from all  
</proxy>  
  
Alias /redmine "D:/tools/redmine/public"  
<directory>  
Options Indexes FollowSymLinks  
AllowOverride none  
Order allow,deny  
Allow from all  
</directory>  
  
ProxyPass /redmine/images !  
ProxyPass /redmine/stylesheets !  
ProxyPass /redmine/javascripts !  
ProxyPass /redmine/ http://127.0.0.1:4000/  
ProxyPass /redmine http://127.0.0.1:4000/  
ProxyPassReverse /redmine/ http://127.0.0.1:4000/  
```

* Ajouter à la fin du fichier httpd.conf d'Apache 2.2, l'instruction suivante.

```properties
Include conf/http-proxy.conf  
```

* S'assurer que l'instruction suivante est dé-commentée dans le fichier *httpd.conf*.

```properties
LoadModule alias\_module modules/mod\_alias.so  
```

* Démarrer le serveur Ruby via l'instruction suivante.

```console
mongrel\_rails start --environment=production -p 4000
```

* Vérifier que l'URL [http://localhost/redmine](http://localhost/redmine) fonctionne. Seule la première page s'affiche. Par ailleurs, les images ne s'affichent pas correctement.

* Arrêter le serveur Ruby.

* Se déplacer à la racine du répertoire Redmine et exécuter la ligne de commande suivante.

```console
ruby script/plugin install http://svn.napcsweb.com/public/reverse\_proxy\_fix
```

* À la question de l'URL, saisir l'URL complète (exemple : http://monserveur/redmine).

* À la question de la version de Rails, sélectionner la valeur 2.0, 2.1, 2.2.

* Pour installer Redmine comme un service Windows, exécuter l'instruction suivante à partir du répertoire Redmine.

```console
mongrel\_rails service::install -N Redmine -p 4000 -e production
```

* À partir du panneau d'administration de Windows, activer le démarrage automatique du service Redmine de telle sorte que l'application Redmine se lance au démarrage de Windows.