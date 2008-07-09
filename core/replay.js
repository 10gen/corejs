// replay.js

/** Replay requests to the server for fun and profit.
 * @class
 * @example core.core.replay();
 * replay = new ReplayServer( "test.10gen.com" );
 *
 * function allowed( req , res , uri ){
 *     replay.send( req );
 * }
 * @param {string} server Server name
 * @param {number} [port=80] Port to connect to.
 * @param {string} [hostname=server]
 */


ReplayServer = function( server , port , hostname ){
    this.server = server;
    this.port = port || 80;
    this.hostname = hostname || server;

    if ( ! this.server )
        throw "need to specify a server";

    this._replay = javaCreate( "ed.net.httpserver.Replay" , this.server , this.port , this.hostname );
};


/** Replay a given request.
 * @param {HTTP request} req Request to be replayed
 * @return whether or not it was succesfully added to queue
 */
ReplayServer.prototype.send = function( req ){
    return this._replay.send( req );
}
