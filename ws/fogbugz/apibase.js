
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

// ---- login/logout

ws.FogBugz.prototype._command = function( cmd , params ){
    var url = this.url + "cmd=" + cmd;

    for ( var k in params )
        if ( params[k] )
            url += "&" + k + "=" + escape( params[k] );

    if ( this._token )
        url += "&token=" + this._token;

    this.log( url );

    var x = new XMLHttpRequest( "GET" , url );
    if ( ! x.send() )
        throw "error";

    var dom = xml.parseDomFromString( x.responseText );
    dom._raw = x.responseText;
    return dom;
}

ws.FogBugz.prototype._login = function(){
    if ( this._token )
        return this._token;

    var res = this._command( "logon" , { email : this.email , password : this.password } );
    var tokenNode = res.getAllByTagName( "token" );

    if ( tokenNode.length == 0 )
        throw "no token node";

    if ( tokenNode.length > 1 )
        throw "why are there more than 1 token node";

    tokenNode = tokenNode[0];
    this._token = tokenNode.textString;
    return tokenNode.textString;
};

/** Log out. */
ws.FogBugz.prototype.done = function(){
    if ( ! this._token )
        return;

    if ( this._passedInToken ) // don't logoff permanent token
        return;

    this._command( "logoff" , {} );
}
