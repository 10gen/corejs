/** Returns a n-deep subobject of a given object.  The first argument
 * must be an object.  Each subsequent argument is a key to go a layer
 * deeper into subobjects.
 * @example Suppose one called this function as: <br />
 * <tt>Ext.getList( { my : { very : { nested : { object : "here's the value I want" } } } }, "my", "very", "nested", "object" );</tt><br />
 * This will return "here's the value I want".
 * @param An object followed by strings.
 * @return The value, if found, otherwise null.
 */
Ext.getlist = function(){
    var obj = arguments[0];
    var i = 1;
    while(obj && i < arguments.length){
        if(typeof obj == "number") return null;
        obj = obj[arguments[i]];
        ++i;
    }
    return obj;
};

