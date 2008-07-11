/** Create a new FogBugz user representation, optionally from existing data.
 * @param {Object} xml Existing user information.
 */
ws.FogBugz.Person = function( xml ){
    if ( xml ){
        for ( var i=0; i<xml.elements.length; i++ ){
            var e = xml.elements[i];
            if ( e.textString )
                this[ e.localName ] = e.textString;
        }
    }
};

/** Returns this person's full name.
 * @return {string} Full name.
 */
ws.FogBugz.Person.prototype.toString = function(){
    return this.sFullName;
}
