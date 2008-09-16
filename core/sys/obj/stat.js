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

/** Functions to get statistics about memory usage and threads.
 */
Stats = {};

/** Returns an object containing memory statistics, including the maximum memory,
 * total memory, memory used, and free memory.
 * @param {number} [div=1] Factor by which to divide memory usage stats.
 * @returns {Object} Memory usage.  Fields: max, total, free, used.
 */
Stats.mem = function( div ){
    div = div || 1;

    var r = javaStatic( "java.lang.Runtime" , "getRuntime" );

    var obj ={
	max : Math.floor( r.maxMemory() / div ) ,
	total : Math.floor( r.totalMemory() / div ) ,
	free : Math.floor( r.freeMemory() / div ) };

    obj.used = obj.total - obj.free;

    return obj;

};

/** Returns an object with information about live and runnable threads.
 * @returns {Object} Fields: <dl>
 * <dt>total</dt><dd>The number of live threads.</dd>
 * <dt>httpserver</dt><dd>Subobject with fields: total - the number of live threads in the HTTP server.
 * active - HTTP server threads that are runnable.
 * </dl>
 */
Stats.threads = function(){
    var t = {};

    var all = javaStatic( "java.lang.Thread" , "getAllStackTraces" );

    var keySet = all.keySet();
    t.total = keySet.size();

    t.httpserver = {};
    t.httpserver.total = 0;
    t.httpserver.active = 0;

    for ( var i=keySet.iterator() ; i.hasNext(); ){
	var temp = i.next();

	if ( temp.getName().indexOf( "HttpServer:" ) >= 0 ){
	    t.httpserver.total++;
	    if ( temp.getState().toString().equals( "RUNNABLE" ) )
		t.httpserver.active++;
	}
    }


    return t;
};

/** Returns stats from Stats.threads and Stats.mem in one object.
 * @returns {Object} Fields: mem and threads.
 */
Stats.all = function(){
    var stats = {}

    stats.mem = Stats.mem( 1024 * 1024 );
    stats.threads = Stats.threads();


    return stats;
}
