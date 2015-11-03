cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/com.phonegap.plugins.PushPlugin/www/PushNotification.js",
        "id": "com.phonegap.plugins.PushPlugin.PushNotification",
        "clobbers": [
            "PushNotification"
        ]
    },
    {
        "file": "plugins/com.salesforce/www/com.salesforce.plugin.oauth.js",
        "id": "com.salesforce.plugin.oauth"
    },
    {
        "file": "plugins/com.salesforce/www/com.salesforce.plugin.sdkinfo.js",
        "id": "com.salesforce.plugin.sdkinfo"
    },
    {
        "file": "plugins/com.salesforce/www/com.salesforce.plugin.smartstore.js",
        "id": "com.salesforce.plugin.smartstore",
        "clobbers": [
            "navigator.smartstore"
        ]
    },
    {
        "file": "plugins/com.salesforce/www/com.salesforce.plugin.sfaccountmanager.js",
        "id": "com.salesforce.plugin.sfaccountmanager"
    },
    {
        "file": "plugins/com.salesforce/www/com.salesforce.plugin.smartsync.js",
        "id": "com.salesforce.plugin.smartsync"
    },
    {
        "file": "plugins/com.salesforce/www/com.salesforce.util.bootstrap.js",
        "id": "com.salesforce.util.bootstrap"
    },
    {
        "file": "plugins/com.salesforce/www/com.salesforce.util.event.js",
        "id": "com.salesforce.util.event"
    },
    {
        "file": "plugins/com.salesforce/www/com.salesforce.util.exec.js",
        "id": "com.salesforce.util.exec"
    },
    {
        "file": "plugins/com.salesforce/www/com.salesforce.util.logger.js",
        "id": "com.salesforce.util.logger"
    },
    {
        "file": "plugins/com.salesforce/www/com.salesforce.util.push.js",
        "id": "com.salesforce.util.push"
    },
    {
        "file": "plugins/org.apache.cordova.camera/www/CameraConstants.js",
        "id": "org.apache.cordova.camera.Camera",
        "clobbers": [
            "Camera"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.camera/www/CameraPopoverOptions.js",
        "id": "org.apache.cordova.camera.CameraPopoverOptions",
        "clobbers": [
            "CameraPopoverOptions"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.camera/www/Camera.js",
        "id": "org.apache.cordova.camera.camera",
        "clobbers": [
            "navigator.camera"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.camera/www/ios/CameraPopoverHandle.js",
        "id": "org.apache.cordova.camera.CameraPopoverHandle",
        "clobbers": [
            "CameraPopoverHandle"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.inappbrowser/www/inappbrowser.js",
        "id": "org.apache.cordova.inappbrowser.inappbrowser",
        "clobbers": [
            "window.open"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.network-information/www/network.js",
        "id": "org.apache.cordova.network-information.network",
        "clobbers": [
            "navigator.connection",
            "navigator.network.connection"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.network-information/www/Connection.js",
        "id": "org.apache.cordova.network-information.Connection",
        "clobbers": [
            "Connection"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.statusbar/www/statusbar.js",
        "id": "org.apache.cordova.statusbar.statusbar",
        "clobbers": [
            "window.StatusBar"
        ]
    },
    {
        "file": "plugins/ru.mcler.phonegap.plugins.SpinnerDialog/www/SpinnerDialog.js",
        "id": "ru.mcler.phonegap.plugins.SpinnerDialog.SpinnerDialog",
        "merges": [
            "window.plugins.SpinnerDialog"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.device/www/device.js",
        "id": "org.apache.cordova.device.device",
        "clobbers": [
            "device"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "com.phonegap.plugins.PushPlugin": "2.2.1",
    "com.salesforce": "3.3.2",
    "cordova-plugin-whitelist": "1.0.0",
    "org.apache.cordova.camera": "0.3.6",
    "org.apache.cordova.inappbrowser": "0.6.0",
    "org.apache.cordova.network-information": "0.2.15",
    "org.apache.cordova.statusbar": "0.1.10",
    "ru.mcler.phonegap.plugins.SpinnerDialog": "0.3.3",
    "org.apache.cordova.device": "0.3.0"
}
// BOTTOM OF METADATA
});