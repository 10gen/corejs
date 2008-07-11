/** @class HTML form handling
 */
Forms = {};

/** Create an object from the name/value pairs in a submitted form.  Assumes a global request object.
* @param {string} [prefix] prefix of variable names
* @param {Object} [o="{}"] object to fill in, or creates a new one if null
* @param {Object} [request] HTTP request
* @returns {Object} Filled-in object
*/
Forms.fillInObject = function( prefix , o , req ){
    req = req || request;
    if ( ! req ) throw "can't find a request";

    o = o || {};

    for ( var name in request ){

        if ( prefix && ! name.startsWith( prefix ) )
            continue;

        if ( ! name )
            continue;

	var val = request[name];
        if ( prefix )
            name = name.substring( prefix.length );

	if ( ! val )
            continue;

	if ( name == "_id" ) val = ObjectId( val );

        Forms._subobject( o , name , val );
    }
    return o;
};

/** If set is non-null, the value is set.  otherwise just returns
 * @public
 * @param {Object} o Target object
 * @param {string} name Field name
 * @param {Object} set Subobject
 * @returns {Object} <tt>o[name]</tt>, if valid, otherwise null
 */
Forms._subobject = function( o , name , set ){
    while ( name.indexOf( "." ) >=0 ){
        var idx = name.indexOf( "." );
        o = o[ name.substring( 0 , idx ) ];
        if ( ! o ){
            if ( ! set )
                return null;
            o = {};
        }
        name = name.substring( idx + 1 );
    }

    if ( set ){
        if ( isNumber( o[name] ) )
            set = parseNumber( set );
        o[name] = set;
    }

    return o[name];
}

/** @constructor Create a form corresponding to a given object and prefix
 * @param {Object} object
 * @param {string} [prefix=""]
 */
Forms.Form = function( object , prefix ){
    this.object = object;
    this.prefix = prefix || "";
};

Forms.Form.prototype._getOptions = function( options , type ){
    options = options || {};
    options.type = type;
    return options;
}

Forms.Form.prototype._getValue = function( name ){
    return Forms._subobject( this.object , name );
}

/** Return an HTML text input tag with a given set of attributes
 * @param {string} name Object field/input text name
 * @param {Object} options Form object containing corresponding value
 * @returns {string} HTML input text box
 */
Forms.Form.prototype.text = function( name , options ){

    options = this._getOptions( options , "text" );
    options.name = this.prefix + name;

    if ( this._getValue( name ) )
        options.value = this._getValue( name  );

    return this.input( options );
};

/** Returns this form's _id
 * @returns {objectid|string} If the object has an id, it is returned, otherwise "" is returned
 */
Forms.Form.prototype.id = function(){
    if ( ! this.object._id )
        return "";

    return this.hidden( "_id" , this.object._id );
}

/** Create an HTML hidden input tag.
 * @param {string} name Field name
 * @param {string} value Field value
 * @param {Object} [options]
 * @returns {string} HTML input tag for given name/value pair
 */
Forms.Form.prototype.hidden = function( name , value , options ){

    options = this._getOptions( options , "hidden" );
    options.name = this.prefix + name;

    if ( value )
        options.value = value;
    else if ( this._getValue( name ) )
        options.value = this._getValue( name );

    return this.input( options );
};

/** Create an HTML submit button tag.
 * @param {string} name Field name
 * @param {string} value Field value
 * @param {Object} options
 * @returns {string} HTML submit input tag
 */
Forms.Form.prototype.submit = function( name , value , options ){

    options = this._getOptions( options , "submit" );

    options.name = name;
    options.value = value || "Submit";

    return this.input( options );
}

/** Creates HTML input tag with field=value pairs for each field in options parameter
 * @param {Object} options
 * @param {string} HTML input tag
 */
Forms.Form.prototype.input = function( options ){
    var html = "<input ";

    for ( var key in options ){
        html += " " + key;
        var val = options[key];
        if ( val )
            html += "=\"" + val + "\" ";
    }

    html += ">";
    return html;
};

