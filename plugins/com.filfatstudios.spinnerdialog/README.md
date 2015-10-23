cordova-plugin-spinnerdialog
=============
Cordova plugin for showing a progress indicator based on Paldom/SpinnerDialog

[cordova-plugin-progress-indicator on NPM](https://www.npmjs.com/package/cordova-plugin-progress-indicator)

## Platforms
| <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Android_robot.svg/511px-Android_robot.svg.png" width="48px" height="48px" alt="Android logo"> | <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/2000px-Apple_logo_black.svg.png" width="48px" height="48px" alt="iOS logo"> | <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Windows_logo_-_2012.svg/2000px-Windows_logo_-_2012.svg.png" width="48px" height="48px" alt="Windows logo"> | <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Windows_logo_-_2012.svg/2000px-Windows_logo_-_2012.svg.png" width="48px" height="48px" alt="Windows logo">
|:---:|:---:|:---:|:---:|
| 4.1+ ✔ | ?+ ✔ | Windows Phone 8.1+ ✔ | 10+ ✔ |

## Installation
```
cordova plugin add https://github.com/filfat-Studios-AB/cordova-plugin-spinnerdialog
cordova prepare
```

## Methods
- `SpinnerDialog.show`
- `SpinnerDialog.hide`

#### SpinnerDialog.show
    SpinnerDialog.show([title], [message], [cancelCallback])

- __title__: Spinner title (Android only). Optional. _(String)_
- __message__: Spinner message. Optional. _(String)_
- __cancelCallback__: Callback to invoke when spinner cancel event fired (tap or Android hardware back button event). If set, spinner dialog will be fixed, you should explicitly call `window.plugins.spinnerDialog.hide`. Due to legacy reasons you can provide boolean value (true/false) to set spinner not cancelable. Optional, defaults to `false`. _(Function/Boolean)_

#### SpinnerDialog.hide
    SpinnerDialog.hide();


## Quirks
* Cordova 5.0 or higher is required for Windows 10 support.
* Windows 10 Mobile or Windows Phone 8.1 is required as desktop doesn't support StatusBar.
    
## License
See "LICENSE".
Based on https://github.com/Paldom/SpinnerDialog
