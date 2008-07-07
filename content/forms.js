
Forms = {};

/**
* assumes a global request object
* @param prefix [optional] prefix of variable names
* @param o [optional] object to fill in, or creates a new one if null 
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
        
	if ( val.lenth == 0 ) 
            continue;
        
	if ( name == "_id" ) val = ObjectId( val );
	
        Forms._subobject( o , name , val );
    }
    return o;
};

/**
* if set is non-null, the value is set.  otherwise just returns
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
    if ( set )
        o[name] = set;
    return o[name];
}

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

Forms.Form.prototype.text = function( name , options ){

    options = this._getOptions( options , "text" );
    options.name = this.prefix + name;
    
    if ( this._getValue( name ) )
        options.value = this._getValue( name  );
    
    return this.input( options );
};

Forms.Form.prototype.id = function(){
    if ( ! this.object._id )
        return "";
    
    return this.hidden( "_id" , this.object._id );
}

Forms.Form.prototype.hidden = function( name , value , options ){

    options = this._getOptions( options , "hidden" );
    options.name = this.prefix + name;
    
    if ( value )
        options.value = value;
    else if ( this._getValue( name ) )
        options.value = this._getValue( name );
    
    return this.input( options );
};


Forms.Form.prototype.submit = function( name , value , options ){

    options = this._getOptions( options , "submit" );

    options.name = name;
    options.value = value || "Submut";
    
    return this.input( options );
}

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

