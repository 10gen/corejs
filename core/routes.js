// routes.js


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

// FIXME: add an setBase method, which means, "all my children live at (e.g.)
//    /~~/user, so if you got to one of my children, replace how you got to me
// with /~~/user".

/** Tools to set up routing.  The default routing is to go to whatever file matches the path of the url.
 * However, this can be overridden to route every url to one file, make certain extensions inaccessible
 * to the client, or set up different routing schemes for each application.
 * URLs are referred to as keys.  The paths to files served are referred to as values.  Absolute paths
 * start with a "/", other paths are relative.
 *
 * A route can also specify how to compute "paramaters" for its JXP. To do this,
 * use the <tt>attachment</tt> parameter to add.
 *
 * @example routes.wiki matches /wiki/
 * So, if you set:
 *     routes.wiki = "/my/wiki/"
 * If someone goes to www.yoursite.com/wiki, the appserver will serve them the file /my/wiki/index.jxp
 * @example You can also set subroutes: routes.wiki.abc matches /wiki/abc
 * @example routes.wiki.search = "/wiki/doSearch";
 * is equivalent to
 * routes.wiki.search = "doSearch";
 * @example Regular expressions can also be used:
 * routes.add( /abc/ , "" )
 * routes.add( /abc(\d)/ , "/foo/$0/$1" )
 * @example Using attachment:
 * routes.add( /abc(\d)/ , "index", { names: ["number"] } );
 * // incoming requests for /abc1 will call index with request.number = "1"
 * routes.add( /abca{3,}/, "index", { extra: { lotsOfA : "yes" } } );
 * // incoming requests for /abcaaaaa will call index with
 * // request.lotsOfA = "yes"
 * @class
 * @docmodule core.core.routes
 */
Routes = function(){
    this._regexp = [];
    this._default = null;
    this._path = '';
};

Routes.prototype._dontEnum = true;

/** Routes logging messages are handled by the logger "log.routes"
 * @type log
 */
Routes.log = log.routes;
Routes.log.level = log.LEVEL.INFO;

/**
 * If no global "routes" is already defined, then create a new Routes object and
 * push it to the global scope as "routes". Return the new object.
 *
 * If the global "routes" already exists then create a new Routes object and add
 * it as a subroutes of "routes". Return the new object. The path for the
 * subroutes is taken from the relative path between the local argument, and the
 * path of the global "routes".
 *
 * If a subroutes (or the routes object itself) already exists for this path,
 * it wil be overwritten.
 *
 * @param calling_local The JSFileLibrary pointed to by 'local.$' in the file that called create()
 * @return A new routes object
 */
Routes.prototype.create = function(calling_local) {
    /* Returns (as a string) the path of the given file library. */
    var path_from_file_library = function(file_library) {
        var string = file_library.toString();
        return string.replace(/.*_base : /, '').slice(0, -1);
    };

    /*
     * Return the relative path between local_path and app_path.
     *
     * local_path must be a descendant of app_path.
     */
    var routes_path = function(app_path, local_path) {
        var remainder;
        if (local_path.indexOf(app_path) !== -1) {
            remainder = local_path.substring(app_path.length);
        } else {
            remainder = local_path;
        }

        // convert the path to an array (ie: "" => [], "mike/is/cool/" => ['mike', 'is', 'cool'])
        if (remainder === "") {
            return [];
        }
        var to_return =  remainder.split("/");
        if (to_return[0] === "") {
            return to_return.slice(1);
        }
        return (to_return);
    };

    // actually set up the new routes object

    var new_routes = new Routes();

    if (routes === undefined) {
        scope.put('routes', new_routes, false);
        new_routes._path = path_from_file_library(calling_local);
    } else {
        var path = routes_path(routes._path, path_from_file_library(calling_local));
        if (path.length === 0) {
            routes = new Routes();
            return routes;
        }

        var parent_routes = routes;
        for (var i = 0; i < path.length - 1; i += 1) {
            parent_routes = parent_routes[path[i]];
        }

        parent_routes[path[path.length - 1]] = new_routes;
    }

    return new_routes;
};

// setting up

/** Add a routing pattern
 * @param {string|RegExp} key Route to match
 * @param {string} value Path to which key should be routed
 * @param {Object} attachment Fields: <dl>
 * <dt>names</dt><dd>An array.  Add the matching pieces of the URI to a request with the form names[0]=match1, ..., names[n-1]=matchn</dd>
 * <dt>extra</dt><dd>An object to be added to the request</dd>
 * </dl>
 * @throws {Exception} If key is not a string or RegExp
 */
Routes.prototype.add = function( key , end , attachment){
    var value = this._createValue( key , end , attachment );

    if ( isString( key ) ){
        this[ key ] = value;
        return;
    }

    if ( key instanceof RegExp ){
        this._regexp.push( value );
        return;
    }

    throw "can't handle [" + key + "] type [" + typeof key + "]";
};

/** Route all requests to a given value
 * @param {string} end Path to which all incoming requests should be routed
 * @param {Object} attachment Fields: <dl>
 * <dt>names</dt><dd>An array.  Add the matching pieces of the URI to a request with the form names[0]=match1, ..., names[n-1]=matchn</dd>
 * <dt>extra</dt><dd>An object to be added to the request</dd>
 * </dl>
 */
Routes.prototype.setDefault = function( end , attachment ){
    this._default = this._createValue( null , end , attachment );
};

Routes.prototype._createValue = function( key , end , attachment ){
    return {
        isValue : true ,
        key : key ,
        end : end ,
        attachment : attachment };
}

// main public method

/**
 * Returns the root at which the last sub-routes took over
 * @return The root at which the last sub-routes took over
 */
Routes.prototype.currentRoot = function(){
    return __routes_global_currentRoot;
};

/** Apply this routing to the given request and return the correct file.
 * Looks for the most specific first.  So, if you have defined a route matching "/x"
 * and one matching "/x/y/z", the handler for "/x/y/z" will catch a request for "/x/y/z/w/q".
 * @param {string} uri URI requested
 * @param {HTTPRequest} request
 * @param {HTTPResponse} response
 * @return {string} The path to the file to be served to the client.
 */
Routes.prototype.apply = function( uri , request , response , prefix ){

    Routes.log.debug( "apply\t" + uri );

    if ( uri == "" ){
        var nu = request.getURI() + "/";
        if ( request.getQueryString()  )
            nu += "?" + request.getQueryString();
        response.sendRedirectTemporary( nu );
    }

    if ( ! uri.startsWith( "/" ) )
        uri = "/" + uri;

    var firstPiece = uri.replace( /^\/?([^\/\\\?&=#]+)\b.*/ , "$1" );
    prefix = prefix ? prefix + "/" + firstPiece : firstPiece;

    // currentRoot stuff
    if ( true ) {

        if ( ! __routes_global_currentRoot )
            __routes_global_currentRoot = "";

        if ( __routes_global_lastPiece ){
            __routes_global_currentRoot += "/" + __routes_global_lastPiece;
        }

        __routes_global_lastPiece = firstPiece;
    }


    for ( var key in this ){

        if ( key.startsWith( "_" ) )
            continue;

        if ( key == firstPiece )
            return this.finish( uri , request , response , firstPiece , key , this[ key ] , prefix);
    }

    if(firstPiece.substring( 0 , firstPiece.indexOf('.') ) in this &&
       !(firstPiece.substring( 0 , firstPiece.indexOf('.') ) in this.__proto__)){
        key = firstPiece.substring( 0, firstPiece.indexOf('.'));
        return this.finish(uri , request , response , firstPiece, key, this[key] , prefix);
    }

    for ( var i=0; i<this._regexp.length; i++ ){
        var value = this._regexp[i];
        value.key.lastIndex = 0;
        if ( value.key.test( uri ) )
            return this.finish( uri , request , response , firstPiece , value.key , value , prefix);
    }

    Routes.log.debug( "\t using default\t" + this._default );
    return this.finish( uri , request , response , firstPiece , null , this._default , prefix);
};

Routes.prototype.finish = function( uri , request , response , firstPiece , key , value , prefix ){
    if ( ! value )
        return null;

    var end = value;
    if ( isObject( end ) && end.isValue )
        end = value.end;

    if ( ! end )
        return null;

    if ( key instanceof RegExp ){

        if ( isString( end ) )
            end = uri.replace( key , end );

        if ( value.attachment && value.attachment.names ){

            var names = value.attachment.names;
            key.lastIndex = 0;
            var r = key.exec( uri );

            if ( ! r )
                throw "regex [" + key + "] didn't match [" + uri + "] when it was supposed to";

            for ( var i=0; i<names.length; i++ ){
                if ( r[i+1] ){
                    request.addParameter( names[i] , r[i+1] );
                }
            }
        }

    }

    if ( value.attachment && value.attachment.extra )
        Object.extend( request , value.attachment.extra );

    if ( isString( end ) )
        return end;

    if ( this.isRoutes( end ) ){
        var res = end.apply( uri.substring( 1 + firstPiece.length ) , request , response , prefix );
        if ( res === null ) {
            return null;
        }
        if ( ! isString( res ) )
            return res;
        if ( ! ( res && res.startsWith( "/" ) ) )
            res = "/" + prefix + "/" + res;
        res = res.replace( /\/+/g , "/" );
        return res;
    }

    if ( isFunction( end ) )
        return end;

    throw "can't handle value: " + end;
};

/** Finds the route to a submodule, if it exists.
 * @param {Object} submodule The submodule being searched for.
 * @return {string} The path, if found, otherwise null.
 */
Routes.prototype.find = function(submodule){
    if(this == submodule) return '/';
    for(var key in this){
        if( key.startsWith( "_" ) )
            continue;

        if( this[key] == null ){
            log.warn("Invalid route : " + key);
            continue;
        }

        if( this[key] == submodule )
            return '/' + key;

        if ( this.isRoutes( this.getEnd(this[key] ) ) ){
            var f = this.getEnd(this[key]).find(submodule);
            if(f)
                return '/' + key + f;
        }
    }

    // Regexps??  ---
    for(var i = 0; i < this._regexp.length; i++){
        var value = this._regexp[i];
        if ( isObject(value.end) && value.end.find && value.end.find(submodule) )
            throw "find returned regex -- help!!";
    }
    return null;
};

/** If the object passed has a route end, return it, otherwise return the object itself.
 * @param {Object} obj Object to check.
 * @returns {string|Object} The route end.
 */
Routes.prototype.getEnd = function(obj){
    if(obj.isValue) return obj.end;
    return obj;
};


Routes.prototype.isRoutes = function( end  ){
    return isObject( end ) && end.apply && end.find && end.isRoutes;
}
