core.ext.explore();

/** Returns certain fields of an object.
 * @constructor
 * @param {Object} obj Object in which to find fields.
 * @param {Object} whitelist Fields to find in the object.
 * @return {Object} Fields from <tt>whitelist</tt> found in the object.
 */
io.Marshal = function(obj, whitelist){
    var endfunc = function(obj, fieldname, specfield, opts, parent){
        if(typeof specfield == "string")
            return parent[specfield];
        return obj;
    };
    return Ext.explore(obj, whitelist, endfunc);
};

/** Returns a function that will take an object and return matching fields and subobjects.
 * @param {Object} opts Specify key/value function to apply to the object's fields.
 * @return {function} Tree generating function for the given options.
 */
io.Marshal.TreeForm = function(opts){
    return function(ary){
        var ret = {};
        var valuefunc = isFunction(opts.value) ? opts.value : function(o){ return io.Marshal(o, opts.value); };
        for(var i = 0; i < ary.length; i++){
            ret[opts.key(ary[i])] = valuefunc(ary[i]);
        }
        return ret;
    };
};
