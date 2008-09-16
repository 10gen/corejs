// irc.js

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

/** IRC functions.
 * @namespace
 * @docmodule CoreJS.Util.irc
 */
Util.IRC = {};

/** The IRC logger.
 * @constructor
 * @param {string} host Hostname of server
 * @param {string} nick Nickname to use
 * @param {string} channel Channel to join
 */
Util.IRC.Logger = function( host , nick , channel ){
    if ( ! db )
        throw "no db to save logs too :(";

    this.host = host;
    this.nick = nick;

    if ( ! this.host )
        throw "need host";

    if ( ! this.nick )
        throw "need nick";

    this._bot = javaCreate( "ed.toys.IRCBot" , this.host , this.nick );
    assert( this.onMessage );
    this._bot.onMessage = this.onMessage;

    this.channel = channel;
    if ( this.channel )
        this._bot.joinChannel( channel );
};

/** Given a message, this logger timestamps it and saves it to db.ircLogs.
 * @param {Object} msg Message to be saved.
 */
Util.IRC.Logger.prototype.onMessage = function( msg ){

    msg.ts = new Date();

    db.ircLogs.save( msg );
    if ( this.first ){
        this.first = false;
        db.ircLogs.ensureIndex( ts );
    }

};
