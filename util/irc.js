// irc.js

/** IRC functions.
 * @namespace
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
