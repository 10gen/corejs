// words.js

Util.Words = Util.Words || {};
Util.Words.usa = Util.Words.usa || javaStatic( "ed.util.Words" , "getWords" , "en" , "us" );

var wordSet = Class.create(function(){}, {
    initialize: function(ary){
        log(ary);
        this._cache = cache = {};
        ary.forEach(function(s){ cache[s] = true; });
    },
    contains: function(w){
        return this._cache[w];
    },
});

Util.Words.bad = new wordSet('shit piss fuck cunt cocksucker motherfucker tits'.split(/ /));
