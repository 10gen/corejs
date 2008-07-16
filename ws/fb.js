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
     * @param {Object} args Fields:  <ul><li> start_time  int  A Unix time for the start of the range (inclusive).</li>
     * <li>end_time  int  A Unix time for the end of the range (inclusive). The end_time cannot be more than 30 days after the start_time.</li>
     * <li>period  int The length of the period, in seconds, during which the metrics were collected. Currently, the only supported periods are 86400 (1 day), 604800 (7-days), and 2592000 (30 days).</li>
     * <li>metrics  json array  A JSON-encoded list of metrics to retrieve (e.g. ["active_users", "canvas_page_views"]).</li>
     * <li><span class="field_name"> api_key </span><span class="field_type"> string </span><span class="field_desc"> The application key associated with the calling application.</span></li>
     * <li><span class="field_name"> sig </span><span class="field_type"> string </span><span class="field_desc"> An MD5 hash of the current request and your secret key, as described in the authentication guide.</span></li>
     * <li><span class="field_name"> v </span><span class="field_type"> string </span><span class="field_desc"> This must be set to 1.0 to use this version of the API.</span></li>
     * </ul>
     */
    getAllocation : function(args) {
        if(!args["integration_point_name"]) return Facebook.err.missingField("integration_point_name");
        args["method"] = "admin.getAllocation";
        return Facebook.call(args);
    },
    /** Returns specified daily metrics for your application, given a date range.
     * @param {Object} args <ul><li> start_date  int  A Unix time for the start of the date range (inclusive).</li>
     * <li> end_date  int  A Unix time for the end of the date range (inclusive).</li>
     * <li>  metrics  json array  A JSON-encoded list of daily metrics to retrieve (e.g. ["daily_active_users", "canvas_page_views"]).</li>
     * <li><span class="field_name"> api_key </span><span class="field_type"> string </span><span class="field_desc"> The application key associated with the calling application.</span></li>
     * <li><span class="field_name"> sig </span><span class="field_type"> string </span><span class="field_desc"> An MD5 hash of the current request and your secret key, as described in the authentication guide.</span></li>
     * <li><span class="field_name"> v </span><span class="field_type"> string </span><span class="field_desc"> This must be set to 1.0 to use this version of the API.</span></li>
     * </ul>
     */
    getDailyMetrics : function(args) {
        if(!args["start_date"]) return Facebook.err.missingField("start_date");
        if(!args["end_date"]) return Facebook.err.missingField("end_date");
        if(!args["metrics"]) return Facebook.err.missingField("metrics");
        args["method"] = "admin.getDailyMetrics";
        return Facebook.call(args);
    },
    /** Returns values of properties for your applications from the Facebook Developer application.
     * <li><span class="field_name"> api_key </span><span class="field_type"> string </span><span class="field_desc"> The application key associated with the calling application.</span></li>
     * <li><span class="field_name"> sig </span><span class="field_type"> string </span><span class="field_desc"> An MD5 hash of the current request and your secret key, as described in the authentication guide.</span></li>
     * <li><span class="field_name"> v </span><span class="field_type"> string </span><span class="field_desc"> This must be set to 1.0 to use this version of the API.</span></li>
     * <li><span class="field_name"> format </span><span class="field_type"> string </span><span class="field_desc"> Desired response format. Either XML (default) or JSON. </span></li>
     * <li><span class="field_name"> callback </span><span class="field_type"> string </span><span class="field_desc">Name of a function to call. This is primarily to enable cross-domain JavaScript requests using the <script> tag, also known as JSONP, and works with both the XML and JSON formats. The function will be called with the response passed as the parameter.</span></li>
     * @param {Object} args <ul><li> properties  json array  A list of property names that you want to view. This list is described on ApplicationProperties.</li></ul>
     */
    getAppProperties : function(args) {
        if(!args["properties"]) return Facebook.err.missingField("properties");
        args["method"] = "admin.getAppProperties";
        return Facebook.call(args);
    },
    /** Sets values for properties for your applications in the Facebook Developer application.
     * @param {Object} args <ul><li>properties  array A JSON encoded map of property names to new values. This call will fail if values have the wrong type. The full list is described on ApplicationProperties. </li>
     * <li><span class="field_name"> api_key </span><span class="field_type"> string </span><span class="field_desc"> The application key associated with the calling application.</span></li>
     * <li><span class="field_name"> sig </span><span class="field_type"> string </span><span class="field_desc"> An MD5 hash of the current request and your secret key, as described in the authentication guide.</span></li>
     * <li><span class="field_name"> v </span><span class="field_type"> string </span><span class="field_desc"> This must be set to 1.0 to use this version of the API.</span></li>
     * <li><span class="field_name"> format </span><span class="field_type"> string </span><span class="field_desc"> (optional) Desired response format. Either XML (default) or JSON. </span></li>
     * <li><span class="field_name"> callback </span><span class="field_type"> string </span><span class="field_desc"> (optional) Name of a function to call. This is primarily to enable cross-domain JavaScript requests using the <script> tag, also known as JSONP, and works with both the XML and JSON formats. The function will be called with the response passed as the parameter.</span></li></ul>
     */
    setAppProperties : function(args) {
        args["method"] = "admin.setAppProperties";
        return Facebook.call(args);
    },

    /** Returns public information about a given application (not necessarily your own).
     * <ul>
     * <li><span class="field_name"> api_key </span><span class="field_type"> string </span><span class="field_desc"> The application key associated with the calling application.</span></li>
     * <li><span class="field_name"> sig </span><span class="field_type"> string </span><span class="field_desc"> An MD5 hash of the current request and your secret key, as described in the authentication guide.</span></li>
     * <li><span class="field_name"> v </span><span class="field_type"> string </span><span class="field_desc"> This must be set to 1.0 to use this version of the API.</span></li>
     * </ul>
     */
    getPublicInfo : function(args) {
        args["method"] = "application.getPublicInfo";
        return Facebook.call(args);
    },

    /** Creates an auth_token to be passed in as a parameter to login.php and then to auth.getSession after the user has logged in.
     * @param {Object} args field:
     * <ul>
     * <li><span class="field_name"> api_key </span><span class="field_type"> string </span><span class="field_desc"> The application key associated with the calling application.</span></li>
     * <li><span class="field_name"> sig </span><span class="field_type"> string </span><span class="field_desc"> An MD5 hash of the current request and your secret key, as described in the authentication guide.</span></li>
     * <li><span class="field_name"> v </span><span class="field_type"> string </span><span class="field_desc"> This must be set to 1.0 to use this version of the API.</span></li>
     * <li><span class="field_name"> format </span><span class="field_type"> string </span><span class="field_desc"> (optional) Desired response format. Either XML (default) or JSON. </span></li>
     * <li><span class="field_name"> callback </span><span class="field_type"> string </span><span class="field_desc"> (optional) Name of a function to call. This is primarily to enable cross-domain JavaScript requests using the <script> tag, also known as JSONP, and works with both the XML and JSON formats. The function will be called with the response passed as the parameter.</span></li></ul>
     */
    createToken : function(args) {
        args["method"] = "auth.createToken";
        return Facebook.call(args);
    },
    /** Returns the session key bound to an auth_token, as returned by auth.createToken or in the callback URL.
     * @param {Object} args Fields:
     * <ul>
     * <li><span class="field_name"> auth_token </span><span class="field_type"> string </span><span class="field_desc"> The token returned by auth.createToken and passed into login.php</span></li>
     * <li><span class="field_name"> api_key </span><span class="field_type"> string </span><span class="field_desc"> The application key associated with the calling application.</span></li>
     * <li><span class="field_name"> sig </span><span class="field_type"> string </span><span class="field_desc"> An MD5 hash of the current request and your secret key, as described in the authentication guide.</span></li>
     * <li><span class="field_name"> v </span><span class="field_type"> string </span><span class="field_desc"> This must be set to 1.0 to use this version of the API.</span></li>
     * <li><span class="field_name"> format </span><span class="field_type"> string </span><span class="field_desc"> (optional) Desired response format. Either XML (default) or JSON. </span></li>
     * <li><span class="field_name"> callback </span><span class="field_type"> string </span><span class="field_desc"> (optional) Name of a function to call. This is primarily to enable cross-domain JavaScript requests using the <script> tag, also known as JSONP, and works with both the XML and JSON formats. The function will be called with the response passed as the parameter.</span></li>
     * <li><span class="field_name"> generate_session_secret </span><span class="field_type"> bool </span><span class="field_desc">(optional) Whether to generate a temporary session secret associated with this session. This is for use only with non-infinite sessions, for applications that want to use a client-side component without exposing the application secret. Note that the app secret will continue to be used for all server-side calls, for security reasons.</span></li>
     * </ul>
     */
    getSession : function(args) {
        if(!args["auth_token"]) return Facebook.err.missingField("auth_token");
        args["method"] = "auth.getSession";
        return Facebook.call(args);
    },
    /** Returns a temporary session secret associated to the current existing session, for use in a client-side component to an application.
     * @param {Object} args Fields:
     * <ul>
     * <li><span class="field_name"> api_key </span><span class="field_type"> string </span><span class="field_desc"> The application key associated with the calling application.</span></li>
     * <li><span class="field_name"> sig </span><span class="field_type"> string </span><span class="field_desc"> An MD5 hash of the current request and your secret key, as described in the authentication guide.</span></li>
     * <li><span class="field_name"> v </span><span class="field_type"> string </span><span class="field_desc"> This must be set to 1.0 to use this version of the API.</span></li>
     * <li><span class="field_name"> format </span><span class="field_type"> string </span><span class="field_desc"> (optional) Desired response format. Either XML (default) or JSON. </span></li>
     * <li><span class="field_name"> callback </span><span class="field_type"> string </span><span class="field_desc"> (optional) Name of a function to call. This is primarily to enable cross-domain JavaScript requests using the <script> tag, also known as JSONP, and works with both the XML and JSON formats. The function will be called with the response passed as the parameter.</span></li>
     * </ul>
     */
    promoteSession : function(args) {
        args["method"] = "auth.promoteSession";
        return Facebook.call(args);
    },

    /** Execute a list of individual API calls in a single batch.
     * @param  {Object} args Fields: <ul><li>method_feed  string A JSON encoded array of strings. Each element in the array should contain the full parameters for a method, including method name, sig, etc. Currently, there is a maximum limit of 15 elements in the array.</li>
     * <li><span class="field_name"> api_key </span><span class="field_type"> string </span><span class="field_desc"> The application key associated with the calling application.</span></li>
     * <li><span class="field_name"> sig </span><span class="field_type"> string </span><span class="field_desc"> An MD5 hash of the current request and your secret key, as described in the authentication guide.</span></li>
     * <li><span class="field_name"> v </span><span class="field_type"> string </span><span class="field_desc"> This must be set to 1.0 to use this version of the API.</span></li>
     * <li><span class="field_name"> format </span><span class="field_type"> string </span><span class="field_desc"> (optional) Desired response format. Either XML (default) or JSON. </span></li>
     * <li><span class="field_name"> callback </span><span class="field_type"> string </span><span class="field_desc"> (optional) Name of a function to call. This is primarily to enable cross-domain JavaScript requests using the <script> tag, also known as JSONP, and works with both the XML and JSON formats. The function will be called with the response passed as the parameter.</span></li>
     * </ul>
     */
    run : function(args) {
        if(!args["method_feed"]) return Facebook.err.missingField("method_feed");
        args["method"] = "batch.run";
        return Facebook.call(args);
    },

    /** Returns all cookies for a given user and application.
     * @param  {Object} args Fields: <ul>
     * <li> uid  int  The user from whom to get the cookies. </li>
     * <li> name  string  (optional) The name of the cookie. If not specified, all the cookies for the given user get returned.</li>
     * </ul>
     */
    getCookie : function(args) {
        if(!args["query"]) return Facebook.err.missingField("uids1");
        args["method"] = "data.getCookie";
        return Facebook.call(args);
    },
    /** Sets a cookie for a given user and application.
     * @param  {Object} args Fields: <ul>
     * <li> uid  int  The user from whom to get the cookies. </li>
     * <li> name  string The name of the cookie. </li>
     * <li> value  string  Value of the cookie. </li>
     * <li>  expires  int (optional) Time stamp when the cookie should expire. If not specified, the cookie expires after 24 hours. (The time stamp can be longer than 24 hours and currently has no limit)</li>
     * <li> path  string  (optional) Path relative to the application's callback URL, with which the cookie should be associated. (default value is /)</li>
     * </ul>
     */
    setCookie : function(args) {
        if(!args["query"]) return Facebook.err.missingField("uids1");
        args["method"] = "data.setCookie";
        return Facebook.call(args);
    },

    /** Returns all visible events according to the filters specified.
     * @param {Object} args Fields:
     * <ul>
     * <li><span class="field_name"> api_key </span><span class="field_type"> string </span><span class="field_desc"> The application key associated with the calling application.</span></li>
     * <li><span class="field_name"> sig </span><span class="field_type"> string </span><span class="field_desc"> An MD5 hash of the current request and your secret key, as described in the authentication guide.</span></li>
     * <li><span class="field_name"> v </span><span class="field_type"> string </span><span class="field_desc"> This must be set to 1.0 to use this version of the API.</span></li>
     * <li><span class="field_name"> format </span><span class="field_type"> string </span><span class="field_desc"> (optional) Desired response format. Either XML (default) or JSON. </span></li>
     * <li><span class="field_name"> callback </span><span class="field_type"> string </span><span class="field_desc"> (optional) Name of a function to call. This is primarily to enable cross-domain JavaScript requests using the <script> tag, also known as JSONP, and works with both the XML and JSON formats. The function will be called with the response passed as the parameter.</span></li>
     * </ul>
     */
    get : function(args) {
        args["method"] = "events.get";
        return Facebook.call(args);
    },
    /** Returns membership list data associated with an event. */
    getMembers : function(args) {
        if(!args["eid"]) return Facebook.err.missingField("eid");
        args["method"] = "events.getMembers";
        return Facebook.call(args);
    },

    /** Fetches and re-caches the image stored at the given URL. */
    refreshImgSrc : function(args) {
        if(!args["url"]) return Facebook.err.missingField("url");
        args["method"] = "fbml.refreshImgSrc";
        return Facebook.call(args);
    },
    /** Fetches and re-caches the content stored at the given URL. */
    refreshRefURL : function(args) {
        if(!args["url"]) return Facebook.err.missingField("url");
        args["method"] = "fbml.refreshRefURL";
        return Facebook.call(args);
    },
    /** Associates a given "handle" with FBML markup so that the handle can be used within the fb:ref FBML tag. */
    setRefHandle : function(args) {
        if(!args["handle"]) return Facebook.err.missingField("handle");
        if(!args["fbml"]) return Facebook.err.missingField("fbml");
        args["method"] = "fbml.setRefHandle";
        return Facebook.call(args);
    },

    /** Publishes a News Feed story to the user corresponding to the session_key parameter. */
    publishStoryToUser : function(args) {
        if(!args["title"]) return Facebook.err.missingField("title");
        args["method"] = "feed.publishStoryToUser";
        return Facebook.call(args);
    },
    /** Publishes a Mini-Feed story to the user corresponding to the session_key parameter, and publishes News Feed stories to the friends of that user. */
    publishActionOfUser : function(args) {
        if(!args["title"]) return Facebook.err.missingField("title");
        args["method"] = "feed.publishActionOfUser";
        return Facebook.call(args);
    },
    /** Publishes a Mini-Feed story to the user or Page corresponding to the session_key or page_actor_id parameter. */
    publishTemplatizedAction : function(args) {
        if(!args["title_template"]) return Facebook.err.missingField("title_template");
        args["method"] = "feed.publishTemplatizedAction";
        return Facebook.call(args);
    },

    /** Evaluates an FQL (Facebook Query Language) query. */
    query : function(args) {
        if(!args["query"]) return Facebook.err.missingField("query");
        args["method"] = "fql.query";
        return Facebook.call(args);
    },

    /** Returns whether or not each pair of specified users is friends with each other. */
    areFriends : function(args) {
        if(!args["uids1"]) return Facebook.err.missingField("uids1");
        if(!args["uids2"]) return Facebook.err.missingField("uids2");
        args["method"] = "friends.getFriends";
        return Facebook.call(args);
    },
    /** Returns the identifiers for the current user's Facebook friends. */
    get : function(args) {
        args["method"] = "friends.get";
        return Facebook.call(args);
    },
    /** Returns the identifiers for the current user's Facebook friends who are signed up for the specific calling application. */
    getAppUsers : function(args) {
        args["method"] = "friends.getAppUsers";
        return Facebook.call(args);
    },
    /** Returns the identifiers for the current user's Facebook friend lists. */
    getLists : function(args) {
        args["method"] = "friends.getLists";
        return Facebook.call(args);
    },

    /** Returns all visible groups according to the filters specified. */
    get : function(args) {
        args["method"] = "groups.get";
        return Facebook.call(args);
    },
    /** Returns membership list data associated with a group. */
    getMembers : function(args) {
        if(!args["gid"]) return Facebook.err.missingField("gid");
        args["method"] = "groups.getMembers";
        return Facebook.call(args);
    },

    /** Create or modify a listing in Marketplace. */
    createListing : function(args) {
        if(!args["listing_id"]) return Facebook.err.missingField("listing_id");
        if(!args["show_on_profile"]) return Facebook.err.missingField("show_on_profile");
        if(!args["listing_attrs"]) return Facebook.err.missingField("listing_attrs");
        args["method"] = "marketplace.createListing";
        return Facebook.call(args);
    },
    /** Returns all the Marketplace categories. */
    getCategories : function(args) {
        args["method"] = "marketplace.getCategories";
        return Facebook.call(args);
    },
    /** Return all Marketplace listings either by listing ID or by user. */
    getListings : function(args) {
        args["method"] = "marketplace.getListings";
        return Facebook.call(args);
    },
    /** Returns the Marketplace subcategories for a particular category. */
    getSubCategories : function(args) {
        args["method"] = "marketplace.getSubCategories";
        return Facebook.call(args);
    },
    /** Remove a listing from Marketplace. */
    removeListing : function(args) {
        if(!args["listing_id"]) return Facebook.err.missingField("listing_id");
        args["method"] = "marketplace.removeListing";
        return Facebook.call(args);
    },
    /** Search Marketplace for listings filtering by category, subcategory and a query string. */
    search : function(args) {
        if(!args["query"]) return Facebook.err.missingField("query");
        args["method"] = "marketplace.search";
        return Facebook.call(args);
    },

    /** Returns information on outstanding Facebook notifications for current session user. */
    get : function(args) {
        args["method"] = "notifications.get";
        return Facebook.call(args);
    },
    /** Sends a notification to a set of users. */
    send : function(args) {
        if(!args["to_ids"]) return Facebook.err.missingField("to_ids");
        if(!args["notification"]) Facebook.err.missingField("notification");
        args["method"] = "notifications.send";
        return Facebook.call(args);
    },
    /** Sends an email to the specified users who have the application. */
    sendEmail : function(args) {
        if(!args["recipients"]) return Facebook.err.missingField("recipients");
        if(!args["subject"]) return Facebook.err.missingField("subject");
        args["method"] = "notifications.sendEmail";
        return Facebook.call(args);
    },

    /** Returns all visible pages to the filters specified. */
    getInfo : function(args) {
        if(!args["fields"]) return Facebook.err.missingField("fields");
        args["method"] = "pages.getInfo";
        return Facebook.call(args);
    },
    /** Checks whether the logged-in user is the admin for a given Page. */
    isAdmin : function(args) {
        args["method"] = "pages.isAdmin";
        return Facebook.call(args);
    },
    /** Checks whether the Page has added the application. */
    isAppAdded : function(args) {
        args["method"] = "pages.isAppAdded";
        return Facebook.call(args);
    },
    /** Checks whether a user is a fan of a given Page. */
    isFan : function(args) {
        args["method"] = "pages.isFan";
        return Facebook.call(args);
    },

    /** Adds a tag with the given information to a photo. */
    addTag : function(args) {
        if(!args["pid"]) return Facebook.err.missingField("pid");
        if(!args["tag_uid"]) return Facebook.err.missingField("tag_uid");
        if(!args["tag_text"]) return Facebook.err.missingField("tag_text");
        if(!args["x"]) return Facebook.err.missingField("x");
        if(!args["y"]) return Facebook.err.missingField("y");
        args["method"] = "photos.addTag";
        return Facebook.call(args);
    },
    /** Creates and returns a new album owned by the current session user. */
    createAlbum : function(args) {
        if(!args["name"]) return Facebook.err.missingField("name");
        args["method"] = "photos.createAlbum";
        return Facebook.call(args);
    },
    /** Returns all visible photos according to the filters specified. */
    get : function(args) {
        if(!args[subj_id]) return Facebook.err.missingField("subj_id");
        if(!args[aid]) return Facebook.err.missingField("aid");
        if(!args[pids]) return Facebook.err.missingField("pids");
        args["method"] = "photos.get";
        return Facebook.call(args);
    },
    /** Returns metadata about all of the photo albums uploaded by the specified user. */
    getAlbums : function(args) {
        if(!args[uid]) return Facebook.err.missingField("uid");
        if(!args[aids]) return Facebook.err.missingField("aids");
        args["method"] = "photos.getAlbums";
        return Facebook.call(args);
    },
    /** Returns the set of user tags on all photos specified. */
    getTags : function(args) {
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
    getLoggedInUser : function(args) {
        args["method"] = "users.getLoggedInUser";
        return Facebook.call(args);
    },
    /** Checks whether the user has opted in to an extended application permission. */
    hasAppPermission : function(args) {
        if(!args[ext_perm]) return Facebook.err.missingField("ext_perm");
        args["method"] = "users.hasAppPermission";
        return Facebook.call(args);
    },
    /** Returns whether the logged-in user has added the calling application. */
    isAppAdded : function(args) {
        args["method"] = "users.isAppAdded";
        return Facebook.call(args);
    },
    /** Updates a user's Facebook status. */
    setStatus : function(args) {
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
