---
title: Shell transparente via JNA
tags: [Java, SWT]
blogger_orig_url: https://keulkeul.blogspot.com/2007/10/shell-transparente-via-jna.html
category: technical
description: Dans un précédent billet, j'avais présenté JNA. Je vous propose ici un petit exemple permettant de rendre transparent une Shell SWT tout en utilisant JNA.  
---

Dans un précédent [billet]({% post_url 2007-06-06-java-native-access-jna %}), j'avais présenté JNA. Je vous propose ici un petit exemple permettant de rendre transparent une Shell SWT tout en utilisant JNA.  
  
**Capture d'écran : sans transparence**
  
![/images/withouttransparency.jpg](/images/withouttransparency.jpg)

**Capture d'écran : avec transparence**
  
![/images/withtransparency.jpg](/images/withtransparency.jpg)  

Il faut cependant passer par un appel natif. Pour simplifier les choses je me limiterai à la plateforme Windows. Sous WIN32, un appel aux fonctions suivantes est nécessaire :

* `int getWindowLong(int hWnd, int nIndex)` ;
* `int setWindowLong(int hWnd, int nIndex, int dwNewLong)` ;
* `boolean setLayeredWindowAttributes(int hWnd, int crKey, byte bAlpha, int dwFlags)`.

Par l'intermédiaire de JNA, l'appel aux fonctions natives se fait très facilement, adieu code C. Ci-dessous vous trouverez l'interface qui contiendra les définitions des fonctions natives.  

```java
public interface User32 extends StdCallLibrary {  
    User32 INSTANCE = (User32) Native.loadLibrary("user32", User32.class, DEFAULT\_OPTIONS);  
    int GWL\_EXSTYLE = -20;  
    int WS\_EX\_LAYERED = 0x80000;  
  
    int LWA\_COLORKEY = 1;  
    int LWA\_ALPHA = 2;  
  
    int GetWindowLong(int hWnd, int nIndex);  
    int SetWindowLong(int hWnd, int nIndex, int dwNewLong);  
  
    boolean SetLayeredWindowAttributes(int hwnd, int crKey, byte bAlpha, int dwFlags);  
}
```

La transparence est gérée par `setLayeredWindowAttributes`. `hWnd` correspond au handle window de la *Shell*, `nIndex` désigne la couleur transparente, `bAlpha` précise le niveau de transparence et enfin `dwFlags` permet d'indiquer le type de transparence : soit par une couleur, soit au niveau globale, soit un mixte des deux (utilisation d'un pipe).  

```java
myButton.addSelectionListener(new SelectionAdapter() {  
    public void widgetSelected(SelectionEvent event) {  
        User32 lib = User32.INSTANCE;  
        int flags = lib.GetWindowLong(myShell.handle, User32.GWL\_EXSTYLE);  
        flags |= User32.WS\_EX\_LAYERED;
        lib.SetWindowLong(myShell.handle, User32.GWL\_EXSTYLE, flags);  
        Color myColor = Display.getDefault().getSystemColor(SWT.COLOR\_DARK\_BLUE);  
        lib.SetLayeredWindowAttributes(myShell.handle, myColor.handle, (byte)200, User32.LWA\_COLORKEY | User32.LWA\_ALPHA);
    }  
});
```

Dans cet exemple, je réalise à la fois une transparence de la fenêtre globale et une transparence de la couleur (`DARK\_BLUE`).

Je ne vais pas m'attarder à expliquer le code, vous trouverez l'exemple [ici](/files/transparencyexample.zip).

À noter que je me suis basé sur le code fournit par le projet [JNA](https://github.com/java-native-access/jna).