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
 *  Test whether a given string is a valid email address.
 *  For a laugh, check http://ex-parrot.com/~pdw/Mail-RFC822-Address.html to see
 *  how to support RFC822 email addresses. We don't do that; we just check for
 *  basic email syntax.
 *  @param {string} s the string to test
 *  @returns {boolean}
 */
net.isEmail = function(s){
    return s.match(/^\w[\w\+\.]*@\w+(\.\w+)+$/);
};
