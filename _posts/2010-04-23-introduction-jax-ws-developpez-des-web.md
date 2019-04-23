---
title: 'Introduction à JAX-WS : développez des services web étendus avec Java'
tags: SOA
blogger_orig_url: https://keulkeul.blogspot.com/2010/04/introduction-jax-ws-developpez-des-web.html
category: lectures
description: Comme les concepts des services web étendus ont été introduits, je vous propose maintenant de développer des services web étendus via la plateforme Java.
---

Je continue la série de supports de cours concernant les services web (billets : [introduction]({% post_url 2010-02-15-introduction-aux-architectures %}), [wsdl]({% post_url 2010-03-09-introduction-wsdl-decrire-et-configurer %}) et [SOAP]({% post_url 2010-03-23-introduction-soap-communiquer-avec-un%})). Comme les concepts ont été introduits, je vous propose maintenant de développer des services web étendus via la plateforme Java.

Ce support de cours présente JAX-WS ([JSR-224](http://jcp.org/en/jsr/summary?id=224)), une API pour développer des services web étendus (WSDL + SOAP) via la plateforme de développement Java.

Voici le découpage :  

* une présentation générale de la spécification JAX-WS est donnée en première partie ;
* le développement de services web côté serveur est ensuite abordé via deux points de vue (approche montante et approche descendante) ;
* une partie expliquant comment utiliser JAX-WS dans un client pour appeler un service web étendu ;
* les parties suivantes s'intéressent à décrire les annotations, le mécanisme d'intercepteur (handler) et l'utilisation de JAX-WS via Java SE 6 et via les EJBs ;
* pour illustrer les concepts introduits dans le support de cours une partie pratique met en œuvre un client pour interroger les services web fournis par eBay ;
* enfin, un tutoriel est donné en dernière partie pour présenter étape par étape le développement de services web étendus via Netbeans 6.8 et Glassfish 3.

Vous trouverez sur ce [lien](/soa/developper-serviceweb-jaxws) un contenu détaillé de ce support de cours.

L'intégralité des exemples sont disponibles sur mon compte Github : [https://github.com/mickaelbaron/jaxws-examples](https://github.com/mickaelbaron/jaxws-examples).

{% include slides.html type="speakerdeck" id="620fb0deecfb43c2a18c30169b0b846a" %}
