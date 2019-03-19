---
title: Communication bidirectionnelle entre application Eclipse RCP et page HTML
tags: [Eclipse]
blogger_orig_url: https://keulkeul.blogspot.com/2007/12/communication-bidirectionnelle-entre.html
category: technical
description: Depuis peu je m'intéresse à la bibliothèque DWR qui permet de cacher les niveaux XMLHttpRequest et d'appeler, du côté JavaScript, des méthodes Java très facilement comme si elles étaient présentes dans le navigateur.
---

Depuis peu je m'intéresse à la bibliothèque [DWR](http://getahead.org/dwr) qui permet de cacher les niveaux XMLHttpRequest et d'appeler, du côté JavaScript, des méthodes Java très facilement comme si elles étaient présentes dans le navigateur ([voir précédent billet](http://keulkeul.blogspot.com/2007/12/push-server-via-multipart-et-dwr.html)). Avec DWR, il est donc possible de communiquer du client vers le serveur (pull client) mais également du côté serveur vers le client (push server).

L'objectif de ce billet est de vous présenter un premier prototype qui utilise les deux types de communication de manière à réaliser une communication bidirectionnelle entre une page html et une application RCP.

De manière synthétique voici le fonctionnement général de ce prototype.

## Côté client léger

Une page HTML classique est utilisée contenant un champ de texte et un bouton. Lors de la saisie puis de la validation sur le bouton, le contenu via DWR est envoyé du côté serveur.

![/images/web.jpg](/images/web.jpg)

## Client lourd

Une application RCP propose une vue contenant un composant *Browser* (pour diffuser l'application web précédente), un champ de texte et un bouton de validation. Lors de la validation la donnée du champ de texte est envoyée vers la page HTML et affichée dans le champ de texte de cette page. L'application Eclipse RCP embarque un serveur d'application [Jetty](http://www.mortbay.org/) de façon à déployer l'application web contenant la page HTML et la librairie DWR.  
  
![/images/rcp.jpg](/images/rcp.jpg)

Ce prototype met en avant plusieurs points techniques que nous détaillons dans la suite de ce billet.

## Code de l'application RCP

L'idée est de pouvoir démarrer un serveur d'application au travers d'une application Eclipse RCP, voir code ci-dessous.

```java
class ServerThread extends Observable implements Observer, Runnable {  
  private String value;  
  
  public ServerThread() {  
    new Thread(this).start();  
  }

  public void run() {  
    Server server = new Server();  
    Connector connector = new SelectChannelConnector();  
    connector.setPort(Integer.getInteger("jetty.port", 8080).intValue());  
    server.setConnectors(new Connector\[\] { connector });  
    webapp = new WebAppContext();  
    webapp.setAttribute("desktopandweb", this);  
    webapp.setContextPath("/");  
    webapp.setWar("c:\\\\javaee.dwr.clientside");  
    server.setHandler(webapp);  
    try {  
      server.start();  
      server.join();  
    } catch (Exception exception) {  
      exception.printStackTrace();  
    }  
  }  
  
  public void setValue(String value) {  
    this.setChanged();  
    this.notifyObservers(value);  
  }  
  
  public void update(Observable observable, Object param) {  
    value = param.toString();  
    Display.getDefault().asyncExec(new Runnable() {  
      public void run() {  
        View.this.myText.setText(value.toString());  
      }  
    });  
  }  
}
``` 

Pour simplifier, j'ai placé arbitrairement l'application web à déployer à la racine du lecteur C. Par ailleurs, le serveur est démarré dans un processus différent de celui du thread principal de l'application RCP. À ce niveau pour accéder à l'application Web lors de l'exécution de l'application RCP, il suffit de modifier l'URL du composant Browser à la valeur <http://localhost:8080>.
  
La communication entre l'application RCP et l'application web est obtenue au travers du contexte de l'application web. En fait, l'instance courante de `ServerThread` est placée comme attribut du contexte (nom de l'attribut : `desktopandweb`). De cette manière du côté de l'application web, il suffira de récupérer l'instance de la classe `ServerThread` pour réaliser un pont de communication entre les deux applications. Par ailleurs comme l'application web ne peut connaître la classe `ServerThread`, puisqu'elle est localisée dans l'application RCP, nous utilisons le patron de conception Observer/Observable comme service de communication.

Ainsi, l'application RCP est à la fois *Observable* et *Observer*. Elle est *Observable* puisqu'elle peut notifier ses *Observers* (en l'occurence l'application web) que des modifications ont été réalisées de son côté. Elle est *Observer* puisqu'elle est notifiée de changements via un *Observable* (en l'occurence l'application web). Comme vous vous en doutez, l'application web est également *Observer* et *Observable*. Lorsque l'application RCP est notifiée de changement, la méthode `update` est déclenchée. La nouvelle valeur à afficher dans le champ de texte de l'application RCP est passée en paramètre.

## Code de l'application Web  

Du côté de l'application web à déployer une classe Java (`ClientSide`) sert de relais entre la page HTML et l'application RCP. La communication entre cette classe Java et la page HTML est obtenue via DWR (pull client et push server). Le code ci-dessous présente la classe `ClientSide`.
  
```java
public class ClientSide extends Observable implements Observer {  
  private WebContext wctx = null;  
  private static final Log log = LogFactory.getLog(ClientSide.class);  
  
  public ClientSide() {  
    wctx = WebContextFactory.get();  
    Object tt = wctx.getServletContext().getAttribute("desktopandweb");  
    if (tt instanceof Observable) {  
      log.info("Observable trouvé");  
      Observable tto = (Observable) tt;  
      tto.addObserver(this);  
    }  
  
    if (tt instanceof Observer) {  
      log.info("Observer trouvé");  
      Observer te = (Observer) tt;  
      this.addObserver(te);  
    }  
  }  
  
  public void setValue(String value) {  
    this.setChanged();  
    this.notifyObservers(value);  
  }  
  
  public void update(Observable observable, Object param) {  
    try {  
      String currentPage = wctx.getCurrentPage();  
      Util pages = new Util(wctx.getScriptSessionsByPage(currentPage));  
      pages.setValue("text", param.toString());  
      log.info("Valeur envoyée aux clients");  
    } catch (Exception e) {  
      e.printStackTrace();  
    }  
  }  
}  
```
  
Lors de l'instanciation de cette classe par DWR, la valeur de l'attribut `desktopandweb` est récupérée du contexte. Cette valeur correspond à l'instance de l'objet précédemment défini. L'abonnement entre *Observable* et *Observer* est réalisé. Nous venons de finaliser le lien bidirectionnelle entre l'application RCP et l'application Web.
  
Quand une valeur de la page HTML est envoyée à l'objet `ClientSide` (par le biais de DWR), la méthode `setValue` est appelée. Son objectif est de notifier tous les Observers d'un changement en passant en paramètre cette valeur. L'*Observer* dans ce cas correspond à l'application RCP qui va modifier le contenu de son champ de texte.
  
Inversement, si une valeur est modifiée du côté application RCP l'objet `ClientSide` est notifié et la méthode update est appelée. Dans ce cas, le champ identifé par l'`id` text est modifié par l'intermédiaire de la solution ReverseAjax fournie par DWR.
  
## Code source du prototype

Le code source complet de l'application est fournie [ici](/files/desktopandweb.zip).  
  
Vous devez par ailleurs installer [XULRunner](http://developer.mozilla.org/en/docs/XULRunner_1.8.0.1_Release_Notes) puisque le navigateur utilisé sous l'application RCP est celui de Mozilla.  
  
## Perspectives

Ceci est un premier prototype mais l'idée générale est posée :

1. embarquer un serveur d'application du côté client lourd
2. utiliser DWR pour la communication entre les pages web et l'application web
3. appliquer le Design Pattern Observer/Observable pour la communication bidirectionnelle entre application RCP et application web  

Dans la prochaine itération nous tenterons d'effectuer une communication sur une page qui n'est pas localisée dans l'application Web. Nous prendrons arbitrairement une page sur le net. L'idée est d'instrumentaliser cette page en ajoutant un écouteur sur chaque champ de texte. L'écouteur transmettra à notre application la valeur du champ lors d'une modification via DWR. L'instrumentalisation se fera en injectant du javascript via la méthode execute du composant Browser de SWT.