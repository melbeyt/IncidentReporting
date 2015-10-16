// ----------------------------------------------- The Application Router ------------------------------------------ //

app.Router = Backbone.StackRouter.extend({
    // template Ids and functions to link together
    routes: {
        "": "mainPage",
        "list": "list",
        "add/:type": "list",
        "add-form/:id/:fromServer": "addForm",
        "edit/forms/:id/:fromServer": "editActivityForm",
        "delete/photo/:Id": "deletePhoto",
        "sync":"sync"
    },

    setupCaches: function() {
        // Cache for offline support
        app.cache = new Force.StoreCache("activity_form__c", [ {path:"RecordTypeId", type:"string"}, {path: "LastModifiedDate", type:"string"} ]);
        app.locationCache = new Force.StoreCache("location__c", [ {path: "JSA_HSE__Location_ID__c", type:"string"} ]);
        app.answerCache = new Force.StoreCache("activity_form_answer__c", [ {path:"JSA_HSE__Activity_Form__c", type: "string"}, {path:"JSA_HSE__Question_Order__c", type: "integer"}]);
        app.photoCache = new Force.StoreCache("attachment", [{path:"ParentId", type:"string"}]);

        // Cache for conflict detection
        app.cacheForOriginals = new Force.StoreCache("original-activity_forms");

        return $.when(app.cache.init(), app.locationCache.init(), app.answerCache.init(), app.photoCache.init(), app.cacheForOriginals.init());
    },

    initialize: function() {
        Backbone.Router.prototype.initialize.call(this);

        // Setup caches
        this.setupCaches();

        // Collection behind search screen
        app.searchResults = new app.models.LocationCollection();

        // Collection behind sync screen
        app.localActivityForms = new app.models.ActivityFormCollection();
        app.localActivityForms.config = {type:"cache", cacheQuery: {queryType:"exact", indexPath:"__local__", matchKey:true, order:"ascending", pageSize:25}};
        app.localLocations = new app.models.LocationCollection();
        app.localLocations.config = {type: "cache", cacheQuery: {queryType:"exact", indexPath:"__local__", matchKey:true, order:"ascending", pageSize:25}};

        // Initializing offline tracker
        app.offlineTracker = new app.models.OfflineTracker({isOnline: true});

        // We keep a single instance of SearchPage / SyncPage and EditAccountPage
        app.mainPage = new app.views.MainPage();
        app.searchPage = new app.views.SearchPage({model: app.searchResults});
        app.syncPage = new app.views.SyncPage({model: app.localActivityForms});
        app.editPage = new app.views.EditActivityFormPage();

        app.nameToViewMap = {
            "main": app.mainPage,
            "search": app.searchPage,
            "sync": app.syncPage,
            "form": app.editPage
        };
    },

    mainPage: function () {
        app.searchResults.fetch();
        this.slidePage(app.mainPage);
    },

    list: function(type) {
        if (type) {
            app.searchPage.setType(type);
        }
        app.searchResults.fetch();
        // Show page right away - list will redraw when data comes in
        this.slidePage(app.searchPage);
    },

    addForm: function(id) {
        app.editPage.model = new app.models.ActivityForm({Id: null, JSA_HSE__Location__c:id});
        this.slidePage(app.editPage);
    },

    editActivityForm: function(id) {
        var that = this;
        var form = new app.models.ActivityForm({Id: id});
        form.fetch({
            success: function(data) {
                app.editPage.model = form;
                app.editPage.model.set("JSA_HSE__Incident_Date_Time__c", formatDateTimeForJS(form.get("JSA_HSE__Incident_Date_Time__c")));
                that.slidePage(app.editPage);
            },
            error: function(model, error) {
                if (error) {
                    console.log("error: " + JSON.stringify(error));
                }
                alert("Failed to get record for edit");
            },
            cacheMode: Force.CACHE_MODE.CACHE_ONLY
        });
    },

    deletePhoto: function (Id) {
        // todo prompt for confirmation
        var photo = new app.models.Attachment({Id: Id});
        photo.fetch({
            success: function (data) {
                photo.destroy({
                    success: function(data) {
                        app.editPage.render();
                    },
                    error: function(data, err, options) {
                        var error = new Force.Error(err);
                        alert("Failed to delete photo: " + (error.type === "RestError" ? error.details[0].message : "Remote change detected - delete aborted"));
                    },
                    cacheMode: Force.CACHE_MODE.CACHE_ONLY
                });
            },
            error: function (model, error) {
                if (error) {
                    console.log("error deleting photo: " + JSON.stringify(error));
                }
                alert("Error deleting photo: " + JSON.stringify(error));
            },
            cacheMode: Force.CACHE_MODE.CACHE_ONLY
        });
    },

    sync: function() {
        app.localActivityForms.fetch();
        // Show page right away - list will redraw when data comes in
        this.slidePage(app.syncPage);
    }
});
