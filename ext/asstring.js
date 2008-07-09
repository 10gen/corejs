core.ext.redirect();

/** Executes a function and returns anything that would normally be printed to standard output as a string.
 * @param {function} f Function to be executed.
 * @returns {string} Any output f would normally have printed.
 */
Ext.asString = function(f){
    // Ext.redirect except we only want the output and trim.
    // This should probably be moved to Ext.redirect.asString or something?
    var value = Ext.redirect(f);
    return value.output.trim();
};
