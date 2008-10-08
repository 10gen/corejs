
BrowserDetect = function( userAgent ){
    if ( ! userAgent ){
        if ( typeof( request ) != "undefined" && request.getHeader( "User-Agent" ) )
            userAgent = request.getHeader( "User-Agent" );
        else if ( typeof ( navigator ) != "undefined" && navigator.userAgent ){
            userAgent = navigator.userAgent;
            for ( var k in navigator ){
                this.k = navigator[k];
            }
        }
    }
    
    if ( ! userAgent )
        throw "can't find a user agent";

    this.userAgent = userAgent;
    
    for ( var i in BrowserDetect.browserInfo ){
        var data = BrowserDetect.browserInfo[i];
        if ( this.userAgent.indexOf( data.subString ) > 0 ){
            this._data = data;
            break;
        }
    }

    if ( this._data ){
        this.browser = this._data.subString;
        var vss = this._data.versionSearch || this._data.identity;
        if ( vss ){
            var idx = this.userAgent.indexOf( vss );
            if ( idx > 0 ){
                this.majorVersion = parseInt( this.userAgent.substring( idx + vss.length + 1 ) );
            }
        }
    }
}

BrowserDetect.prototype.isIE = function(){
    return this.userAgent.indexOf( "MSIE" ) >= 0 ;
}

BrowserDetect.prototype.isFirefox = function(){
    return this.userAgent.indexOf( "Firefox/" ) >= 0 ;
}

BrowserDetect.prototype.isSafari = function(){
    return this.userAgent.indexOf( "Safari/" ) >= 0 ;
}

/**
* @return 2 or 3
*/
BrowserDetect.prototype.getMajorVersion = function(){
    this.majorVersion;
}

BrowserDetect.prototype.debug = function(){
    var s = "";
    s += " browser [" + this.browser + "] ";
    s += " major version [" + this.majorVersion + "] ";
    return s;
}

BrowserDetect.browserInfo = [
    {
	subString: "Chrome",
	identity: "Chrome"
    },
    {
	subString: "OmniWeb",
	versionSearch: "OmniWeb/",
	identity: "OmniWeb"
    },
    {
	subString: "Apple",
	identity: "Safari" ,
        versionSearch: "Version"
    },
    {
	subString: "iCab",
	identity: "iCab"
    },
    {
	subString: "KDE",
	identity: "Konqueror"
    },
    {
	subString: "Firefox",
	identity: "Firefox"
    },
    {
	subString: "Camino",
	identity: "Camino"
    },
    {
	subString: "Netscape",
	identity: "Netscape"
    },
    {
	subString: "MSIE",
	identity: "Explorer",
	versionSearch: "MSIE"
    },
    {
	subString: "Gecko",
	identity: "Mozilla",
	versionSearch: "rv"
    },
    {
	subString: "Mozilla",
	identity: "Netscape",
	versionSearch: "Mozilla"
    }
];

//try {
    currentBrowser = new BrowserDetect();
//}
//catch ( e ){
    // don't care
//}

