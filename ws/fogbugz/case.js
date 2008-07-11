/** Create a new FogBugz case
 * @param {Object} [xml] If given, fill in the case with xml.attributes and xml.elements
 */
ws.FogBugz.Case = function( xml ){
    this.ixBug = null;
    if ( xml ){
        this.ixBug = xml.attributes.ixBug;
        for ( var i=0; i<xml.elements.length; i++ ){
            var e = xml.elements[i];
            if ( e.textString )
                this[ e.localName ] = e.textString;
        }
    }
};

/** Set this case's title.
 * @param {string} title
 */
ws.FogBugz.Case.prototype.setTitle = function( title ){
    this.sTitle = title;
};


/** Set which project contains this case.
 * @param {string} project
 */
ws.FogBugz.Case.prototype.setProject = function( project ){
    this.sProject = project;
};

/** Set which area contains this case.
 * @param {string} area
 */
ws.FogBugz.Case.prototype.setArea = function( area ){
    this.sArea = area;
};

/** Add a description to this case.
 * @param {string} desc
 */
ws.FogBugz.Case.prototype.setDescription = function( desc ){
    this.sEvent = desc;
};

/** Return this case in string form.
 * @return {string} This case.
 */
ws.FogBugz.Case.prototype.toString = function(){
    var s =  "[ FogBugz Case " + this.id + " " + this.sProject + ":" + this.sTitle + "\n";

    s += "\t status:" + this.ixStatus + "\n";
    s += "\t priority:" + this.ixPriority + "\n";
    s += "\t assigned to:" + this.sPersonAssignedTo + "\n";

    s += "]";
    return s;
}
