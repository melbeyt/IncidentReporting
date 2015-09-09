(function () {

    "use strict";

    /* Adding platform (ios/android) specific css */
    var platformStyle = document.createElement('link');
    platformStyle.setAttribute('rel', 'stylesheet');
    if (/Android/.test(navigator.userAgent)) {
        platformStyle.setAttribute('href', 'css/ratchet-theme-android.css');
    } else if (/iPhone/.test(navigator.userAgent)) {
        platformStyle.setAttribute('href', 'css/ratchet-theme-ios.css');
    }
    document.querySelector('head').appendChild(platformStyle);


    /* Wait until cordova is ready to initiate the use of cordova plugins and app launch */
    document.addEventListener("deviceready", function() {
        authenticateUser(showUsersList);
    }, false);

    /* Method to authenticate user with Salesforce Mobile SDK's OAuth Plugin */
    var authenticateUser = function(successHandler, errorHandler) {

        // Get salesforce mobile sdk OAuth plugin
        var oauthPlugin = cordova.require("com.salesforce.plugin.oauth");

        // Call getAuthCredentials to get the initial session credentials
        oauthPlugin.getAuthCredentials(
            // Callback method when authentication succeeds.
            function (creds) {
                // Create forcetk client instance for rest API calls
                var forceClient = new forcetk.Client(creds.clientId, creds.loginUrl);
                forceClient.setSessionToken(creds.accessToken, "v33.0", creds.instanceUrl);
                forceClient.setRefreshToken(creds.refreshToken);

                // Call success handler and handover the forcetkClient
                successHandler(forceClient);
            },
            function (error) {
                alert('Failed to authenticate user: ' + error);
            }
        );
    }

    var storetest = function (entries) {
        navigator.smartstore.registerSoup("Test",[{path:"Name",type:"full_text"},{path:"Id",type:"full_text"}],function (soup) {
            console.log("success: " + soup);
            navigator.smartstore.upsertSoupEntries("Test", entries, function (items) {
                console.log("upserted " + items.length + " entries");
            }, function (error) {
                alert("Problem in " + error);
                console.log(error);
            });
        }, function(error) {
            alert("problem " + error);
            console.log("problem: " + error);
        });
    };

    var setInnerHTML = function (items) {
        var listItemsHtml = '';
        for (var i=0; i < items.length; i++) {
            listItemsHtml += ('<li class="table-view-cell"><div class="media-body">' + items[i].Name + '</div></li>');
        }

        document.querySelector('#users').innerHTML = listItemsHtml;
    };

    /* This method will render a list of users from current salesforce org */
    var showUsersList = function(forceClient) {

        fetchRecords(forceClient, function(data) {
            var users = data.records;
            storetest(users);

            $("#clear").click(function(e) {
                e.preventDefault();
                setInnerHTML([]);
            });

            $("#offlineLoad").click(function (e) {
                e.preventDefault();
                offlineFetch("Test");
            });

            setInnerHTML(users);
        })
    };

    /**
     * load all records from all pages for the specified cursor into the specified array
     **/
    var LoadAllRecords = function(cursor,records){
        console.log('Util.LoadAllRecords');
        //add the first page of results to records
        var that = this;
        records = AddEntriesFromCursorTo(cursor,records);

        //loop through available pages, populating records
        while(cursor.currentPageIndex < cursor.totalPages - 1) {
            navigator.smartstore.moveCursorToNextPage(cursor, function(){
                records = AddEntriesFromCursorTo(cursor,records);
            });
        }
        return records;
    };

    /**
     * define handler for paging from SmartStore query
     **/
    var AddEntriesFromCursorTo = function(cursor,records) {
        console.log('Util.addEntriesFromCursorTo');
        var curPageEntries = cursor.currentPageOrderedEntries;
        $.each(curPageEntries, function(i,entry) {
            records.push(entry);
        });
        return records;
    };

    var offlineFetch = function (soupName) {
        var querySpec = navigator.smartstore.buildAllQuerySpec("Id", null, 2000);

        navigator.smartstore.querySoup(soupName,querySpec,
            function(cursor) {
                var records = [];
                //DF12 DEMO 12 -- LOAD RECORDS
                records = LoadAllRecords(cursor,records);

                //close the query cursor
                navigator.smartstore.closeCursor(cursor);
                alert("offline load!");
                setInnerHTML(records);
            },
            function (error) {
                alert("error in offline fetch");
                console.log(error);
            });
    };

    /* This method will fetch a list of user records from salesforce. 
     Just change the soql query to fetch another sobject. */
    var fetchRecords = function (forceClient, successHandler) {
        var soql = 'SELECT Id, Name FROM User LIMIT 10';
        forceClient.query(soql, successHandler, function(error) {
            alert('Failed to fetch users: ' + error);
        });
    };

})();