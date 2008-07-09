core.ext.getlist();

/** Given a dot-separated path, returns a function that returns the subobject corresponding with that path.
 * @example <tt>var f = Ext.pluck("weird.path.to.desired.field");
 * print( f( { weird : { path : { to : { desired : { field : "this field" } } } } } ) );
 * </tt><br />
 * This will print "this field".
 * @param {string} path Dot-separated path.
 * @return {function} Function that returns the file specified.
 */
Ext.pluck = function(path){
    path = path.split(/\./);
    return function(obj){
        return Ext.getlist.apply(this, [obj].concat(path));
    };
};

