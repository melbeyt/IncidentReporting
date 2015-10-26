SpinnerDialog
=============

PhoneGap waiting dialog / progress dialog plugin with spinner for Android and iOS. Forked from Paldom version.

Installation:

```cordova plugin add https://github.com/mcler/SpinnerDialog.git```

or ```phonegap local plugin add https://github.com/mcler/SpinnerDialog.git```


Config.xml:

```<gap:plugin name="ru.mcler.phonegap.plugins.SpinnerDialog" version="0.3.3" />```


Usage:

    // Show spinner dialog
    window.plugins.spinnerDialog.show();
    
    // Show spinner dialog with message (Android only)
    window.plugins.spinnerDialog.show("title","message");
    
    // Hide spinner dialog
    window.plugins.spinnerDialog.hide();

Differences from Paldom version
* Android overlay do not dismiss on touch
* iOS version works correct in landscape orientation
* iOS overlay prevents interface orientation change
    
Note: on Android platfrom, multiple show calls builds up a stack (LIFO) which means hide will dismiss the last spinner added with show call. 
