---
title: Push Server via Multipart et DWR
tags: [Java, web]
blogger_orig_url: https://keulkeul.blogspot.com/2007/12/push-server-via-multipart-et-dwr.html
category: technical
---

L'idée de ce billet est de vous présenter deux solutions pour faire du push serveur.

La première n'utilise pas de bibliothèque mais s'appuie sur le protocole HTTP via le type de contenu `multipart/mixed`. La seconde utilise la bibliothèque DWR (Direct Web Remoting). Pour chacune des solutions le code source est présenté.

Depuis mes travaux de doctorat, je m'intéresse à tout ce qui touche au domaine de l'interaction homme machine (architecture logicielle, boîte à outils, modélisation du dialogue, prise en compte des besoins utilisateur, etc.). J'ai de ce fait pas mal roulé ma bosse concernant le développement d'applications de type client lourd avec la boîte à outils AWT/Swing (deux projets SUIDT et [K-MADe](https://forge.lias-lab.fr/projects/kmade)) et dernièrement avec la plateforme Eclipse avec SWT/JFace (cours traitant du sujet : [SWT](/eclipse/intro-swt) et JFace). Toutefois concernant les clients légers, il faut dire que je me suis plus intéressé à l'aspect architecture côté présentation (Struts et JSF) en délaissant la couche graphique à proprement parler. Depuis la montée en interactivité des clients web via l'AJAX (technique dite *pull client* : le client va chercher les données sur le serveur et les traite) je me suis toujours demandé s'il était possible de faire l'inverse, c'est-à-dire du reverse AJAX. En fait, il s'agirait de faire du push serveur, c'est-à-dire que c'est le serveur qui transmettrait les données à sa demande. C'est donc le serveur qui notifie le client de changement et non l'inverse.

Pour mes besoins actuels, une seule bibliothèque m'a vraiment séduite il s'agit de [DWR](http://directwebremoting.org/dwr/) (Direct Web Remoting). Elle cache les niveaux XMLHttpRequest, elle utilise du java via une servlet et enfin du côté html/javascript il est possible d'appeler des fonctions java comme si elles étaient présentes dans le navigateur.

L'idée de ce billet est de vous présenter deux solutions pour faire du push serveur. La première n'utilise pas de librairies mais s'appuie sur le protocole HTTP via le ContentType multipart/mixed. La seconde utilise la librairie DWR (Direct Web Remoting). Pour chacune des solutions le code source est présenté.

Pour ces deux solutions, nous utiliserons une même étude de cas : une horloge rafraîchie toutes les une seconde.

## Multipart/mixed

Cette première solution utilise le type MIME spécifique : `multipart/mixed`. Ce type MIME, précisé dans le Content-Type de la réponse, autorise l'ouverture d'une connexion HTTP de longue durée. En fait cette ouverture est contrôlée par le serveur. Par ailleurs, pendant l'ouverture de la connexion HTTP des données peuvent être envoyées vers le client lors de différentes parties. Généralement `multipart/mixed` est utilisé pour envoyer des fichiers avec différents type de contenu (fichiers, images, textes brutes, etc). Le fonctionnement détaillé est le suivant :

* dans une première étape, il faut envoyer un message avec un type de contenu `multipart/mixed` en précisant la limite (boundary) de chaque partie : `Content-type: multipart/mixed; boundary="end"` ;
* pour chaque partie, construire une réponse en la terminant par la limite : `--end` puis la retourner au client ;
* pour fermer la connexion HTTP, dans la dernière réponse à construire terminer la par la limite : `--end--` et la retourner au client.

Vous trouverez ci-dessous une servlet qui utilise le principe de `multipart/mixed` pour simuler une horloge. Le serveur retourne toutes les une seconde une nouvelle valeur de la date.

```java
public class PushServerServlet extends HttpServlet {

 protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException { 
   ServletOutputStream out = res.getOutputStream(); 
   res.setContentType("multipart/x-mixed-replace;boundary=End");
   out.println(); 
   out.println("--End"); 
     for (int i = 10; i > 0; i--) {
       out.println("Content-Type: text/plain");
       out.println(); 
       out.println(new Date().toString()); 
       out.println(); 
       out.println("--End");
       out.flush(); 
       try { 
         Thread.sleep(1000); 
       } catch (InterruptedException e) {
       }
     }
     out.println("Content-Type: text/plain");
     out.println();
     out.println("Fin");
     out.println("--End--");
     out.flush();
 }
}
```

La servlet commence par modifier le type de contenu de la réponse à `multipart/x-mixed-replace;boundary=End`. De cette manière la limite d'une partie est fixée par la chaine `--END`. Ensuite une boucle sur dix occurences est réalisée. À chaque occurence l'heure est envoyée à la réponse qui est terminée par la chaîne `--END`. Veuillez noter que pour déclencher un envoi de la réponse au client, un appel explicite est réalisé via l'instruction `flush()`. De manière à temporiser la boucle, une pause d'une seconde est réalisée. Enfin, pour fermer la connexion HTTP le message `--END--` est envoyé à la réponse.

Malheureusement nous remarquons que cette solution impose que la connexion entre le client/serveur soit toujours maintenue et qu'aucun traitement utilisateur sur le client ne puisse être réalisé.

## DWR (Direct Web Remoting)

Cette solution utilise la technique Comet également appelé « The Slow load techniquue » (technique du chargement lent) ou encore « long lived HTTP » (requête de longue durée). Cette technique a pour objectif de lancer une requête HTTP extrêmement lente. De ce fait le serveur maintient le contact avec le client sur une très longue durée. En contrepartie, ce mode de fonctionnement impose qu'une connection HTTP soit toujours ouverte entre le client et le serveur et cela demande donc une surcharge de travail supplémentaire au serveur.

Ci-dessous est présenté le code complet permettant de simuler une horloge via du reverse ajax avec DWR.

Le premier fichier correspond au *web.xml*. Nous décrivons ici quelle sera la Servlet (`org.directwebremoting.servlet.DwrServlet`) qui sera en charge d'effectuer le traitement lors d'un appel à la bibliothèque DWR. Notez par ailleurs que le mode « ReverseAjax » a été activé explicitement.

```xml
<web-app>

 <display-name>Exemple qui permet de simuler une horloge via Reverse Ajax de DWR</display-name>
   <servlet>
     <servlet-name>dwr-invoker</servlet-name>
     <display-name>DWR Servlet</display-name>
     <description>Direct Web Remoter Servlet</description>
     <servlet-class>org.directwebremoting.servlet.DwrServlet</servlet-class>
     <init-param>
       <param-name>debug</param-name>
       <param-value>true</param-value>
     </init-param>
     <init-param>
       <param-name>activeReverseAjaxEnabled</param-name>
       <param-value>true</param-value>
     </init-param>
     <load-on-startup>1</load-on-startup>
   </servlet>
   <servlet-mapping>
     <servlet-name>dwr-invoker</servlet-name>
     <url-pattern>/dwr/*</url-pattern>
   </servlet-mapping>
</web-app>
```

Le deuxième fichier correspond à *index.html*. Cette page affiche un bouton **Start/Stop** qui permet d'activer ou pas l'horloge. Une zone d'écriture identifiée par l'id `clockDisplay` permet de définir une zone d'écriture pour la date. L'idée proposée ici est de permettre au serveur de modifier le contenu du composant `clockDisplay`.

Par ailleurs, les bibliothèques JavaScript (engine et util) sont précisées et permettent d'utiliser les fonctionnalités de DWR. L'appel au fichier *Clock.js* est géré par la servlet définie précédemment. En fait, nous verrons dans les fichiers suivants que *Clock.js* permet au client d'accéder directement à un objet Java stocké sur le serveur. Pour revenir au bouton, celui-ci, quand l'utilisateur réalise un clique, fait un appel à la fonction JavaScript `Clock.toggleClock()` qui indirectement est une fonction Java.

```xml
<html xmlns="http://www.w3.org/1999/xhtml">

 <head>
   <title>index</title>
   <script type='text/javascript' src='dwr/interface/Clock.js'> </script>
   <script type='text/javascript' src='dwr/engine.js'> </script>
   <script type='text/javascript' src='dwr/util.js'> </script>
  </head>
  <body onload="dwr.engine.setActiveReverseAjax(true);">
    <h1>Server Side Reverse Ajax Clock</h1>
    <input type="button" value="Start / Stop" onclick="Clock.toggleClock();"/>
    <div style="font-size:200%;" id="clockDisplay"></div>
  </body>
</html>
```

Nous présentons ci-dessous la classe `Clock` contenant une méthode `toggleClock()` désignée précédemment par la fonction JavaScript `Clock.toggleClock()`. Ainsi au moment de l'appel à cette fonction côté client, DWR va appeler la méthode `toggleClock` de l'objet Java `Clock`. Un thread Java est créé à chaque appel de `toggleClock()`. Veuillez noter enfin que cette méthode effectue des modifications sur les pages clientes ("sessions") en modifiant le composant identifié `clockDisplay` dans la page *index.html*.

```java
public class Clock implements Runnable {

 private transient boolean active = false;
 private WebContext wctx = null;
 public Clock() {
   wctx = WebContextFactory.get();
 }
 public synchronized void toggleClock() {
   active = !active;
   if (active) {
     new Thread(this).start();
   }
 }
 public void run() {
   String currentPage = wctx.getCurrentPage();
   active = true;
     try {	
       while (active) {
         Collection sessions = wctx.getScriptSessionsByPage(currentPage);
         Util utilAll = new Util(sessions);
         utilAll.setValue("clockDisplay", new Date().toString());
         Thread.sleep(1000);
       }
       Collection sessions = wctx.getScriptSessionsByPage(currentPage);
       Util pages = new Util(sessions);
       pages.setValue("clockDisplay", "Terminé");
     } catch (InterruptedException ex) {
       ex.printStackTrace();
     }
   }
}
```

Pour finir, le fichier *dwr.xml* s'occupe de définir les objets Java qui seront exposés dans le javascript du client.

```xml
<dwr>

 <allow>
   <create creator="new" javascript="Clock" scope="application">
     <param name="class" value="javaee.dwr.clock.Clock"/>
   </create>
  </allow>
</dwr>
```

Il est à noter que les prochaines versions de DWR devraient intégrer le support de l'écouteur HTTP [Grizzly](https://javaee.github.io/grizzly/) écrit en NIO (New Input/Output). Des informations complémentaires peuvent être trouvées ici. Les serveurs [Glassfish](https://javaee.github.io/glassfish/) et [Jetty](https://www.eclipse.org/jetty/) supportent actuellement [Grizzly](https://javaee.github.io/grizzly/).

## Conclusion

Ajax a permis d'augmenter l'intéractivité au niveau des sites web. Le champ d'utilisation de reverse AJAX (push serveur) est, je pense, tout autant important. Il va être possible de créer facilement des sites web avec des notifications qui ne sont plus à la demande du client mais du serveur. Nous pouvons imaginer concrètement une application financière qui nécessite un rafraichissement déclenché par la modification d'une donnée financière. Le serveur sera à même d'avertir les clients de tout changement. De nombreux travaux sont en cours pour améliorer les performances du reverse AJAX tant au niveau du navigateur ([Opera](https://dev.opera.com/blog/event-streaming-to-web-browsers/) par exemple) qu'au niveau du serveur d'application [Grizzly](https://jfarcand.wordpress.com/page/14/?app-download=ios).