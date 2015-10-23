//  cordova-plugin-spinnerdialog
//  Copyright © 2015 filfat Studios AB
//  Repo: https://github.com/filfat-Studios-AB/cordova-plugin-spinnerdialog
/* global Windows, cordova */
var progressIndicator;

cordova.commandProxy.add("SpinnerDialog",{
    show: function (successCallback, errorCallback, data) {
        if (typeof Windows !== 'undefined' &&
            typeof Windows.UI !== 'undefined' /* Check that we have a UI to work with */ &&
            typeof Windows.UI.ViewManagement.StatusBar !== 'undefined' /* Check that we have the StatusBar to work with*/) {

            var data = data[0];
            progressIndicator = Windows.UI.ViewManagement.StatusBar.ProgressIndicator;
            
            if(data.title == null)
                data.title = undefined;
            progressIndicator.text = typeof data.title !== 'undefined' ? data.title : 'Loading...';
            progressIndicator.showAsync();
        }
    },
    hide: function (successCallback, errorCallback, data) {
        if (typeof Windows !== 'undefined' &&
            typeof Windows.UI !== 'undefined' /* Check that we have a UI to work with */ &&
            typeof Windows.UI.ViewManagement.StatusBar !== 'undefined' /* Check that we have the StatusBar to work with*/) {

            progressIndicator.hideAsync();
        }
    }
});
