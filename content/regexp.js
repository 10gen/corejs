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

/** @class Common regular expression manipulation functions.
 * @docmodule core.content.regexp
 */
content.RegExp = {};

/** Special characters.  '\', '^', '$', '*', '+', '?', '=', '!', ':', '|', '/', '(', ')', '[', ']', '{', '}', and '.'.
 */
content.RegExp.special = ['\\', '^', '$', '.', '*', '+', '?', '=', '!', ':',
                          '|', '/', '(', ')', '[', ']', '{', '}'];

/** Escape special characters in a string.
 * @param {string} str String to be escaped
 * @returns {string} Escaped string
 */
content.RegExp.escape = function(str){
    for(var i in content.RegExp.special){
        var c = content.RegExp.special[i];
        str = str.replace(new RegExp('\\' + c, 'g'), '\\' + c);
    }
    return str;
};

/** Unescape special characters.
 * @param {string} str String with special characters.
 * @returns {string} Unescaped string
 */
content.RegExp.unescape = function(str){
    for(var i in content.RegExp.special){
        var c = content.RegExp.special[i];
        str = str.replace(new RegExp('\\\\\\' + c, 'g'), c);
    }
    return str;
};

/** Escape special characters in a string using the given flags.
 * @param {string} str String to be escaped
 * @param {string} flags Flags to use in regular expression
 * @returns {string} Escaped string
 */
content.RegExp.literal = function(str, flags){
    return new RegExp(content.RegExp.escape(str), flags);
};
