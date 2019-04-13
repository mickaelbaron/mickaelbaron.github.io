---
title: J'ai besoin d'... exposer mes services OSGi en service web via JAX-WS et Java 6
tags: [Java, JAX-WS]
blogger_orig_url: https://keulkeul.blogspot.com/2010/02/jai-besoin-d-exposer-mes-services-osgi.html
description: Je montre dans ce billet comment il est possible d'utiliser JAX-WS dans un bundle OSGi qui expose des services.
category: technical
---

Depuis quelques temps je suis en train de découvrir le framework service web [JAX-WS](https://jax-ws.dev.java.net/) et j'essaye de voir s'il peut être utilisé dans différentes situations non conventionnelles. A cette occasion, je montre dans ce billet comment il est possible d'utiliser JAX-WS dans un bundle OSGi qui expose des services. Plus précisément, j'utilise les fonctionnalités offertes par Java 6 pour le déploiement de services web JAX-WS sans utiliser de serveur d'application. Un serveur intégré à Java 6 est automatiquement créé pour l'occasion.  

Une fois créé le bundle (appelé JAXWSWithOSGI), une interface Java doit être définie décrivant le contrat du service OSGI.

```java
@WebService  
public interface IHelloWorldService {  
  String makeHelloWorld();  
}
```

À noter que l'annotation @WebService est utilisée pour exposer cette interface comme un service web.  
  
Ci-dessous, la classe l'implémentation du service HelloWorldImpl décrit le traitement du service web.

```java
@WebService(endpointInterface="jaxwswithosgi.IHelloWorldService")  
public class HelloWorldImpl implements IHelloWorldService {  
  public String makeHelloWorld() {  
    return "Hello World";  
  }  
}
```

Au niveau de la classe `Activator` (classe utilisée pour la gestion du cycle de vie du bundle), nous définissons au niveau du démarrage du bundle (méthode `start()`) l'instance de l'implémentation du service et l'enregistrement auprès du registre de services du conteneur OSGI. Par la suite, nous utilisons la classe `Endpoint` pour exposer le service OSGI comme service web. À noter que le premier paramètre de la méthode `publish()` permet d'indiquer l'URL de déploiement. De ce fait, cette instruction lancera un serveur web très léger permettant d'exposer ce service web.

```java
public class Activator implements BundleActivator {  
  public void start(BundleContext context) throws Exception {  
    IHelloWorldService ref = new HelloWorldImpl();  
    context.registerService(IHelloWorldService.class.getName(), ref, new Hashtable());  
  
    publish = Endpoint.publish("http://localhost:8080/IHelloWorldService", ref);  
    System.out.println("Bundle started.");  
  }  
  
  public void stop(BundleContext context) throws Exception {  
    publish.stop();  
  
    System.out.println("Bundle stopped.");  
  }  
}
```

Dans la méthode `stop()` de la classe `Activator`, nous indiquons que l'exposition du service web doit se terminer.  

Pour utiliser JAX-WS, il faut ajouter les bibliothèques (Jar) de l'implémentation de référence qui est Metro dans le *classpath* du bundle. La liste des fichiers est donnée ci-dessous :  

* *webservices-api.jar* ;
* *webservices-extra.jar* ;
* *webservices-extra-api.jar* ;
* *webservices-rt.jar* ;
* *webservices-tools.jar*.

Démarrer une configuration d'exécution pour effectuer le test. Vous remarquerez qu'au démarrage du bundle que le service web est publié à l'adresse <http://localhost:8080/IHelloWorldService>. De même l'accès au document WSDL se fait via cette adresse <http://localhost:8080/IHelloWorldService?wsdl>.

Il ne reste plus qu'à développer un client JAX-WS en partant de la description WSDL.