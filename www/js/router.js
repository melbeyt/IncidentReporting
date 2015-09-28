// ----------------------------------------------- The Application Router ------------------------------------------ //

app.Router = Backbone.StackRouter.extend({
    // template Ids and functions to link together
    routes: {
        "": "mainPage",
        "list": "list",
        "add/:type": "list",
        "add/form/:id/:fromServer": "addForm",
        "edit/forms/:id/:fromServer": "editActivityForm",
        "sync":"sync"
    },

    setupCaches: function() {
        // Cache for offline support
        app.cache = new Force.StoreCache("activity_form__c", [ {path:"RecordTypeId", type:"string"}, {path: "LastModifiedDate", type:"string"} ]);
        app.locationCache = new Force.StoreCache("location__c", [ {path: "Location_ID__c", type:"string"} ]);
        app.answerCache = new Force.StoreCache("activity_form_answer__c", [ {path:"Activity_Form__c", type: "string"}, {path:"Question_Order__c", type: "integer"}]);

        // Cache for conflict detection
        app.cacheForOriginals = new Force.StoreCache("original-activity_forms");

        return $.when(app.cache.init(), app.locationCache.init(), app.answerCache.init(), app.cacheForOriginals.init());
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
        app.editPage.model = new app.models.ActivityForm({Id: null, Location__c:id});
        this.slidePage(app.editPage);
    },

    editActivityForm: function(id) {
        var that = this;
        var form = new app.models.ActivityForm({Id: id});
        form.fetch({
            success: function(data) {
                app.editPage.model = form;
                app.editPage.model.set("Incident_Date_Time__c", formatDateTimeForJS(form.get("Incident_Date_Time__c")));
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

    sync: function() {
        app.localActivityForms.fetch();
        // Show page right away - list will redraw when data comes in
        this.slidePage(app.syncPage);
    }
});
