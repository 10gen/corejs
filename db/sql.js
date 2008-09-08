
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

/** Convert SQL queries to 10gen database queries 
 * @namespace
 */
SQL = {};


/** Convert an SQL where clause into a mongo lookup object.
* @param {string} Sql where clause i.e. "clicked > 0" or "clicked > 0 and type='foo'"
* @param {Object} [existingFilters] Object to add filters to
*/
SQL.parseWhere = function( sql , existingFilters ){
    if ( sql.contains( "(" ) )
        throw "sql parser can't handle nested stuff yet";
    if ( sql.toLowerCase().contains( " or " ) )
        throw "sql parser can't handle ors yet";

    return SQL._parseWhere( new SQL.Tokenizer( sql ) , existingFilters );
}


/**
* @param t SQL.Tokenizer
*/    
SQL._parseWhere = function( t , existingFilters ){
    var filters = existingFilters || {};

    while( t.hasMore() ){
        var name = t.nextToken();
        var type = t.nextToken();
        if ( type.toLowerCase() == "not" )
            type += " " + t.nextToken();
        var val = t.nextToken();

        type = type.toLowerCase();

        if ( type == "=" )
            filters[name] = val;
        else if ( type == "<" )
            filters[name] = { $lt : val };
        else if ( type == ">" )
            filters[name] = { $gt : val };
        else
            throw "can't handle sql type [" + type + "] yet";

        if ( ! t.hasMore() )
            break;

        var next = t.nextToken().toLowerCase();
        if ( next == "and" )
            continue;

        if ( next == "order" || next == "group" || next == "limit" ){
            t.extraTokens.add( next );
            break;
        }
            
        
        throw "can't handle [" + next + "] yet";

    }
    return filters;
};

SQL._parseToNumber = function( s ){
    if ( ! isString( s ) )
        return s;

    if ( ! s.match( /^\d+$/ ) )
        return s;

    return parseNumber( s );
}

SQL.executeQuery = function( mydb , sql ){
    
    if ( sql.contains( "(" ) || sql.contains( " or " ) )
        throw "don't support lots of things";
    
    var t = new SQL.Tokenizer( sql );

    var command = t.nextToken();
    if ( command == null )
        throw "empty sql statement passed to executeQuery";
    
    if ( command.toLowerCase() != "select" )
        throw "only select supported right now";
    
    var fields = [];
    var tables = [];

    var next = null;

    while ( t.hasMore() ){
        var name = t.nextToken();
        if ( name.contains( "." ) )
            throw "table aliases not supported yet";

        fields.add( { name : name } );
        
        next = t.nextToken();

        if ( ! next )
            break;

        if ( next.toLowerCase() == "from" )
            break;

        if ( next == "," )
            continue;
        
        
        throw "don't support [" + next + "] yet in select";
    }

    while ( t.hasMore() ){
        var table = t.nextToken();

        tables.add( { table : table } );

        next = t.nextToken();        

        if ( ! next 
             || next.toLowerCase() == "where" 
             || next.toLowerCase() == "order" 
             || next.toLowerCase() == "group" 
           )
            break;
        
        if ( next == "," || next == "left" || next == "join" )
            throw "don't support joins";

        throw "don't support from [" + next + "] yet";
    }

    var filter = {};

    if ( next && next.toLowerCase() == "where" ){
        SQL._parseWhere( t , filter );
        next = t.nextToken();
    }

    var sort = null;

    if ( next && next.toLowerCase() == "order" ){
        next = t.nextToken();
        if ( ! ( next && next.toLowerCase() == "by" ) )
            throw "order without by doesn't make sense to me [" + sql + "]";
     
        sort = {};

        while ( t.hasMore() ){
            var sortField = t.nextToken();
            
            sort[ sortField ] = 1;
            
            next = t.nextToken();
            if ( ! next )
                break;
            
            if ( next.toLowerCase() == "asc" || next.toLowerCase() == "asec" ){
                sort[ sortField ] = 1;
                next = t.nextToken();
            }
            else if ( next.toLowerCase() == "dsc" || next.toLowerCase() == "desc" ){
                sort[ sortField ] = -1;
                next = t.nextToken();
            }
            
            if ( next == "," )
                throw "only sorting by 1 column supported right now";

            break;
        }        
    }

    assert.eq( 1 , tables.length , "wrong number of tables" );
    assert( fields.length > 0 , "why don't we have any fields" );
    assert( ! t.hasMore() , "more sql to parse but i think i'm done" );

    var wanted = null;
    if ( fields.length == 1 && fields[0].name == "*" )
        wanted = null;
    else {
        wanted = {};
        for each ( field in fields ){
            wanted[ field.name ] = 1;
        }
    }
    
    var cursor = mydb[tables[0].table].find( filter , wanted );
    if ( sort )
        cursor.sort( sort );
    
    return cursor;
}

// ------------------------
// ---- SQL.Tokenizer -----
// -----------------------

/** Initializes an sql expression tokenizer
 * @param {string} sql SQL query
 * @constructor
 */
SQL.Tokenizer = function( sql ){
    this.sql = sql;
    this.length = this.sql.length;
    this.pos = 0;
    this.extraTokens = [];
};

/** If the parser is on a whitespace character, this advances the position until it is not. */
SQL.Tokenizer.prototype.skipWhiteSpace = function(){
    while ( this.pos < this.length && this.sql[this.pos] == " " )
        this.pos++;
}

/** Returns if the pointer is still within the string being parsed.
 * @return {boolean} If the pointer is still within the string being parsed.
 */
SQL.Tokenizer.prototype.hasMore = function(){
    this.skipWhiteSpace();
    return this.pos < this.length;
}

/** Returns the next token from this SQL query.
 * @return The next token, or null.
 */
SQL.Tokenizer.prototype.nextToken = function(){
    if ( this.extraTokens.length > 0 )
        return this.extraTokens.shift();

    this.skipWhiteSpace();

    var t = "";
    
    var first = null;

    while ( this.pos < this.length ){
        var c = this.sql[this.pos];

        if ( c == " " )
            break;

        if ( first == null )
            first = this._isAlphaNumeric( c );
        
        var me = this._isAlphaNumeric( c );


        if ( me != first && t.length > 0 )
            break;

        t += c;
        this.pos++;
    }

    if ( t.length == 0 )
        return null;

    return SQL._parseToNumber( t );
}

SQL.Tokenizer.prototype._isAlphaNumeric = function( c ){
    return isAlpha( c ) || isDigit( c );
}

// ------------------------
// ---- END SQL.Tokenizer -----
// -----------------------
