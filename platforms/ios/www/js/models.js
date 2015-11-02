// Activity Form Answer Model and Collection
app.models.ActivityFormAnswer = Force.SObject.extend({
    sobjectType: "JSA_HSE__Activity_Form_Answer__c",
    relationshipField: "JSA_HSE__Activity_Form__c",
    fieldlist: ["Id", "RecordTypeId", "JSA_HSE__Activity_Form__c", "JSA_HSE__Question_Order__c", "JSA_HSE__Answer__c"],
    cache: function() {return app.answerCache;},
    cacheMode: function (method) {
        if (!app.offlineTracker.get("isOnline")) {
            return Force.CACHE_MODE.CACHE_ONLY;
        } else {
            return (method == "read" ? Force.CACHE_MODE.CACHE_FIRST : Force.CACHE_MODE.SERVER_FIRST);
        }
    }
});

app.models.ActivityFormAnswerCollection = Force.SObjectCollection.extend({
    model: app.models.ActivityFormAnswer,
    fieldlist: ["Id", "RecordTypeId", "JSA_HSE__Activity_Form__c", "JSA_HSE__Question_Order__c", "JSA_HSE__Answer__c"],
    parent: "",
    doCacheSearch: false,
    cache: function () { return app.answerCache; },
    config: function () {
        // Offline or cache flag: do a cache query
        if (!app.offlineTracker.get("isOnline") || this.doCacheSearch) {
            return {type:"cache", cacheQuery:{queryType:"smart", smartSql:"SELECT {activity_form_answer__c:_soup} FROM {activity_form_answer__c} WHERE {activity_form_answer__c:JSA_HSE__Activity_Form__c} LIKE '" + this.parent + "' ORDER BY {activity_form_answer__c:JSA_HSE__Question_Order__c}", pageSize:25}};
        }
        // Online
        else {
            // do a full query
            return {
                type: "soql",
                query: "SELECT " + this.fieldlist.join(",") + " FROM JSA_HSE__Activity_Form_Answer__c WHERE JSA_HSE__Activity_Form__c like '" + this.parent + "' ORDER BY JSA_HSE__Question_Order__c ASC"
            };
        }
    }
});

// Models to hold photos taken of incidents
app.models.Attachment = Force.SObject.extend({
    sobjectType: "Attachment",
    fieldlist: ["Id", "ParentId", "Body", "Name"],
    relationshipField: "ParentId",
    cache: function () { return app.photoCache; },
    cacheMode: function (method) {
        if (!app.offlineTracker.get("isOnline")) {
            return Force.CACHE_MODE.CACHE_ONLY;
        }
        else {
            return (method == "read" ? Force.CACHE_MODE.CACHE_FIRST : Force.CACHE_MODE.SERVER_FIRST);
        }
    }
});

app.models.AttachmentCollection = Force.SObjectCollection.extend({
    model: app.models.Attachment,
    fieldlist: ["Id", "ParentId", "Body", "Name"],
    parent: "",
    doCacheSearch: false,
    cache: function () { return app.photoCache; },
    config: function () {
        // Offline or cache flag: do a cache query
        if (!app.offlineTracker.get("isOnline") || this.doCacheSearch) {
            return {type:"cache", cacheQuery:{queryType:"smart", smartSql:"SELECT {attachment:_soup} FROM {attachment} WHERE {attachment:ParentId} LIKE '" + this.parent + "'", pageSize:25}};
        }
        // Online
        else {
            // do a full query
            return {
                type: "soql",
                query: "SELECT " + this.fieldlist.join(",") + " FROM Attachment WHERE ParentId in ('" + this.parent + "')"
            };
        }
    }
});

// Activity Form Model and Collection (requires Activity Form Answer models to be defined first)
app.models.ActivityForm = Force.SObject.extend({
    sobjectType: "JSA_HSE__Activity_Form__c",
    children: [new app.models.AttachmentCollection],
    fieldlist: function(method) {
        return method == "read"
            ? ["Id", "RecordTypeId", "JSA_HSE__Form_Group__c", "JSA_HSE__Consequence__c", "JSA_HSE__Job__c", "JSA_HSE__Task__c", "JSA_HSE__Location__c", "JSA_HSE__Incident_Date_Time__c",
                "JSA_HSE__Inc__c", "JSA_HSE__Incident_Description__c", "JSA_HSE__Equipment_in_use__c", "JSA_HSE__Specific_Job_Type__c", "JSA_HSE__Eye_Face__c", "JSA_HSE__Hearing__c", "JSA_HSE__Foot__c",
                "JSA_HSE__Respiratory__c", "JSA_HSE__Head__c", "JSA_HSE__Hand_Arm__c", "JSA_HSE__Fall_Protection__c", "JSA_HSE__Proper_Equipment_Used__c", "JSA_HSE__Adequate__c",
                "JSA_HSE__Equipment_Stored_Correctly__c", "JSA_HSE__General_Comments__c", "JSA_HSE__Observations__c", "JSA_HSE__Potential_Injury_or_Hazard__c", "JSA_HSE__Recommendations__c",
                "LastModifiedBy.Name", "LastModifiedDate"]
            : ["Id", "RecordTypeId", "JSA_HSE__Form_Group__c", "JSA_HSE__Consequence__c", "JSA_HSE__Job__c", "JSA_HSE__Task__c", "JSA_HSE__Location__c", "JSA_HSE__Incident_Date_Time__c",
                "JSA_HSE__Inc__c", "JSA_HSE__Incident_Description__c", "JSA_HSE__Equipment_in_use__c", "JSA_HSE__Specific_Job_Type__c", "JSA_HSE__Eye_Face__c", "JSA_HSE__Hearing__c", "JSA_HSE__Foot__c",
                "JSA_HSE__Respiratory__c", "JSA_HSE__Head__c", "JSA_HSE__Hand_Arm__c", "JSA_HSE__Fall_Protection__c", "JSA_HSE__Proper_Equipment_Used__c", "JSA_HSE__Adequate__c",
                "JSA_HSE__Equipment_Stored_Correctly__c", "JSA_HSE__General_Comments__c", "JSA_HSE__Observations__c", "JSA_HSE__Potential_Injury_or_Hazard__c", "JSA_HSE__Recommendations__c"];
    },
    cache: function() { return app.cache;},
    cacheForOriginals: function() { return app.cacheForOriginals;},
    cacheMode: function(method) {
        if (!app.offlineTracker.get("isOnline")) {
            return Force.CACHE_MODE.CACHE_ONLY;
        }
        else {
            return (method == "read" ? Force.CACHE_MODE.CACHE_FIRST : Force.CACHE_MODE.SERVER_FIRST);
        }
    }
});

app.models.ActivityFormCollection = Force.SObjectCollection.extend({
    model: app.models.ActivityForm,
    fieldlist: ["Id", "RecordTypeId", "JSA_HSE__Form_Group__c", "JSA_HSE__Consequence__c", "JSA_HSE__Job__c", "JSA_HSE__Task__c", "JSA_HSE__Location__c", "JSA_HSE__Incident_Date_Time__c",
                "JSA_HSE__Inc__c", "JSA_HSE__Incident_Description__c", "JSA_HSE__Equipment_in_use__c", "JSA_HSE__Specific_Job_Type__c", "JSA_HSE__Eye_Face__c", "JSA_HSE__Hearing__c", "JSA_HSE__Foot__c",
                "JSA_HSE__Respiratory__c", "JSA_HSE__Head__c", "JSA_HSE__Hand_Arm__c", "JSA_HSE__Fall_Protection__c", "JSA_HSE__Proper_Equipment_Used__c", "JSA_HSE__Adequate__c",
                "JSA_HSE__Equipment_Stored_Correctly__c", "JSA_HSE__General_Comments__c", "JSA_HSE__Observations__c", "JSA_HSE__Potential_Injury_or_Hazard__c", "JSA_HSE__Recommendations__c",
                "LastModifiedBy.Name", "LastModifiedDate"],
    cache: function() { return app.cache},
    cacheForOriginals: function() { return app.cacheForOriginals;},

    getCriteria: function() {
        return this.key;
    },

    setCriteria: function(key) {
        this.key = key;
    },

    config: function() {
        // Offline: do a cache query
        if (!app.offlineTracker.get("isOnline")) {
            return {type:"cache", cacheQuery:{queryType:"smart", smartSql:"SELECT {activity_form__c:_soup} FROM {activity_form__c} WHERE {activity_form__c:JSA_HSE__Form_Group__c} LIKE '" + (this.key == null ? "" : this.key) + "%' ORDER BY LOWER({activity_form_c:JSA_HSE__Form_Group__c})", pageSize:25}};
        }
        // Online
        else {
            // First time: do a full query
            if (this.key == null) {
                return {type:"soql", query: "SELECT " + this.fieldlist.join(",") + " FROM JSA_HSE__Activity_Form__c ORDER BY JSA_HSE__Form_Group__c"};
            }
            // Other times: do a SOQL query
            else {
                return {type:"soql", query: "SELECT " + this.fieldlist.join(",") + " FROM JSA_HSE__Activity_Form__c WHERE JSA_HSE__Form_Group__c like '" + this.key + "%' ORDER BY JSA_HSE__Form_Group__c LIMIT 25"};
            }
        }
    }
});

// Online/Offline Tracker
app.models.OfflineTracker = Backbone.Model.extend({
    initialize: function() {
        var that = this;
        this.set("isOnline", navigator.onLine);
        document.addEventListener("offline", function() {
            console.log("Received OFFLINE event");
            that.set("isOnline", false);
        }, false);
        document.addEventListener("online", function() {
            console.log("Received ONLINE event");
            that.set("isOnline", true);
        }, false);
    }
});

// Location model and collection
app.models.Location = Force.SObject.extend({
    sobjectType: "JSA_HSE__Location__c",
    fieldlist: ["Id", "JSA_HSE__Location_ID__c"],
    cache: function() { return app.locationCache; },
    cacheMode: function(method) {
        if (!app.offlineTracker.get("isOnline")) {
            return Force.CACHE_MODE.CACHE_ONLY;
        } else {
            return Force.CACHE_MODE.CACHE_FIRST;
        }
    }
});

app.models.LocationCollection = Force.SObjectCollection.extend({
    model: app.models.Location,
    fieldlist: ["Id", "JSA_HSE__Location_ID__c"],
    cache: function () { return app.locationCache; },
    getCriteria: function () {
        return this.key;
    },
    setCriteria: function (key) {
        this.key = key;
    },
    config: function () {
        if (!app.offlineTracker.get("isOnline")) {
            if (this.key == null) {
                return {type:"cache", cacheQuery: {queryType:"smart", smartSql: "SELECT {location__c:_soup} FROM {location__c} WHERE {location__c:JSA_HSE__Location_ID__c} LIKE '%" + new Date().getFullYear() + "' ORDER BY {location__c:JSA_HSE__Location_ID__c} ASC"}};
            } else {
                return {type:"cache", cacheQuery: {queryType:"smart", smartSql: "SELECT {location__c:_soup} FROM {location__c} WHERE {location__c:JSA_HSE__Location_ID__c} LIKE '%" + this.key + "%' AND {location__c:JSA_HSE__Location_ID__c} LIKE '%" + new Date().getFullYear() + "' ORDER BY {location__c:Location_ID__c} ASC", pageSize: 25}};
            }
        } else {
            if (this.key == null) {
                return {type:"soql", query: "SELECT " + this.fieldlist.join(",") + " FROM JSA_HSE__Location__c WHERE JSA_HSE__Location_ID__c LIKE '%" + new Date().getFullYear() + "' ORDER BY JSA_HSE__Location_ID__c ASC"};
            } else {
                return {type:"soql", query: "SELECT " + this.fieldlist.join(",") + " FROM JSA_HSE__Location__c WHERE JSA_HSE__Location_ID__c LIKE '%" + this.key + "%' AND JSA_HSE__Location_ID__c LIKE '%" + new Date().getFullYear() + "' ORDER BY JSA_HSE__Location_ID__c ASC"};
            }
        }
    }
});

