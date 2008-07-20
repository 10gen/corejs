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

/** String comparison function.
 * @param {string} x
 * @param {string} y
 * @returns {number} 1 if <tt>x</tt> is semantically greater than <tt>y</tt>, -1 if <tt>x</tt> is less than <tt>y</tt>, 0 if they are the same.
 */
Ext.stringCompare = function(x, y){
    if (x > y) return 1;
    if (x < y) return -1;
    return 0;
};
