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

/** .isValid from YUI YAHOO.lang.JSON, code licensed under a BSD license */

var JSON = {
    /**
     * First step in the validation.  Regex used to replace all escape
     * sequences (i.e. "\\", etc) with '@' characters (a non-JSON character).
     * @property _ESCAPES
     * @type {RegExp}
     * @static
     * @private
     */
    _ESCAPES : /\\["\\\/bfnrtu]/g,
    /**
     * Second step in the validation.  Regex used to replace all simple
     * values with ']' characters.
     * @property _VALUES
     * @type {RegExp}
     * @static
     * @private
     */
    _VALUES  : /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
    /**
     * Third step in the validation.  Regex used to remove all open square
     * brackets following a colon, comma, or at the beginning of the string.
     * @property _BRACKETS
     * @type {RegExp}
     * @static
     * @private
     */
    _BRACKETS : /(?:^|:|,)(?:\s*\[)+/g,
    /**
     * Final step in the validation.  Regex used to test the string left after
     * all previous replacements for invalid characters.
     * @property _INVALID
     * @type {RegExp}
     * @static
     * @private
     */
    _INVALID  : /^[\],:{}\s]*$/,
    /**
     * Determines if a string is valid JSON.  In the first three steps,
     * escape sequences, safe values, and properly placed open square brackets
     * are replaced with placeholders or removed.  Then in the final step, the
     * resulting string is checked for invalid characters.
     * @method isValid
     * @param {string} str JSON string to be tested
     * @return {boolean} If the string is safe for eval
     * @static
     */
    isValid : function (str) {
        return this._INVALID.test(str.
                replace(this._ESCAPES,'@').
                replace(this._VALUES,']').
                replace(this._BRACKETS,''));
    },


};

return JSON;
