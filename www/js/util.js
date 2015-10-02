/**
 * Created by melanieb on 9/24/2015.
 */

"use strict";

// Takes a collection of objects and a method to perform on each. Additionally takes
// an argument to pass in along with the object. Calls given callback with array of
// results and errors when all are finished. Expects method to take (object, args, successCallback, errorCallback).
function asyncForEach (collection, method, args, callback) {
    // call method on each object in the collection
    var successes = [];
    var errors = [];
    var promises = [];
    for (var c in collection) {
        promises.push(new Promise(function (resolve, reject) {
            // do a thing, possibly async, then…
            method(collection[c], args, function (result) {
                successes.push(result);
                resolve();
            }, function (error) {
                errors.push(error);
                // Promise.all halts and immediately returns if one of the promises is rejected, which we don't want, so resolve instead.
                resolve();
            });
        }));
    }
    // call final callback
    Promise.all(promises).then(
        function () {
            callback(successes, errors);
        }
    );
}

// helper function to save all of one type of children. args expects the oldId and newId of the parent
function saveHelper (children, args, successCB, failureCB) {
    var childrenToSave = [];
    var oldId = null;
    var parentId = null;
    if (args.newId) {
        parentId = args.newId;
    }
    if (args.oldId) {
        oldId = args.oldId;
    }
    children.parent = oldId;
    children.doCacheSearch = true;
    children.fetch({
        success: function (data) {
            children.doCacheSearch = false;
            for (var i = 0; i < children.length; i++) {
                // query for children and replace Ids, then save each
                var child = children.at(i);
                if (!child.relationshipField) {
                    continue;
                }
                child.set(child.relationshipField, parentId);
                childrenToSave.push(child);
            }
            asyncForEach(childrenToSave, saveOne, null, function (successes, errors) {
                if (errors.length > 0) {
                    failureCB(errors);
                } else {
                    successCB();
                }
            });

        }, error: function (model, error) {
            children.doCacheSearch = false;
            alert("An error occured: " + JSON.stringify(error));
            failureCB(error);
        },
        cacheMode: Force.CACHE_MODE.CACHE_ONLY   // if we are calling saveOne, we're syncing, meaning we want to only get the local children
    });
}

// Save a single record and recursively save its children
function saveOne (record, args, successCB, failureCB) {
    var oldId = record.get("Id");
    var options = {
        mergeMode: Force.MERGE_MODE.MERGE_ACCEPT_YOURS,
        success: function() {
            if (record.children !== null && record.children.length > 0) {
                asyncForEach(record.children, saveHelper, {oldId: oldId, newId: record.get("Id")}, function (successes, errors) {
                    if (errors.length > 0) {
                        failureCB(errors);
                    }  else {
                        successCB();
                    }
                });
            } else {
                successCB();
            }
        },
        error: function(error) {
            failureCB(error);
        }
    };
    record.save(null, options);
}

function getOfflineChildren (collection, parent) {
    return new Promise(function (resolve, reject) {
       if (parent.has("__localId__")) {
           collection.parent = parent.get("__localId__");
           collection.doCacheSearch = true;
           collection.fetch({
               success: function () {
                   var ret = [];
                   for (var i = 0; i < collection.length; i++) {
                       var m = collection.at(i);
                       m.set("ParentId", parent.get("Id"));
                       ret.push(m);
                   }
                   resolve(ret);
               }, error: function (model, error) {
                   reject("Error occured fetching offline-created children: " + JSON.stringify(error));
               }
           })
       } else {
           resolve([]);
       }
    });
}

function getOnlineChildren (collection, parent) {
    return new Promise(function (resolve, reject) {
        if (parent.get("Id").indexOf("local_") == -1) {
            collection.parent = parent.get("Id");
            collection.doCacheSearch = true;
            collection.fetch({
                success: function () {
                    var ret = [];
                    for (var i = 0; i < collection.length; i++) {
                        var m = collection.at(i);
                        ret.push(m);
                    }
                    resolve(ret);
                }, error: function (model, error) {
                    reject("Error occured fetching online-created children: " + JSON.stringify(error));
                }
            })
        } else {
            resolve([]);
        }
    });
}

// format an html datetime into Salesforce's format
function formatDateTimeForSF (datetime) {
    return datetime + ':0.0000Z';
}

// turn a Salesforce datetime string and format for javascript
function formatDateTimeForJS (datetime) {
    return datetime.substring(0, datetime.length - 8);
}

// get the current datetime as a Salesforce-formatted string
function currentDateTime () {
    var today = new Date();
    return today.getFullYear() + '-' +  (today.getMonth() + 1) + '-' + today.getDate() + 'T' + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds() + '.000Z';
}
