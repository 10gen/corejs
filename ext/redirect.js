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

/** Call a function, appending text that would normally be printed to a buffer.
 * @param {function} f Function to be called using buffer instead of standard output.
 * @returns {Object} Fields:
 * <dl><dt>value</dt><dd><tt>f</tt>'s return value.</dd>
 * <dt>output</dt><dd>String of <tt>f</tt>'s output.</dd>
 * </dl>
 */
Ext.redirect = function(f){
    // Is there a better way to return this stuff to the user? Not sure.
    if(! f) throw "cannot call a null function";

    var oldPrint = print;
    var buf = "";
    print = function(s){ buf += s; };
    try {
        var value = f();
    }
    finally {
        print = oldPrint;
    }
    return {value: value, output: buf};
};
