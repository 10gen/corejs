// logDB.js

core.db.db();
core.core.mail();

/** @class Appends log messages to the _log collection in the database.
 */
BasicDBAppender = {};

/** Creates the _logs collection, if not already in existence and an appender.
 * On fatal log messages, an email is sent to the user, notifying them of the error.
 */
BasicDBAppender.create = function(){

    try {
        createCollection( "_logs" , {size:1000000, capped:true} );
    }
    catch ( e ){
        SYSOUT( "error creating _logs db - db logging off" );
        SYSOUT( scope.currentException() );
        return null;
    }

    var append = function( loggerName , date , level , msg , throwable , thread ){
        var now = new Date();
        var lvl = level.toString();
        msg = msg.toString();
        if(lvl == "FATAL") {
            m = new Mail.Message( "Fatal Log Message", msg );
            m.addRecipient(  user.email , "to" );
            m.send( mail );
        }
        var obj = LogUtil.createObject( loggerName , date , lvl , msg , LogUtil.prettyStackTrace( throwable ) , thread.toString() );
        obj.request = request ? request.getHeader("Authorization") : "";
        db._logs.save( obj );
    }

    append.isBasicDBAppender = true;
    append.sentEmail = new Date(0);

    return javaCreate( "ed.log.JSAppender" , append );
};

/** Determine if a BasicDBAppender already exists and return it if it does.
 * @param {log} logger Log being used
 * @returns {appender} BasicDBAppender appender, if it exists, null otherwise
 */
BasicDBAppender.find = function( logger ){
    if ( ! logger )
        return null;

    if ( ! logger.appenders )
        return null;

    for ( var i=0; i<logger.appenders.length; i++ ){
        var a = logger.appenders[i];

        if ( isObject( a ) && a.isBasicDBAppender )
            return a;
    }

    return null;
};
