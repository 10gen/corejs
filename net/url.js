/** URL class for parsing/manipulating URLs.
 */
URL = function(s){
    // This class is a representation of a URL. Right now it is mostly
    // intended to support adding/replacement/removal of query args, but it could
    // presumably be used for other URL-related things too.
    // Query args are stored in an array, since there can be more than one of the
    // same arg in a URL.
    // (If we ever write a multidict or anything, it should be used here.)

    // Parse scheme and hostname. Sometimes this is absent
    // (the URL starts with a slash).
    this.scheme = "";
    this.hostname = "";
    this.args = [];
    this.path = "";
    this.anchor = "";

    if(s.indexOf('://') == -1){
        this.scheme = 'http';
    } else {
        this.scheme = s.substring(0, s.indexOf('://'));
        s = s.substring(s.indexOf('://')+3, s.length);
    }
    this.hostname = s.substring(0, s.indexOf('/'));
    if(this.hostname.indexOf(':') != -1){
        this.port = this.hostname.substring(this.hostname.indexOf(':')+1,
                                            this.hostname.length);
        this.hostname = this.hostname.substring(0, this.hostname.indexOf(':'));
    }
    s = s.substring(s.indexOf('/'), s.length);

    // Parse the anchor, path and query args (if any).
    this.args = [];
    this.anchor = "";
    // Check for an anchor first, and trim it.
    // Note that we don't get an anchor from an incoming request!
    if(s.indexOf('#') != -1){
        this.anchor = s.substring(s.indexOf('#')+1, s.length);
        s = s.substring(0, s.indexOf('#'));
    }
    if(s.indexOf('?') == -1){
        this.path = s;
    } else {
        this.path = s.substring(0, s.indexOf('?'));
        s = s.substring(s.indexOf('?')+1, s.length);
        var ary = s.split('&');
        if ( ary && ary.length > 0 ){
            for(var i in ary){
                var temp = ary[i];
                var idx = temp.indexOf( "=" );
                if ( idx < 0 )
                    continue;
                this.args.push( { key: temp.substring( 0 , idx ) ,
                                  value: URL.unescape_queryargs( temp.substring( idx + 1 ) ) } );
            }
        }
    }
};
/**
 *  A URL to this site, with the given path.
 *  Takes the hostname and port from the Request object.
 *  Don't call with new; bad things happen.
 *  @param {string} path The path that the URL should have.
 */
LocalURL = function(path){
    // Don't call using new, bad things happen
    // Tests not yet written
    path = path || request.getURL();
    var u = new URL(path);
    u.hostname = request.getHost();
    u.port = request.getPort();
    return u;
};
/**
 *  Stringify a URL.
 */
URL.prototype.toString = function(){
    // Generate the string for this URL object.
    if(this.hostname){
        var str = this.scheme + "://" + this.hostname;
        if(this.port)
            str = str+':'+this.port;
        str += this.path;
    }
    else
        var str = this.path;

//    var encodeURIComponent = URL.escape_queryargs;
    if(this.args.length > 0){
        str += '?';

        str += this.args.map(function(a){
            if(a.key == null || a.value == null)
                throw "bad args " + tojson(this.args);
            return encodeURIComponent(a.key)+'='+encodeURIComponent(a.value);
        }).join('&');
    }
    if(this.anchor) str += "#"+encodeURIComponent(this.anchor);
    return str;
};

/**
 *  Clone a URL.
 *  Works "the long way", formatting to string and parsing the string.
 *  @returns a new URL with the same attributes as this one.
 */
URL.prototype.clone = function(){
    // Clone a URL object. FIXME: when we get Prototype working, use their
    // Object.clone method.
    return new URL(this.toString());
};

/**
 *  Make a new URL composed of this url with an additional query argument.
 *  Always adds an additional argument, even if one with the same key exists
 *  already in this URL.
 *  @returns a new URL.
 *  @see URL.prototype.replaceArg
 */
URL.prototype.addArg = function(key, value){
    var c = this.clone();
    return c._addArg(key, value);
};

/*
 *  Internal method to add a query argument to this url.
 */
URL.prototype._addArg = function(key, value){
    this.args.push({key: key, value: value});
    return this;
};

/** Make a new URL composed of this url with many additional query arguments.
 *  Does not replace previous arguments with the same names.
 *  @param {Object} obj A mapping of key, value pairs, 
 *        all of which are added to this URL.
 *  @returns a new URL.
 */
URL.prototype.addArgs = function(obj){
    var c = this.clone();
    return c._addArgs(obj);
};

/* Internal method to add several query arguments to this url.
 */
URL.prototype._addArgs = function(obj){
    for(var key in obj){
        this._addArg(key, obj[key]);
    }
    return this;
};

/**
 *  Create a new URL with a new query argument, replacing the first query 
 *  argument of the same name if any.
 *  If there is no query arg with key "key", then just add a key:arg pair at the
 *  end.
 *  @returns a new URL.
 *  @param {string} key The key to add (and replace).
 *  @param {string} value The value to add with it.
 */
URL.prototype.replaceArg = function(key, value){
    var c = this.clone();
    return c._replaceArg(key, value);
};

URL.prototype._replaceArg = function(key, value){
    if(key == null) throw "key is null";
    if(value == null) throw "value is null";
    for(var i in this.args){
        if(this.args[i].key == key){
            this.args[i].value = value;
            return this;
        }
    }
    return this._addArg(key, value);
};

/** Create a new URL without the first query argument named by key.
 *  @returns a new URL with either the same args (if none had the right key) or
 *         one less arg (if that arg had the same key).
 */
URL.prototype.removeArg = function(key){
    var c = this.clone();
    c._removeArg(key);
    return c;
};

URL.prototype._removeArg = function(key){
    var start = false;
    for(var i in this.args){
        if(!start && this.args[i].key == key){
            start = true;
        }
        else if(start) {
            this.args[i-1] = this.args[i];
        }
    }
    if(start)
        this.args.pop();
    return this;
};

/** Create a new URL without any of the query arguments this one has.
 */
URL.prototype.clearArgs = function(){
    var c = this.clone();
    c._clearArgs();
    return c;
};

/* Internal method to get rid of the query arguments for this object.
*/
URL.prototype._clearArgs = function(){
    this.args = [];
};

// I can never remember the right name for these!
URL.prototype.addQuery = URL.prototype.addArg;
URL.prototype.replaceQuery = URL.prototype.replaceArg;
URL.prototype.removeQuery = URL.prototype.removeArg;
URL.prototype.clearQueries = URL.prototype.clearArgs;

/**
 *  Create a new URL with the same path as this one, except with the last path
 *  component different.
 *  @example
 *  var u = new URL('/a/b/c');
 *  var u2 = u.replaceLastPath('d');
 *  print(u2.toString()); // prints /a/b/d
 */
URL.prototype.replaceLastPath = function(s){
    var c = this.clone();
    c._replaceLastPath(s);
    return c;
};

/* Internal method to replace this object's last path component.
*/
URL.prototype._replaceLastPath = function(s){
    var components = this.path.split('/');
    components.pop();
    components.push(s);
    this.path = components.join('/');
};

/**
 *  Create a new URL with a different path.
 *  @param {string} s the path for the new URL
 *  @returns a new URL
 */
URL.prototype.setPath = function(s){
    var c = this.clone();
    c._setPath(s);
    return c;
};

/* Internal method to replace the path of this object.
*/
URL.prototype._setPath = function(s){
    this.path = s;
};



/* I think we don't use this any more.
*/
URL.escape_queryargs = function( s , plusIsLiteral ){
    // This temporary function is meant to be roughly equivalent to the JS
    // encodeURIComponent function, which isn't implemented yet in the appserver.

    // The *real* encodeURIComponent doesn't replace spaces with +, but instead
    // uses %20. We support this with the "broken" parameter (if true, use %20).

    if ( ! plusIsLiteral ) s = s.replace( / /g , "+" );

    return escape( s );
};

/* Used in parsing queryargs for a given URL.
*/
URL.unescape_queryargs = function( s, plusIsLiteral ){
    // Analagously to escape_queryargs, support treating + signs as + signs
    // (rather than really as spaces). This doesn't usually come up, because
    // plus signs are usually encoded into %2b, so no "raw" plus signs come
    // through unless they were encoded from spaces.
    if( ! plusIsLiteral ) s = s.replace( /\+/g , ' ');

    return unescape( s );
};
