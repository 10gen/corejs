// words.js

/** Dictionary functions.
 * @namespace
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
