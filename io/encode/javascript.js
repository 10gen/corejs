/** JavaScript encoding functions.
 * @namespace
 */
io.Encode.JavaScript = {};

/** Escape single and double quote marks in a given string.
 * @param {string} s String to be cleaned.
 * @return {string} Escaped string.
 */
io.Encode.JavaScript.escape = function(s) {
    s = s.replace(/'/g, "\\'");
    s = s.replace(/"/g, "\\\"");
    return s;
}

