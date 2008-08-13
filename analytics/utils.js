//  utils.js

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

if ( ! Analytics )
    Analytics = {};

if ( ! Analytics._utilsInit ){

    Analytics.inc = { $inc : { num : 1 } };
    Analytics.dbOptions = { upsert : true , ids : false };
    
    Analytics.hour = function( r ){
        return r.getStart().roundHour();
    };
    Analytics.day = function( r ){
        return r.getStart().roundDay();
    };
    Analytics.month = function( r ){
        return r.getStart().roundMonth();
    };
    
    
    Analytics.hourlyThing = function( name ){
        var key = { time : Analytics.hour };
        key[name] = function( r ){ return r[name]; };
        
        return { key : key , 
                skip : function( r ){ return ! r[ name ] } 
        };
    };
    
    Analytics.stdAgs = {
        pageView : { key : { time : Analytics.hour } } ,
        
        title : Analytics.hourlyThing( "title" ) ,
        search : Analytics.hourlyThing( "search" ) ,
        referrer : Analytics.hourlyThing( "referrer" ) ,
        referrerSearch : Analytics.hourlyThing( "referrerSearch" ) ,
        section : Analytics.hourlyThing( "section" ) ,
      
	titleReferrer : {
	    key : { time : Analytics.hour , 
		    referrer : function( r ){ return r[ "referrer" ]; } ,
		    title : function( r ){ return r[ "title" ]; } 
	    } ,
	    skip : function ( r ){ 
		if ( ! r.referrer ) return true;  
		if ( ! r.title ) return true;  
		return false;
	    } 
	} ,
		    
        uniqueHour : { key : { time : Analytics.hour } , skip : function( r ){ return ! r.uniqueHour; } } ,
        uniqueDay : { key : { time : Analytics.day } , skip : function( r ){ return ! r.uniqueDay; } } ,
        uniqueMonth : { key : { time :  Analytics.month } , skip : function( r ){ return ! r.uniqueMonth; } }
        
    };
    
    Analytics.go = function( r , aggs ){
        for ( var name in aggs ){
            var x = aggs[name];
            if ( x.skip && x.skip( r ) )
                continue;
            
            var op = x.op || Analytics.inc;
            
            var key = {};
	    var idx = {};
            for ( var foo in x.key ){
                var v = x.key[foo];
                if ( isFunction( v ) )
                    v = v(r);
                key[foo] = v;
		idx[foo] = 1;
            }
            
            var coll = db.analytics[ name ];

	    coll.ensureIndex( { time : 1 } );
	    coll.ensureIndex( idx );

            if( String(tojson(key)).match(/slide/i) ) log('got a slider ' + tojson(r) );
            coll.update( key , op , Analytics.dbOptions );
        }
    };

    Analytics._utilsInit = true;

}
