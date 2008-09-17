// stem.js

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

// Porter stemmer in Javascript. Few comments, but it's easy to follow against the rules in the original
// paper, in
//
//  Porter, 1980, An algorithm for suffix stripping, Program, Vol. 14,
//  no. 3, pp 130-137,
//
// see also http://www.tartarus.org/~martin/PorterStemmer

// Release 1

// Taken from http://tartarus.org/~martin/PorterStemmer/index-old.html , which
// is "free of charge for any purpose". This version was adapted by Eliot.

/*
   @class
   @docmodule core.text.stem
 */
Stem = { 
    step2list : {  
        ational : "ate" , 
        tional : "tion" , 
        enci : "ence" , 
        anci : "ance" , 
        izer : "ize" , 
        bli : "ble" , 
        alli : "al" , 
        entli : "ent", 
        eli : "e" , 
        ousli : "ous" , 
        ization : "ize" , 
        ation : "ate" , 
        ator : "ate" , 
        alism : "al" , 
        iveness : "ive" , 
        fulness : "ful" , 
        ousness : "ous" , 
        aliti : "al" , 
        iviti : "ive" , 
        biliti : "ble" ,
        logi : "log" 
    } , 
    
    step3list : {
        icate : "ic" , 
        ative : "" , 
        alize : "al" , 
        iciti : "ic" , 
        ical : "ic" , 
        ful : "" , 
        ness : "" 
    } ,

    c : "[^aeiou]" ,          // consonant
    v : "[aeiouy]" ,         // vowel
    C : c + "[^aeiouy]*" ,    // consonant sequence
    V : v + "[aeiou]*"      // vowel sequence
};
    
Stem.mgr0 = "^(" + Stem.C + ")?" + Stem.V + Stem.C ;                    // [C]VC... is m>0
Stem.meq1 = "^(" + Stem.C + ")?" + Stem.V + Stem.C + "(" + Stem.V + ")?$" ;  // [C]VC[V] is m=1
Stem.mgr1 = "^(" + Stem.C + ")?" + Stem.V + Stem.C + Stem.V + Stem.C ;            // [C]VCVC... is m>1
Stem.s_v = "^(" + Stem.C + ")?" + Stem.v ;                    // vowel in stem

/** Get the stem of a word using the Porter stemming algorithm.
 *  @param {string} w a word
 *  @returns {string} the stem of the word
 */

Stem.stem = function(w) {
    var stem;
    var suffix;
    var firstch;
    var origword = w;
        
    if (w.length < 3) { return w; }
        
    var re;
    var re2;
    var re3;
    var re4;

    firstch = w.substr(0,1);
    if (firstch == "y") {
        w = firstch.toUpperCase() + w.substr(1);
    }

    // Step 1a
    re = /^(.+?)(ss|i)es$/;
    re2 = /^(.+?)([^s])s$/;

    if (re.test(w)) { w = w.replace(re,"$1$2"); }
    else if (re2.test(w)) {	w = w.replace(re2,"$1$2"); }

    // Step 1b
    re = /^(.+?)eed$/;
    re2 = /^(.+?)(ed|ing)$/;
    if (re.test(w)) {
        var fp = re.exec(w);
        re = new RegExp(Stem.mgr0);
        if (re.test(fp[1])) {
            re = /.$/;
            w = w.replace(re,"");
        }
    } else if (re2.test(w)) {
        var fp = re2.exec(w);
        stem = fp[1];
        re2 = new RegExp(Stem.s_v);
        if (re2.test(stem)) {
            w = stem;
            re2 = /(at|bl|iz)$/;
            re3 = new RegExp("([^aeiouylsz])\\1$");
            re4 = new RegExp("^" + C + v + "[^aeiouwxy]$");
            if (re2.test(w)) {	w = w + "e"; }
            else if (re3.test(w)) { re = /.$/; w = w.replace(re,""); }
            else if (re4.test(w)) { w = w + "e"; }
        }
    }

    // Step 1c
    re = /^(.+?)y$/;
    if (re.test(w)) {
        var fp = re.exec(w);
        stem = fp[1];
        re = new RegExp(Stem.s_v);
        if (re.test(stem)) { w = stem + "i"; }
    }

    // Step 2
    re = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
    if (re.test(w)) {
        var fp = re.exec(w);
        stem = fp[1];
        suffix = fp[2];
        re = new RegExp(Stem.mgr0);
        if (re.test(stem)) {
            w = stem + Stem.step2list [suffix];
        }
    }

    // Step 3
    re = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
    if (re.test(w)) {
        var fp = re.exec(w);
        stem = fp[1];
        suffix = fp[2];
        re = new RegExp(Stem.mgr0);
        if (re.test(stem)) {
            w = stem + Stem.step3list[suffix];
        }
    }

    // Step 4
    re = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
    re2 = /^(.+?)(s|t)(ion)$/;
    if (re.test(w)) {
        var fp = re.exec(w);
        stem = fp[1];
        re = new RegExp(Stem.mgr1);
        if (re.test(stem)) {
            w = stem;
        }
    } else if (re2.test(w)) {
        var fp = re2.exec(w);
        stem = fp[1] + fp[2];
        re2 = new RegExp(Stem.mgr1);
        if (re2.test(stem)) {
            w = stem;
        }
    }

    // Step 5
    re = /^(.+?)e$/;
    if (re.test(w)) {
        var fp = re.exec(w);
        stem = fp[1];
        re = new RegExp(Stem.mgr1);
        re2 = new RegExp(Stem.meq1);
        re3 = new RegExp("^" + C + v + "[^aeiouwxy]$");
        if (re.test(stem) || (re2.test(stem) && !(re3.test(stem)))) {
            w = stem;
        }
    }

    re = /ll$/;
    re2 = new RegExp(Stem.mgr1);
    if (re.test(w) && re2.test(w)) {
        re = /.$/;
        w = w.replace(re,"");
    }

    // and turn initial Y back to y

    if (firstch == "y") {
        w = firstch.toLowerCase() + w.substr(1);
    }

    return w;

};

/** Takes the root of a word and a word to be matched and checks if the 
 *  root is a stripped version of the match word.
 *  @param {string} word a stem
 *  @param {string} m a word
 *  @returns true if m could be stemmed to word
 */
Stem.destem = function(word, m) {
    /* Note that this doesn't just stem m again .. why?? */

    var suffix = "able|ible|al|ial|ed|en|er|est|ful|ic|ing|ion|tion|ation|ition|ity|ty|ive|ative|itive|less|ly|ment|ness|ous|eous|ious|s|es|y";
    var prefix = "anti|de|dis|en|em|fore|in|im|il|ir|inter|mid|mis|non|over|pre|re|semi|sub|super|trans|un|under";

    if(!word)
        return;

    var reg = new RegExp("(\\b)(("+prefix+")?"+word+"("+suffix+")?)(\\b)", "gi");
    return m.match(reg);

};
