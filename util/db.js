/** Determine whether a collection has an index on a given field.
 * @param {db_collection} ns Collection to check.
 * @param {string} field Field to check.
 * @return {boolean} If the collection has an index on the given field.
 */
has_index = function(ns, field){
    if ( ! ns )
	return false;

    var l = { ns : new RegExp( ns.name ) , name: new RegExp("^"+field) };

    return db.system.indexes.findOne( l ) != null;
};
