---
title: Glasspane en SWT
tags: [Java, SWT]
blogger_orig_url: https://keulkeul.blogspot.com/2007/10/glasspane-en-swt.html
category: technical
---

S'il y a bien une chose assez pénible dans la toolkit SWT quand on vient du monde Swing, c'est l'absence de *glasspane* au niveau des fenêtres. 

Pour rappel le *glasspane* est une couche (*layout*) au niveau d'une fenêtre permettant de fournir une zone translucide. L'intérêt est de pouvoir dessiner ce que l'on souhaite et de combiner la partie translucide avec le contenu de la fenêtre de l'application. Concrètement, le *glasspane* permet d'ajouter des effets assez intéressants (voir [démos](http://www.curious-creature.org/) de Romain Guy).

L'exemple proposé dans ce billet n'a pas la prétention d'émuler à l'identique le *glasspane* de Swing. Il s'agit d'une première ébauche.

Le principe utilisé consiste à ajouter à la fenêtre principale de l'application deux sous fenêtres. Celles-ci utilisent la transparence via une fonction native de l'OS pour aboutir à un effet *glasspane* (Pour Win32 il s'agit de la fonction `SetLayeredWindowAttributes`). La première sous fenêtre appelée `transparencyShell` à un niveau de transparence complet. L'alpha est placé au minimum à 1, pas à 0, sinon la *Shell* serait invisible et donc il n'y aurait plus de réaction aux événements utilisateur mais assez pour ne plus la voir. La seconde fenêtre appelée `glassPaneShell` est aussi transparente mais uniquement pour une couleur donnée (couleur à choisir).  

Plusieurs scénarios pour comprendre le fonctionnement.

* Quand le *glasspane* est activé (les deux sous *Shell* sont visibles et la transparence est activée) et si l'interaction est effectuée sur une zone balayée par le couleur transparente, `transparencyShell` récupère alors l'événement et le route à `glassPaneShell`.
* Quand le *glasspane* est activé et si l'interaction est effectuée sur une zone non balayée par la couleur transparente, `glassPaneShell` récupère l'événement.

Par conséquent, `transparencyShell` n'est utile que pour bloquer les événements à la fenêtre principale et à les transférer à `glassPaneShell`.

La mécanique du *glasspane* en SWT est déléguée à la classe `SWTGlassPane` (création des sous *Shell*, activation de la transparence, routage des événements, etc).

Pour tester le tout, je me suis inspiré de l'exemple fourni par le tutorial de Swing au sujet du [glasspane](https://docs.oracle.com/javase/tutorial/uiswing/components/rootpane.html).

**Sans Glasspane**

![/images/glasspanedisabled.jpg](/images/glasspanedisabled.jpg)

**Avec Glasspane**

![/images/glasspaneenabled.jpg)](/images/glasspaneenabled.jpg)

L'aspect intéressant montré dans cet exemple est la possibilité de communiquer avec le contenu de la *Shell* principale. Si le *glasspane* est activé, il n'est pas possible d'interagir directement avec l'IHM de la *Shell* principale. En effet, tous les événements sont routés à `glassPaneShell`. Par conséquent, du côté client il faut préciser les retours possibles sur l'IHM de la fenêtre principale.  
  
Les problèmes à résoudre prochainement :  

* quand le Glasspane est activé et qu'une interaction via la sours se produit, le focus sur la fenêtre principale est perdu. Normal le focus passe sur une sous *Shell*.
* le niveau d'opacité sur la *Shell* de `glassPaneShell`.
* les deux sous fenêtres (`transparencyShell` et `glasspaneShell`) sont liées à la fenêtre applicative. Ainsi tout déplacement/redimensionnement de cette dernière implique le déplacement et le redimensionnement des deux autres. Pour l'instant, un problème de refresh subsiste.

Voici le code source : [ici](/files/swtglasspane.zip).
