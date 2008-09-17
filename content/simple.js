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

/** Simple text format processor, suitable for handling text from
 *  blog posts, etc.
*/
content.Simple = function(){

};

/** Replace newline characters with &lt;br /&gt;s in a given string.
 * @param {string} str String to change.
 * @return {string} Altered string.
 */
content.Simple.prototype.toHtml = function(str){
    str = str.replace(/\r?\n/g, '<br/>');
    return str;
};
