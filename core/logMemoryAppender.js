// logMemoryAppender.js

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

/** Appender for logs in RAM.  These log messages are also saved to the _logs collection.
 * @class
 */
MemoryAppender = {};

/** Create the appender for logs in memory.  Log size defaults to 100 entries, which can be changed
 *  by setting appender.options.max.
 */
MemoryAppender.create = function(){

    var cache = {};
    var options = { max : 100 };
    var all = [];

    var append = function( loggerName , date , level , msg , throwable , thread ){

        var lst = cache[ loggerName ];
        if ( ! lst ){
            lst = Array.createLinkedList();
            cache[ loggerName ] = lst;
        }

        var obj = LogUtil.createObject( loggerName , date , level , msg , throwable , thread );

        lst.push( obj );
        if ( lst.length > options.max  )
            lst.shift();

        all.push( obj );
        if ( lst.length > options.max * 5 )
            lst.shift();

    };

    append.cache = cache;
    append.options = options;
    append.all = all;

    append.isMemoryAppender = true;

    return javaCreate( "ed.log.JSAppender" , append );
};

/** Determine if a MemoryAppender already exists and return it if it does.
 * @param {log} logger Log being used
 * @returns {appender} MemoryAppender appender, if it exists, null otherwise
 */
MemoryAppender.find = function( logger ){
    if ( ! logger )
        return null;

    if ( logger.appenders ){
        for ( var i=0; i<logger.appenders.length; i++ ){
            var a = logger.appenders[i];

            if ( isObject( a ) && a.isMemoryAppender )
                return a;
        }
    }
}
