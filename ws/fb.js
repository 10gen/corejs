/**
*      Copyright (C) 2008 10gen Inc.
*
*    Licensed under the Apache License, Version 2.0 (the "License");
*    you may not use this file except in compliance with the License.
*    You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*    Unless required by applicable law or agreed to in writing, software
*    distributed under the License is distributed on an "AS IS" BASIS,
*    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*    See the License for the specific language governing permissions and
*    limitations under the License.
*/


/** @class Facebook Developer API */
Facebook = {
    /** Set this to the secret key Facebook assigns you
     * @type string
     */
    secret_key : "",
    /** Set this to the API key Facebook assigns you
     * @type string
     */
    api_key : "",

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

/** Call a facebook API method.  See the <a href="http://wiki.developers.facebook.com/index.php/API">Facebook developer API</a> for available methods and parameters.
 * @example var r = call({ method : "users.getInfo", uids : "1579,23456", fields : "birthday,last_name"});
 * Returns the last names and birthdays of the two users selected.
 * @param {Object} args All key/value pairs
 * @return {string} HTTP response text
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



/** Error messages */
Facebook.err = {
    /** A required field is absent from a request */
    missingField : function(str) { return '{ api_error: "Missing required field '+str+'." }'; },
    /** The http request failed */
    httpError : function() { return '{ api_error: "Something went wrong in the http request.  No text was returned." }'; },
    /** Two mutually exclusive arguments were passed */
    mutualExclusion : function() { return '{ api_error: "Two mutually exclusive arguments were passed to the request."}'; },
};
