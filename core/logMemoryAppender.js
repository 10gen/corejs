// logMemoryAppender.js

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
