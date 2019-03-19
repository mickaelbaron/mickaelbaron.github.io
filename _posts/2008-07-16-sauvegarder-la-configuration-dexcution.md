---
title: Sauvegarder la configuration d'exécution sous Eclipse
tags: [Eclipse]
blogger_orig_url: https://keulkeul.blogspot.com/2008/07/sauvegarder-la-configuration-dexcution.html
category: technical
---

Quand vous utilisez un projet sous Eclipse et que vous souhaitez exécuter ce projet, vous passez généralement par une configuration d'exécution.

L'outil proposé par Eclipse vous facilite l'édition de nombreux paramètres. Prenons le cas d'une application Eclipse, les options généralement modifiées sont les paramètres d'exécution, les plug-ins du framework Eclipse employés et pleins d'autres choses...

Si, comme moi, vous avez besoin de garder une trace de ces modifications (par exemple dans le cas d'une importation d'un projet) vous avez moyen de sauvegarder cette configuration d'exécution dans un fichier.

Pour cela, ouvrez l'outil d'édition des configurations d'exécution via le menu (Run -> Run Configurations...) ou via le bouton de la barre d'outil d'Eclipse montré sur la capture d'écran ci-dessous.

![/images/runconf.jpg](/images/runconf.jpg)

Choisissez l'onglet Common puis sélectionnez l'option Shared file. Précisez un nom en sélectionnant comme répertoire celui du projet auquel la configuration appartient.

![/images/eclipseconf.jpg](/images/eclipseconf.jpg)

Ainsi, dés que vous importerez ce projet dans un autre workspace, la configuration d'exécution sera déjà prête. Elle sera automatiquement affichée dans la liste des configurations. Il ne vous restera qu'à exécuter.

J'ai pris comme exemple la configuration d'exécution d'une application Eclipse, mais ça fonctionne également pour tout projet qui utilise une configuration d'exécution (Java, JUnit...).