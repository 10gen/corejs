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

/** Returns a field of an object, if the field exists, otherwise it returns a default value.
 * @param {Object} obj Object in which to look for the field.
 * @param {string} key Key to search for in <tt>obj</tt>.
 * @param def Default value to return if field is not found.
 * @return {any} The contents of the field <tt>obj[key]</tt>, if it exists, otherwise <tt>def</tt>.
 */
Ext.getdefault = function(obj, key, def){
    if(obj == null) return def;
    if(key in obj) return obj[key];
    return def;
};
