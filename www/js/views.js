// -------------------------------------------------- The Views ---------------------------------------------------- //
// Main landing page from which users can select a form type; also handles some initializations
app.views.MainPage = Backbone.View.extend({
    name: "main",
    template: _.template($("#landing-page").html()),

    events: {
        "click .options": "options"
    },

    initialize: function() {
        this.offlineTogglerView = new app.views.OfflineToggler({model: app.offlineTracker});

        Force.forcetkClient.query("Select Id from RecordType where Name = 'Incident'", function (response) {
            app.IncidentRecordType = response.records[0].Id;
        });
        Force.forcetkClient.query("Select Id from RecordType where Name = 'Near Miss'", function (response) {
            app.NearMissRecordType = response.records[0].Id;
        });
        Force.forcetkClient.query("Select Id from RecordType where Name = 'JSA'", function (response) {
            app.JSARecordType = response.records[0].Id;
        });
        Force.forcetkClient.query("Select Id from RecordType where Name = 'LSV'", function (response) {
            app.LSVRecordType = response.records[0].Id;
        });
        Force.forcetkClient.query("Select Id from RecordType where Name = 'Safety Observation'", function (response) {
            app.SORecordType = response.records[0].Id;
        });
    },

    render: function () {
        $(this.el).html(this.template());
        this.offlineTogglerView.setElement($(".offlineStatus", this.el)).render();
        return this;
    },

    options: function () {
        app.router.slidePage(app.optionsPage);
    }
});

app.views.OptionsMenu = Backbone.View.extend({
    name: "options",
    template: _.template($("#options-menu").html()),
    backAction: null,

    events: {
        "click .back": "back",
        "click .logoutUser": "logoutUser",
        "click .inspectSmartstore": "inspectSmartstore",
        "click .simOffline": "simulateOffline"
    },

    initialize: function () {
        this.offlineTogglerView = new app.views.OfflineToggler({model: app.offlineTracker});
    },

    render: function () {
        $(this.el).html(this.template());
        this.offlineTogglerView.setElement($(".offlineStatus", this.el)).render();
        return this;
    },

    back: function () {
        var b = app.router.getLastPage();
        app.router.slidePage(app.nameToViewMap[b] ? app.nameToViewMap[b] : app.mainPage);
    },

    logoutUser: function () {
        cordova.require("com.salesforce.plugin.sfaccountmanager").logout();
    },

    inspectSmartstore: function () {
        cordova.require("com.salesforce.plugin.smartstore").showInspector();
    },

    simulateOffline: function () {
        app.offlineTracker.set("isOnline", !app.offlineTracker.get("isOnline"));
    }
});

// Page to search a collection (location in this case) to associate with a form
app.views.SearchPage = Backbone.View.extend({
    name: "search",
    template: _.template($("#search-page").html()),

    events: {
        "keyup .search-key": "search",
        // keyup event does not fire on ios devices, so we also attach to change event
        "change .search-key": "search",
        "click .back": "back",
        "click .options": "options"
    },

    getType: function () {
        return this.type;
    },

    setType: function (type) {
        this.type = type;
    },

    initialize: function() {
        this.type = "";
        this.listView = new app.views.LocationListView({model: this.model});
        this.offlineTogglerView = new app.views.OfflineToggler({model: app.offlineTracker});
    },

    render: function(eventName) {
        $(this.el).html(this.template());
        $(".search-key", this.el).val(this.model.getCriteria());
        this.offlineTogglerView.setElement($(".offlineStatus", this.el)).render();
        this.listView.setElement($("ul", this.el)).render();
        return this;
    },

    search: function(event) {
        this.model.setCriteria($(".search-key").val());
        this.model.fetch();
    },

    options: function () {
        app.router.slidePage(app.optionsPage);
    },

    back: function () {
        app.router.slidePage(app.mainPage);
    }
});

// Page to list existing activity forms
app.views.ActivityFormListView = Backbone.View.extend({

    listItemViews: [],

    initialize: function() {
        this.model.on("reset", this.render, this);
    },

    render: function(eventName) {
        _.each(this.listItemViews, function(itemView) { itemView.close(); });
        this.listItemViews = _.map(this.model.models, function(model) { return new app.views.ActivityFormListItemView({model: model}); });
        $(this.el).append(_.map(this.listItemViews, function(itemView) { return itemView.render().el;} ));
        return this;
    }
});

// View to list locations
app.views.LocationListView = Backbone.View.extend({
    listItemViews: [],

    initialize: function () {
        this.model.on("reset", this.render, this);
    },

    render: function (eventName) {
        _.each(this.listItemViews, function(itemView) {itemView.close();});
        this.listItemViews = _.map(this.model.models, function(model) { return new app.views.LocationListItemView({model: model}); });
        $(this.el).append(_.map(this.listItemViews, function(itemView) {return itemView.render().el;}));
        return this;
    }
});

// View for a single activity form item in a list
app.views.ActivityFormListItemView = Backbone.View.extend({

    tagName: "li",
    template: _.template($("#form-list-item").html()),

    render: function(eventName) {
        var templateData = _.extend({__sync_failed__:false}, this.model.toJSON());
        $(this.el).html(this.template(templateData));
        return this;
    },

    close: function() {
        this.remove();
        this.off();
    }
});

// View for a single location item in a list
app.views.LocationListItemView = Backbone.View.extend({
    tagName: "li",
    template: _.template($("#location-list-item").html()),
    render: function (eventName) {
        var templateData = _.extend({__sync_failed__:false}, this.model.toJSON());
        $(this.el).html(this.template(templateData));
        return this;
    },
    close: function () {
        this.remove();
        this.off();
    }
});

// View for the button bar along the bottom to toggle connection and control syncing
app.views.OfflineToggler = Backbone.View.extend({

    template: _.template($("#offline-toggler").html()),

    events: {
        "click .syncFiles": "syncFiles"
    },

    initialize: function() {
        this.model.on("change:isOnline", this.render, this);
    },

    render: function(eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    syncFiles: function() {
        app.router.slidePage(app.syncPage);
    }


});

// Page to sync all locally modified records
app.views.SyncPage = Backbone.View.extend({
    name: "sync",
    template: _.template($("#sync-page").html()),

    events: {
        "click .back": "goBack",
        "click .sync": "sync",
        "click .options": "options"
    },

    initialize: function() {
        var that = this;
        _.each(["reset","add","remove"], function(eventName) { that.model.on(eventName, that.render, that); });
        this.listView = new app.views.ActivityFormListView({model: this.model});
        this.offlineTogglerView = new app.views.OfflineToggler({model: app.offlineTracker});
    },

    render: function(eventName) {
        $(this.el).html(this.template(_.extend({countLocallyModified: this.model.length}, this.model.toJSON())));
        this.listView.setElement($("ul", this.el)).render();
        this.offlineTogglerView.setElement($(".offlineStatus", this.el)).render();
        return this;
    },

    goBack: function(event) {
        app.router.slidePage(app.mainPage);
    },

    options: function () {
        app.router.slidePage(app.options);
    },

    // todo: be sure we're adding all locally modified records to sync collection
    sync: function(event) {
        SpinnerDialog.show();
        var that = this;
        if (this.model.length == 0 || this.model.at(0).get("__sync_failed__")) {
            // we push sync failures back to the end of the list - if we encounter one, it means we are done
            SpinnerDialog.hide();
            return;
        }
        else {
            var record = this.model.shift();
            if (record.get("__local__") == false) {
                // we encountered a child that was already saved by its parent, so skip it
                that.sync();
                return;
            }
            //record.get("__locally_deleted__") ? record.destroy(options)
            saveOne(record, null, function () {
                if (that.model.length == 0) {
                    SpinnerDialog.hide();
                    app.router.slidePage(app.mainPage);
                }
                else {
                    that.sync();
                }
            }, function (error) {
                var errStr = "";
                if ($.isArray(error)) {
                    errStr = "Errors have occurred: \n";
                    for (var i = 0; i < error.length; i++) {
                        errStr += JSON.stringify(error[i]) + '\n';
                    }
                } else {
                    errStr = "An error has occured: \n" + JSON.stringify(error);
                }
                SpinnerDialog.hide();
                alert(errStr);
                record = record.set("__sync_failed__", true);
                that.model.push(record);
                that.sync();
            });
        }
    }
});

// Page to edit activity forms (or add, for a new one)
app.views.EditActivityFormPage = Backbone.View.extend({
    name: "form",
    action: null,
    backAction: null,

    template: _.template($("#edit-form-page").html()),

    events: {
        "click .back": "goBack",
        "change": "change",
        "click .save": "save",
        "click .toggleDelete": "toggleDelete",
        "click .camera": "takePhoto",
        "click .options": "options"
    },

    initialize: function() {
        this.locked = false;
        this.attachments = new app.models.AttachmentCollection;
        this.offlineTogglerView = new app.views.OfflineToggler({model: app.offlineTracker});
        app.offlineTracker.on("change:isOnline", this.offlineTogglerView.render, this.offlineTogglerView);
    },

    render: function(eventName) {
        var imgs = [];
        var options = ["Safe", "At Risk", "Not Observed"];
        var consequences = ["", "Serious", "Minor", "Minimal", "Ergonomic"];
        this.attachments = new app.models.AttachmentCollection;
        this.action = (null == this.model.id) ? "Add" : "Edit";
        if (this.action == "Add") {
            switch (app.searchPage.getType()) {
                case "incident":
                    this.model.set({
                        __local__: false,
                        'RecordTypeId': app.IncidentRecordType,
                        JSA_HSE__Form_Group__c: "Incident",
                        JSA_HSE__Job__c: "",
                        JSA_HSE__Specific_Job_Type__c: "",
                        JSA_HSE__Task__c: "",
                        JSA_HSE__Incident_Description__c: "",
                        JSA_HSE__Consequence__c: "",
                        JSA_HSE__Equipment_in_use__c: "",
                        JSA_HSE__Incident_Date_Time__c: "",
                        JSA_HSE__Inc__c: currentDateTime(),
                        LastModifiedDate: "",
                        attributes: {type: "JSA_HSE__Activity_Form__c"}
                    });
                    break;
                case "nearMiss":
                    this.model.set({
                        __local__: false,
                        'RecordTypeId': app.NearMissRecordType,
                        JSA_HSE__Form_Group__c: "Near Miss",
                        JSA_HSE__Job__c: "",
                        JSA_HSE__Specific_Job_Type__c: "",
                        JSA_HSE__Task__c: "",
                        JSA_HSE__Incident_Description__c: "",
                        JSA_HSE__Consequence__c: "",
                        JSA_HSE__Equipment_in_use__c: "",
                        JSA_HSE__Incident_Date_Time__c: "",
                        JSA_HSE__Inc__c: currentDateTime(),
                        LastModifiedDate: "",
                        attributes: {type: "JSA_HSE__Activity_Form__c"}
                    });
                    break;
                case "safetyObservation":
                    this.model.set({
                        __local__: false,
                        'RecordTypeId': app.SORecordType,
                        JSA_HSE__Form_Group__c: "Safety Observation",
                        JSA_HSE__Job__c: "",
                        JSA_HSE__Specific_Job_Type__c: "",
                        JSA_HSE__Task__c: "",
                        JSA_HSE__Eye_Face__c: "Not Observed",
                        JSA_HSE__Hearing__c: "Not Observed",
                        JSA_HSE__Foot__c: "Not Observed",
                        JSA_HSE__Respiratory__c: "Not Observed",
                        JSA_HSE__Head__c: "Not Observed",
                        JSA_HSE__Hand_Arm__c: "Not Observed",
                        JSA_HSE__Fall_Protection__c: "Not Observed",
                        JSA_HSE__Proper_Equipment_Used__c: "Not Observed",
                        JSA_HSE__Adequate__c: "Not Observed",
                        JSA_HSE__Equipment_Stored_Correctly__c: "Not Observed",
                        JSA_HSE__General_Comments__c: "",
                        JSA_HSE__Observations__c: "",
                        JSA_HSE__Potential_Injury_or_Hazard__c: "",
                        JSA_HSE__Recommendations__c: "",
                        LastModifiedDate: "",
                        attributes: {type: "JSA_HSE__Activity_Form__c"}
                    });
                    break;
                case "JSA":
                    break;
                case "Audit":
                    break;
                default:
                    // default: incident
                    this.model.set({
                        __local__: false,
                        'RecordTypeId': app.IncidentRecordType,
                        JSA_HSE__Form_Group__c: "Incident",
                        JSA_HSE__Job__c: "",
                        JSA_HSE__Specific_Job_Type__c: "",
                        JSA_HSE__Task__c: "",
                        JSA_HSE__Incident_Description__c: "",
                        JSA_HSE__Consequence__c: "",
                        JSA_HSE__Equipment_in_use__c: "",
                        JSA_HSE__Incident_Date_Time__c: "",
                        JSA_HSE__Inc__c: currentDateTime(),
                        LastModifiedDate: "",
                        attributes: {type: "JSA_HSE__Activity_Form__c"}
                    });
            }
        } else {
            var that = this;
            //get photos from cache
            this.attachments = [];
            getOnlineChildren(new app.models.AttachmentCollection, this.model).then(function (result) {
                that.attachments = that.attachments.concat(result);
                getOfflineChildren(new app.models.AttachmentCollection, that.model).then(function (result) {
                    that.attachments = that.attachments.concat(result);

                    for (var i = 0; i < that.attachments.length; i++) {
                        var ret = {};
                        ret.src = "data:image/jpeg;base64," + that.attachments[i].get("Body");
                        ret.name = that.attachments[i].get("Name");
                        ret.parent = that.attachments[i].get("ParentId");
                        ret.id = that.attachments[i].get("Id");
                        imgs.push(ret);
                    }
                    $(that.el).html(that.template(_.extend({action: that.action, imgs: imgs, options: options, consequences: consequences}, that.model.toJSON())));
                }, function (reason) {
                    alert(reason);
                    console.log(reason);
                })
            }, function (reason) {
                alert(reason);
                console.log(reason);
            });
        }
        
        if (this.model.has("JSA_HSE__Incident_Date_Time__c")) {
            this.model.set("JSA_HSE__Incident_Date_Time__c", formatDateTimeForJS(this.model.get("JSA_HSE__Incident_Date_Time__c")));
        }
        $(this.el).html(this.template(_.extend({action: this.action, options: options, consequences: consequences, imgs: imgs}, this.model.toJSON())));
        this.offlineTogglerView.setElement($(".offlineStatus", this.el)).render();
        var online = app.offlineTracker.get("isOnline");
        $(".merge", this.el).hide();
        $(".overwrite", this.el).hide();

        if (this.action == "Add") {
            $(".toggleDelete", this.el).hide();
        }
        else {
            var deleted = this.model.get("__locally_deleted__");
            $(".toggleDelete", this.el).html(deleted?"Undelete":"Delete");
        }
        return this;
    },

    change: function(evt) {
        // apply change to model
        var target = evt.target;
        var type = target.type;
        var value = target.value;
        this.model.set(target.name, value);
        $("#form" + target.name + "Error", this.el).hide();
    },

    goBack: function(event) {
        var b = app.router.getLastPage();
        app.router.slidePage(app.nameToViewMap[b] ? app.nameToViewMap[b] : app.mainPage);
    },

    options: function (event) {
        app.router.slidePage(app.optionsPage);
    },

    showFieldError: function(field, message, error) {
        var errorEl = $("#form" + field + "Error", this.el);
        errorEl.addClass(error ? "badge badge-negative" : "count-other");
        errorEl.html(message);
        errorEl.show();
    },

    handleError: function(error) {
        var that = this;
        if (error.type === "RestError") {
            _.each(error.details, function(detail) {
                if (detail.fields == null || detail.fields.length == 0) { alert(detail.message); }
                else {_.each(detail.fields, function(field) {that.showFieldError(field, detail.message);});}
            });
        }
        else if (error.type == "ConflictError") {
            _.each(error.remoteChanges, function(field) {
                var conflict = error.conflictingChanges.indexOf(field) >=0;
                that.showFieldError(field, "Server: " +  error.theirs[field], conflict);
            });
            $(".merge", this.el).show();
            $(".overwrite", this.el).show();
        }
    },

    getSaveOptions: function(mergeMode, cacheMode) {
        var that = this;
        return {
            cacheMode: cacheMode,
            mergeMode: mergeMode,
            success: function(file) {
                // save attachment to server if we're online - they were already saved to the cache
                if (app.offlineTracker.get("isOnline")) {
                    var saveHelper = function (record, args, success, failure) {
                        record.save(null, {
                            success: function () {
                                success();
                            },
                            error: function () {
                                failure();
                            }
                        });
                    };
                    asyncForEach(that.attachments, saveHelper, {}, function (successes, failures) {
                        that.locked = false;
                        if (failures.length > 0) {
                            SpinnerDialog.hide();
                            alert("Error saving attachments: " + JSON.stringify(failures[0]));
                            console.log("Error saving attachments: " + JSON.stringify(failures[0]));
                        } else {
                            SpinnerDialog.hide();
                            app.router.slidePage(app.mainPage);
                        }
                    });
                } else {
                    that.locked = false;
                    SpinnerDialog.hide();
                    app.router.slidePage(app.mainPage);
                }
            },
            error: function(data, err, options) {
                that.locked = false;
                SpinnerDialog.hide();
                alert("Error saving record: " + err.responseText);
                that.handleError(new Force.Error(err));
            }
        };
    },

    save: function() {
        // prevent multi saves from button mashing
        if (!this.locked) {
            SpinnerDialog.show();
            this.locked = true;
            this.model.set("JSA_HSE__Incident_Date_Time__c", formatDateTimeForSF(this.model.get("JSA_HSE__Incident_Date_Time__c")))
            this.model.save(null, this.getSaveOptions(Force.MERGE_MODE.MERGE_ACCEPT_YOURS));
        }
    },

    toggleDelete: function() {
        var that = this;
        if (this.model.get("__locally_deleted__")) {
            this.model.set("__locally_deleted__", false);
            this.model.save(null, this.getSaveOptions(null, Force.CACHE_MODE.CACHE_ONLY));
        }
        else {
            this.model.destroy({
                success: function(data) {
                    app.router.slidePage(app.mainPage);
                },
                error: function(data, err, options) {
                    var error = new Force.Error(err);
                    alert("Failed to delete form: " + (error.type === "RestError" ? error.details[0].message : "Remote change detected - delete aborted"));
                }
            });
        }
    },

    takePhoto: function () {
        var that = this;
        navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
            destinationType: Camera.DestinationType.DATA_URL
        });

        function onSuccess(imageData) {
            SpinnerDialog.show();
            that.model.save(null, {success: function () {
                var attachment = new app.models.Attachment({ParentId: that.model.get("Id"), Name: currentDateTime() + '.jpg', Body: imageData});
                attachment.save(null, {success: function () {
                    SpinnerDialog.hide();
                    that.render();
                }, error: function (err) {
                    SpinnerDialog.hide();
                    alert("Error saving photo: " + err);
                }, cacheMode: Force.CACHE_MODE.CACHE_ONLY});
            }, error: function (error) {
                SpinnerDialog.hide();
                alert("Record save failed: " + error);
            }});
        }

        function onFail(message) {
            alert('Photo capture failed: ' + message);
        }
    }
});