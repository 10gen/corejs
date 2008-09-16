// words.js

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

/** Dictionary functions.
 * @namespace
 * @docmodule CoreJS.Util.util.words
 */
Util.Words = Util.Words || {};

/** Gets the English dictionary.
 */
Util.Words.usa = Util.Words.usa || javaStatic( "ed.util.Words" , "getWords" , "en" , "us" );

var wordSet = Class.create(function(){}, {
    initialize: function(ary){
        this._cache = cache = {};
        ary.forEach(function(s){ cache[s] = true; });
    },
    contains: function(w){
        return this._cache[w];
    },
});

Util.Words.bad = new wordSet('shit piss fuck cunt cocksucker motherfucker tits'.split(/ /));
