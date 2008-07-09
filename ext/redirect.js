/** Call a function, appending text that would normally be printed to a buffer.
 * @param {function} f Function to be called using buffer instead of standard output.
 * @returns {Object} Fields:
 * <dl><dt>value</dt><dd><tt>f</tt>'s return value.</dd>
 * <dt>output</dt><dd>String of <tt>f</tt>'s output.</dd>
 * </dl>
 */
Ext.redirect = function(f){
    // Is there a better way to return this stuff to the user? Not sure.
    if(! f) throw "cannot call a null function";

    var oldPrint = print;
    var buf = "";
    print = function(s){ buf += s; };
    try {
        var value = f();
    }
    finally {
        print = oldPrint;
    }
    return {value: value, output: buf};
};

