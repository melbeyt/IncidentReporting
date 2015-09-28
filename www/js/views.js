// -------------------------------------------------- The Views ---------------------------------------------------- //

app.views.MainPage = Backbone.View.extend({
    template: _.template($("#landing-page").html()),

    events: {
        "click .logoutUser": "logoutUser"
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
        this.offlineTogglerView.setElement($("#offlineStatusMain", this.el)).render();
        return this;
    },

    inspectSmartstore: function(event) {
        cordova.require("com.salesforce.plugin.smartstore").showInspector();
    },

    switchUser: function(event) {
        cordova.require("com.salesforce.plugin.sfaccountmanager").switchToUser();
    },

    logoutUser: function(event) {
        cordova.require("com.salesforce.plugin.sfaccountmanager").logout();
    }
});

app.views.SearchPage = Backbone.View.extend({

    template: _.template($("#search-page").html()),

    events: {
        "keyup .search-key": "search",
        "click .back": "back",
        "click .logoutUser": "logoutUser",
        "click .inspectSmartstore": "inspectSmartstore"
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
        this.offlineTogglerView.setElement($("#offlineStatus", this.el)).render();
        this.listView.setElement($("ul", this.el)).render();
        return this;
    },

    search: function(event) {
        this.model.setCriteria($(".search-key", this.el).val());
        this.model.fetch();
    },

    inspectSmartstore: function(event) {
        cordova.require("com.salesforce.plugin.smartstore").showInspector();
    },

    switchUser: function(event) {
        cordova.require("com.salesforce.plugin.sfaccountmanager").switchToUser();
    },

    logoutUser: function(event) {
        cordova.require("com.salesforce.plugin.sfaccountmanager").logout();
    },

    back: function () {
        app.router.navigate("#", {trigger:true});
    }
});

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

app.views.OfflineToggler = Backbone.View.extend({

    template: _.template($("#offline-toggler").html()),

    events: {
        "click .toggleStatus": "toggle",
        "click .syncFiles": "syncFiles"
    },

    initialize: function() {
        this.model.on("change:isOnline", this.render, this);
    },

    render: function(eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    toggle: function(event) {
        event.preventDefault();
        this.model.set("isOnline", !this.model.get("isOnline"));
    },

    syncFiles: function() {
        app.router.navigate("#sync", {trigger:true});
    }


});

app.views.SyncPage = Backbone.View.extend({

    template: _.template($("#sync-page").html()),

    events: {
        "click .back": "goBack",
        "click .sync": "sync"
    },

    initialize: function() {
        var that = this;
        _.each(["reset","add","remove"], function(eventName) { that.model.on(eventName, that.render, that); });
        this.listView = new app.views.ActivityFormListView({model: this.model});
    },

    render: function(eventName) {
        $(this.el).html(this.template(_.extend({countLocallyModified: this.model.length}, this.model.toJSON())));
        this.listView.setElement($("ul", this.el)).render();
        return this;
    },

    goBack: function(event) {
        app.router.navigate("#", {trigger:true});
    },

    // todo: be sure we're adding all locally modified records to sync collection
    // todo: test with children
    sync: function(event) {
        var that = this;
        if (this.model.length == 0 || this.model.at(0).get("__sync_failed__")) {
            // we push sync failures back to the end of the list - if we encounter one, it means we are done
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
                    app.router.navigate("#", {trigger:true});
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
                alert(errStr);
                record = record.set("__sync_failed__", true);
                that.model.push(record);
                that.sync();
            });
        }
    }
});

app.views.EditActivityFormPage = Backbone.View.extend({

    action: null,
    backAction: "#",

    template: _.template($("#edit-form-page").html()),

    events: {
        "click .back": "goBack",
        "change": "change",
        "click .save": "save",
        "click .merge": "saveMerge",
        "click .overwrite": "saveOverwrite",
        "click .toggleDelete": "toggleDelete"
    },

    initialize: function() {
        this.locked = false;
        this.offlineTogglerView = new app.views.OfflineToggler({model: app.offlineTracker});
        app.offlineTracker.on("change:isOnline", this.render, this);
    },

    render: function(eventName) {
        this.action = (null == this.model.id) ? "Add" : "Edit";
        if (this.action == "Add") {
            switch (app.searchPage.getType()) {
                case "incident":
                    this.model.set({
                        __local__: false,
                        'RecordTypeId': app.IncidentRecordType,
                        Form_Group__c: "Incident",
                        Job__c: "",
                        Specific_Job_Type__c: "",
                        Task__c: "",
                        Incident_Description__c: "",
                        Consequence__c: "",
                        Equipment_in_use__c: "",
                        Incident_Date_Time__c: "",
                        Inc__c: currentDateTime(),
                        LastModifiedDate: "",
                        attributes: {type: "Activity_Form__c"}
                    });
                    break;
                case "nearMiss":
                    this.model.set({
                        __local__: false,
                        'RecordTypeId': app.NearMissRecordType,
                        Form_Group__c: "Near Miss",
                        Job__c: "",
                        Specific_Job_Type__c: "",
                        Task__c: "",
                        Incident_Description__c: "",
                        Consequence__c: "",
                        Equipment_in_use__c: "",
                        Incident_Date_Time__c: "",
                        Inc__c: currentDateTime(),
                        LastModifiedDate: "",
                        attributes: {type: "Activity_Form__c"}
                    });
                    break;
                case "safetyObservation":
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
                        Form_Group__c: "Incident",
                        Job__c: "",
                        Specific_Job_Type__c: "",
                        Task__c: "",
                        Incident_Description__c: "",
                        Consequence__c: "",
                        Equipment_in_use__c: "",
                        Incident_Date_Time__c: "",
                        Inc__c: currentDateTime(),
                        LastModifiedDate: "",
                        attributes: {type: "Activity_Form__c"}
                    });
            }
        }
        this.backAction = app.router.getLastPage() || "#";
        $(this.el).html(this.template(_.extend({action: this.action}, this.model.toJSON())));
        this.offlineTogglerView.setElement($("#offlineStatusPage", this.el)).render();
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
        if (type === "datetime-local") {
            value = formatDateTimeForSF(target.value);
        }
        this.model.set(target.name, value);
        $("#form" + target.name + "Error", this.el).hide();
    },

    goBack: function(event) {
        app.router.navigate(this.backAction ? this.backAction : "#", {trigger:true});
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
                var a = new app.models.ActivityFormAnswer({Activity_Form__c: file.get("Id"), Question_Order__c: 1, Answer__c: "Test"});
                a.save(null, {cacheMode: cacheMode, mergeMode: mergeMode, success: function () {
                    that.locked = false;
                    if (that.action == "Edit") {
                        app.router.navigate(that.backAction, {trigger:true});
                    } else {
                        app.router.navigate("#", {trigger:true}
                        );
                    }
                }, error: function (data, err, options) {
                    that.locked = false;
                    that.handleError(new Force.Error(err));
                }});

            },
            error: function(data, err, options) { that.locked = false; that.handleError(new Force.Error(err)); }
        };
    },

    save: function() {
        // prevent multi saves from button mashing
        if (!this.locked) {
            this.locked = true;
            this.model.save(null, this.getSaveOptions(Force.MERGE_MODE.MERGE_FAIL_IF_CHANGED));
        }
    },

    saveMerge: function() {
        this.model.save(null, this.getSaveOptions(Force.MERGE_MODE.MERGE_ACCEPT_YOURS));
    },

    saveOverwrite: function() {
        this.model.save(null, this.getSaveOptions(Force.MERGE_MODE.OVERWRITE));
    },

    toggleDelete: function() {
        if (this.model.get("__locally_deleted__")) {
            this.model.set("__locally_deleted__", false);
            this.model.save(null, this.getSaveOptions(null, Force.CACHE_MODE.CACHE_ONLY));
        }
        else {
            this.model.destroy({
                success: function(data) {
                    app.router.navigate("#", {trigger:true});
                },
                error: function(data, err, options) {
                    var error = new Force.Error(err);
                    alert("Failed to delete form: " + (error.type === "RestError" ? error.details[0].message : "Remote change detected - delete aborted"));
                }
            });
        }
    }
});