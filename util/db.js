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

/** Determine whether a collection has an index on a given field.
 * @param {db_collection} ns Collection to check.
 * @param {string} field Field to check.
 * @return {boolean} If the collection has an index on the given field.
 */
has_index = function(ns, field){
    if ( ! ns )
	return false;

    var l = { ns : new RegExp( ns.name ) , name: new RegExp("^"+field) };

    return db.system.indexes.findOne( l ) != null;
};
