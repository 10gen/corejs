/** JSON encoding, which is dealt with the same as untrusted json (json_u).
 * @function
 * @param {Object} o Object to convert to a string.
 * @return {string} Object as an escaped json string.
 */
io.Encode.JSON = tojson_u;

