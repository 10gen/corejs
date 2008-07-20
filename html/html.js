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
 * Filename: html.js
 * Author: Dana Spiegel (dana@10gen.com)
 */

if (!HTML)
    /** HTML encoding functions
     * @namespace
     */
    HTML = {};

if (!HTML.__init) {

    /** Return a given string with &amp;, &lt;, and &gt; correctly replaced.
     * @param {string} s HTML string
     * @return {string} Cleaned string.
     */
    HTML.encode = function(s) {
        return s ? s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : s;
    };

    HTML.__init = true;
}
