
/** Convert between 10gen database queries and SQL queries
 * @namespace
 */
SQL = {};


/** Convert an SQL query into a 10gen database query.
* @param {string} Sql where clause i.e. "clicked > 0" or "clicked > 0 and type='foo'"
* @param {Object} [existingFilters] Object to add filters to
*/
SQL.parseWhere = function( sql , existingFilters ){
    if ( sql.contains( "(" ) )
        throw "sql parser can't handle nested stuff yet";
    if ( sql.toLowerCase().contains( " or " ) )
        throw "sql parser can't handle ors yet";

    // ----

    var filters = existingFilters || {};

    var t = new SQL.Tokenizer( sql );

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

        throw "can't handle [" + next + "] yet";

    }
    return filters;
};

SQL._parseToNumber = function( s ){
    if ( ! isString( s ) )
        return s;

    if ( ! s.match( /\d+/ ) )
        return s;

    return parseNumber( s );
}

/** Initializes an sql expression tokenizer
 * @param {string} sql SQL query
 * @constructor
 */
SQL.Tokenizer = function( sql ){
    this.sql = sql;
    this.length = this.sql.length;
    this.pos = 0;
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
    this.skipWhiteSpace();

    var t = "";

    while ( this.pos < this.length ){
        var c = this.sql[this.pos];

        if ( c == " " )
            break;

        if ( ! isAlpha( c ) && t.length > 0 )
            break;

        t += c;
        this.pos++;
    }

    if ( t.length == 0 )
        return null;

    return SQL._parseToNumber( t );
}

SQL._parseToken = function( token ){

    token = token.trim();
    var idx = token.indexOf( " " );

};
