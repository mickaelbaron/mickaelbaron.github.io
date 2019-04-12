---
title: J'ai besoin d'... ajouter dynamiquement des éléments à un menu Eclipse
tags: [Eclipse]
blogger_orig_url: https://keulkeul.blogspot.com/2009/12/jai-besoin-d-ajouter-dynamiquement-des.html
description: Ce billet montre comment créer et afficher une commande dans un menu en ajoutant une restriction visibleWhen.
category: technical
---

Lars Vogel propose sur son blog un [billet](http://www.vogella.de/blog/2009/12/03/commands-menu-runtime/) qui explique comment créer et afficher une commande à l'exécution d'une application Eclipse.

Sur le support de cours des commandes que je propose depuis [peu](http://keulkeul.blogspot.com/2009/11/introduction-la-construction-de.html), je vais un peu plus loin dans la démonstration. Je montre comment créer et afficher une commande dans un menu en ajoutant une restriction visibleWhen. Je vous propose dans ce billet une explication de cet exemple.

Une vue est utilisée pour ajouter la commande dans le menu principal. Il est ensuite possible d'afficher ou de cacher la commande du menu. Pour cela la vue fournit trois boutons (Create, Hide et Show). Vous trouverez ci-dessous des captures d'écran de l'exemple.  

![/images/hidedynamiccommand.jpg](/images/hidedynamiccommand.jpg)
  
![/images/showdynamiccommand.jpg](/images/showdynamiccommand.jpg)

Au niveau des pré-requis, je suppose qu'une commande et un handler sont définis. L'identifiant de la commande est ...helloworldcommandid  
  
Au niveau du code de l'action du bouton Create, présenté ci-dessous, il est codé que la commande doit s'afficher dans la barre de menu principal (`menu:org.eclipse.ui.main.menu`), que l'identifiant de la commande est ...helloworldcommandid et enfin que la restriction visibleWhen est contrainte par l'expression définie par currentExpression.  

```java
public void createParControl(Composite parent) {  
    ...  
    final Button myButton = new Button(parent, SWT.NONE);  
    myButton.setText("Create");  
    myButton.setLayoutData(myData);  
    myButton.addSelectionListener(new SelectionAdapter() {  
        public void widgetSelected(SelectionEvent e) {  
            IMenuService service = (IMenuService)PlatformUI.getWorkbench().getService(IMenuService.class);  
            AbstractContributionFactory ref = new AbstractContributionFactory("menu:org.eclipse.ui.main.menu", null) {  
                public void createContributionItems(IServiceLocator serviceLocator, IContributionRoot additions) {  
                    CommandContributionItemParameter commandParameter = new CommandContributionItemParameter(serviceLocator, "contributionitem",  
                        "eclipse.workbench.commandsprogrammaticvisiblewhenexamples.helloworldcommandid" CommandContributionItem.STYLE\_PUSH);
                    currentExpression = new Expression() {  
                        public EvaluationResult evaluate(IEvaluationContext context) throws CoreException {  
                            if (isVisible) {  
                                return EvaluationResult.TRUE;  
                            } else {  
                                return EvaluationResult.FALSE;  
                            } 
                        }  
                    };  
                    item = new CommandContributionItem(commandParameter);  
                    additions.addContributionItem(item, currentExpression);  
                }  
            };  
            service.addContributionFactory(ref);  
            myButton.setEnabled(false);  
        }  
    });  
...  
}
```

Dans la méthode evaluate, vous noterez que l'attribut isVisible est utilisé pour aiguiller si la commande doit être affichée ou pas. Toute la difficulté est de notifier l'expression lorsque l'attribut isVisible est modifié. Pour cela, j'ai examiné le code source de la plateforme Eclipse (merci l'Open Source) et j'ai remarqué que les expressions utilisées pour les restrictions visibleWhen étaient notifiées lorsque la Shell de la WorkbenchWindow recevait un événement Activate.  
  
Ci-dessous est présenté le code utilisé pour mettre à jour l'expression définie par currentExpression.  

```java
private void updateExpression() {  
    WorkbenchWindow current = (WorkbenchWindow)PlatformUI.getWorkbench().getActiveWorkbenchWindow();  
    final Set<evaluationreference> menuRestrictions = current.getMenuRestrictions();  
    if (menuRestrictions == null) {
        return;
    }  
    IEvaluationService es = (IEvaluationService)PlatformUI.getWorkbench().getService(IEvaluationService.class);  
    IEvaluationContext currentState = es.getCurrentState();  
    EvaluationReference\[\] refs = (EvaluationReference\[\]) menuRestrictions.toArray(new EvaluationReference\[menuRestrictions.size()\]);  
    boolean changeDetected = false;  
    for (EvaluationReference evalRef : refs) {  
        final Expression expression =evalRef.getExpression();  
  
        if (expression == currentExpression) {  
            evalRef.setPostingChanges(true);  
            boolean os = evalRef.evaluate(currentState);  
            evalRef.clearResult();  
            boolean ns = evalRef.evaluate(currentState);  
            if (os != ns) {  
                changeDetected = true;  
                evalRef.getListener().propertyChange(new PropertyChangeEvent(evalRef, evalRef.getProperty(), valueOf(os), valueOf(ns)));  
            }  
        }  
    }  
  
    if (changeDetected) {  
        IMenuService ms = (IMenuService) PlatformUI.getWorkbench().getService(IMenuService.class);  
        if (ms instanceof WorkbenchMenuService) {  
            ((WorkbenchMenuService) ms).updateManagers();  
        }  
    }  
}
```

Si vous examinez la méthode liftRestrictions de la classe WorkbenchWindow, vous noterez que cela est très similaire. De manière à éviter de rafraichir l'intégralité des expressions des restrictions visibleWhen, j'ai placé un filtre sur l'expression définie précédemment.  
  
Enfin, sur le code des actions des boutons hide et show, l'attribut isVisible est modifié et la méthode updateExpression est appelée. Ci-dessous est présenté le code de l'action show.

```java
public void createPartControl(Composite parent) {  
    ...  
    Button hideMenuContribution = new Button(parent, SWT.NONE);  
    hideMenuContribution.setText("Hide");  
    hideMenuContribution.setLayoutData(myData);  
    hideMenuContribution.addSelectionListener(new SelectionAdapter() {  
        public void widgetSelected(SelectionEvent e) {  
            isVisible = false;  
            updateExpression();  
        }  
    });  
}
```

Les codes sources de l'exemple sont disponibles à cette [adresse](/files/commandsprogrammaticvisiblewhenexamples.zip).