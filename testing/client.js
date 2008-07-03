core.ext.redirect();
core.net.url();
core.user.user();

/** @class Library for testing JXPs.
*   Instantiate a testing.Client, and then call
*   t.execute(function(){
*       print(request.getHostname());
*   });
*   or some other function. Within this function, request and response are
*   defined, and behave as you might expect. You can also set parameters of
*   the incoming request like:
*   t.setIP("192.168.1.1");
*   t.setURL("/some/path");
*   t.addArg("key", "val");
*   Methods can be chained, as follows:
*   t.setIP("192.168.1.1").setURL("/some/path").addArg("key", "val");
*
*   execute takes a function and can arrange to return the output of that
*   function (i.e. what it print()s) or the return value of that function.
*   See setAnswer() for more details.
*/
testing.Client = function(){
    this.cookies = {};
    this.headers = [];
    this.redirects = [];
    this.url = new URL('/');
    this.ip = "127.0.0.1";
};

/* Utility method to get an Array of headers, including the cookies.
*/
testing.Client.prototype.getHeaders = function(){
    var headers = this.headers;
    var cookieStrings = [];
    for(var key in this.cookies){
        cookieStrings.push(key + '=' + this.cookies[key]);
    }
    if(cookieStrings.length > 0){
        headers = headers.concat(["Cookie: " + cookieStrings.join("; ")]);
    }
    headers = headers.concat(["X-Cluster-Client-Ip: " + this.ip]);
    headers = headers.concat(["Host: " + this.url.hostname + (this.url.port ? ":"+this.url.port : "")]);

    return headers.join("\n");
};

/**
* Set the IP that the request "comes from".
*/
testing.Client.prototype.setIP = function(ip){
    this.ip = ip;
};

/** Add a header.
*/
testing.Client.prototype.addHeader = function(header){
    this.headers.push(header);
};

/* Utility method to get a dummy request.
*/
testing.Client.prototype.getRequest = function(query){
    return javaStatic("ed.net.httpserver.HttpRequest", "getDummy", query,
                      this.getHeaders());
};

/** Add a cookie to the incoming request.
*/
testing.Client.prototype.addCookie = function(key, val){
    this.cookies[key] = val;
};

/* This method gets called by the dummy response when it is sent a
*  sendRedirectTemporary. It sets the URL so that further execute() calls get
*  that URL as a request.
*/
testing.Client.prototype.addRedirect = function(type, location){
    // FIXME: should this really keep an array of redirects?? should
    // this really set the next location? I have no idea!!
    this.redirects.push({type: type, location: location});
    return this.setURL(location);
};

/* Utility method to put together a dummy response object.
*/
testing.Client.prototype.getResponse = function(){
    var t = this;
    var response = { sendRedirectTemporary: function(location){ t.addRedirect('temporary', location); },
                     addCookie: function(key, val){ t.addCookie(key, val); }
                   };
    return response;
};

/** Set the URL that the request is trying to fetch.
*   @param {string} query  some path or GET query
*/
testing.Client.prototype.setURL = function(query){
    this.url = new URL(query || '/');
    return this;
};

/** Add arguments to the URL that the request is trying to fetch.
*   @param {object} args  a mapping of query key -> query value.
*/
testing.Client.prototype.addArgs = function(args){
    this.url = this.url.addArgs(args);
    return this;
};

/**
*   Adds a parameter to the URL and thus request.
*   @param {string} key the request key to add
*   @param {string} value the request value to add
*/
testing.Client.prototype.addArg = function(key, value){
    this.url = this.url.addArg(key, value);
    return this;
};

/**
*   Sets whether execute() should return the value or printed output of its
*   parameter.
*   @param {string} answer 'value' or 'output'
*/
testing.Client.prototype.setAnswer = function(answer){
    // answer == 'value' or 'output', and specifies what you care about when
    // you call execute on a function
    this.answer = answer || 'output';
    return this;
};

/** Call a function as though it were being called within the context of an
*   application.
*   This provides a number of niceties that a unit test run from the Shell
*   might want:
*
*   - a dummy print() function which buffers the output and can be used by a JXP
*     without complaint
*   - a dummy request and response which act much like requests and responses do
*     in the app server
*   - a head object which ignores addScript and addCSS calls
*   A global "user" object is not provided; for that, see withPermission().
*
*   @param {function} f  the function that should be called
*   @returns either the return value of the given function or the output,
*      according to the last setAnswer call.
*/
testing.Client.prototype.execute = function(f){
    // execute "within the context of a request" -- i.e. generate
    // sensible request and response objects and keep track of what happens to
    // them
    this.redirects = [];
    var answer = this.answer || 'output';

    // Explicitly pollute the global namespace
    request = this.getRequest(this.url.toString());
    response = this.getResponse();
    head = Object.extend([], {addScript: function() {},
                              addCSS: function() {} });
    jxp = {};

    var val = Ext.redirect(function(){
        try{
            return f();
        }
        catch(e if (e instanceof Exception.Quiet)){
            return e;
        }
    });
    if(val && answer in val) return val[answer];
    if(answer in this) return this[answer];
    return val;
};

/**
*   Like execute(), but creates a user object which has the given permission.
*   @param {string} perm   the permission that the incoming user should have
*   @param {function} f    the function that should be called
*/
testing.Client.prototype.withPermission = function(perm, f){
    user = new User();
    user.name = "Testing User 1";
    user.addPermission(perm);

    // I can't count 24 zeroes! You must be mad.
    user._id = ['0000', '0000', '0000', '0000', '0000', '0001'].join('');

    var val = this.execute(f);

    return val;
};
