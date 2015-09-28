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

function formatDateTimeForSF (datetime) {
    return datetime + ':0.0000Z';
}

function formatDateTimeForJS (datetime) {
    return datetime.substring(0, datetime.length - 8);
}

function currentDateTime () {
    var today = new Date();
    return today.getFullYear() + '-' +  (today.getMonth() + 1) + '-' + today.getDate() + 'T' + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds() + '.000Z';
}
