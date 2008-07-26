
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

/** Functions to interact with a database collection.
 *  @example
 * foo = function( name ){
 *     this.name = name;
 * }
 *
 * foo.prototype.blah = function(){
 *     // ...
 * }
 *
 * foo.__proto__ = new ModelBase( "foos" );
 * @constructor
 * @param {string} collection The name of a collection
 * @param {function} constructor Constructor for the collection
 */
ModelBase = function( collectionName , cons ){
    this.collectionName = collectionName;
    this.cons = cons;
    this._c = db[this.collectionName];
    this._c.setConstructor( this.cons );
};
ModelBase.prototype._dontEnum = true;

/** Return an object from the collection that matches a given _id.
 * @param {string} key ObjectId for which to search.
 * @param {boolean} [create] If true and the key was invalid or unfindable, return an object
 * created by the collection's constructor.
 * @returns {Object} Either the found object, a basic object created by the collection's constructor, or null.
 */
ModelBase.prototype.findOne = function( key , create ){
    if ( ! key )
        return create ? new this.cons() : null;

    if ( isString( key ) )
        key = ObjectId( key );

    var o = this._c.findOne( key );
    if ( ! o && create )
        o = new this.cons();
    return o;
};

/** Query a collection and return a cursor.
 * @param {Object} key Key/value pairs for which to search.
 * @param {Object} fields Object of the form {key0: true, ..., keyn: true} of fields of
 * matching objects to be returned.
 * @return {DBCursor} Cursor starting at first matching object.  If no objects matched, null.
 */
ModelBase.prototype.find = function( key , fields ){
    return this._c.find( key , fields );
}

/** Save an object to the collection.
 * @return {Object} The object saved to the collection.
 */
ModelBase.prototype.save = function(){
    return this._c.save( this );
}

/** Delete an object from the collection.
 * @param {Object} [key=this._id] Object pattern to remove from database.
 */
ModelBase.prototype.remove = function( key ){
    if ( ! key ){
        key = {};
        if ( ! this._id )
            return;
        key._id = this._id;
    }

    return this._c.remove( key );
}
