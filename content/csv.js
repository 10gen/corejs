/** @class Methods for dealing with comma-separated-value files
 */

/** @constructor Parses a csv into an array of lines in preparation for further processing
 * @param {string} raw The contents of a csv file as a string
 */
content.CSVContent = function( rawContent ){
    var t = new content.CSVContent.Tokenizer( rawContent );

    this.headers = t.nextLine();
    this.headerMap = {};
    for ( var i=0; i<this.headers.length; i++ )
        this.headerMap[this.headers[i]] = i;

    this.lines = [];

    var l = null;
    while ( ( l = t.nextLine() ) != null )
        this.lines.add( l );
};

/** Class to separate fields on delimiter.  Starts a reader at the first field of the first line.
 * @param {string} raw The contents of a csv file as a string
 */
content.CSVContent.Tokenizer = function( raw ){
    this.raw = raw;
    this.pos = 0;
};

/** Return the file's next line.  Does not advance the pointer.
 * @returns {Array} Fields from the next line
 */
content.CSVContent.Tokenizer.prototype.nextLine = function(){

    if ( this.pos >= this.raw.length )
        return null;

    var pieces = [];
    var p;
    while ( ( p = this.nextPiece() ) != null ){
        pieces.add( p );
    }
    return pieces;
}

/** Returns the next line without advancing the pointer.
 * @return {string} The next field
 */
content.CSVContent.Tokenizer.prototype.peek = function(){
    return this.raw[ this.pos ];
}

/** Returns the next line and advances the pointer one line.
 * @returns {string} The next field
 */
content.CSVContent.Tokenizer.prototype.next = function(){
    return this.raw[ this.pos++ ];
}

/** Move pointer over whitespace (" " only)
 */
content.CSVContent.Tokenizer.prototype.skipWhiteSpace = function(){
    while ( this.raw[this.pos] == " " )
        this.pos++;
}

/** Return the next field and advance the pointer
 * @returns {string} Field
 */
content.CSVContent.Tokenizer.prototype.nextPiece = function(){

    this.skipWhiteSpace();

    if ( this.pos >= this.raw.length )
        return null;

    if ( this.peek() == "\n" || this.peek() == "\r" ){
        this.pos++;
        if ( this.peek() == "\n" )
            this.pos++;
        return null;
    }

    var cur = "";

    while ( true ){
        var c = this.next();

        if ( c == "," )
            break;

        if ( c == "\r" || c == "\n" ){
            this.pos--;
            break;
        }

        if ( c != '\"' ){
            cur += c;
            continue;
        }

        while ( true ){
            c = this.next();
            if ( c == '"' )
                break;
            cur += c;
        }

    }

    return cur;
};


/** If field is a number it returns number field (0 based).  If its a string, it uses the header to find the field.
 * @param {number} lineNumber
 * @param {string|number} field Field name/number
 * @returns {string} Field
 * @throws {Exception} If field cannot be found
 */
content.CSVContent.prototype.getField = function( lineNumber , field ){
    if ( isString( field ) ){
        var id = this.headerMap[ field ];
        if ( id == null )
            throw "can't find field [" + field + "]";
        field = id;
    }

    return this.lines[lineNumber][field];
};

/** The number of lines in the file
 * @returns {number}
 */
content.CSVContent.prototype.numLines = function(){
    return this.lines.length;
}

/** Perform a set of actions on each line.
 * @param {function} func Function for each line
 */
content.CSVContent.prototype.forEach = function( func ){
    this.lines.forEach( func );
}
