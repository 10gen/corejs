// replay.js

/**
*      Copyright (C) 2008 10gen Inc.
*  
*    Licensed under the Apache License, Version 2.0 (the "License");
*    you may not use this file except in compliance with the License.
*    You may obtain a copy of the License at
*  
*       http://www.apache.org/licenses/LICENSE-2.0
*  
*    Unless required by applicable law or agreed to in writing, software
*    distributed under the License is distributed on an "AS IS" BASIS,
*    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*    See the License for the specific language governing permissions and
*    limitations under the License.
*/

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
 * @docmodule core.core.replay
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
