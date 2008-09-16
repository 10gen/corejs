// log.js

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

/** @namespace Logging utilities
 * @docmodule CoreJS.Core.log
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
