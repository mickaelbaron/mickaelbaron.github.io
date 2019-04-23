---
title: Emmanuel Bernard au JUG Poitou-Charentes pour présenter Hibernate Search et HibernateOGM
tags: [Hibernate]
blogger_orig_url: https://keulkeul.blogspot.com/2011/06/emmanuel-bernard-au-jug-poitou.html
category: announcement
twitter: 79634101530931200
description: Emmanuel Bernard est venu présenter Hibernate Search et Hibernate OGM au JUG Poitou-Charentes, je vous propose un compte-rendu de la soirée.
---

Jeudi dernier (9 juin 2011) avait lieu la dernière session du [JUG Poitou-Charentes](http://www.poitoucharentesjug.org/xwiki/bin/view/Main/soiree%20juin%202011) avant la pause estivale. Nous avons eu droit pour cette occasion à deux excellentes présentations données par [Emmanuel Bernard](http://twitter.com/#%21/emmanuelbernard) de [JBoss](http://www.jboss.org/) sur [Hibernate Search](http://www.hibernate.org/subprojects/search.html) et [Hibernate OGM](http://community.jboss.org/en/hibernate/ogm).  

Hibernate Search est une API qui s'ajoute à Hibernate permettant de faire de la recherche fulltext sur le contenu de la base de données. Cette API s'appuie sur [Apache Lucene](http://lucene.apache.org/java/docs/index.html) pour réaliser l'indexation du contenu. Emmanuel s'est attaché, avec brio, à expliquer comment ajouter les fonctionnalités de Hibernate Search dans un développement existant (nouvelles annotations spécifiques). La simplicité d'interrogation avec une API adaptée pour la recherche a été montrée. Cette dernière a montré sans aucun doute que des recherches complexes peuvent être menées en toute simplicité. Parfois, je me demandais même si je ne pouvais pas remplacer certaines des mes requêtes complexes HQL/JPQL par ce mécanisme de recherche.  

Hibernate OGM présenté en second m'a tout simplement bluffé tant l'idée est simple et efficace. Vous prenez actuellement toutes les solutions [NoSQL](http://nosql-database.org/) du marché et vous vous retrouvez avec quatre familles distinctes (clé/valeur, orientées colonnes, orientées documents et graphes). Seulement le problème c'est que vous avez une API différente pour chacune, un langage de requête spécifique. Bref, pour manipuler ces bases c'est galère et sans compter l'apprentissage nécessaire. L'objectif d'Hibernate OGM (Object Grid Mapper) offre une implémentation JPA (manipulation d'object et requêtes JP-QL) tout en stockant et requêtant les données d'une grille clé/valeur. Ainsi, il offre une API familière tout en permettant de bénéficier des possibilités de scalabilité des solutions NoSQL. Hibernate OGM inclus notamment de supporter des applications JPA existantes.  

Lors de la présentation il s'est attardé à montrer comment on pouvait représenter les données objets dans une représentation verticale clé/valeur. Toutes les modélisations (associations simples et multiples) y sont passées. Pour l'instant ça se limite à la solution NoSQL [InfiniteSpan](http://www.jboss.org/infinispan) (BD Grille en mémoire). Toutefois des dialectes pour d'autres solutions et familles sont prévus.  

Actuellement Hibernate OGM est encore en phase de prototype (version alpha). Toutefois Emmanuel s'est avancé à préciser une date de sortie pour la release prévue pour la fin d'année.  

D'autres solutions du même type :

* [DataNucleus](http://www.datanucleus.org/) ;
* [Spring Data Graph](http://www.springsource.org/spring-data/neo4j) en relation avec [NEO4J](http://neo4j.org/).

Comme j'ai été séduit par cette solution, je vous propose prochainement un billet pour débuter avec Hibernate OGM et j'espère qu'au fur et à mesure de l'évolution de la bibliothèque étoffer par d'autres billets. Une autre cible pour la série des J'ai besoin ... d'utiliser Hibernate OGM.