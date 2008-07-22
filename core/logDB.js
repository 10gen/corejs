// logDB.js

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

core.core.mail();

/** @class Appends log messages to the _log collection in the database.
 */
BasicDBAppender = {};

/** Creates the _logs collection, if not already in existence, and an appender.
 * On fatal log messages, an email is sent to the user, notifying them of the error.
 */
BasicDBAppender.create = function(){

    try {
        db.createCollection( "_logs" , {size:1000000, capped:true} );
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
            mail = Mail.SMTP.gmail("10gen.auto@gmail.com", "jumpy171");
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
