---
title: 'Introductionà JAX-RS : Développer des Web Services REST avec Java'
tags: [SOA]
blogger_orig_url: https://keulkeul.blogspot.com/2011/03/introductiona-jax-rs-developper-des-web.html
category: lectures
twitter: 51729499208945664
---

Je vous propose un nouveau support de cours présentant l'API JAX-RS (JSR 311) qui permet de développer des services Web REST avec la plateforme Java.  

Le plan de ce support de cours est le suivant :

* présentation générale de la spécification JAX-RS ;
* présentation de l'implémentation de référence JERSEY ;
* notions de chemin via `@Path` ;
* Template parameters ;
* sub-resource locator ;
* méthodes HTTP via `@GET`, `@POST`, `@PUT` et `@DELETE` ;
* paramètres de requêtes via `@PathParam`, `@QueryParam`, `@FormParam`, `@HeaderParam` et `@Context` ;
* représentations des données via `@Consumes` et `@Produces` ;
* gestion de contenu ;
* manipulation des réponses via la classe `Response` ;
* constructeurs d'URI via UriBuilder ;
* déploiement ;
* API cliente fournie par JERSEY.

Vous trouverez sur ce [lien](/soa/developper-serviceweb-rest-jaxrs) un contenu détaillé de ce support de cours.

L'intégralité des exemples sont disponibles sur mon compte Github : [https://github.com/mickaelbaron/jaxrs-examples](https://github.com/mickaelbaron/jaxrs-examples).

{% include slides.html type="speakerdeck" id="c213e56aec064b178f0147850be84798" %}