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

core.user.user();

/** @namespace Several different styles of authentication.
 * @docmodule core.user.auth
*/
Auth = {

    /** Toggle debug.
     * @type boolean
     */
    debug : false ,

    /** Attempts to find and authenticate a user.
     * @param {Object} [request] HTTP request
     * @param {Object} [response] HTTP response
     * @param {Object} [user] User
     * @returns {Object} The user object, if found, null otherwise.
     */
    getUser : function( req , res , uWanted ){

        if ( user )
            return user;

        var u = Auth.digest.getUser( req || request , res || response , User.getSiteName() , uWanted );
        if ( ! u )
            u = Auth.cookie.getUser( req || request , res || response , User.getSiteName() , uWanted );

        if ( ! u )
            return null;

        log.user.auth.info( "got user : " + u.name );
        return u;
    } ,

    /** Reject a user authentication.
     * @param {Object} [request] HTTP request
     * @param {Object} [response] HTTP response
     * @returns {string} The string "no".  More helpfully, it sets the response code to 401 (unauthorized).
     */
    reject : function( req , res ){
        return Auth.digest.reject( req || request , res || response , User.getSiteName() );
    } ,

    /** Basic user authentication.  Sends passwords plaintext.
     * @type namespace
     * @deprecated Use cookie authentication instead
     */
    basic : {
        /** Try to find and log in a user given an HTTP request.
         * @param {Object} [request] HTTP request
         * @returns {Object} The user, if correctly identified, otherwise null
         */
        getUser : function( req ){
            var auth = req.getHeader("Authorization");
            if ( ! auth )
                return null;

            if ( ! auth.match( /^Basic / ) )
                return null;


            auth = auth.substring( 6 );
            auth = Base64.decode( auth );
            var idx = auth.indexOf( ":" );

            if ( idx <= 0 )
                return null;

            var name = auth.substring( 0 , idx );

            var user = User.find( name );
            if ( ! user )
                return null;

            var pass = auth.substring( idx + 1 );
            if ( ! user.checkPasswordClearText( pass ) )
                return null;

            return user;
        }  ,

        /** Reject a user authentication.
         * @param {Object} [request] HTTP request
         * @param {Object} [response] HTTP response
         * @param {string} [username] Username
         * @returns {string} "no", also sets response code to 401 (unauthorized).
         */
        reject: function( req , res , name ){
            res.setHeader( "WWW-Authenticate" , "Basic realm=\"" + name + "\"" );
            res.setResponseCode( 401 );
            res.getWriter().print( "not allowed" );
            return "no";
        }
    } ,

    /** Digest user authentication.
     * @type namespace
     * @deprecated Use cookie authentication instead
     */
    digest : {

        /** Finds and logs in a user.
         * @param {Object} [request] HTTP request
         * @param {Object} [response] HTTP response
         * @param {string} [username] Username
         * @param {Object} [user] User object.
         * @returns {Object} If a user is found, the user object, otherwise null.
         */
        getUser : function( req , res , name , user ){
            var auth = req.getHeader("Authorization");
            if ( ! auth )
                return null;

            if ( ! auth.match( /^Digest / ) )
                return null;

            var things = {};
            var digestThings = things;

            auth = auth.substring( 7 );

            var idx = auth.indexOf( "=" );
            while ( idx > 0 ){
                var name = auth.substring( 0 , idx ).trim();
                var val = null;

                auth = auth.substring( idx + 1 ).trim();
                if ( auth.startsWith( "\"" ) ){
                    auth = auth.substring(1);
                    idx = auth.indexOf( "\"" );
                    val = auth.substring( 0 , idx );
                    auth = auth.substring( idx + 1 ).trim();
                }
                else {
                    var spaceidx = auth.indexOf( " " );
                    var commaidx = auth.indexOf( "," );

                    if ( spaceidx < 0 && commaidx < 0 )
                        idx = auth.length;
                    else if ( spaceidx < 0 )
                        idx = commaidx;
                    else if ( commaidx < 0 )
                        idx = spaceidx;
                    else
                        idx = Math.min( commaidx , spaceidx );

                    val = auth.substring( 0 , idx );
                    if ( val.endsWith( "," ) )
                        val = val.substring( 0 , val.length - 1 );
                    auth = auth.substring( idx + 1 ).trim();
                }

                things[name] = val;
                if ( auth.startsWith( "," ) )
                    auth = auth.substring( 1 ).trim();
                idx = auth.indexOf( "=" );
            }

            if ( ! things.username )
                return null;

            var uri = things.uri;
            if ( ! uri )
                uri = req.getURI();

            if( ! user )
                user = User.find( things.username );
            if ( ! user ){
                if ( Auth.debug ) SYSOUT( "no user:" + things.username );
                return null;
            }
            if ( Auth.debug ) SYSOUT( "found user:" + things.username );

            var ha1 = things.username.match( /@/ ) ? user.pass_ha1_email : user.pass_ha1_name;
            var ha2 = md5( req.getMethod() + ":" + uri );

            var r = ha1;
            r += ":" + things.nonce;

            //only if client supports RFC2617
            if( "nc" in things && "cnonce" in things && "qop" in things ) {
                r += ":" + things.nc +
                    ":" + things.cnonce +
                    ":" + things.qop;
            }

            r += ":" + ha2;
            r = md5(r);

            if ( Auth.debug ) SYSOUT( r + "\n" + things.response );
            if ( r != things.response ){
                if ( Auth.debug ) SYSOUT( "don't match" );
                return null;
            }

            if ( Auth.debug ) SYSOUT( "success!" );

            return user;
        } ,

        /** Reject a user authentication.
         * @param {Object} [request] HTTP request
         * @param {Object} [response] HTTP response
         * @param {string} [username] Username
         * @returns {string} "no", also sets response code to 401 (unauthorized).
         */
        reject : function( req , res , name ){
            var realm = name;

            if ( req != null && "11" == req.getCookie( "__sudo" ) )
                realm = "admin";

            res.setHeader( "WWW-Authenticate" ,
                           "Digest realm=\"" + realm + "\"," +
                           " nonce=\"" + md5( Math.random() ) + "\", " +
                           "algorithm=MD5, qop=\"auth\"" );
            res.setResponseCode( 401 );
            return "no";
        }
    } ,

    /** Cookie-style user authentication
     * @type namespace
     */
    cookie :  {
        /** Finds and logs in a user.
         * @param {Object} request HTTP request
         * @param {Object} response HTTP response
         * @param {string} [name] name of the database to use (this is not actually used anywhere, but must be left in for backwards compatibility.  It may safely be set to null.)
         * @param {Object} [user] user object.
         * @returns {Object} If a user is found, the user object, otherwise null.
         */
        getUser : function( request , response , name , u ){
          if (request.username && request.prefix && request.hash) {
            return Auth.cookie.getUserFromLogin(request, response, u);
          } else {
            return Auth.cookie.getUserFromCookie(request, response, u);
          }
        },

        getUserFromCookie: function(request, response, u) {
            var now = new Date();

            var username = request.getCookie( "username" );
            var myHash = request.getCookie( "userhash" );

            if ( username && myHash ){

                log.user.auth.cookie.debug( "got old username and hash " + username + " , " + myHash );

                if( ! u )
                    u = User.find( username );
                if ( u && u.tokens ){
                    log.user.auth.cookie.debug( "\t found user" );

                    var found = false;
                    u.tokens.forEach( function(z){
                            log.user.auth.cookie.debug( "\t\t got old : "  + tojson( z ) );
                            if ( z.hash != myHash )
                                return;
                            log.user.auth.cookie.debug( "\t\t\t hash match!" );

                            if ( z.expires < now ){
                                log.user.auth.cookie.debug( "\t\t\t too old" );
                                return;
                            }

                            found = true;
                        } );

                    if ( found )
                        return u;
                }
            }

            return null;
        },

        getUserFromLogin: function(request, response, u) {
            // check for login
            if ( ! request.username )
                return null;

            var prefix = request.prefix;
            var hash = request.hash;

            if ( ! ( prefix && hash ) )
                return null;

            var prefixOk = false;
            if ( prefix == md5( SERVER_HOSTNAME + ( new Date() ).roundMinutes( 7 ) ) ) prefixOk = true;
            if ( prefix == md5( SERVER_HOSTNAME + ( new Date( (new Date()).getTime() - ( 7 * 60 * 1000 )  ) ).roundMinutes( 7 ) ) ) prefixOk = true;
            if ( ! prefixOk )
                return null;

            log.user.auth.cookie.debug( "prefix ok.  username : " + request.username );

            if( ! u )
                u = User.find( request.username );
            if ( ! u )
                return null;

            log.user.auth.cookie.debug( "got user : " + request.username  );
            var temp1 = md5( prefix + ":" + u.pass_ha1_name );
            var temp2 = md5( prefix + ":" + u.pass_ha1_email );
            if ( hash != temp1 && hash != temp2 ){
                log.user.auth.cookie.debug( " hashes don't match hash [" + hash + "] \n ha1n [" + u.pass_ha1_name + "] ha1e [" + u.pass_ha1_email + "] \n temp1[" + temp1 + "] temp2[" + temp2 + "]" );
                return null;
            }

            log.user.auth.cookie.debug( "yay - got valid user : " + request.getURL() );

            Auth.cookie.login( request , response , u );
            return u;
        } ,

        /** Given a user, logs them in and sets the cookie.
         * @param {Object} request HTTP request
         * @param {Object} response HTTP response
         * @param {Object} username User object
         * @returns {Object} User object
         */
        login : function( request , response , u ){
            var now = new Date();

            // gen token
            if ( ! u.tokens ){
                u.tokens = [];
            }
            else { // lets take this oppurunity to do some cleaning
                u.tokens = u.tokens.filter( function(z){
                        return z.expires > now;
                    } );
            }

            var myHash = md5( Math.random() );
            var remember = request.remember;

            var secs = -1;
            if ( remember )
                secs = 7 * 86400;

            var expires = null;
            if ( remember )
                expires = new Date( now.getTime() + ( secs * 1000 ) );
            else
                expires = new Date( now.getTime() + ( 86400 * 1000 ) );

            u.tokens.push( { hash : myHash , expires : expires } );
            db.users.save( u );

            User.setAuthCookie( request , response , "username" , request.username , expires );
            User.setAuthCookie( request , response , "userhash" , myHash , expires );

            return u;

        } ,

        /** Reject a user authentication.
         * @param {Object} [request] HTTP request
         * @param {Object} [response] HTTP response
         * @param {string} [username] Username
         * @returns {string} "no", also sets response code to 401 (unauthorized).
         */
        reject : function ( req , res , name , args ){
            core.user.html.loginForce(args);
        }
    }

};


log.user.auth.level = log.LEVEL.ERROR;
