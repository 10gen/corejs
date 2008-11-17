// search.js

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

core.text.stem();
core.ext.getdefault();
core.content.html();

if ( Search && Search._doneInit )
    return;

/** @namespace Database search functions
 * @docmodule core.content.search
*/
Search = {

    /** Search log
     * @type log
     */
    log : log.search ,
    DEBUG : false ,

    /** Search weights */
    _weights : {} ,
    _default : [ { idx : "_searchIndex" , w : 1 } ] ,

    /** Regular expression representing a word.
     * @type RegExp
     */
    wordRegex : /[,\. ]*\b[,\. ]*/ ,

    /** Trim a string, convert it to lower case, and get its stem
     * @param {string} s String to be cleaned
     * @returns {string} Cleaned string
     */
    cleanString : function( s ){

        if ( ! s.match( /\w/ ) )
            return "";

        s = s.trim().toLowerCase();
        s = Stem.stem( s );
        s = s.trim();
        return s;
    } ,

    /** Find the name of the search index
     * @param {number} [weight] Search term weight
     * @returns {string} Search index name
     */
    getIndexName : function( weight ){
        var idx = "_searchIndex";
        if ( weight && weight > 0 && weight != 1 )
            idx += "_" + weight.toString().replace( /\./g , "_" );
        return idx;
    } ,

    // make sure that all indexes are on the right fields of the table
    fixTable : function(table, weights){
        if ( Search.DEBUG ) Search.log( "fixTable : " + table.getName() );
        table.ensureIndex( { _searchIndex : 1 } );
        if(weights){
            var num = [];
            Search.fixTableSub(table, weights, num);
            num = num.unique().sort().reverse();
            var a = [];
            num.forEach( function(z){
                a.push( { idx : Search.getIndexName( z ) ,
                          w : z } );
            } );
            Search._weights[ table.getName() ] = a;
        }
    },

    fixTableSub : function( table , weights , num){
        if ( !weights )
            return;

        for ( var field in weights ){

            var w = weights[ field ];
            if(typeof w == "number"){
                num.push( w );

                var idx = Search.getIndexName( w );
                var o = {}
                o[idx] = 1;

                if ( Search.DEBUG ) Search.log( "\t putting index on " + tojson( o ) );
                table.ensureIndex( o );
            }
            else {
                Search.fixTableSub(table, w, num);
            }
        }
    } ,

    /** Add a set of words to the search index of an object
     * @param {Object} obj Target object
     * @param {string} str String with words to be added
     * @param {number} weight Weight of the index the words should be added to
     */
    addToIndex : function( obj, str, weight){
        var idx = Search.getIndexName( weight );

        var words = obj[idx];
        if ( !words ){
            words = [];
            obj[idx] = words;
        }

        str.split( Search.wordRegex ).forEach( function( z ){
            z = Search.cleanString( z );
            if ( z.length == 0 )
                return;
            if ( ! words.contains( z ) )
                words.add( z );
        });
    },

    /** Index the fields of an object
     * @param {Object} obj Target object
     * @param {number} weight Weight of the index
     * @param {Object} [options={}] Can include a function "filter" or boolean "stripHTML"
     * @returns {Object} The object obj
     */
    index : function( obj, weights, options ){
        var keys = Object.keys(obj);
        for(var i = 0; i < keys.length; i ++){
            if(keys[i].match(/searchIndex/)) delete obj[keys[i]];
        }
        return Search.indexSub(obj, obj, weights, options || {} );
    },

    /** Index the fields of an object
     * @param {Object} top Object to which search terms should be added
     * @param {Object} obj Target object
     * @param {number} weight Weight of the index
     * @param {Object} [options={}] Can include a function "filter" or boolean "stripHTML"
     * @returns {Object} The object top
     * @throws {Exception} Weights cannot be null
     */
    indexSub : function( top , obj , weights, options){

        if ( weights == null )
            throw "weights can't be null";


        if( obj instanceof Array ){
            for(var i = 0; i < obj.length; i++){
                if(obj[i]){
                    if( ! (Ext.getdefault(options, 'filter', function(){return true}))(i, obj[i])) continue;
                    Search.indexSub(top, obj[i], weights, options);
                }
            }
        }

        for ( var field in weights ){

            var w = weights[field];
            var o = Ext.getdefault(options, field, {});

            if ( typeof w == "number" ){
                var s = obj[field];
                if ( ! s )
                    continue;
                if( o.stripHTML || options.stripHTML ){
                    s = content.HTML.strip(s);
                }
                if ( ! s )
                    continue;

                Search.addToIndex(top, s, w);
            }
            else {
                if( ! (Ext.getdefault(options, 'filter', function(){return true}))(field, obj[field])) return;
                Search.indexSub(top, obj[field], w, o);
            }

        }

        return top;
    } ,

    /** Split a search string into individual, clean words
     * @param {string} query Search string
     * @returns {Array} An array of strings
     */
    queryToArray : function(queryString){
        var words = [];

        queryString.split( Search.wordRegex ).forEach( function( z ){
                z = Search.cleanString( z );
                if ( z.length == 0 )
                    return;
                words.push( z );
            } );
        words = words.unique();
        return words;
    },

    /** Perform a query on a database collection.
     * @param {db_collection} collection Collection to be searched
     * @param {string} query
     * @param {Object} [options={}] Search options: min, sort, ignoreRelevancy
     * @returns {Array} An array of results, if successful
     */
    search : function( table , queryString , options ){

        if ( Search.DEBUG ) Search.log( table.getName() + "\t" + queryString );

        options = options || {};
        var min = options.min || 10;

        var weights = Search._weights[ table.getName() ] || Search._default;
        if ( weights.length == 0 )
            weights = Search._default;
        if ( weights.length == 0 )
            weights.push( { idx : "_searchIndex" , w : 1 } );
        if ( Search.DEBUG ) Search.log( "\t weights.length : " + tojson(weights) );

        var matchCounts = Object(); // _id -> num
        var all = Array();
        var allIds = [];
        var max = 0;
        var words = Search.queryToArray(queryString);

        var fieldsWanted = { _id : ObjectId() };
        if ( options.sort ){
            for ( var k in options.sort )
                fieldsWanted[k] = 1;
        }

        for ( var i=0; i<weights.length; i++){
            var idx = weights[i].idx;
            var w = weights[i].w;

            if ( Search.DEBUG ) Search.log( "\t using index " + idx );

            words.forEach( function(z){
                var s = { query : {} }; 
                s.query[idx] = z;
                
                if ( options.sort )
                    s.orderBy = options.sort;

                var indexKeys = {};
                indexKeys[idx] = 1;
                s.$hint = table.genIndexName( indexKeys );

                if ( Search.DEBUG )Search.log( "\t\t searching on "+tojson(s) );
                log( "HERE " + tojson( s ) );
                
                
                var res = table.find( s , fieldsWanted );

                res.limit( 20000 );

                while ( res.hasNext() ){
                    var tempObject = res.next();
                    var temp = tempObject._id.toString();

                    if ( matchCounts[temp] )
                        matchCounts[temp] += w;
                    else
                        matchCounts[temp] = w;

                    max = Math.max( max , matchCounts[temp] );

                    if ( Search.DEBUG ) Search.log( "\t\t " + temp + "\t" + tojson( tempObject )  + "\t" + matchCounts[temp] );

                    if ( ! allIds.contains( temp ) ){
                      allIds.add( temp );
                      all.add( tempObject );
                    }
                }
            } );

            if ( matchCounts.keySet().size() >= min )
                break;
        }

        if ( Search.DEBUG ){
            Search.log( "matchCounts: ");
            all.forEach(
                function(z){
                    Search.log( "\t" + z._id + "\t" + matchCounts[z._id] );
                }
            );
        }

        // will only work if options.sort has 1 key
        all = all.sort(
            function( l , r ){

                if ( options.sort ){
                    for ( var k in options.sort ){
                        if ( l[k] < r[k] )
                            return -1 * options.sort[k];
                        if ( l[k] > r[k] )
                            return options.sort[k];
                    }
                }

                if ( ! options.ignoreRelevancy ){
                    var diff = matchCounts[r] - matchCounts[l];
                    if ( diff != 0 )
                        return diff;
                }

                if ( l._id < r._id )
                    return -1;

                if ( l._id > r._id )
                    return 1;

                return 0;
            }
        );

        if ( Search.DEBUG ){
            Search.log( "matchCounts sorted: ");
            all.forEach(
                function(z){
                    Search.log( "\t" + z + "\t" + matchCounts[z] );
                }
            );
        }

        var good = Array();
        all.forEach( function( z ){
            if ( good.length <= min ){
                var id = z._id;
                var obj = table.findOne( id );
                if( obj == null ) {
                    Search.log.error( "couldn't find " + id + " even though it came up in the search!" );
                }
                else {
                    if( options.recordRelevancy ) {
                        obj._relevance = matchCounts[ id.toString() ];
                    }
                    good.add( obj );
                }
                return;
            }
        } );

        return good;
    },


    /** Given two queries, determine if they are essentially the same
     * @param {string} query1 First query
     * @param {string} query2 Second query
     * @returns {boolean} If the queries are the same
     */
    match: function(obj, query){
        var qwords = Search.queryToArray(query);
        var owords = Search.queryToArray(obj);
        for(var i = 0; i < qwords.length; i++){
            if(owords.contains(qwords[i]))
                return true;
        }
    },


    /** Given an object and a search term, find the relevant parts
     *  of the object.
     *
     *  FIXME: Which parts are relevant? For right now, I only return
     *  JS objects.
     *   So, if given: {a : ["hi", "yo", "hey"]} and the query "hi", return
     *   the whole object -- not the array, not either of the strings.
     *   Search.snippet should return an array of {object: o1, text: "hi"}
     *   objects.
     *   Other text processing can happen after that. snippet should
     *   just search through the object structure to find the text at all
     * @param {Object} obj Object to be searched
     * @param {string} query Search query
     * @param {Array|number} weights Search weights
     * @returns {Array} Search results
    */
    snippet: function(obj, query, weights){

        var ary = [];
        Search.snippetSub(obj, obj, query, weights, ary);
        return ary;
    },

    /** explore a structure recursively, as directed by
     * variable.
     * The base case we're working towards is to end up with a weight
     * of a number, versus a single string.
     * In this case we just test the string.

     *  If we are exploring an array, we just explore each element without
     * changing the parent. This comes before the base case, because
     * we can explore arrays in either the base case or other cases.

     * If we're not at an array and weights is not a number,
     * we explore recursively.
     * Don't recurse into nulls.
     * @param {Object} obj Object to search in
     * @param {Object} parent <tt>obj</tt>'s parent
     * @param {string} query Search query
     * @param {Array|number} weights
     * @param {Array} results Array of search results
     * @returns {boolean} <tt>false</tt>
     */
    snippetSub: function(obj, parent, query, weights, results){
        var ret = false;

        if(obj == null){
            Search.log.debug("recursing onto a null object! broken weights spec??");
        }

        else if(obj instanceof Array){
            for(var i = 0; i < obj.length; i++){
                Search.snippetSub(obj[i], parent, query, weights, results);
            }
        }
        else if(typeof weights == "number"){
            // base case
            Search.log.debug("checking string : " + obj);
            if(Search.match(obj, query))
                results.push({object: parent, text: obj});
        }
        else for ( var field in weights ){
            Search.log.debug("recursive on : " + field);
            var w = weights[field];
            Search.snippetSub(obj[field], obj, query, w, results);
        }
        return ret;
    }

};

Search._doneInit = true;
Search._default.lock();
Search._default[0].setReadOnly( true );

Search.log.level = Search.log.LEVEL.DEBUG;
