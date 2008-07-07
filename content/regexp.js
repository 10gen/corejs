/** @class Common regular expression manipulation functions.
 */
content.RegExp = {};

/** Special characters: \, ^, $, ., *, +, ?, =, !, :, |, /, (, ), [, ], {, and }.
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

/** Escape a string using certain flags.
 * @param {string} str String to be escaped
 * @param {string} flags Flags to use in regular expression
 * @returns {string} Escaped string
 */
content.RegExp.literal = function(str, flags){
    return new RegExp(content.RegExp.escape(str), flags);
};

