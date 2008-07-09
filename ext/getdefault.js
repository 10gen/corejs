/** Returns a field of an object, if the field exists, otherwise it returns a default value.
 * @param {Object} obj Object in which to look for the field.
 * @param {string} key Key to search for in <tt>obj</tt>.
 * @param def Default value to return if field is not found.
 * @return The contents of the field <tt>obj[key]</tt>, if it exists, otherwise <tt>def</tt>.
 */
Ext.getdefault = function(obj, key, def){
    if(obj == null) return def;
    if(key in obj) return obj[key];
    return def;
};
