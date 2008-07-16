/** Creates a cache.
 * @param {number} [cacheTime=60000] Default time-until-death in milliseconds
 */
function TimeOutCache( cacheTime ){
    this.cache = {};
    this.cacheTime = cacheTime || ( 1000 * 60 );
};

/** Adds an entry to a cache and sets its death time
 * @param {string} name Name of the cache entry to which this value should be added
 * @param {any} value Value to be added to this cache entry
 * @param {number} [cacheTime=this.cacheTime] Time until this entry's "death"
 */
TimeOutCache.prototype.add = function( name , value , cacheTime ){
    cacheTime = cacheTime || this.cacheTime;
    var t = new Date();
    t = new Date( t.getTime() + cacheTime );
    this.cache[ name ] = { value : value , dead : t };
};

/** Find a cache with a given name and, if it has not died, return its value.
 * @param {string} name Cache entry name
 * @param {Array} oldArr if oldArr exists, and the object is there, but dead
 *               will do oldArr[0] = v;
 * @return {any} Value in the cache
 */
TimeOutCache.prototype.get = function( name , oldArr ){
    var v = this.cache[ name ];
    if ( ! v )
	return null;

    var now = new Date();
    if ( now.getTime() > v.dead.getTime() ){
	if ( oldArr )
	    oldArr[0] = v.value;
	return null;
    }

    return v.value;
};