/**
 * @fileOverview fb.js - Facebook api
 * @name Facebook API
 * @author Kristina Chodorow
 */

/** @class Facebook Developer API */
Facebook = {
    /** Set this to the secret key Facebook assigns you
     * @type string
     */
    secret_key : "ced4191148da846e833a74674dbf32fb",
    /** Set this to the API key Facebook assigns you
     * @type string
     */
    api_key : "eb17c23417bd37e9c00592037393ee13",

    /** The Facebook REST server.  Value is "http://api.facebook.com/restserver.php".
     * @type string
     */
    server : "http://api.facebook.com/restserver.php",
    /** The API version */
    v : "1.0",

    /** Format of the message returned by the server.  Defaults to "XML".  Also can be set to "JSON"
     * @type string
     */
    format : "XML"
    //errHandler : myFunc
};


/** Get an object representing a request and return the URL args in the correct format
* @param {Object} args An object containing the key/value pairs that will be part of the
* HTTP request, sans signature (which this function generates)
* @return {string} Request in the form "key1=value1&key2=value2...sig=abcdeabcde"
*/
Facebook.getRequest = function(args) {
    var req = [];
    for(var i in args) {
        req.push(i+"="+args[i]);
    }
    return req.join("&")+"&"+Facebook.getSig(args);
};

/** Create the Facebook RESTful signature
 * Every call to the Facebook API requires a signature based on the arguments
* @param {Object} args All key/value pairs in the request
* @return {string} "sig=abcdeabcde"
 */
Facebook.getSig = function(args) {
    // args = array of args to the request, not counting sig, formatted in non-urlencoded arg=val pairs
    var req = [];
    for(var i in args) {
        req.push(i+"="+args[i]);
    }
    // sorted_array = alphabetically_sort_array_by_keys(args);
    req.sort();
    // request_str = concatenate_in_order(sorted_array);
    var request_str = req.join("");

    // signature = md5(concatenate(request_str, secret))
    return "sig="+md5(request_str + Facebook.secret_key);
};

/** Get an ID for a call
 * Every call to the Facebook API is required to have a unique identifier that is larger than the
 * previous call's identifier.  Facebook suggests using the time in ms.
 * @return {number}
 */
Facebook.getCallId = function() {
    return (new Date()).getTime();
};

/** Call a facebook API method
 * this method should not need to be called directly
* @param {Object} args All key/value pairs
* @return {string} HTTP response
 */
Facebook.call = function(args) {
    if(!args["api_key"]) args["api_key"] = Facebook.api_key;
    if(!args["session_key"]) args["session_key"] = Facebook.session_key;
    if(!args["v"]) args["v"] = Facebook.v;
    if(!args["format"]) args["format"] = Facebook.format;
    if(!args["call_id"]) args["call_id"] = Facebook.getCallId();

    var rq = new XMLHttpRequest("POST",  Facebook.server);
    // this is supposed to be the default, but for some reason we have to set it anyways...
    rq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    var result = rq.send(Facebook.getRequest(args));

    // something went wrong with the request itself
    if(result.responseText == "") {
        return Facebook.err.httpError;
    }
    else {
        return result.responseText;
    }
};

/** Calls a facebook method and returns an object
* @param {Object} args All key/value pairs
* @return {Object} HTTP response as an object
*/
Facebook.callJSON = function(args) {
    args["format"] = "JSON";
    return scope.eval("("+Facebook.call(args)+")");
};


/** Connect to facebook from outside the site.
 * This is used in conjunction with the FB login link (Facebook.getLoginLink).
 *     @param {string} auth_token required, returned as a request arg from the Facebook login page
* @return {string} Facebook's HTTP response to the attempted connection
 */
Facebook.connect = function(auth_token) {
    if(!auth_token) return Facebook.err.missingField("auth_token");
    var args = {
        method : "auth.getSession",
        api_key : Facebook.api_key,
        v : "1.0",
        auth_token : auth_token,
        format : "JSON"
    };
    var rq = new XMLHttpRequest("POST",  Facebook.server);
    rq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    var result = rq.send(Facebook.getRequest(args));

    // something went wrong with the request itself
    if(result.responseText == "") {
        return Facebook.err.httpError;
    }
    else {
        return result.responseText;
    }
};

/** In order for a Facebook API client to use the API, the user of the client application must be logged in to Facebook. To accomplish this, direct your users to Facebook.getLoginLink(args), which will prompt the user to log in if necessary.
* @param {Object} args Key/value pairs for login options
* @return {string} The URL ("www.facebook.com/login?api_key=...")
*/
Facebook.getLoginLink = function(args) {
    return "www.facebook.com/login.php?api_key="+Facebook.api_key+"&v="+Facebook.v+
    (args.next ? "&next="+args.next : "")+
    (args.popup ? "&popup="+args.popup : "")+
    (args.skipcookie ? "&skipcookie="+args.skipcookie : "")+
    (args.hide_checkbox ? "&hide_checkbox="+args.hide_checkbox : "")+
    (args.canvas ? "&canvas="+args.canvas : "");
};

Facebook.REST = {
    /** Returns the current allocation limit for your application for the specified integration point.
     */
    adminGetAllocation : function(args) {
        if(!args["integration_point_name"]) return Facebook.err.missingField("integration_point_name");
        args["method"] = "admin.getAllocation";
        return Facebook.call(args);
    },
    /** Returns specified daily metrics for your application, given a date range.
     */
    adminGetDailyMetrics : function(args) {
        if(!args["start_date"]) return Facebook.err.missingField("start_date");
        if(!args["end_date"]) return Facebook.err.missingField("end_date");
        if(!args["metrics"]) return Facebook.err.missingField("metrics");
        args["method"] = "admin.getDailyMetrics";
        return Facebook.call(args);
    },
    /** Returns values of properties for your applications from the Facebook Developer application.
     */
    adminGetAppProperties : function(args) {
        if(!args["properties"]) return Facebook.err.missingField("properties");
        args["method"] = "admin.getAppProperties";
        return Facebook.call(args);
    },
    /** Sets values for properties for your applications in the Facebook Developer application.
     */
    adminSetAppProperties : function(args) {
        args["method"] = "admin.setAppProperties";
        return Facebook.call(args);
    },

    /** Returns public information about a given application (not necessarily your own).
     */
    applicationGetPublicInfo : function(args) {
        args["method"] = "application.getPublicInfo";
        return Facebook.call(args);
    },

    /** Creates an auth_token to be passed in as a parameter to login.php and then to auth.getSession after the user has logged in.
     */
    authCreateToken : function(args) {
        args["method"] = "auth.createToken";
        return Facebook.call(args);
    },
    /** Returns the session key bound to an auth_token, as returned by auth.createToken or in the callback URL.
     */
    authGetSession : function(args) {
        if(!args["auth_token"]) return Facebook.err.missingField("auth_token");
        args["method"] = "auth.getSession";
        return Facebook.call(args);
    },
    /** Returns a temporary session secret associated to the current existing session, for use in a client-side component to an application.
     */
    authPromoteSession : function(args) {
        args["method"] = "auth.promoteSession";
        return Facebook.call(args);
    },

    /** Execute a list of individual API calls in a single batch.
     */
    batchRun : function(args) {
        if(!args["method_feed"]) return Facebook.err.missingField("method_feed");
        args["method"] = "batch.run";
        return Facebook.call(args);
    },

    /** Returns all cookies for a given user and application.
     */
    dataGetCookies : function(args) {
        if(!args["query"]) return Facebook.err.missingField("uids1");
        args["method"] = "data.getCookie";
        return Facebook.call(args);
    },
    /** Sets a cookie for a given user and application.
     */
    dataSetCookie : function(args) {
        if(!args["query"]) return Facebook.err.missingField("uids1");
        args["method"] = "data.setCookie";
        return Facebook.call(args);
    },

    /** Returns all visible events according to the filters specified.
     */
    eventsGet : function(args) {
        args["method"] = "events.get";
        return Facebook.call(args);
    },
    /** Returns membership list data associated with an event.
     */
    eventsGetMembers : function(args) {
        if(!args["eid"]) return Facebook.err.missingField("eid");
        args["method"] = "events.getMembers";
        return Facebook.call(args);
    },

    /** Fetches and re-caches the image stored at the given URL.
     */
    fbmlRefreshImgSrc : function(args) {
        if(!args["url"]) return Facebook.err.missingField("url");
        args["method"] = "fbml.refreshImgSrc";
        return Facebook.call(args);
    },
    /** Fetches and re-caches the content stored at the given URL.
     */
    fbmlRefreshRefURL : function(args) {
        if(!args["url"]) return Facebook.err.missingField("url");
        args["method"] = "fbml.refreshRefURL";
        return Facebook.call(args);
    },
    /** Associates a given "handle" with FBML markup so that the handle can be used within the fb:ref FBML tag.
     */
    fbmlSetRefHandle : function(args) {
        if(!args["handle"]) return Facebook.err.missingField("handle");
        if(!args["fbml"]) return Facebook.err.missingField("fbml");
        args["method"] = "fbml.setRefHandle";
        return Facebook.call(args);
    },

    /** Publishes a News Feed story to the user corresponding to the session_key parameter.
     */
    feedPublishStoryToUser : function(args) {
        if(!args["title"]) return Facebook.err.missingField("title");
        args["method"] = "feed.publishStoryToUser";
        return Facebook.call(args);
    },
    /** Publishes a Mini-Feed story to the user corresponding to the session_key parameter, and publishes News Feed stories to the friends of that user.
     */
    feedPublishActionOfUser : function(args) {
        if(!args["title"]) return Facebook.err.missingField("title");
        args["method"] = "feed.publishActionOfUser";
        return Facebook.call(args);
    },
    /** Publishes a Mini-Feed story to the user or Page corresponding to the session_key or page_actor_id parameter. */
    feedPublishTemplatizedAction : function(args) {
        if(!args["title_template"]) return Facebook.err.missingField("title_template");
        args["method"] = "feed.publishTemplatizedAction";
        return Facebook.call(args);
    },

    /** Evaluates an FQL (Facebook Query Language) query.
     */
    fqlQuery : function(args) {
        if(!args["query"]) return Facebook.err.missingField("query");
        args["method"] = "fql.query";
        return Facebook.call(args);
    },

    /** Returns whether or not each pair of specified users is friends with each other.
     */
    friendsAreFriends : function(args) {
        if(!args["uids1"]) return Facebook.err.missingField("uids1");
        if(!args["uids2"]) return Facebook.err.missingField("uids2");
        args["method"] = "friends.getFriends";
        return Facebook.call(args);
    },

    /** Returns the identifiers for the current user's Facebook friends.
     */
    friendsGet : function(args) {
        args["method"] = "friends.get";
        return Facebook.call(args);
    },
    /** Returns the identifiers for the current user's Facebook friends who are signed up for the specific calling application.
     */
    friendsGetAppUsers : function(args) {
        args["method"] = "friends.getAppUsers";
        return Facebook.call(args);
    },
    /** Returns the identifiers for the current user's Facebook friend lists.
     */
    friendsGetLists : function(args) {
        args["method"] = "friends.getLists";
        return Facebook.call(args);
    },

    /** Returns all visible groups according to the filters specified.
     */
    groupsGet : function(args) {
        args["method"] = "groups.get";
        return Facebook.call(args);
    },

    /** Returns membership list data associated with a group.
     */
    groupsGetMembers : function(args) {
        if(!args["gid"]) return Facebook.err.missingField("gid");
        args["method"] = "groups.getMembers";
        return Facebook.call(args);
    },

    /** Create or modify a listing in Marketplace.
     */
    marketplaceCreateListing : function(args) {
        if(!args["listing_id"]) return Facebook.err.missingField("listing_id");
        if(!args["show_on_profile"]) return Facebook.err.missingField("show_on_profile");
        if(!args["listing_attrs"]) return Facebook.err.missingField("listing_attrs");
        args["method"] = "marketplace.createListing";
        return Facebook.call(args);
    },

    /** Returns all the Marketplace categories.
     */
    marketplaceGetCategories : function(args) {
        args["method"] = "marketplace.getCategories";
        return Facebook.call(args);
    },

    /** Return all Marketplace listings either by listing ID or by user.
     */
    marketplaceGetListings : function(args) {
        args["method"] = "marketplace.getListings";
        return Facebook.call(args);
    },

    /** Returns the Marketplace subcategories for a particular category.
     */
    marketplaceGetSubCategories : function(args) {
        args["method"] = "marketplace.getSubCategories";
        return Facebook.call(args);
    },

    /** Remove a listing from Marketplace.
     */
    marketplaceRemoveListing : function(args) {
        if(!args["listing_id"]) return Facebook.err.missingField("listing_id");
        args["method"] = "marketplace.removeListing";
        return Facebook.call(args);
    },
    /** Search Marketplace for listings filtering by category, subcategory and a query string.  */
    marketplaceSearch : function(args) {
        if(!args["query"]) return Facebook.err.missingField("query");
        args["method"] = "marketplace.search";
        return Facebook.call(args);
    },

    /** Returns information on outstanding Facebook notifications for current session user. */
    notificationsGet : function(args) {
        args["method"] = "notifications.get";
        return Facebook.call(args);
    },
    /** Sends a notification to a set of users. */
    notificationsSend : function(args) {
        if(!args["to_ids"]) return Facebook.err.missingField("to_ids");
        if(!args["notification"]) Facebook.err.missingField("notification");
        args["method"] = "notifications.send";
        return Facebook.call(args);
    },
    /** Sends an email to the specified users who have the application. */
    notificationsSendEmail : function(args) {
        if(!args["recipients"]) return Facebook.err.missingField("recipients");
        if(!args["subject"]) return Facebook.err.missingField("subject");
        args["method"] = "notifications.sendEmail";
        return Facebook.call(args);
    },

    /** Returns all visible pages to the filters specified. */
    pagesGetInfo : function(args) {
        if(!args["fields"]) return Facebook.err.missingField("fields");
        args["method"] = "pages.getInfo";
        return Facebook.call(args);
    },
    /** Checks whether the logged-in user is the admin for a given Page. */
    pagesIsAdmin : function(args) {
        args["method"] = "pages.isAdmin";
        return Facebook.call(args);
    },
    /** Checks whether the Page has added the application. */
    pagesIsAppAdded : function(args) {
        args["method"] = "pages.isAppAdded";
        return Facebook.call(args);
    },
    /** Checks whether a user is a fan of a given Page. */
    pagesIsFan : function(args) {
        args["method"] = "pages.isFan";
        return Facebook.call(args);
    },

    /** Adds a tag with the given information to a photo. */
    photosAddTag : function(args) {
        if(!args["pid"]) return Facebook.err.missingField("pid");
        if(!args["tag_uid"]) return Facebook.err.missingField("tag_uid");
        if(!args["tag_text"]) return Facebook.err.missingField("tag_text");
        if(!args["x"]) return Facebook.err.missingField("x");
        if(!args["y"]) return Facebook.err.missingField("y");
        args["method"] = "photos.addTag";
        return Facebook.call(args);
    },
    /** Creates and returns a new album owned by the current session user. */
    photosCreateAlbum : function(args) {
        if(!args["name"]) return Facebook.err.missingField("name");
        args["method"] = "photos.createAlbum";
        return Facebook.call(args);
    },
    /** Returns all visible photos according to the filters specified. */
    photosGet : function(args) {
        if(!args[subj_id]) return Facebook.err.missingField("subj_id");
        if(!args[aid]) return Facebook.err.missingField("aid");
        if(!args[pids]) return Facebook.err.missingField("pids");
        args["method"] = "photos.get";
        return Facebook.call(args);
    },
    /** Returns metadata about all of the photo albums uploaded by the specified user. */
    photosGetAlbums : function(args) {
        if(!args[uid]) return Facebook.err.missingField("uid");
        if(!args[aids]) return Facebook.err.missingField("aids");
        args["method"] = "photos.getAlbums";
        return Facebook.call(args);
    },
    /** Returns the set of user tags on all photos specified. */
    photosGetTags : function(args) {
        if(!args[pids]) return Facebook.err.missingField("pids");
        args["method"] = "photos.getTags";
        return Facebook.call(args);
    },
    /** Uploads a photo owned by the current session user and returns the new photo. */
    upload : function(args) {
        if(args.uid && args.session_key) return Facebook.err.mutualExclusion();
        args["method"] = "photos.upload";
        return Facebook.call(args);
    },

    /** Sets the FBML for a user's profile, including the content for both the profile box and the profile actions. */
    getFBML : function(args) {
        args["method"] = "profile.getFBML";
        return Facebook.call(args);
    },
    /** Gets the FBML that is currently set for a user's profile. */
    setFBML : function(args) {
        args["method"] = "profile.setFBML";
        return Facebook.call(args);
    },

    /** Returns a wide array of user-specific information for each user identifier passed, limited by the view of the current user. */
    getInfo : function(args) {
        if(!args[uids]) return Facebook.err.missingField("uids");
        if(!args[fields]) return Facebook.err.missingField("fields");
        args["method"] = "users.getInfo";
        return Facebook.call(args);
    },
    /** Gets the user ID (uid) associated with the current session. */
    usersGetLoggedInUser : function(args) {
        args["method"] = "users.getLoggedInUser";
        return Facebook.call(args);
    },
    /** Checks whether the user has opted in to an extended application permission. */
    usersHasAppPermission : function(args) {
        if(!args[ext_perm]) return Facebook.err.missingField("ext_perm");
        args["method"] = "users.hasAppPermission";
        return Facebook.call(args);
    },
    /** Returns whether the logged-in user has added the calling application. */
    usersIsAppAdded : function(args) {
        args["method"] = "users.isAppAdded";
        return Facebook.call(args);
    },
    /** Updates a user's Facebook status. */
    usersSetStatus : function(args) {
        args["method"] = "users.setStatus";
        return Facebook.call(args);
    }
};

/** Error messages */
Facebook.err = {
    /** A required field is absent from a request */
    missingField : function(str) { return '{ api_error: "Missing required field '+str+'." }'; },
    /** The http request failed */
    httpError : function() { return '{ api_error: "Something went wrong in the http request.  No text was returned." }'; },
    /** Two mutually exclusive arguments were passed */
    mutualExclusion : function() { return '{ api_error: "Two mutually exclusive arguments were passed to the request."}'; },
};
