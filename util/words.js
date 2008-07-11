// words.js

/** Dictionary functions.
 * @namespace
 */
Util.Words = Util.Words || {};

/** Gets the English dictionary.
 */
Util.Words.usa = Util.Words.usa || javaStatic( "ed.util.Words" , "getWords" , "en" , "us" );
