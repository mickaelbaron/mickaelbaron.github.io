---
title: "A Guide to Deploying Onyxia On-Premises (part 1): basic installation and user account management with Keycloak"
tags: [kubernetes]
category: technical
description: ""
english: true
toc: true
comments: utterances
---

[Onyxia](https://www.onyxia.sh/) est un projet open source porté par l’[INSEE](https://www.insee.fr/) (France) et créé initialement pour faciliter la mise en place d'un environnement de travail pour les personnels de l'institut. [Onyxia](https://www.onyxia.sh/) fournit une application web pour lancer et configurer un environnement de travail. Il permet ainsi à l'utilisateur de choisir des outils (VSCode, Jupyter, etc.), des ressources (CPU, GPU et RAM) et de connecter des services de stockage (type S3) sans avoir à gérer directement les complexités du cloud ou de l’infrastructure sous-jacente. 

[Onyxia](https://www.onyxia.sh/) s'appuie sur Kubernetes. Les environnements de travail sont packagés dans des Charts [Helm](https://helm.sh/) et configurables au niveau de l'interface web fournit par [Onyxia](https://www.onyxia.sh/). L'[INSEE](https://www.insee.fr/) propose une instance de [Onyxia](https://www.onyxia.sh/) appelée [SPPCloud](https://www.sspcloud.fr/), elle est gratuite pour toutes les administrations publiques françaises. Toutefois, cette instance n’est pas configurable et les ressources doivent être partagées avec un nombre croissant d’utilisateurs.

L'installation d'une instance [Onyxia](https://www.onyxia.sh/) sur un cluster Kubernetes est possible et c'est l'objectif de ce billet de blog. La documentation d'installation de [Onyxia](https://www.onyxia.sh/) est très bien faite, mais un peu trop générique pour correspondre à des cas spécifiques et de toute façon il n'est pas pensable de traiter chaque cas. Par ailleurs, la documentation n'est pas forcément à jour et les dernières versions des outils tiers comme [Keycloak](https://www.keycloak.org/) et [Vault](https://github.com/hashicorp/vault) ne sont pas disponibles.

Dans ce billet de blog, nous adoptorons une approche incrémentale, en commençant avec l'installation de [Onyxia](https://www.onyxia.sh/), puis l'ajout et l'intégration du gestionnaire d'identification et d'autentification [Keycloak](https://www.keycloak.org/). Dans le cas spécifique de [Keycloak](https://www.keycloak.org/), nous détaillerons la gestion implicite des utilisateurs via [Keycloak](https://www.keycloak.org/), avant de présenter la configuration nécessaire pour fédérer une source d’identité externe qui supporte OpenID. 

D'autres points pourront être abordés dans des prochains billets, notamment l'installation et l'intégration d'un stockage S3, la gestion des secrets avec [Vault](https://github.com/hashicorp/vault), ainsi que l'utilisation de Prometheus pour la supervision du cluster Kubernetes. Sur cette base, nous mettrons en place des stratégies d’allocation de ressources afin d'éviter, par exemple, l'accaparement des ressources critiques telles que les GPU. Enfin, nous verrons ultérieurement comment créer ses propres services. 

Enfin, contrairement à la documentation officielle d’[Onyxia](https://www.onyxia.sh/) qui s’appuie sur [Argo CD](https://github.com/argoproj/argo-cd) pour le déploiement, nous réaliserons ici toutes les opérations via l'outil en ligne de commande [kubectl](https://github.com/kubernetes/kubectl). Bien que l’approche avec [Argo CD](https://github.com/argoproj/argo-cd) soit recommandée pour un environnement de production, l’objectif de ce billet est de proposer une première installation simple afin de découvrir et tester la plateforme [Onyxia](https://www.onyxia.sh/).

## Prérequis

Pour mettre en œuvre l’ensemble des éléments présentés, vous aurez besoin d’un cluster Kubernetes. À ce sujet, je vous invite à consulter les deux billets de blog que j’ai déjà publiés.

* [A step-by-step pratical guide for deploying NVIDIA GPUs on Kubernetes](/blog/2024/07/19/guide-deploying-nvidiagpu-k8s)
* [Advanced Kubernetes Deployment on an NVIDIA GPUs Cluster](/blog/2025/02/13/advanced-k8s-deployment)

Il vous faudra également disposer d’un nom de domaine. Nous utiliserons dans cet exemple le domaine fictif : *.mydomain.fr.

## Onyxia tout simplement

Cette section décrit la configuration et l’installation d’[Onyxia](https://www.onyxia.sh/) à partir d’un chart [Helm](https://helm.sh/). La personnalisation de l’apparence constitue la seule étape de configuration abordée. Les autres paramètres seront traités ultérieurement, après la mise en place du système d’authentification avec [Keycloak](https://www.keycloak.org/).

### Installation Onyxia

* Créer un fichier minimaliste _onyxia-values.yaml_ pour que l'installation se déroule sans problème. Ainsi, un seul utilisateur sera défini et l’apparence conservera les paramètres par défaut.

```yaml
ingress:
  enabled: true
  hosts:
    - host: onyxia.mydomain.fr
web:
  env:
api:
  regions:
    [
      {
        id: "onyxia_id",
        name: "Onyxia",
        description: "Instance Onyxia de TEST.",
        services: {
          type: "KUBERNETES",
          singleNamespace: true,
          authenticationMode: "serviceAccount",
          namespacePrefix: "onyxia-user-",
          expose: {
            domain: "lab-onyxia.mydomain.fr"
          },
        },
      },
    ]
```

* Ajouter le dépôt Helm de [Onyxia](https://www.onyxia.sh/) à la configuration [Helm](https://helm.sh/) locale et vérifier que ce dépôt est disponible.

```bash
helm repo add onyxia https://inseefrlab.github.io/onyxia
helm repo list
```

La sortie console attendue :

```bash
NAME                  	URL
ingress-nginx         	https://kubernetes.github.io/ingress-nginx
nvidia                	https://helm.ngc.nvidia.com/nvidia
onyxia                	https://inseefrlab.github.io/onyxia
prometheus-community  	https://prometheus-community.github.io/helm-charts
...
```

* Déployer le chart _Onyxia_ dans sa version _10.28.9_. 

```bash
helm install onyxia onyxia/onyxia -f onyxia-values.yaml --version 10.28.9 --create-namespace --namespace onyxia
```

La sortie console attendue :

```bash
NAME: onyxia
LAST DEPLOYED: Fri Oct  3 17:26:00 2025
NAMESPACE: onyxia
STATUS: deployed
REVISION: 1
NOTES:
Enjoy Onyxia :)
```

Deux pods devront être créées : l’un pour la partie serveur, qui fournit l’API, et l’autre pour la partie interface utilisateur. 

* Tester la disponibilité de ces deux pods par la ligne de commande suivante.

```bash
kubectl get pods -n onyxia
```

La sortie console attendue :

```bash
NAME                          READY   STATUS    RESTARTS   AGE
onyxia-api-54594bb97d-xxzcq   1/1     Running   0          28m
onyxia-web-67666469d8-27xpb   1/1     Running   0          28m
```

* Ouvrir un navigateur web et saisir l'URL suivante : https://onyxia.mydomain.fr

![Installation de Onyxia avec les paramètres minimalistes](/images/setup-onyxia-onpremise-part1/onyxia-install.png "Installation de Onyxia avec les paramètres minimalistes")

Vous remarquerez sur la partie en bas à droite la version courante de Onyxia (_10.28.9_). 

### Mise à jour de la version de Onyxia

Lorsque des mises à jour de version ou de configuration de [Onyxia](https://www.onyxia.sh/) seront nécessaires, ce qui se produit régulièrement, il suffira de suivre les étapes ci-dessous pour les appliquer.

* Forcer la mise à jour du dépôt 

```bash
helm repo update onyxia
```

La sortie console attendue :

```bash
Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "onyxia" chart repository
Update Complete. ⎈Happy Helming!⎈
```

* Afficher les versions disponibles du dépôt Onyxia.

```
helm search repo onyxia -l
```

La sortie console attendue :

```bash
NAME         	CHART VERSION	APP VERSION	DESCRIPTION
onyxia/onyxia	10.29.2      	           	Onyxia is your datalab's hub.
onyxia/onyxia	10.29.1      	           	Onyxia is your datalab's hub.
onyxia/onyxia	10.29.0      	           	Onyxia is your datalab's hub.
onyxia/onyxia	10.28.10     	           	Onyxia is your datalab's hub.
onyxia/onyxia	10.28.9      	           	Onyxia is your datalab's hub.
onyxia/onyxia	10.28.8      	           	Onyxia is your datalab's hub.
...
```

* Mettre à jour la version [Onyxia](https://www.onyxia.sh/) en spécifiant la version souhaitée.

```bash
helm update onyxia onyxia/onyxia -f onyxia-values.yaml --version 10.29.2 --create-namespace --namespace onyxia
```

### Personnalisation de Onyxia

Intéressons nous maintenant à personnaliser l'affichage de l'instance [Onyxia](https://www.onyxia.sh/) déployée. Il s'agit de compléter les éléments de la clé `env` depuis le fichier _onyxia-values.yaml_. L'ensemble des paramètres sont disponibles depuis le dépôt Github du projet qui gère l'interface utilisateur : [onyxia/web/.env](https://github.com/InseeFrLab/onyxia/blob/main/web/.env). La documentation est bien faite, car chaque paramètre est accompagné d’une illustration indiquant précisément l’endroit où il est configuré.

* Éditer le fichier _onyxia-values.yaml_ en ajoutant le contenu de la clé `env`.

```yaml
ingress:
  enabled: true
  hosts:
    - host: onyxia.mydomain.fr
web:
  env:
    HEADER_TEXT_BOLD: Test
    TAB_TITLE: Onyxia Test
    HOMEPAGE_HERO_TEXT: |
      {
        "fr": "Bienvenue dans la version Test",
        "en": "Welcome to the Test version "
      }
    PALETTE_OVERRIDE: |
      {
        focus: {
          main: "#067A76",
          light: "#0AD6CF",
          light2: "#AEE4E3"
        },
        dark: {
          main: "#2D1C3A",
          light: "#4A3957",
          greyVariant1: "#22122E",
          greyVariant2: "#493E51",
          greyVariant3: "#918A98",
          greyVariant4: "#C0B8C6"
        },
        light: {
          main: "#F7F5F4",
          light: "#FDFDFC",
          greyVariant1: "#E6E6E6",
          greyVariant2: "#C9C9C9",
          greyVariant3: "#9E9E9E",
          greyVariant4: "#747474"
        }
      }
api:
    ...
```

* Mettre à jour la version [Onyxia](https://www.onyxia.sh/).

```bash
helm update onyxia onyxia/onyxia -f onyxia-values.yaml --version 10.29.2 --create-namespace --namespace onyxia
```

![Onyxia après des paramètres de personnalisation de l'interface utilisateur](/images/setup-onyxia-onpremise-part1/onyxia-updateui.png "Onyxia après des paramètres de personnalisation de l'interface utilisateur")

## Onyxia avec des utilisateurs

L'identification (le fait de déclarer qui l'on est) et l'authenfication (le fait de prouver que l’on est bien celui qu’on prétend être) seront déléguées à [Keycloak](https://www.keycloak.org/). Nous utiliserons la version 26.3.3 de [Keycloak](https://www.keycloak.org/) depuis le chart [Helm](https://helm.sh/) en version 25.2.0. À noter que depuis août 2025, [Bitnami](https://bitnami.com/) ne proposera gratuitement qu’un ensemble réduit d’images sécurisées sous le tag latest, tandis que les anciennes versions seront déplacées vers le dépôt `bitnamilegacy` sans mises à jour.  Nous allons nous limiter à utiliser la version 25.2.0 disponible dans le dépôt `bitnamilegacy`.

### Installation Keycloak

* Créer un fichier _keycloak-values.yaml_ et copier le contenu suivant tout en l'adaptant à votre besoin (changement de domaine). Penser à changer la valeur de `mydomain.fr` par le domaine que vous souhaitez.

```yaml
postgresql:
  enabled: true
  image:
    repository: bitnamilegacy/postgresql
  auth:
    postgresPassword: "test"
    username: "keycloak"
    password: "test"
    database: "keycloak"
global:
  security:
    allowInsecureImages: true
image:
  repository: bitnamilegacy/keycloak
auth:
  adminUser: keycloak
  adminPassword: test
production: true
tls:
  enabled: false
  autoGenerated:
    enabled: false
proxyHeaders: xforwarded
proxy: edge
httpRelativePath: "/auth/"
replicaCount: 1
ingress:
  enabled: true
  annotations:
    nginx.ingress.kubernetes.io/proxy-buffer-size: 128k
  hostname: auth.lab-onyxia.mydomain.fr
  extraTls:
    - hosts:
      - auth.lab-onyxia.mydomain.fr

extraStartupArgs: "--features=preview --log-level=org.keycloak.events:debug"
extraEnvVars:
  - name: ONYXIA_RESOURCES_ALLOWED_ORIGINS
    value: "https://onyxia.mydomain.fr, http://localhost, http://127.0.0.1"
  - name: KEYCLOAK_LOG_LEVEL
    value: DEBUG

initContainers: |
  - name: realm-ext-provider
    image: curlimages/curl
    imagePullPolicy: IfNotPresent
    command:
      - sh
    args:
      - -c
      - |
        curl -L -f -S -o /extensions/onyxia-web.jar https://github.com/InseeFrLab/onyxia/releases/download/v10.28.8/keycloak-theme.jar
    volumeMounts:
      - name: empty-dir
        mountPath: /extensions
        subPath: app-providers-dir

externalDatabase:
  host: keycloakv3-postgresql
  port: 5432
  user: keycloak
  password: test
  database: keycloak
```

Dans ce fichier plusieurs choses : l'utilisation des images du dépôt `bitnamilegacy` en attente d'avoir les dernières versions. L'initialisation en utilisant `initContainers` afin de télécharger un thème spécifique. Les mots de passes par défaut devront être changé après l'installation. Le sous-domaine de [Keycloak](https://www.keycloak.org/) sera `auth.lab-onyxia`.

```bash
helm install onyxiakeycloak oci://registry-1.docker.io/bitnamicharts/keycloak --version 25.2.0 -f keycloak-values.yaml --create-namespace --namespace onyxia-keycloak
```

Le résulat attendu est le suivant

```bash
Pulled: registry-1.docker.io/bitnamicharts/keycloak:25.2.0
Digest: sha256:3e12451e0300902bafa1e588e62cce8ad3467dc3d6bf15352c25a0393a75fc6e
NAME: onyxiakeycloak
LAST DEPLOYED: Thu Oct  2 17:07:49 2025
NAMESPACE: onyxia-keycloak
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
CHART NAME: keycloak
CHART VERSION: 25.2.0
APP VERSION: 26.3.3

⚠ WARNING: Since August 28th, 2025, only a limited subset of images/charts are available for free.
    Subscribe to Bitnami Secure Images to receive continued support and security updates.
    More info at https://bitnami.com and https://github.com/bitnami/containers/issues/83267

** Please be patient while the chart is being deployed **

Keycloak can be accessed through the following DNS name from within your cluster:

    onyxiakeycloak.onyxia-keycloak.svc.cluster.local (port 80)

To access Keycloak from outside the cluster execute the following commands:

1. Get the Keycloak URL and associate its hostname to your cluster external IP:

   export CLUSTER_IP=$(minikube ip) # On Minikube. Use: `kubectl cluster-info` on others K8s clusters
   echo "Keycloak URL: http://auth.lab-onyxia.mydomain.fr/"
   echo "$CLUSTER_IP  auth.lab-onyxia.mydomain.fr" | sudo tee -a /etc/hosts

2. Access Keycloak using the obtained URL.
3. Access the Administration Console using the following credentials:

  echo Username: keycloak
  echo Password: $(kubectl get secret --namespace onyxia-keycloak onyxiakeycloak -o jsonpath="{.data.admin-password}" | base64 -d)

WARNING: There are "resources" sections in the chart not set. Using "resourcesPreset" is not recommended for production. For production installations, please set the following values according to your workload needs:
  - resources
+info https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/

⚠ SECURITY WARNING: Original containers have been substituted. This Helm chart was designed, tested, and validated on multiple platforms using a specific set of Bitnami and Tanzu Application Catalog containers. Substituting other containers is likely to cause degraded security and performance, broken chart features, and missing environment variables.

Substituted images detected:
  - docker.io/bitnamilegacy/keycloak:26.3.3-debian-12-r0

⚠ SECURITY WARNING: Verifying original container images was skipped. Please note this Helm chart was designed, tested, and validated on multiple platforms using a specific set of Bitnami and Bitnami Secure Images containers. Substituting other containers is likely to cause degraded security and performance, broken chart features, and missing environment variables.
```

Deux pods devront être créés à savoir celui pour la base de données PostgreSQL et celui pour [Keycloak](https://www.keycloak.org/). Ce dernier étant long à démarrer, tester la disponibilité des pods par la ligne de commande suivante.

```
kubectl get pods -n onyxia-keycloak
```

Le résultat attendu

```
NAME                          READY   STATUS    RESTARTS        AGE
onyxiakeycloak-0              1/1     Running   1 (8m13s ago)   10m
onyxiakeycloak-postgresql-0   1/1     Running   0               10m
```

* Ouvrir un navigateur web et saisir l'URL suivante : <https://auth.lab-onyxia.mydomain.fr/auth>

![Connexion à Keycloak après l'installation](/images/setup-onyxia-onpremise-part1/keycloak-signin.png "Connexion à Keycloak après l'installation")

Le nom d'utilisateur et le mot de passe ont été précisé dans le fichier _keycloak-values.yaml_ à savoir `keycloak` et `test`. 

La première chose que nous allons effectuer est la création d'un nouveau compte administrateur car le compte `keycloak` est temporaire (recommandation de [Keycloak](https://www.keycloak.org/)).

* Depuis le realm `keycloak` choisir le menu **Users** et créer un utilisateur `admin` (**Add User**). Depuis l'onglet **Role Mapping** assigner le rôle `admin` (**Assign role** -> **Realm roles** et choisir `admin`) et changer enfin le mot de passe via l'onglet **Credentials**. 

![Création d'un compte utilisateur admin](/images/setup-onyxia-onpremise-part1/keycloak-changepassword.png "Création d'un compte utilisateur admin")

### Intégration Keycloak avec Onyxia

Intéressons-nous maintenant à l'intégration de [Keycloak](https://www.keycloak.org/) avec [Onyxia](https://www.onyxia.sh/), afin que [Keycloak](https://www.keycloak.org/) devienne le gestionnaire de compte utilisateur pour [Onyxia](https://www.onyxia.sh/). Dans cette première version d'intégration, les utilisateurs seront créés par l'administrateur de [Keycloak](https://www.keycloak.org/) et nous désactiverons la création de compte à la volée.

* Créer un nouveau realm `onyxia` via le menu **Manage realms**. Vous devrez cliquer sur **Create realm** et saisir dans **Realm name** la valeur `onyxia`. Pour valider cliquer sur **Create**.

![Création d'un realm onyxia](/images/setup-onyxia-onpremise-part1/keycloak-createrealm.png "Création d'un realm onyxia")

* Sélectionner le nouveau realm `onyxia`

![Sélection du realm onyxia](/images/setup-onyxia-onpremise-part1/keycloak-currentrealm.png "Sélection du realm onyxia")

Toutes les demandes d’autorisation pour [Onyxia](https://www.onyxia.sh/) seront désormais gérées depuis ce realm. Il est toutefois nécessaire de procéder à sa configuration, notamment pour définir le thème graphique utilisé sur les formulaires d’identification ou encore pour déterminer si la création de comptes est autorisée.

* Depuis le menu de latéral, cliquer sur **Realm settings**.

* Depuis l'onglet **Login**, désactiver l'option de création d'utilisateur (`User registration`) afin d'éviter de pouvoir créer à la volée des utilisateurs.

![Configuration realm onyxia : login](/images/setup-onyxia-onpremise-part1/keycloak-configurerealm-login.png "Configuration realm onyxia : login")

* Depuis l'onglet **Email** configurer les informations pour permettre l'envoi d'email. Les paramètres à choisir dépendent des informations dont vous disposez. Le bouton **Test connection** vous permet de tester si tout fonctionne correctement.

![Configuration realm onyxia : login](/images/setup-onyxia-onpremise-part1/keycloak-configurerealm-email.png "Configuration realm onyxia : email")

* Depuis l'onglet **Themes** choisir le thème fourni par [Onyxia](https://www.onyxia.sh/) pour les champs d'édition **Login theme** et **Email theme**. 

![Configuration realm onyxia : themes](/images/setup-onyxia-onpremise-part1/keycloak-configurerealm-themes.png "Configuration realm onyxia : themes")

* Depuis l'onglet **Localization** ajouter de nouvelles langues. L'identification devra pouvoir gérer l'anglais et le français.

![Configuration realm onyxia : localization](/images/setup-onyxia-onpremise-part1/keycloak-configurerealm-localization.png "Configuration realm onyxia : localization")

Il nous reste maintenant à créer un client [Keycloak](https://www.keycloak.org/) afin de permettre à [Onyxia](https://www.onyxia.sh/) de s’appuyer sur lui pour l’authentification et de lui faire confiance.

* Créer un nouveau client via le menu **Clients**, puis cliquer sur **Create client**.

![Création d'un client](/images/setup-onyxia-onpremise-part1/keycloak-createclient0.png "Création d'un client")

* Dans le champ d'édition **Client ID** saisir la valeur `onyxia`.

![Création d'un client : identification du client](/images/setup-onyxia-onpremise-part1/keycloak-createclient1.png "Création d'un client : identification du client")

* Sélectionner l'option `Direct access grants` pour que le nom d'utilisateur le mot de passe puisse être envoyé à [Keycloak](https://www.keycloak.org/) afin de recevoir par la suite un jeton d'accès.

![Création d'un client : configuration](/images/setup-onyxia-onpremise-part1/keycloak-createclient2.png "Création d'un client : configuration")

* Saisir dans le champ d'édition **Rool URL** la valeur `https://onyxia.mydomain.fr`, puis dans le champ d'édition **Valid redirects URIs** la valeur `https://onyxia.mydomain.fr/*` et enfin dans le champ d'édition `Web origins` la valeur `*`.

![Création d'un client : configuration des accès](/images/setup-onyxia-onpremise-part1/keycloak-createclient3.png "Création d'un client : configuration des accès")

* Après la création du client, modifier la valeur pour le champ d'édition **Login theme** en choisissant `onyxia`.

![Création d'un client : configuration de l'apparence](/images/setup-onyxia-onpremise-part1/keycloak-createclient4.png "Création d'un client : configuration de l'apparence")

Pour tester le client [Keycloak](https://www.keycloak.org/), il faut au moins créer un utilisateur.

* Depuis [Keycloak](https://www.keycloak.org/) avec le realm `onyxia` courant, créer un compte utilisateur `test`.

Du côté configuration [Onyxia](https://www.onyxia.sh/), il faut modifier le fichier _onyxia-values.yaml_ pour préciser le client [Keycloak](https://www.keycloak.org/) précédemment construit. 

* Modifier le fichier _onyxia-values.yaml_ afin d'ajouter les éléments de la clé `env` ainsi que le changement pour la valeur `singleNamespace`. L'authentification se fera à partir d'OpenID.

```yaml
ingress:
  enabled: true
  hosts:
    - host: onyxia.mydomain.fr
web:
  ...
api:
  serviceAccount:
    create: true
    clusterAdmin: true

  env:
    security.cors.allowed_origins: "*"
    authentication.mode: "openidconnect"
    oidc.issuer-uri: "https://auth.lab-onyxia.mydomain.fr/auth/realms/onyxia"
    oidc.clientID: "onyxia"
    oidc.audience: "onyxia"

  regions:
    [
      {
        id: "onyxia_id",
        name: "Onyxia",
        description: "Instance Onyxia de TEST.",
        services: {
          type: "KUBERNETES",
          singleNamespace: false,
          authenticationMode: "serviceAccount",
          namespacePrefix: "onyxia-user-",
          expose: {
            domain: "lab-onyxia.mydomain.fr"
          },
        },
      },
    ]
```

* Mettre à jour la version [Onyxia](https://www.onyxia.sh/).

```bash
helm update onyxia onyxia/onyxia -f onyxia-values.yaml --version 10.29.2 --create-namespace --namespace onyxia
```

* Depuis l'application web [Onyxia](https://www.onyxia.sh/), cliquer sur le bouton **Connexion** (en haut à droite) pour faire apparaître le formulaire d'authentification.

![Formulaire d'authentification](/images/setup-onyxia-onpremise-part1/onyxia-login.png "Formulaire d'authentification")

À cette étape [Onyxia](https://www.onyxia.sh/) a pu appeler le client `onyxia` de [Keycloak](https://www.keycloak.org/) puisque le formulaire d'authentification est affiché.

* Se connecter avec le compte utilisateur `test` et malheureusement vous devriez obtenir une erreur de type 401.

Pour comprendre l'erreur, afficher la console développeur du navigateur et chercher la requête correspondant à l'erreur 401. Au niveau de l'en-tête de la réponse, la clé `Www-Authenticate` devrait retourner cette erreur `Bearer error="invalid_token", error_description="An error occurred while attempting to decode the Jwt: The required audience onyxia is missing", error_uri="https://tools.ietf.org/html/rfc6750#section-3.1`. Elle précise que le jeton JWT (fourni par OpenID) ne contient pas dans la clé `aud` la valeur `onyxia`. La configuration realm `onyxia` depuis [Keycloak](https://www.keycloak.org/) doit être modifiée.

* Depuis le menu latéral, cliquer sur **Client scopes** puis sur **Create client scope**. Dans le champ d'édition `Name` saisir la valeur `onyxia`.

![Création d'un client scope](/images/setup-onyxia-onpremise-part1/keycloak-createclientscope0.png "Création d'un client scope")

* Une fois créée, sélectionner l'onglet **Mappers** puis cliquer sur **Configure a new mapper** et choisir `Audience`.

* Dans le champ d'édition `Name`, saisir la valeur `Audience for Onyxia` et dans le champ d'édition `Included Client Audience`, sélectionner la valeur `onyxia` puis cliquer sur `Save`.

![Configuration d'un client scope](/images/setup-onyxia-onpremise-part1/keycloak-createclientscope1.png "Configuration d'un client scope")

Il reste désormais à ajouter cette nouvelle configuration au client `onyxia` de [Keycloak](https://www.keycloak.org/).

* Depuis le menu latéral, cliquer sur **Clients** et sélectionner `onyxia`. Depuis l'onglet **Client scopes**, cliquer sur **Add client scope** et sélectionner `onyxia`.

![Ajout d'un client scope à un client](/images/setup-onyxia-onpremise-part1/keycloak-addclientscope.png "Ajout d'un client scope à un client")

Il est possible de vérifier le contenu du jeton JWT directement depuis [Keycloak](https://www.keycloak.org/) en spécifiant un utilisateur disponible dans la base.

* Depuis le menu latéral, cliquer sur **Client** et sélectionner le client `onyxia`. Depuis l'onglet **Client scopes**, sélectionner le sous onglet **Evaluate**. Dans le champ d'édition **Users** saisir `test`.

![Évaluation de la valeur d'un jeton JWT](/images/setup-onyxia-onpremise-part1/keycloak-evaluate.png "Évaluation de la valeur d'un jeton JWT")

Comme vous pouvez le remarquer, la clé `aud` contient deux valeurs qui sont `onyxia` et `account`.

* Depuis l'interface web de [Onyxia](https://www.onyxia.sh/), se connecter et normalement vous ne devriez pas obtenir d'erreur.

### Configuration d’un fournisseur d’identité OpenID dans Keycloak

Dans la section précédente, nous avons présenté l'utilisation de [Keycloak](https://www.keycloak.org/) avec des utilisateurs créés directement par l'administrateur de [Keycloak](https://www.keycloak.org/). Dans cette section, nous allons montrer comment intégrer un fournisseur d'identité OpenID externe. Dans ce cas de figure, les personnes accédant à [Onyxia](https://www.onyxia.sh/) peuvent provenir soit du système d'information existant (via le fournisseur d'identité OpenID externe), soit de comptes locaux créés manuellement par l'administrateur [Keycloak](https://www.keycloak.org/).

Concernant le fournisseur d’identité OpenID externe, j’utiliserai celui proposé par l’hébergeur des services que je déploie. Il est bien entendu possible d’utiliser d’autres fournisseurs, tels que ceux proposés par Google ou Meta. Quel que soit le fournisseur d’identité OpenID retenu, trois informations seront nécessaires pour configurer [Keycloak](https://www.keycloak.org/) :

1. L'URL du endpoint : adresse du fournisseur d’identité (OpenID Provider) qui expose les points d’accès nécessaires à l’authentification (<https://auth-cas.mydomain.fr/authentification/oidc/.well-known>);
2. Le client ID : identifiant public de l’application déclarée auprès du fournisseur d’identité (n'est pas secret car disponible sur le client) ;
3. Le client secrète : mot de passe associé au Client ID (ne pas divulguer et seul [Keycloak](https://www.keycloak.org/) le conservera).

* Depuis le menu latéral, cliquer sur **Identiy Providers** et sélectionner le fournisseur `OpenID Connect v1.0`.

![Ajouter un fournisseur OIDC](/images/setup-onyxia-onpremise-part1/keycloak-addoidcprovider.png "Ajouter un fournisseur OIDC")

* Préciser dans les champs d'édition **Alias** et **Display Name** la valeur `oidc`. Au niveau du champ d'édition **Discovery endpoint**, donner l'URL du endpoint. Enfin, remplir les champs d'édition **Client ID** et **Client Secret**.

![Compléter les informations du fournisseur OIDC](/images/setup-onyxia-onpremise-part1/keycloak-addoidcproviderdetail.png "Compléter les informations du fournisseur OIDC")

* Au niveau du champ de sélection **Sync mode**, choisir la valeur `Import`. Ainsi, les informations du compte seront importées une seule fois lors de la création de l'utilisateur.  Vous pouvez également utiliser le mode `Force` qui permet de mettre à jour les informations du compte à chaque nouvelle connexion.

![Configurer les informations du fournisseur OIDC](/images/setup-onyxia-onpremise-part1/keycloak-configureoidcproviderdetail.png "Configurer les informations du fournisseur OIDC")

* Pour vérifier que tout fonctionne, vous pouvez consulter l'URL suivante : <https://auth.lab-onyxia.mydomain.fr/auth/realms/onyxia/.well-known/openid-configuration>

La réponse fournit des informations permettant, entre autres, de déterminer quels attributs sont renvoyés par le fournisseur d’identité OpenID :

```xml
  "claims_supported": [
    "aud",
    "sub",
    "iss",
    "auth_time",
    "name",
    "given_name",
    "family_name",
    "preferred_username",
    "email",
    "acr"
  ]
```

À cette étape de configuration lors de la phase d'authentification, vous pourrez le faire soit en passant par le fournisseur d'identité OpenID fraichement configuré soit passer par les comptes créés manuellement par l'administrateur [Keycloak](https://www.keycloak.org/).

![Formulaire d'authenfication avec deux possibilités](/images/setup-onyxia-onpremise-part1/onyxia-multiple-login.png "Formulaire d'authenfication avec deux possibilités")

Quand vous choisissez l'authentification par le fournisseur d'identité OpenID, vous aurez un formulaire qui vous demandera de compléter les données. 

![Formulaire pour compléter les informations de l'utilisateur](/images/setup-onyxia-onpremise-part1/onyxia-completeuserdata.png "Formulaire pour compléter les informations de l'utilisateur")

La raison, c'est que notre fournisseur d'identité OpenID regroupent les informations utilisateur dans un objet `attributes` car il s'appuie fortement sur LDAP. [Keycloak](https://www.keycloak.org/) n'arrive donc pas à créer un utilisateur avec les informations minimalistes (`userName`, `email`, `firstName` et `lastName`).

Nous montrons dans la suite comment faire correspondre (mapper) des attributs du fournisseur (claim) qui sont contenus dans un objet `attributes` avec des attributs du modèle utilisateur [Keycloak](https://www.keycloak.org/).

```javascript
"attributes": {
  "uid": ["baronm"],
  "displayName": ["Mickaël BARON"],
  "givenName": ["Mickaël"],
  "sn": ["BARON"],
  "email": ["mickael.baron@ensma.fr"]
}
```

* Éditer la configuration du fournisseur d'identité OpenID et sélectionner l'onglet **Mappers**.

![Configuration des mappers](/images/setup-onyxia-onpremise-part1/keycloak-configuremappers.png "Configuration des mappers")

* Cliquer sur **Add mapper**, saisir dans le champ d'édition **Name** la valeur `email`, choisir le type de correspondance **Mapper Type** la valeur `Attribute Importer`, saisir dans le champ d'édition **Claim** la valeur `attributes.email` et dans le champ de sélection **User Attribute Name** la valeur `email`.

![Configuration du mapper email](/images/setup-onyxia-onpremise-part1/keycloak-configureemailmapper.png "Configuration du mapper email")

* Procéder de la même façon pour les attributs `firstName` et `lastName`.

![Configuration de tous les mappers](/images/setup-onyxia-onpremise-part1/keycloak-allmappers.png "Configuration de tous les mappers")

Vérifier que la configuration est opérationnelle en vous authentifiant via le fournisseur d'identité OpenID. A l'issue de cette opération, un nouvel utilisateur sera créer directement dans [Keycloak](https://www.keycloak.org/). Les informations `userName`, `email`, `firstName` et `lastName` proviendront du fournisseur de service OpenID.

## Conclusion

Dans ce premier billet, nous avons posé les bases du déploiement d’[Onyxia](https://www.onyxia.sh/) en environnement on-premises sur Kubernetes. Après une installation volontairement simple de la plateforme, nous avons progressivement introduit la gestion des utilisateurs et de l’authentification en nous appuyant sur [Keycloak](https://www.keycloak.org/). Cette approche incrémentale permet de mieux comprendre chaque brique, leurs interactions et les points de configuration essentiels.

Nous avons ainsi vu comment :

- déployer [Onyxia](https://www.onyxia.sh/) via [Helm](https://helm.sh/) et personnaliser son interface ;
- installer et configurer [Keycloak](https://www.keycloak.org/) comme gestionnaire d’identités ;
- intégrer Onyxia avec [Keycloak](https://www.keycloak.org/) via OpenID Connect ;
- gérer les audiences et les jetons JWT ;
- fédérer un fournisseur d’identité OpenID externe ;
- et mapper correctement les attributs utilisateur lorsque ceux-ci ne sont pas exposés de manière standard.

Cette première étape permet déjà de disposer d’une plateforme [Onyxia](https://www.onyxia.sh/) pleinement fonctionnelle, sécurisée et intégrée à un système d’authentification. 

Dans le prochain billet, nous verrons comment définir des droits spécifiques par utilisateur afin de contrôler finement l’accès aux ressources critiques, en particulier les GPU. Pour cela, nous utiliserons le principe de `roles` dans [Onyxia](https://www.onyxia.sh/).