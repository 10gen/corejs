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

/** Returns a n-deep subobject of a given object.  The first argument
 * must be an object.  Each subsequent argument is a key to go a layer
 * deeper into subobjects.
 * @example Suppose one called this function as:
 * Ext.getList( { my : { very : { nested : { object : "here's the value I want" } } } }, "my", "very", "nested", "object" );
 * This will return "here's the value I want".
 * @param {Object, string, ..., string} An object followed by keys.
 * @return The value, if found, otherwise null.
 */
Ext.getlist = function(){
    var obj = arguments[0];
    var i = 1;
    while(obj && i < arguments.length){
        if(typeof obj == "number") return null;
        obj = obj[arguments[i]];
        ++i;
    }
    return obj;
};
