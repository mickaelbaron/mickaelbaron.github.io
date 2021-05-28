---
title: J'ai besoin de... communiquer en Python et Java vers XO-Server en passant par du Websocket/JSON-RPC
tags: [Xen]
category: technical
description: Dans ce billet j'explique comment communiquer en Python et Java vers XO-Server, le backend de Xen Orchestra
twitter: 1398330862387744769
---

Dans un précédent [billet](/blog/2019/09/09/xen-point-montage-dom0), j'expliquais que j'utilisais l'hyperviseur [Xen](https://xenproject.org/) dans la structure où je travaille. Depuis quelques mois, nous avons fait évoluer cette solution [Xen](https://xenproject.org/) pour migrer de [Citrix Hypervisor](https://www.citrix.fr/downloads/citrix-hypervisor/) vers [XCP-NG](https://xcp-ng.org/). C'est le même hyperviseur [Xen](https://xenproject.org/), mais la solution [XCP-NG](https://xcp-ng.org/) est plus ouverte et offre des fonctionnalités intéressantes comme l'augmentation du nombre de serveurs par Pool (de 3 pour [Citrix Hypervisor](https://www.citrix.fr/downloads/citrix-hypervisor/) à 16 pour [XCP-NG](https://xcp-ng.org/)) et la gestion de [cloud-init](https://cloud-init.io/). 

Un des points intéressants avec [XCP-NG](https://xcp-ng.org/), c'est **l'impossibilité de ne pas utiliser** le gestionnaire [XenCenter](https://docs.citrix.com/en-us/xencenter). C'est un outil réservé à la version [Citrix Hypervisor](https://www.citrix.fr/downloads/citrix-hypervisor/) qui ne s'installe et ne s'utiilse que sous Windows. Ne pas pouvoir l'utiliser pouvait devenir une contrainte, mais c'est surtout une libération. [XCP-NG](https://xcp-ng.org/) offre le choix d'utiliser ce que vous [souhaitez](https://xcp-ng.org/docs/management.html). Dans mon cas, je suis parti pour utiliser [Xen Orchestra](https://xen-orchestra.com/) que j'utilisais à titre expérimental depuis ses débuts et qui devient désormais l'outil officiel pour gérer les machines virtuelles.

[Xen Orchestra](https://xen-orchestra.com/) est bien pensé et a été architecturé en plusieurs modules dont [xo-server](https://github.com/vatesfr/xen-orchestra/tree/master/packages/xo-server) le backend et [xo-web](https://github.com/vatesfr/xen-orchestra/tree/master/packages/xo-web) le frontend. Un autre outil rend l'administration intéressante et automatisable c'est l'outil [xo-cli](https://github.com/vatesfr/xen-orchestra/tree/master/packages/xo-cli) qui propose de réaliser les mêmes choses que sur l'interface web, mais depuis la ligne de commande. L'outil [xo-cli](https://github.com/vatesfr/xen-orchestra/tree/master/packages/xo-cli) communique vers [xo-server](https://github.com/vatesfr/xen-orchestra/tree/master/packages/xo-server) via le protocole Websocket [JSON-RPC](https://www.jsonrpc.org). 

Pour des besoins dans la structure où je travaille, j'avais besoin de communiquer avec [xo-server](https://github.com/vatesfr/xen-orchestra/tree/master/packages/xo-server) via le langage Python. Le problème c'est 1) que [xo-cli](https://github.com/vatesfr/xen-orchestra/tree/master/packages/xo-cli) a été dévéloppé en JavaScript via Node.js et 2) que je ne souhaitais pas appeler [xo-cli](https://github.com/vatesfr/xen-orchestra/tree/master/packages/xo-cli) depuis mon programme Python. 

Je vais donc expliquer dans le reste de ce billet (le contexte du problème étant largement décrit), comment j'ai pu réaliser la communication entre un programme Python et [xo-server](https://github.com/vatesfr/xen-orchestra/tree/master/packages/xo-server). Je me restreindrai à la partie cliente. La partie serveur est fournie par [xo-server](https://github.com/vatesfr/xen-orchestra/tree/master/packages/xo-server). Pour le fun et parce que j'❤️ Java, je me suis amusé à faire la même chose avec ce langage.

Le protocole [JSON-RPC](https://www.jsonrpc.org) est assez simple. Il est similaire au protocole [XML-RPC](https://en.wikipedia.org/wiki/XML-RPC). Le client envoie une requête avec dans son corps un document JSON. Ce document JSON contient une structure imposée par la spécification [JSON-RPC](https://www.jsonrpc.org) permettant l'appel à une méthode particulière. Ci-dessous, un exemple qui permet d'invoquer la méthode `session.signIn` avec des paramètres.

```
--> {"id":0,"jsonrpc":"2.0","method":"session.signIn","params":{"username":"jsmith","password":"passw0rd"}}
<-- {"id":0,"jsonrpc":"2.0","result":{"id":"ad2593b0-97c7-446f-bc0e-f5558c013d52","email":"jsmith","groups":[],"permission":"admin","preferences":{}}}
```

Dans le cas de la communication via [WebSocket](https://www.w3.org/TR/websockets/) [JSON-RPC](https://www.jsonrpc.org), c'est le même principe que celui expliqué ci-dessus, sauf que le protocole [WebSocket](https://www.w3.org/TR/websockets/) est utilisé comme moyen de transport.

Sous Python, j'ai utilisé la bibliothèque [jsonrpc_websocket](https://github.com/emlove/jsonrpc-websocket) prête à l'emploi pour gérer [JSON-RPC](https://www.jsonrpc.org) avec [WebSocket](https://www.w3.org/TR/websockets/). Cette bibliothèque s'appuie sur [aiohttp](https://docs.aiohttp.org) pour la partie [WebSocket](https://www.w3.org/TR/websockets/).

Ci-dessous le code permettant de se connecter à [xo-server](https://github.com/vatesfr/xen-orchestra/tree/master/packages/xo-server), de lister l'ensemble des méthodes disponibles, de s'identifier (via la mtéthode `session.signIn` et d'invoquer la méthode `xo.getAllObjects` pour récupérer des informations sur les différents objets de Xen.

```python
import json
import aiohttp
import asyncio

from jsonrpc_websocket import Server

async def routine():
    async with aiohttp.ClientSession() as client:
        server = Server('ws://XO_SERVER_IP/api/', client)

        await server.ws_connect()

        # No signIn required
        methodsInfoResult = await server.system.getMethodsInfo()
        print('\n'.join([str(e) for e in methodsInfoResult.keys()]))

        # signIn required
        result = await server.session.signIn(username='YOUR_LOGIN', password='YOUR_PASSWORD') # email attribute is working in place of username
        result = await server.xo.getAllObjects(filter={"type": "VIF"}, limit=10)

        print('[')
        print(', \n'.join([str(json.dumps(e, indent=4)) for e in result.values()]))
        print(']')

asyncio.get_event_loop().run_until_complete(routine())
```

Veuillez faire attention lors de la création de l'objet `Server` de finir l'URL par un `/`. À noter également que la méthode `xo.getAllObjects` permet de filtrer, mais pas de restreindre l'affichage d'une propriété. Ce traitement doit être fait de manière programmatique. L'ensemble des paramètres à transmettre aux méthodes sont données ici : <https://pastebin.com/D0qkWeuv>

**Petite remarque amusante, après avoir coder l'exemple ci-dessus, j'ai trouvé une solution identique sur le Github de la bibliothèque : <https://github.com/emlove/jsonrpc-websocket/issues/8>.**

Sous Java, il n'existe pas de bibliothèque prête à l'emploi pour gérer [JSON-RPC](https://www.jsonrpc.org) avec [WebSocket](https://www.w3.org/TR/websockets/). Je suis donc parti de [Tyrus](https://eclipse-ee4j.github.io/tyrus/) qui gère les [WebSocket](https://www.w3.org/TR/websockets/).

```java
public class XOServerClient {

	private static CountDownLatch messageLatch;

	public static void main(String[] args) {
		try {			
			final ClientEndpointConfig cec = ClientEndpointConfig.Builder.create().build();
			ClientManager client = ClientManager.createClient();
			Session currentSession = client.connectToServer(new Endpoint() {
				@Override
				public void onOpen(Session session, EndpointConfig config) {
					session.addMessageHandler(new MessageHandler.Whole<String>() {

						@Override
						public void onMessage(String message) {
							System.out.println("Received message: " + message);
							messageLatch.countDown();
						}
					});
				}
			}, cec, new URI("ws://XO_SERVER_IP/api/"));
			
			messageLatch = new CountDownLatch(1);
			JsonRpc getMethodsInfo = new JsonRpc();
			getMethodsInfo.setMethod("system.getMethodsInfo");	
			currentSession.getBasicRemote().sendText(new JSONObject(getMethodsInfo).toString());
			messageLatch.await();
			
			messageLatch = new CountDownLatch(1);
			JsonRpc signIn = new JsonRpc();
			signIn.setMethod("session.signIn");
			signIn.getParams().put("username", "YOUR_LOGIN");
			signIn.getParams().put("password", "YOUR_PASSWORD");
			currentSession.getBasicRemote().sendText(new JSONObject(signIn).toString());
			messageLatch.await();

			messageLatch = new CountDownLatch(1);
			JsonRpc getAllObjects = new JsonRpc();
			getAllObjects.setMethod("xo.getAllObjects");
			getAllObjects.getParams().put("limit", 10);
			getAllObjects.getParams().put("filter", Map.of("type", "VIF"));
			currentSession.getBasicRemote().sendText(new JSONObject(getAllObjects).toString());
			messageLatch.await();
			
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
```

J'ai dû utiliser un sémaphore pour rendre bloquant la réponse aux appels des méthodes de [xo-server](https://github.com/vatesfr/xen-orchestra/tree/master/packages/xo-server) via un `CountDownLatch`.

Le code de la classe `JsonRpc` qui permet d'encapsuler la construction de l'objet Json.

```java
public class JsonRpc {
	
	private Long id = 0L;
	private String jsonrpc = "2.0";
	private String method;
	private Map<String, Object> params = new HashMap<String, Object>();

  ... Get and Set
}
```

Enfin, le fichier de description Maven _pom.xml_ pour identifier clairement les dépendances.

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<groupId>fr.mickaelbaron</groupId>
	<artifactId>ws-jsonrpc-xoserver</artifactId>
	<version>0.0.1-SNAPSHOT</version>

	<properties>
		<websocket.version>1.1</websocket.version>
		<tyrus.version>1.15</tyrus.version>
		<jackson-databind.version>2.12.1</jackson-databind.version>
		<json.version>20210307</json.version>

		<maven.compiler.version>3.1</maven.compiler.version>
		<maven.compiler.source>11</maven.compiler.source>
		<maven.compiler.target>11</maven.compiler.target>
		<maven.dependency.version>3.1.1</maven.dependency.version>
	</properties>
	<dependencies>
		<dependency>
			<groupId>org.glassfish.tyrus</groupId>
			<artifactId>tyrus-client</artifactId>
		</dependency>
		<dependency>
			<groupId>org.glassfish.tyrus</groupId>
			<artifactId>tyrus-container-grizzly-client</artifactId>
		</dependency>
		<dependency>
			<groupId>org.json</groupId>
			<artifactId>json</artifactId>
			<version>${json.version}</version>
		</dependency>
	</dependencies>
	<dependencyManagement>
		<dependencies>
			<dependency>
				<groupId>org.glassfish.tyrus.bundles</groupId>
				<artifactId>tyrus-bundles</artifactId>
				<version>${tyrus.version}</version>
				<type>pom</type>
				<scope>import</scope>
			</dependency>
			<dependency>
				<groupId>com.fasterxml.jackson.core</groupId>
				<artifactId>jackson-databind</artifactId>
				<version>${jackson-databind.version}</version>
			</dependency>
		</dependencies>
	</dependencyManagement>
</project>
```

Clairement, le programme Python est plus minimaliste, mais c'est compréhensible car 1) une bibliothèque encapsule le redondance de certains codes et 2) des structures de langages facilitent le développement (vivie les list comprehension).