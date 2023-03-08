---
title: J'ai besoin d'... installer Coder sur K3s
tags: [DevOps, Kubernetes, Coder]
category: technical
description: "Dans ce billet j'explique comment déployer Coder, une solution d'environnement de développement en ligne, sur un cluster Kubernetes K3s"
---

Ce billet se propose de décrire le déploiement de [Coder](https://coder.com) sur un cluster Kubernetes via la distribution [K3s](https://k3s.io/). [Coder](https://coder.com) est une plateforme d'environnement de développement en ligne en proposant la possibilité d'éditer son code directement depuis un navigateur. L'ensemble des outils de la chaîne de compilation est alors déporté sur le serveur. [Coder](https://coder.com) permet donc de fournir un environnement de développement distant prêt à l'emploi et de réduire les problèmes d'installation et de configuration du poste de développeur dûs à l'hétérogénité des architectures et des logiciels manipulés.

Ce type de solution s'est multiplié depuis ces dernières années. On peut citer, sans être exhaustif, [Gitpod](https://www.gitpod.io/), [EclipseCHE](https://www.eclipse.org/che/), [JupyterHub](https://jupyter.org/hub), [GitHub Codespaces](https://github.com/features/codespaces) ou [Codeanywhere](https://codeanywhere.com/). Ces produits fournissent des caractéristiques communes, mais on souvent des particularités qui peuvent les rendre séduisantes à l'heure du choix d'un produit.

Dans mon cas, je m'intéresse à déployer ce type de solution au niveau de l'établissement où je travaille tant sur les aspects recherche qu'enseignement. Plusieurs caractéristiques ne sont pas négociables comme l'auto-hébergement (`self-hosted`), la libération du code source, la présence d'une communauté, la facilité d'installation et la capacité de gérer de nombreux langages de programmation. 

Une première expérimentation avait débuté par [Gitpod](https://www.gitpod.io/). Malheureusement, le revirement sur l'[abondon du support de l'auto-hébergement](https://www.gitpod.io/blog/introducing-gitpod-dedicated) m'ont contraint à abandonner ce produit. Par ailleurs, la mise en place de [Gitpod](https://www.gitpod.io/) était loin d'être facile et je peux comprendre ce revirement puisque comme il est expliqué sur le [blog](https://www.gitpod.io/blog/introducing-gitpod-dedicated), il y avait de nombreux soucis dûs à l'hétérogénéïté des distributions Kubernetes. Une deuxième solution a été [JupyterHub](https://jupyter.org/hub) qui était assez facile d'installation, mais limitée au langage Python. Dans une troisième expérimentation, je me suis donc intéressé à [Coder](https://coder.com) et je propose dans ce billet une explication sur son déploiement dans un cluster Kubernetes.

Du point de vue technique, [Coder](https://coder.com) permet la création et la gestion des espaces de travail Workspaces des développeurs en s'appuyant sur [Terraform](https://www.terraform.io/) pour l'approvisionnement. Par exemple, via [Terraform](https://www.terraform.io/), vous allez pouvoir préciser que vous souhaitez utiliser une image [Docker](https://www.docker.com/) qui contient les outils pour compiler du Java et que vous souhaitez installer une version VIM ultra vitaminée. Les ressources seront également précisées comme par exemple la mémoire ou la capacité de stockage des espaces de travail.

Au niveau des prérequis matériels et logiciels voici une liste pour reproduire cette installation :

- un nom de domaine : coder.mondomaine.com ;
- un certificat : [LetsEncrypt](https://letsencrypt.org) (root et wildcard) ;
- trois machines virtuelles propulsées par [XCP-NG](https://xcp-ng.org/) : Os Linux Ubuntu, serveur SSH, 4 cœurs CPU, 16 Go de mémoire et 300 Go de disque dur ;
- un Reverse Proxy : [NGINX](https://www.nginx.com/) ou [Apache HTTP Server](https://httpd.apache.org/) ;
- des clients d'administration Kubernetes : kubectl, [k9s](https://k9scli.io/) et [HELM](https://helm.sh/).

Pour le Reverse Proxy (passe-plat), il sera externe au cluster Kubernetes et il aura à la charge la gestion du HTTPS et distribuera les requêtes vers le cluster en HTTP. La configuration du DNS pointera vers une des machines virtuelles qui devra gérer le Reverse Proxy et un nœud du cluster Kubernetes. Cette contrainte est imposée par les règles de déploiement d'application de mon établissement.

Toutes les commandes en dehors des machines virtuelles ont été réalisées depuis un ordinateur macOS version Ventura.

## Mise en place du cluster Kubernetes via K3s

Cette section s'intéresse à la création d'un cluster Kubernetes à partir de la distribution légère [K3s](https://k3s.io/). Comme cela a été présenté en introduction, ce cluster Kubernetes sera hébergé sur trois machines virtuelles qui disposent chacune des mêmes ressources à savoir 4 coeurs CPU, 16 Go de mémoire et 300 Go de disque dur. L'identification réseau des machines virtuelles (IPv4 et nom dans le domaine) est décrite ci-dessous :

- 210.105.201.226 : k8s226
- 210.105.201.227 : k8s227
- 210.105.201.234 : k8s234

La machine virtuelle nommée `k8s226` sera considérée comme étant le nœud serveur et hébergera le service Reverse Proxy comme justifié en introduction. Les machines virtuelles nommées `k8s227` et `k8s234` seront considérées comme nœud de travail.

* Ouvrir une connexion SSH vers `k8s226` et saisir la commande suivante pour exécuter le script d'installation de [K3s](https://k3s.io/).

```
$ curl -sfL https://get.k3s.io | sh -
```

Le nœud maître étant installé, veuillez récupérer le jeton (TOKEN) d'identification et l'adresse IP du cluster Kubernetes depuis le fichier _/var/lib/rancher/k3s/server/node-token_. Ces informations nous serviront pour ajouter des nœuds de travail au cluster (actuellement composé d'un seul nœud).

* Exécuter la ligne de commande pour récupérer le jeton d'identification du nœud serveur.

```
$ sudo cat /var/lib/rancher/k3s/server/node-token
K20545dbddda0f19bf1c9ac794546d200cdc4ede3fe9ad82d5e560ad0748cc28fd4::server:17a174d18d4fd82c0f99b687bd9aabcd
```

Conserver le contenu de ce TOKEN pour la suite de l'installation.

* Ouvrir une connexion SSH vers `k8s227` et saisir la commande pour exécuter le même script d'installation afin d'ajouter un premier nœud de travail au cluster Kubernetes.

```
$ export mynodetoken=K20545dbddda0f19bf1c9ac794546d200cdc4ede3fe9ad82d5e560ad0748cc28fd4::server:17a174d18d4fd82c0f99b687bd9aabcd
$ curl -sfL https://get.k3s.io | K3S_URL=https://210.105.201.226:6443 K3S_TOKEN=$mynodetoken sh -
```

* Ouvrir une connexion SSH vers `k8s234` et saisir la commande pour exécuter le même script d'installation afin d'ajouter un second nœud de travail au cluster Kubernetes.

```
$ export mynodetoken=K20545dbddda0f19bf1c9ac794546d200cdc4ede3fe9ad82d5e560ad0748cc28fd4::server:17a174d18d4fd82c0f99b687bd9aabcd
$ curl -sfL https://get.k3s.io | K3S_URL=https://210.105.201.226:6443 K3S_TOKEN=$mynodetoken sh -
```

Le cluster Kubernetes est désormais installé. Afin que nous puissions accéder au cluster, nous devons récupérer un fichier d'accès qui contiendra des informations comme les autorisations pour les outils clients. Ce fichier d'accès permet de communiquer avec le composant API Server d'un cluster Kubernetes.

* Depuis votre machine de travail, exécuter la ligne de commande suivante pour récupérer ce fichier d'accès.

```
$ scp 210.105.201.226:/etc/rancher/k3s/k3s.yaml .
```

* Exécuter la ligne de commande ci-dessous pour modifier le contenu du fichier afin de préciser l'IP du nœud serveur.

```
$ sed -i '' "s/127.0.0.1/210.105.201.226/" k3s.yaml
```

* Tester le fonctionnement du cluster Kubernetes via la ligne de commande suivante.

```
$ export KUBECONFIG=$PWD/k3s.yaml
$ kubectl get nodes
NAME     STATUS   ROLES                  AGE   VERSION
k8s226   Ready    control-plane,master   21d   v1.25.6+k3s1
k8s227   Ready    <none>                 21d   v1.25.6+k3s1
k8s234   Ready    <none>                 21d   v1.25.6+k3s1
```

Comme vous pouvez le constater, les trois nœuds sont opérationnels.

* Vérifier également le bon fonctionnement du cluster Kubernetes via l'outil **k9s**.

```
$ export KUBECONFIG=$PWD/k3s.yaml # Pas obligatoire si vous l'avez déjà fait auparavant.
$ k9s
```

![Supervision Kubernetes avec K9s](/images/install-coder-k3s/k9s-coder.png)

La mise en place du cluster Kubernetes via la distribution [K3s](https://k3s.io/) est désormais terminée, nous allons pouvoir déployer [Coder](https://coder.com).

## Déploiement de Coder

Le déploiement de [Coder](https://coder.com) va consister à déployer une base de données PostgreSQL et l'application [Coder](https://coder.com). Le déploiement se fera par l'intermédiaire du gestionnaire de package Kubernetes [Helm](https://helm.sh/).

* Créer un namespace pour [Coder](https://coder.com).

```
$ kubectl create namespace coder
namespace/coder created
```

Nous allons tout d'abord nous intéresser au déploiement de la base de données PostgreSQL en se basant sur un package fourni par [Bitnami](https://bitnami.com/).

* Ajouter le dépôt de package Kubernetes [Bitnami](https://bitnami.com/) à la liste des dépôts disponibles sur votre poste local.

```
$ helm repo add bitnami https://charts.bitnami.com/bitnami
"bitnami" has been added to your repositories
```

* Lister les dépôts de package Kubernetes [Helm](https://helm.sh/).

```
$ helm repo list
NAME   	URL
bitnami	https://charts.bitnami.com/bitnami
```

* Déployer le package Kubernetes `bitnami/postgresql` en précisant le `namespace`, l'utilisateur, le mot de passe, le nom de la base de données et la capacité de stockage.

```
$ helm install coder-db bitnami/postgresql \
    --namespace coder \
    --set auth.username=coder \
    --set auth.password=coder \
    --set auth.database=coder \
    --set persistence.size=10Gi

NAME: coder-db
LAST DEPLOYED: Wed Feb  31 09:53:58 2666
NAMESPACE: coder
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
CHART NAME: postgresql
CHART VERSION: 11.1.28
APP VERSION: 14.2.0

** Please be patient while the chart is being deployed **

PostgreSQL can be accessed via port 5432 on the following DNS names from within your cluster:

    coder-db-postgresql.coder.svc.cluster.local - Read/Write connection

To get the password for "postgres" run:

    export POSTGRES_ADMIN_PASSWORD=$(kubectl get secret --namespace coder coder-db-postgresql -o jsonpath="{.data.postgres-password}" | base64 --decode)

To get the password for "coder" run:

    export POSTGRES_PASSWORD=$(kubectl get secret --namespace coder coder-db-postgresql -o jsonpath="{.data.password}" | base64 --decode)

To connect to your database run the following command:

    kubectl run coder-db-postgresql-client --rm --tty -i --restart='Never' --namespace coder --image docker.io/bitnami/postgresql:14.2.0-debian-10-r88 --env="PGPASSWORD=$POSTGRES_PASSWORD" \
      --command -- psql --host coder-db-postgresql -U coder -d coder -p 5432

    > NOTE: If you access the container using bash, make sure that you execute "/opt/bitnami/scripts/entrypoint.sh /bin/bash" in order to avoid the error "psql: local user with ID 1001} does not exist"

To connect to your database from outside the cluster execute the following commands:

    kubectl port-forward --namespace coder svc/coder-db-postgresql 5432:5432 &
    PGPASSWORD="$POSTGRES_PASSWORD" psql --host 127.0.0.1 -U coder -d coder -p 5432
```

Comme vous pouvez le constater, un ensemble de commande sont disponibles pour se connecter à la base de données `coder`. Nous y reviendrons une fois que [Coder](https://coder.com) sera en fonctionnement. 

* Vérifier que le Pod associé à la base de données PostgreSQL a été créé.

```
$ kubectl get pods --namespace coder
NAME                     READY   STATUS    RESTARTS   AGE
coder-db-postgresql-0    1/1     Running   0          22d
```

* Créer un secret à partir de l'URL de la base de données. Ce secret identifié par la clé `coder-db-url` sera utilisé par `coder` pour localiser la base de données PostgreSQL.

```
$ kubectl create secret generic coder-db-url -n coder --from-literal=url="postgres://coder:coder@coder-db-postgresql.coder.svc.cluster.local:5432/coder?sslmode=disable"
```

* Ajouter le dépôt de package Kubernetes [Coder](https://coder.com) à la liste des dépôts disponibles sur votre poste local.

```
$ helm repo add coder-v2 https://helm.coder.com/v2
"coder-v2" has been added to your repositories
```

* Lister les dépôts de package Kubernetes [Helm](https://helm.sh/).

```
$ helm repo list
NAME    	URL
bitnami 	https://charts.bitnami.com/bitnami
coder-v2	https://helm.coder.com/v2
```

Le déploiement de [Coder](https://coder.com) s'appuie sur un fichier de configuration au format YAML pour préciser des paramètres intrinsèques de l'application, mais aussi des paramètres de déploiement sur Kubernetes (service, ingress, etc.). 

* Créer un fichier _values.yaml_ et copier le contenu ci-dessous. Le commentaire `# TODO` indique où vous devez changer le code pour faire correspondre à votre configuration.

```yaml
coder:
  env:
    - name: CODER_PG_CONNECTION_URL
      valueFrom:
        secretKeyRef:
          name: coder-db-url
          key: url

    - name: CODER_ACCESS_URL
      # TODO
      value: "https://coder.mondomaine.com"
    - name: CODER_WILDCARD_ACCESS_URL
      # TODO
      value: "*.coder.mondomaine.com"

  service:
    enable: true
    type: ClusterIP
    sessionAffinity: ClientIP
    externalTrafficPolicy: Cluster
    loadBalancerIP: ""
    annotations: {}

  ingress:
    enable: true
    className: ""
    # TODO
    host: "coder.mondomaine.com"
    # TODO
    wildcardHost: "*.coder.mondomaine.com"
    annotations: {}
    tls:
      enable: false
      secretNames: ""
      wildcardSecretName: ""
```

Dans la configuration proposée ci-dessous, la clé `service` présice que l'accès au Pod de [Coder](https://coder.com) se fera par un service de type `ClusterIP`. Par ailleurs, l'accès à ce service se fera par un Ingress qui a été activé (`enable: true`). Pour rappel, un Ingress permet de définir des règles pour relier une URL à un objet de type service. Dans cette configuration tout ce qui arrivera vers `coder.mondomaine.com` sera envoyé vers le service défini précédemment.

* Déployer le package Kubernetes `coder-v2/coder` en précisant le `namespace` et le fichier de configuration _values.yaml_.

```console
$ helm install coder coder-v2/coder --namespace coder --values values.yaml
...
```

* Vérifier que tous les Pods ont été créés en exécuant la ligne de commande suivante.

```console
$ kubectl get pods --namespace coder
NAME                     READY   STATUS    RESTARTS   AGE
coder-db-postgresql-0    1/1     Running   0          22d
coder-59c6bc9c77-6f2wj   1/1     Running   0          9m47s
```

À cette étape, [Coder](https://coder.com) a été déployée, mais ne pourra répondre aux requêtes HTTPS (443) de manière sécurisée car aucun certificat SSL n'a été configuré. Nous allons expliquer dans la section suivante comment mettre en place un Reverse Proxy externe au cluster Kubernetes pour répondre aux sollications des requêtes HTTPS (443) avec un certificat SSL fourni par LetsEncrypt.

## Mise en place du certificat LetsEncryp et du Reverse Proxy NGINX

La mise en place d'un Reverse Proxy en amont du cluster Kubernetes oblige à changer les ports d'écoute du Reverse Proxy utilisé par [K3s](https://k3s.io/). En effet, les ports 80 et 443 ne seront plus écoutés par le cluster Kubernetes, mais par le Reverse Proxy que nous allons mettre en place et qui redirigera vers le cluster. Pour information, le Reverse Proxy fourni par [K3s](https://k3s.io/) est [Traefik](https://traefik.io/).

* Depuis le nœud serveur `k8s226`, créer le fichier _/var/lib/rancher/k3s/server/manifests/traefik-config.yaml_ et ajouter le contenu ci-dessous.

```yaml
kind: HelmChartConfig
metadata:
  name: traefik
  namespace: kube-system
spec:
  valuesContent: |-
    ports:
      web:
        exposedPort: 8080
      websecure:
        exposedPort: 8443
```

Dans cette configuration les ports `80` et `443` ont été remplacés respectivement par `8080` et `8443`.

* Toujours depuis le nœud serveur `k8s226`, appliquer la configuration via la ligne de commande ci-dessous. 

```console
$ kubectl apply -f /var/lib/rancher/k3s/server/manifests/traefik-config.yaml
```

Nous allons maintenant créer le certificat [LetsEncrypt](https://letsencrypt.org) pour le domaine `coder.mondomaine.com`. Nous utiliserons l'outil **certbot** en mode manuel avec un défi de type DNS (moyen pour LetsEncrypt d'identifier que je suis le propriétaire de ce domaine et que le domaine `coder.mondomaine.com` pointe vers l'adresse IP : 210.105.201.226).

* Installer certbot.

```console
$ sudo apt-get update 
$ sudo apt-get install certbot -y
```

* Créer le certificat.

```console
$ sudo certbot certonly --agree-tos -m YOUR_EMAIL --manual --preferred-challenges=dns -d 'coder.mondomaine.com' -d '*.coder.mondomaine.com' -v
...
```

* Copier les fichiers relatifs au certificat (_fullchain.pem_ et _privkey.pem_) dans un répertoire _/ssl_.

```
$ mkdir ~/ssl
$ cp /etc/letsencrypt/live/coder.mondomaine.com-0001/fullchain.pem privkey.pem /ssl
```

* Générer le fichier _dhparams.pem_ qui contient les paramètres d'OpenSSL.

```
$ cd /ssl
$ openssl dhparam -out dhparams.pem 4096
```

À cette étape, le répertoire _/ssl_ devra contenir les trois fichiers : _dhparam.pem_, _fullchain.pem_ et _privkey.pem_. Nous occupons maintenant de la création d'une instance [NGINX](https://www.nginx.com/) qui sera exécuté par l'intermédiaire de [Docker](https://www.docker.com/). Pour la suite, nous supposons que [Docker](https://www.docker.com/) est installé sur le nœud serveur `k8s226`.

* Créer le fichier de configuration _~/conf/coder.conf_ avec le contenu suivant.

```
server {
    listen       80;
    listen       [::]:80;
    server_name  *.coder.mondomaine.com;
    return	 301 https://$host$request_uri;
}

server {
   listen       443 ssl;
   server_name  *.coder.mondomaine.com;

   ssl_protocols TLSv1.2 TLSv1.3;
   ssl_certificate /ssl/fullchain.pem;
   ssl_certificate_key /ssl/privkey.pem;
   ssl_dhparam /ssl/dhparam.pem;
   ssl_ecdh_curve secp384r1;
   ssl_prefer_server_ciphers on;
   ssl_ciphers EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH;

   access_log /var/log/nginx/coder/access.log;
   error_log /var/log/nginx/coder/error.log;

   location / {
       proxy_pass http://210.105.201.226:8080/;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "Upgrade";
       proxy_set_header Host $host;
   }
}
```

Dans cette configuration, le Reverse Proxy redirigera toutes les requêtes de `*.coder.mondomaine.com` vers le cluster Kubernetes identifié par `210.105.201.226:8080`.

* Créer le fichier _~/docker-compose.yaml_ avec le contenu suivant.

```yaml
services:

  nginx:
    container_name: nginx
    image: nginx:latest
    volumes:
      - ./conf:/etc/nginx/conf.d
      - /ssl:/ssl
    restart: always
    ports:
      - "80:80"
      - "443:443"
    networks:
      - reverseproxynetwork

networks:
  reverseproxynetwork:
    name: reverseproxynetwork
    external: true
```

* Démarrer les services définis dans le fichier _docker-compose.yaml_.

```console
$ docker compose up -d
```

* Vérifier que le service _nginx_ a correctement démarré.

```console
$ docker compose up -d
NAME                IMAGE               COMMAND                  SERVICE             CREATED             STATUS              PORTS
nginx               nginx:latest        "/docker-entrypoint.…"   nginx               3 weeks ago         Up 3 weeks          0.0.0.0:80->80/tcp, :::80->80/tcp, 0.0.0.0:443->443/tcp, :::443->443/tcp
```

À cette étape, l'installation de tous les serices est terminée, nous pouvons donc tester [Coder](https://coder.com).

## Démarrage de Coder

Avant de faire nos premiers pas avec [Coder](https://coder.com), deux concepts sont à présenter : Template et Workspace. Un Template [Coder](https://coder.com) décrit l'infrastructure d'exécution de l'environnement de développement distant. Il est décrit via le langage [Terraform](https://www.terraform.io/) et permet de préciser les images [Docker](https://www.docker.com/), les ressources, les volumes, etc. Un Workspace [Coder](https://coder.com) est l'exécution d'un Template [Coder](https://coder.com) et se matérialise dans un Pod Kubernetes. Il peut y avoir donc plusieurs Workspace pour un Template. Dans la suite de cette section, nous allons manipuler ces deux concepts.

L'accès à [Coder](https://coder.com) se fait par l'URL : https://coder.mondomaine.com. 

* Ouvrir un navigateur web et saisir l'adresse https://coder.mondomaine.com.

![Première connexion avec Coder](/images/install-coder-k3s/01-coder-sigin.png)

À la première connexion, un utilisateur doit être créé. Veuillez saisir, un nom d'utilisateur, un email et un mot de passe.

* Cliquer sur l'onglet Template et choisir le Template prédéfini `Develop in Kubernetes`. 

![Choix d'un template](/images/install-coder-k3s/02-coder-starter-templates.png)

Il existe de nombreux Templates déjà existants dont les codes [Terraform](https://www.terraform.io/) sont disponibles ici : [https://github.com/coder/coder/tree/main/examples/templates](https://github.com/coder/coder/tree/main/examples/templates).

* Visualiser les Templates qui ont été importés dans cette instance de [Coder](https://coder.com).

![Utilisation d'un template](/images/install-coder-k3s/03-coder-list-template.png)

* Cliquer sur l'onglet Templates, sélectionner le Template « Develop in Kubernetes » puis éditer les champs de texte qui sont proposés (nom, propriétaire, etc.). La propriété `var.home_disk_size` est issue de la description [Terraform](https://www.terraform.io/) du Template. Il est donc possible de paramétrer la création de Workspace par l'intermédiaire de [Terraform](https://www.terraform.io/).

![Choix du template pour créer un workspace](/images/install-coder-k3s/04-coder-create-workspace.png)

* Cliquer sur **Create Workspace** pour démarrer l'exécution du script [Terraform](https://www.terraform.io/). 

![Création du workspace](/images/install-coder-k3s/05-coder-workspace.png)

À la fin de la création du Workspace, un ensemble de fonctionnalités sont offertes : 

* **coder-server** : instance de Visual Studio Code dans le navigateur ;
* **Terminal** : accès ligne de commande du Workspace depuis la navigateur ;
* **SSH** : accès SSH vers le Workspace depuis une console ;
* **VS Code Desktop** : accès vers le Workspace depuis un Visual Studio Code existant ;
* **Port forward** : configuration pour la redirection du port.

La création du Workspace basé sur le Template `Develop in Kubernetes` a créé un Pod intitulé `coder-baronm-test`. L'image de base [Docker](https://www.docker.com/) utilisée est `codercom/enterprise-base:ubuntu` (information présente dans le [fichier](https://github.com/coder/coder/blob/main/examples/templates/kubernetes/main.tf) de description du Template).

* Exécuter la ligne de commande suivante pour afficher la liste des Pods du namespace `coder`.

```console
$ kubectl get pods --namespace coder
NAME                     READY   STATUS    RESTARTS   AGE
coder-db-postgresql-0    1/1     Running   0          26d
coder-59c6bc9c77-6f2wj   1/1     Running   0          3d23h
coder-baronm-test        1/1     Running   0          9h
```

Vous remarquerez la présence du Pod `coder-baronm-test` suite à la création du Workspace intitulé `Test`.

* Cliquer sur l'option *coder-server*.

![Ouverture de l'éditeur VSCode](/images/install-coder-k3s/06-coder-vscode.png)

L'éditeur Visual Studio Code est disponible dans une nouvelle fenêtre du navigateur Web. Veuillez noter qu'il s'agit d'une application Progressive Web App (PWA), un raccourci sur le Dock de macOS peut être créé.

## Conclusion

Ce billet a montré le déploiement de [Coder](https://coder.com) sur un cluster Kubernetes via la distribution [K3s](https://k3s.io/). Il reste encore plein de chose à découvrir sur l'utilisation et la configuration de [Coder](https://coder.com).

Dans un prochain billet, j'expliquerai les points suivants :

* installer et utiliser le client [Coder](https://coder.com) ;
* configurer OpenID via une instance Gitlab ;
* mettre à jour [Coder](https://coder.com) ;
* écrire son premier Template [Coder](https://coder.com) avec Terraform ;
* tester la scalibilité de [Coder](https://coder.com).