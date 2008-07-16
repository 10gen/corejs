
/** Functions for using semaphores.
 * @param {number} numPermits The number of threads allowed to hold this semaphore at a time.
 */
Util.Semaphore = function( numPermits ){

    if ( ! numPermits )
        throw "need to specify number of permits";

    print( "numPermits : " + numPermits );
    this._sem = javaCreate( "java.util.concurrent.Semaphore" , numPermits);
};

/** Acquires a permit from this semaphore, blocking until one is available, or the thread is interrupted. */
Util.Semaphore.prototype.acquire = function(){
    this._sem.acquire();
};

/** Acquires a permit from this semaphore, only if one is available at the time of invocation. */
Util.Semaphore.prototype.tryAcquire = function(){
    return this._sem.tryAcquire();
};

/** Releases a permit, returning it to the semaphore. */
Util.Semaphore.prototype.release = function(){
    this._sem.release();
};

/** Returns the current number of permits available in this semaphore.
 * @return {number} The number of permits available.
 */
Util.Semaphore.prototype.availablePermits = function(){
    return this._sem.availablePermits();
};
