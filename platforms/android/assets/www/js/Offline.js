/**
 * Created by melanieb on 8/21/2015.
 */

var Offline = {};
Offline.cache = {};
Offline.fakeOffline = false;

Offline.init = function (sObjects, dependencies, successCallback, errorCallback) {
    if (!dependencies) {
        dependencies = {};
    }
    Offline.dependencies = dependencies;

    Offline.isOnline = navigator.onLine;
    document.addEventListener("offline", function() {
        console.log("Received OFFLINE event");
        Offline.isOnline = false;
    }, false);
    document.addEventListener("online", function() {
        console.log("Received ONLINE event");
        Offline.isOnline = true;
    }, false);


    //setup collection for each sObject
    var cachePromises = [];
    for (var o in sObjects) {
        if (!o.indicies) {
            o.indicies = {};
        }
        Offline.cache[o.name] = new Force.StoreCache(o.name, o.indicies);
        cachePromises.push(Offline.cache[o.name].init());
    }
    $.when.apply($, cachePromises).then(function () {
        Offline.sync(successCallback)
    }, function (error) {
        //callback with error
        errorCallback(error);
    });
};

Offline.checkOnlineStatus = function () {
    return (Offline.isOnline && !Offline.fakeOffline)
};

Offline.sync = function (callback, alertFail) {
    if (alertFail == null) {
        alertFail = false;
    }

    //check if online
    if (Offline.checkOnlineStatus()) {
        //sync up all soups
        //sync down all soups
    } else {
        console.log("Offline: cannot sync");
        if (alertFail) {
            alert("Offline: cannot sync right now");
        }
        callback();
    }
};

Offline.updateIndex = function (objectName, newIndicies, reIndex, successCB, failCB) {
    navigator.smartstore.soupExists(objectName, function (param) {
            if (param) {
                navigator.smartstore.alterSoup(objectName, newIndicies, false, reIndex, successCB, failCB);
            } else {
                Offline.cache[objectName] = new Force.StoreCache(objectName, newIndicies);
                Offline.cache[objectName].init().then(successCB, failCB);
            }
        }, failCB);
};

Offline.updateDependencies = function (dependencies) {
    for (var key in dependencies) {
        Offline.dependencies[key] = dependencies[key];
    }
};

Offline.getIndicies = function () {
    // return sObjects tracked in soup
    var config = {};
    for (var o in Offline.cache) {
        config[o] = o.additionalIndexSpecs;
    }
    return config;
};

Offline.getDependencies = function () {
    return Offline.dependencies;
};

Offline.query = function (querySpec) {
    // query cache, return records
    // todo do we want it to query saleforce if online? or just cache regardless?
    // maybe set policy in init
};

Offline.save = function (record) {
    // upsert record
    // todo if online, save to database
    // else cache
};

Offline.saveAll = function (records) {
    // upsert all records
    // todo if online, save to database
};

Offline.delete = function (attr, value) {
    //delete record with matching attr value in soup
    // todo if online, direct to database
};

Offline.removeFromCache = function (attr, value) {
    //remove record with matching attr value from soup
};