// FYI: the "attachment" is a holdover from routes; really needs to be taken out
// here..

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

/**
 *  @class An object representing a hierarchy or tree structure encoded by URLs.
 *  To use this, subclass URLTree and override terminal,
 *  canRecurse, and unwind. Also think about overriding emptyString.
 *
 *  URLTree can be used for many purposes. Typically, you call apply() on some
 *  URL, and some object is returned. A good example is the routes system,
 *  where you get back a path to some object.
 *  The mechanics of this execution path are somewhat involved. We
 *  use the following conventions in this document:
 *
 *  RetType: the type returned by apply. For the routes system, this is a
 *     string. Terminals are transformed into objects of type RetType.
 *  Terminal: the type of a terminal.
 *  RecType: the type of subobjects that are not terminals. This could be
 *     anything; the details of recursively calling apply() are specified by
 *     the user. For the routes system, RecType is the same as the Routes class.
 *  UserData: the type of extra information which is passed through the URLTree.
 *     {@link URLTree#apply} takes a UserData param, and passes it through
 *     faithfully to terminal, emptyString, and unwind. The routes system
 *     doesn't use this at all.
 *  UserDataAdd: the user can also attach additional data to a subobject using
 *     the add() method. This data will be passed to unwind and terminal.
 *  IntermediateType: the user specifies how to recurse on a RecType by
 *     providing a recurse() function; the result of recurse is processed by
 *     this.unwind(). The intent is that after we walk all the way down to a
 *     leaf in the URLTree, we can reconstruct the path we took to got there.
 *     This means that recurse() can return any object type, as long as unwind()
 *     can convert that type into a RetType instance. But since most recurse()
 *     methods end up calling apply(), IntermediateType is usually the same as
 *     RetType.
 *
 *
 *  @see URLTree#apply
 *
 *  @example
 *  var u = new Util.URLTree();
 *  u.foo = new Util.URLTree();
 *  u.foo.bar = 'hi';
 *  var terminal = function(end){ return end; };
 *  u.foo.terminal = terminal;
 *  u.unwind = function(result){ return result+result; };
 *  print( u.apply( null, '/foo/bar', null, null ) ); // prints 'hihi'
 * @docmodule core.util.urltree
 */

Util.URLTree = function(){
    this._regexp = [];
    this._default = null;
};

Util.URLTree.log = log.urltree;
Util.URLTree.log.level = log.LEVEL.ERROR;

Object.extend(Util.URLTree.prototype, {
    /** Add a component to this URLTree object.
     *  @param {string | RegExp} key the path to match against
     *  @param {Terminal | RecType} end what happens when someone looks on key
     *  @param {UserDataAdd} attached user data associated with this subobject
     */
    add: function( key , end , attachment ){
        var value = this._createValue( key , end , attachment );

        if ( isString( key ) ){
            this[ key ] = value;
            return;
        }

        if ( key instanceof RegExp ){
            this._regexp.push( value );
            return;
        }

        throw "can't handle : " + key;
    },

    /**
     *  Set the default response if no subobject in this object matches a URI
     *  component.
     *  @param {Terminal | RecType} end what happens when a part isn't found
     */
    setDefault: function( end , attachment ){
        this._default = this._createValue( null , end , attachment );
    },

    /** Internal method to translate a target into an "end" object.
     *  @private
     */
    _createValue: function( key , end , attachment ){
        return {
            isValue : true,
            key : key,
            end : end,
            attachment : attachment };
    },

    /**
     *  Internal method to translate an "end" object back into a target.
     *  @private
     */
    getEnd: function(obj){
        if(obj.isValue) return obj.end;
        return obj;
    },

    /** Step through a URI, calling recurse() when necessary.
     *  The URI is split by path component, and one component is examined.
     *  At each step, the "this" object is searched for something that could
     *  match the path component. If a subobject S is found, and S is a RecType,
     *  we call S.apply().
     *  After the apply method returns, this.unwind() is called, and its
     *  return value is returned.
     *  If S does not have an apply method, this.terminal() is called with S
     *  as an argument.
     *  You can override this.canRecurse to use different criteria for whether
     *  to call S.apply(), and you can provide a different recurse function
     *  to call something else instead of S.apply().
     *  @param {function(next, uri, request, extras)} recurse the function
     *      called when we get a RecType.
     *  @param {string} uri the URI to step through
     *  @param {Request} request the current global request; we don't use this,
     *      but in emptyString you might want to redirect the user or something.
     *  @param {UserData} extras whatever extra data you might want to send to
     *      terminal, emptyString, and unwind.
     */
    apply: function( recurse , uri , request , extras ){
        // This API sucks a little. The problem is that apply needs to recurse,
        // but doesn't know how to recur or what arguments to give. So we pass
        // this "recurse" function which adapts the needs of the subclass to
        // the apply method.
        // To check whether to recurse, this.canRecurse(child) is called.

        // If no recurse method is provided, we just call apply again.
        Util.URLTree.log.debug( "apply\t" + uri );
        if ( uri == "" )
            return this.emptyString( uri, request , extras );

        if ( ! uri.startsWith( "/" ) )
            uri = "/" + uri;

        var firstPiece = uri.replace( /^\/?([^\/\\\?&=#]+)\b.*/ , "$1" );

        // currentRoot stuff -- routes specific -- this probably shouldn't be here
        if ( false ) {
            if ( ! this.currentRoot )
                this.currentRoot = "";
            if ( this.lastPiece ){
                this.currentRoot += "/" + this.lastPiece;
            }
            this.lastPiece = firstPiece;
        }

        for ( var key in this ){
            if ( key.startsWith( "_" ) )
                continue;
            if ( key == firstPiece )
                return this.finish( recurse , uri , request , firstPiece , key, this[ key ] , extras );
        }

        if(firstPiece.substring( 0, firstPiece.indexOf('.') ) in this){
            key = firstPiece.substring( 0, firstPiece.indexOf('.'));
            return this.finish(recurse, uri, request, firstPiece, key, this[key], extras);
        }

        for(var i = 0; i < this._regexp.length; i++){
            var value = this._regexp[i];
            if ( value.key.test( uri ) )
                return this.finish( recurse, uri, request, firstPiece, value.key, value, extras);
        }

        Util.URLTree.log.debug( "\t using default\t" + this._default );
        return this.finish( recurse, uri , request , firstPiece , null , this._default , extras );
    },

    /**
     * find: locate the path of a submodule in this URLTree
     * @returns a string which, when fed to apply, gets you to submodule
     */
    find: function(submodule){
        if(this == submodule) return '/';
        for(var key in this){
            if( key.startsWith( "_" ) )
                continue;

            if(this[key] == submodule){
                return '/' + key;
            }
            if(isObject(this.getEnd(this[key]))){
                var f = this.getEnd(this[key]).find(submodule);
                if(f)
                    return '/' + key + f;
            }
        }

        // Regexps??  ---
        for(var i = 0; i < this._regexp.length; i++){
            var value = this._regexp[i];
            if ( isObject(value.end) && value.end.find(submodule) )
                throw "find returned regex -- help!!";
        }
        return null;
    },

    /** Now that we found an object matching a path component, what do we do
     *  with it?
     *  @private
     *  @param {function} recurse the function to call if canRecurse()
     *  @param {string}   uri     the URI apply was called with
     *  @param {Request}  request the request
     *  @param {string}   firstPiece the path component we matched
     *  @param {string | RegExp} key the thing that matched the path component
     *  @param {Terminal | RecType} value the thing that corresponds to this
     *     path component
     *  @param {UserData} extras  whatever user data apply was called with
     *  @type RetType
     *  @returns whatever unwind() or terminal() replied
     */
    finish: function( recurse, uri, request , firstPiece , key , value , extras ){
        if(! recurse) recurse = function(end, uri, request, extras){ return end.apply(null, uri, request, extras); };
        var end = value;
        if ( isObject( end ) && end.isValue )
            end = value.end;

        var attachment = null;
        if ( isObject( value ) ){
            attachment = value.attachment;
        }

        if ( isObject( end ) && this.canRecurse(end) ){
            Util.URLTree.log.debug("Recursing on end");
            var res = recurse( end, uri.substring( 1 + firstPiece.length ) , request , extras );
            if(res == null) res = this.getDefault();
            res = this.unwind( res, uri, request, firstPiece, key, attachment, extras);
            return res;
        }

        else {
            Util.URLTree.log.debug("Found a terminal");
            return this.terminal( end, uri , request, firstPiece, key, attachment, extras );
        }

        throw "can't handle value: " + end;
    },

    // This is mostly routes-specific. FIXME: Move this into a subclass
    currentRoot: function(){
        return currentRoot;
    },

    /** Check if we can recurse on an object
     *  @param {Terminal | RecType} next some object we found; should we call
     *     recurse, or terminal?
     *  @returns false for terminal, new for recurse
     *  @type boolean
     */
    canRecurse: function(next){ return next.apply; },

    /** Used in place of the return value of recurse() if recurse returns null.
     *  @type IntermediateType
     */
    getDefault: function(){
        return "";
    },

    /** Called if we run out of URL components at this URLTree.
     *  @param {string} uri the URI we have left
     *  @param {UserData} extras the extras apply was called with
     *  @type RetType
     */
    emptyString: function(uri, request, extras){
        response = extras[0];
        var nu = request.getURI() + "/";
        if( request.getQueryString() )
            nu += "?" + request.getQueryString();
        response.sendRedirectTemporary( nu );
    },

    /** Called if canRecurse returned false.
     *  @param {Terminal} end the subobject terminal that we found
     *  @param {string} uri the URI after this point
     *  @param {string} firstPiece the component that we used to find this
     *     terminal
     *  @param {string | RegExp} key the key that matched the path component
     *  @param {UserDataAdd}  value  whatever data was associated to this
     *     subobject when it was add()ed
     *  @param {UserData}  extras  the user data passed to apply()
     *  @type RetType
     */
    terminal: function( end, uri, request, firstPiece, key, value, extras){
        if ( key instanceof RegExp ){
            end = uri.replace( key , end );
            if ( value.attachment && value.attachment.names ){

                var names = value.attachment.names;
                var r = key.exec( uri );

                if ( ! r )
                    throw "something is wrong";

                for ( var i=0; i<names.length; i++){
                    if ( r[i+1] )
                        request[ names[i] ] = r[i+1];
                }

            }
        }
        return end;
    },

    /** Called after a recursion.
     *  @param {IntermediateType} result whatever was returned by recurse
     *  @param {string} uri whatever was left of the URI
     *  @param {Request} request the Request
     *  @param {string} firstPiece the piece that got us to this RecType
     *      instance
     *  @param {string | RegExp} key the key that matched firstPiece
     *  @param {UserDataAdd} value whatever user data was associated with this
     *      subobject when it was add()ed
     *  @param {UserData} extras the user data passed to apply()
     *  @type  RetType
     */

    unwind: function( result, uri, request, firstPiece, key, value, extras ){
        if ( ! ( res && res.startsWith( "/" ) ) )
            res = "/" + firstPiece + "/" + res;
        res = res.replace( /\/+/g , "/" );
        return res;
    },
});
