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

core.ext.redirect();

/** Executes a function and returns anything that would normally be printed to standard output as a string.
 * @param {function} f Function to be executed.
 * @returns {string} Any output f would normally have printed.
 */
Ext.asString = function(f){
    // Ext.redirect except we only want the output and trim.
    // This should probably be moved to Ext.redirect.asString or something?
    var value = Ext.redirect(f);
    return value.output.trim();
};
