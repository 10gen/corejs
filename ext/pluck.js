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

core.ext.getlist();

/** Given a dot-separated path, returns a function that returns the subobject corresponding with that path.
 * @example <tt>var f = Ext.pluck("weird.path.to.desired.field");
 * print( f( { weird : { path : { to : { desired : { field : "this field" } } } } } ) );
 * </tt><br />
 * This will print "this field".
 * @param {string} path Dot-separated path.
 * @return {function} Function that returns the file specified.
 */
Ext.pluck = function(path){
    path = path.split(/\./);
    return function(obj){
        return Ext.getlist.apply(this, [obj].concat(path));
    };
};
