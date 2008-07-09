// log.js

/** @namespace Logging utilities
 */
LogUtil = {};

/** Create an object to be logged.
 * @param {string} loggerName The idenifier for the logger being used
 * @param {Date} date Date of the log message
 * @param {string} level Severity of the message: DEBUG, INFO, ERROR, FATAL
 * @param {string} msg Log message
 * @param {Exception} throwable If an exception was thrown, record what type it was
 * @param {string} thread The thread pool from which the log message is coming
 * @return {Object} An object with the fields passed in.
 */
LogUtil.createObject = function( loggerName , date , level , msg , throwable , thread ){
    return {
	msg : msg ,
        level : level ,
        date : date ,
        throwable : throwable ,
        thread : thread ,
	logger : loggerName
    };

};

/** Serializes Java exceptions correctly, if succinctly.
 * @param {Exception} throwable Java exception.
 * @return {string} A string representation of the exception.
 */
LogUtil.prettyStackTrace = function( throwable ){
    if ( ! throwable )
        return null;

    return throwable.toString();
};

core.core.logMemoryAppender();
core.core.logDB();
