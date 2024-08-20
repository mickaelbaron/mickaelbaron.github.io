---
title: Running Coder in a K3s cluster self-hosted
tags: [DevOps, Kubernetes, Coder]
category: technical
description: "This post aims at describing the deployment of Coder on a Kubernetes cluster via the K3s distribution."
english: true
toc: true
twitter: 1664646863302082560
---

This post aims at describing the deployment of [Coder](https://coder.com/) on a Kubernetes cluster via the [K3s](https://k3s.io/) distribution. 

[Coder](https://coder.com/) is an online development environment platform that offers the possibility to code directly from a web browser. All the compilation toolchain is then deported on the server. [Coder](https://coder.com/) provides a ready-to-use remote development environment and reduces the installation and configuration issues that could arise from the heterogeneity of developer's workstation architectures and software used.

This kind of solution has gained popularity in recent years, with several alternative solutions such as: 

* [Gitpod](https://www.gitpod.io/)
* [EclipseCHE](https://www.eclipse.org/che/)
* [JupyterHub](https://jupyter.org/hub)
* [GitHub Codespaces](https://github.com/features/codespaces)
* [Codeanywhere](https://codeanywhere.com/)

These alternative solutions have a lot in common, but also some distinguishing features that can make them attractive.

I am interested in deploying an online development platform within a higher education governmental institution. This platform is meant to be used by researchers and students. Several features are mandatory, such as self-hosting, open source, great community, ease of installation, and the ability to handle multiple programming languages.

A first experimentation was based on [Gitpod](https://www.gitpod.io/). Unfortunately, Gitpod no longer supports self-hosting, as explained on the [Gitpod blog](https://www.gitpod.io/blog/introducing-gitpod-dedicated). Furthermore, setting up [Gitpod](https://www.gitpod.io/) was not easy, and I can understand the choice made by [Gitpod](https://www.gitpod.io/) developers, as explained on the blog post, to drop support for self-hosting since there were many issues arising from the heterogeneity of Kubernetes distributions. A second solution was [JupyterHub](https://jupyter.org/hub), which was fairly easy to install but limited to the Python language. In a third experimentation, I therefore turned to [Coder](https://coder.com/). In this post I will explain how I deployed it on a [K3s](https://k3s.io/) cluster.

[Coder](https://coder.com/) solution matches all features I need, because it is [self-hosted](https://coder.com/docs/v2/latest/install), [open source](https://github.com/coder) and has a great[Discord community](https://discord.com/invite/coder). From a technical point of view, [Coder](https://coder.com/) provisions remote development environments via Terraform to supply users with Workspaces. For example, via Terraform, you can specify that you want to use a specific Docker image that contains the necessary compilation toolchain to build Java programs and that you want to install VIM as a code editor. Resources will also be specified, such as the memory or storage capacity of Workspaces. As for [K3s](https://k3s.io/), it is a lightweight Kubernetes distribution designed for production environments with limited resources, such as embedded systems. I appreciate [K3s](https://k3s.io/) because it is designed to be easy to install.

The deployment of [Coder](https://coder.com/) on a [K3s](https://k3s.io/) cluster is broken down into the following steps:

* [Setup](#setup)
* [Install k3s](#install-k3s)
* [Deploy Coder](#deploy-coder)
* [Deploy reverse-proxy](#deploy-reverse-proxy)
    * [NGINX](#nginx)
    * [Apache HTTP](#apache-http)
* [Run and enjoy](#test-coder)
* [Next steps](#next-steps)

All materials can be found on my Github repository: <https://github.com/mickaelbaron/coder-k3s-guide>

## Setup

Before starting the [Coder](https://coder.com/) install process, you must have:

* The following infrastructure (to reproduce the experimentation):
  * Three Ubuntu 22.04 machines with SSH credentials.
    * The hostname of each machine (physical or virtual) is: `k3sserver`, `k3snode1` and `k3snode2`.
    * All machines are on the same vlan.
    * All machines have ports 22 (SSH), 80 (HTTP), 443 (HTTPS) and 6443 (Kubernetes) exposed.
  * A domain (coder.mydomain.com), a subdomain (*.coder.mydomain.com) and a configured DNS to redirect to `k3sserver`.
  * A reverse-proxy (Apache HTTP or NGINX) which will be hosted outside of the Kubernetes cluster.
  * A [Docker](https://www.docker.com/) installation on `k3sserver` to deploy the reverse-proxy.

* Locally
  * [kubectl](https://kubernetes.io/docs/reference/kubectl/)
  * [HELM](https://helm.sh/)

> **Note**: in the following infrastructure, I will present a configuration where TLS certificates will be managed by a reverse-proxy outside of Kubernetes. It is a **restriction** of my higher education governmental institution and I would like to reproduce the same setup and to show you this specific use case. But, I agree in many cases, the ingress could/should also be secured via [cert-manager](https://cert-manager.io/) or by passing TLS certificates in directly. It would be better to stay within the K8s infrastructure.

## Install [K3s](https://k3s.io/)

* Connect to the server node (`k3sserver`) and run:

```console
$ curl -sfL https://get.k3s.io | sh -
```

* Extract the [K3s](https://k3s.io/) token on the server node:

```console
$ sudo cat /var/lib/rancher/k3s/server/node-token
K20545dbddda0f19bf1c9ac794546d200cdc4ede3fe9ad82d5e560ad0748cc28fd4::server:17a174d18d4fd82c0f99b687bd9aabcd
```

> This is my own [K3s](https://k3s.io/) token. You will have to adapt the next few instructions with YOUR [K3s](https://k3s.io/) token.

* Connect to the first agent node (`k3snode1`) and run:

```console
$ export K3S_TOKEN=K20545dbddda0f19bf1c9ac794546d200cdc4ede3fe9ad82d5e560ad0748cc28fd4::server:17a174d18d4fd82c0f99b687bd9aabcd
$ curl -sfL https://get.k3s.io | K3S_URL=https://k3sserver:6443 sh -
```

* Connect to the second agent node (`k3snode2`) and execute the same command line:

```console
$ export K3S_TOKEN=K20545dbddda0f19bf1c9ac794546d200cdc4ede3fe9ad82d5e560ad0748cc28fd4::server:17a174d18d4fd82c0f99b687bd9aabcd
$ curl -sfL https://get.k3s.io | K3S_URL=https://k3sserver:6443 sh -
```

* To get the cluster access file (_k3s.yaml_), from your host, run:

```console
$ scp k3sserver:/etc/rancher/k3s/k3s.yaml .
```

* Update the [K3s](https://k3s.io/) server address (old value: 127.0.0.1) with the new hostname:

```console
$ sed -i '' "s/127.0.0.1/k3sserver/" k3s.yaml
```

* Check the [K3s](https://k3s.io/) cluster:

```console
$ export KUBECONFIG=$PWD/k3s.yaml
$ kubectl get nodes
NAME        STATUS   ROLES                  AGE   VERSION
k3sserver   Ready    control-plane,master   21d   v1.25.6+k3s1
k3snode1    Ready    <none>                 21d   v1.25.6+k3s1
k3snode2    Ready    <none>                 21d   v1.25.6+k3s1
```

> These instructions are based on the [K3s](https://k3s.io/) website: https://docs.k3s.io/quick-start.

## Deploy Coder

* Create a namespace for [Coder](https://coder.com/), named `coder` in this example:

```console
$ kubectl create namespace coder
namespace/coder created
```

* Deploy PostgreSQL on the [K3s](https://k3s.io/) cluster from the [Bitnami](https://bitnami.com/) repository:

```console
$ helm repo add bitnami https://charts.bitnami.com/bitnami
"bitnami" has been added to your repositories

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

* Verify that a PostgreSQL pod has been created:

```console
$ kubectl get pods --namespace coder
NAME                     READY   STATUS    RESTARTS   AGE
coder-db-postgresql-0    1/1     Running   0          22d
```

The cluster-internal DB URL for the PostgreSQL database is:

```
postgres://coder:coder@coder-db-postgresql.coder.svc.cluster.local:5432/coder?sslmode=disable
```

* Create a secret with the database URL:

```console
$ kubectl create secret generic coder-db-url -n coder --from-literal=url="postgres://coder:coder@coder-db-postgresql.coder.svc.cluster.local:5432/coder?sslmode=disable"
```

* Add the Coder Helm repository:

```console
$ helm repo add coder-v2 https://helm.coder.com/v2
```

* Create a [values.yaml](https://github.com/mickaelbaron/coder-k3s-guide/blob/main/coder/values.yaml) configuration file with the suitable settings for your deployment. You should at least update the content following the `# TODO` comments:

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
      value: "https://coder.mydomain.com"
    - name: CODER_WILDCARD_ACCESS_URL
      # TODO
      value: "*.coder.mydomain.com"

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
    host: "coder.mydomain.com"
    # TODO
    wildcardHost: "*.coder.mydomain.com"
    annotations: {}
    tls:
      enable: false
      secretNames: ""
      wildcardSecretName: ""
```

The service will be configured as a ClusterIP. We configure Ingress to handle requests for the (`coder.mydomain.com`) domain.

* Install the HELM chart on your [K3s](https://k3s.io/) cluster:

```console
$ helm install coder coder-v2/coder --namespace coder --values values.yaml
...
```

* Check the pods into the `coder` namespace:

```console
$ kubectl get pods --namespace coder
NAME                     READY   STATUS    RESTARTS   AGE
coder-db-postgresql-0    1/1     Running   0          22d
coder-59c6bc9c77-6f2wj   1/1     Running   0          9m47s
```

> These instructions are based on the [Coder](https://coder.com/) website: https://coder.com/docs/v2/latest/install/kubernetes.

## Deploy reverse-proxy

As mentioned in the setup section, a reverse-proxy will be deployed outside of your Kubernetes cluster.

The reverse-proxy will also be in charge of managing SSL/TLS certificates. Let's describe how to generate certificates with LetsEncrypt.

* Connect to the server node (`k3sserver`) and install Certbot:

```console
$ sudo apt-get update 
$ sudo apt-get install certbot -y
```

* Create the SSL/TLS certificates:

```console
$ sudo certbot certonly --agree-tos -m YOUR_EMAIL --manual --preferred-challenges=dns -d 'coder.mydomain.com' -d '*.coder.mydomain.com' -v
...
```

* Copy the SSL/TLS certificates files (_fullchain.pem_ and _privkey.pem_) into a directory (i.e. _/ssl_):

```console
$ mkdir /ssl
$ cp /etc/letsencrypt/live/coder.mydomain.com-0001/fullchain.pem privkey.pem /ssl
```

* Generate _dhparams.pem_ file:

```console
$ cd /ssl
$ openssl dhparam -out dhparams.pem 4096
```

You need to configure your Kubernetes cluster to update HTTP and HTTPS listen ports.

* Connect to the server node (`k3sserver`) and create a _/var/lib/rancher/k3s/server/manifests/traefik-config.yaml_ file with the following content:

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

* Apply this configuration:

```console
$ kubectl apply -f /var/lib/rancher/k3s/server/manifests/traefik-config.yaml
```

We suppose [Docker](https://www.docker.com/) is installed on the server node (`k3sserver`). 

* Create a Docker network called `reverseproxynetwork`:

```
$ docker network create reverseproxynetwork
```

Two reverse-proxy solutions will be presented: [NGINX](https://www.nginx.com/) and [Apache HTTP](https://httpd.apache.org/). Choose only ONE at your convenience.

### NGINX

* Connect to the server node (`k3sserver`).

* Create an _nginx_ directory:

```console
$ mkdir ~/nginx
``` 

* Create an NGINX configuration file [nginx/conf/coder.conf](https://github.com/mickaelbaron/coder-k3s-guide/blob/main/nginx/conf/coder.conf) with the following content:

```
server {
    listen       80;
    listen       [::]:80;
    server_name  *.coder.mydomain.com;
    return	 301 https://$host$request_uri;
}

server {
   listen       443 ssl;
   server_name  *.coder.mydomain.com;

   ssl_protocols TLSv1.2 TLSv1.3;
   ssl_certificate /ssl/fullchain.pem;
   ssl_certificate_key /ssl/privkey.pem;
   ssl_dhparam /ssl/dhparam.pem;
   ssl_ecdh_curve secp384r1;
   ssl_prefer_server_ciphers on;
   ssl_ciphers EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH;

   location / {
       proxy_pass http://k3sserver:8080/;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "Upgrade";
       proxy_set_header Host $host;
   }
}
```

* Create a file [nginx/docker-compose.yaml](https://github.com/mickaelbaron/coder-k3s-guide/blob/main/nginx/docker-compose.yaml) with the following content:

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

* Create and start the NGINX container:

```console
$ cd ~/nginx
$ docker compose up -d
```

### Apache HTTP

* Connect to the server node (`k3sserver`).

* Create an _apachehttp_ directory.

```console
$ mkdir ~/apachehttp
``` 

* Create an Apache HTTP configuration file [apachehttp/conf/coder.conf](https://github.com/mickaelbaron/coder-k3s-guide/blob/main/apachehttp/conf/coder.conf) with the following content:

```
<VirtualHost *:443>
    SSLEngine On
    SSLProxyEngine on

    SSLProxyVerify none
    SSLProxyCheckPeerCN off
    SSLProxyCheckPeerName off
    SSLProxyCheckPeerExpire off

    SSLProtocol all -SSLv2 -SSLv3 -TLSv1 -TLSv1.1
    SSLHonorCipherOrder On
    SSLCipherSuite "EECDH+ECDSA+AESGCM EECDH+aRSA+AESGCM EECDH+ECDSA+SHA384 EECDH+ECDSA+SHA256 EECDH+aRSA+SHA384 EECDH+aRSA+SHA256 EECDH EDH+aRSA !aNULL !eNULL !LOW !3DES !MD5 !EXP !PSK !SRP !DSS !RC4 !SHA1 !SHA256 !SHA384"
    SSLCompression off

    # HSTS (http://fr.wikipedia.org/wiki/HTTP_Strict_Transport_Security)
    Header unset Strict-Transport-Security
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Port "443"

    # Certificates
    SSLCertificateFile /ssl/fullchain.pem
    SSLCertificateKeyFile /ssl/privkey.pem

    ServerName *.coder.mydomain.com

    ProxyPreserveHost On
    ProxyRequests off
    ProxyPass / http://k3sserver:8080/ upgrade=any
    ProxyPassReverse / http://k3sserver:8080/

    RewriteEngine on

    RewriteCond %{HTTP:Connection} Upgrade [NC]
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteRule /(.*) ws://k3sserver:8080/$1 [P,L]

    # Custom log file for SSL
    ErrorLog /var/log/apachehttp/coder/error.log
    CustomLog /var/log/apachehttp/coder/access.log combined
</VirtualHost>

<VirtualHost *:80>
    ServerName *.coder.mydomain.com
    RewriteEngine On
    RewriteRule (.*) https://%{HTTP_HOST}%{REQUEST_URI}
</VirtualHost>
```

* Copy and update at your convenience the [apachehttp/httpd.conf](https://github.com/mickaelbaron/coder-k3s-guide/blob/main/apachehttp/httpd.conf) configuration file.

* Create a file [apachehttp/docker-compose.yaml](https://github.com/mickaelbaron/coder-k3s-guide/blob/main/apachehttp/docker-compose.yaml) with the following content:

```yaml
services:

  httpd:
    container_name: httpd
    image: httpd:latest
    volumes:
      - ./httpd.conf:/usr/local/apache2/conf/httpd.conf
      - ./conf:/usr/local/apache2/conf/sites
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

* Create and start Apache HTTP container:

```console
$ cd ~/apachehttp
$ docker compose up -d
```

## Test Coder

* Open the <https://coder.mydomain.com> URL with your favorite web browser.

![Coder is running on K3s](/images/coder-sigin.png)

## Next steps

I hope this post helped you deploy [Coder](https://coder.com/) on a Kubernetes cluster via the [K3s](https://k3s.io/) distribution.

I still have a lot to learn on how to use and configure [Coder](https://coder.com/).
In a future post, I will try to provide some feedback on my use of [Coder](https://coder.com/) and Kubernetes. Several questions still remain unanswered:

* How should I scale? How much resources (cpu, memory, disk) should I allocate for each user (student or researcher)?
* What are the limitations of using a remote development environment? How can I integrate hardware used during hands-on exercises (sensors, robots with Raspberry Pis)?
* How can I provide access to users data, especially when hosted on remote volumes?

The answers to these questions, among others, might help me conclude whether [Coder](https://coder.com/) is the solution to my problem.
