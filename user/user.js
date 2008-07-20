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

/** Set a user's password.  Prerequisites: <ul>
 * <li>There must be a database chosen
 * <li>The user's email must be set.  If a user's email changes, the password must be rehashed.
 * <li>The user's name must be set.  If a user's name changes, the password must be rehashed.
 * </ul>
 * @param {string} password Unencoded password
 * @param {string} database Database name
 */
User.prototype.setPassword = function( pass , name ){
    if ( ! name )
        name = db.getName();
    this.pass_ha1_name = md5( this.name + ":" + name + ":" + pass );
    this.pass_ha1_email = md5( this.email + ":" + name + ":" + pass );
};

/** Determine if the password is correct.
 * @param {string} password Unencoded password to be checked
 * @returs {boolean} If the password was correct
 */
User.prototype.checkPasswordClearText = function( pass ){
    if ( this.pass_ha1_name == md5( this.name + ":" + db.getName() + ":" + pass ) )
        return true;

    if ( this.pass_ha1_email == md5( this.email + ":" + db.getName() + ":" + pass ) )
        return true;

    return false;
};

/** Determine if the password is correct.
 * @param {string} password Encoded password to be checked
 * @returs {boolean} If the password was correct
 */
User.prototype.checkPasswordDigest = function( pass ){
    if ( this.pass_ha1_name == pass )
         return true;
    if ( this.pass_ha1_email == pass )
        return true;
    return false;
};

/** Determine if the user has administrative privileges
 * @returns {boolean} If the user has the "admin" permission
 */
User.prototype.isAdmin = function(){
    return this.hasPermission( "admin" );
};

/** Get user permissions
 *  @return {Array} Copy of array of permissions. Can be empty.
 */
User.prototype.getPermissions = function(){
    if (!this.permissions) {
        return [];
    }

    return this.permissions.slice();
};

/** Check if a user has the specified permission
 * @param {string} permission The desired user permission
 * @returns {boolean} If the user had the permission specified
 */
User.prototype.hasPermission = function( perm ){
    if ( ! this.permissions )
        return false;

    return this.permissions.contains( perm.toLowerCase() ) || this.permissions.contains( "superadmin" );
};

/** Add a permission
 * @param {string} permission Permission to be added
 */
User.prototype.addPermission = function( perm ){
    if ( ! this.permissions )
        this.permissions = Array();
    this.permissions.push( perm.toLowerCase() );
};

/** Remove a permission.
 * @param {string} permission Permission to be removed.  Fails silently if user didn't have the permission.
 */
User.prototype.removePermission = function( perm ){
    if ( ! this.permissions )
        return;
    var i = this.permissions.indexOf(perm);
    if ( i == -1 )
        return;
    this.permissions.splice(i, 1);
};

/** Returns the nickname, if it exists, otherwise the username
 * @returns {string} Prettiest name found
 */
User.prototype.getDisplayName = function( ){
    return this.nickname || this.name;
};

User.prototype.presave = function( ){
    log.user.presave.debug("calling presave on " + tojson(this));
    if(this.uniqueness_hash == md5(this.name + ":" + this.email + ":" +
                                   this.nickname))
        return;

    log.user.presave.debug("hash is wrong");
    // Either this.uniqueness_hash is missing or name/email has changed
    // Either way, scan the DB for users with these attributes

    if(this.name == ""){
        throw "name is required";
    }
    if(this.email == ""){
        throw "email is required";
    }

    var t = this;

    if(t._id)
        var isDuplicate = function(obj){
            var matches = db.users.find(obj).toArray();
            matches = matches.filter(function(u){ return u._id != t._id; });
            log.user.presave.debug("matches: " + tojson(matches));
            return (matches.length != 0);
        }
    else
        var isDuplicate = function(obj){
            return db.users.findOne(obj);
        }

    log.user.presave.debug("using duplicate-checking function " + isDuplicate);

    if(isDuplicate({name: this.name})){
        throw "user has duplicate name: " + this.name;
    }
    if( isDuplicate({email: this.email}) ){
        throw "user has duplicate email: " + this.email;
    }

    this.uniqueness_hash = md5(this.name + ":" + this.email + ":" + this.nickname);
};

/** Find a user
 * @param {string} uname User name or email to use to find a user
 * @param {Object} [collection="db.users"] The database user collection
 * @returns {Object} User object
 * @static
 */
User.find = function( thing , theTable ){
    if ( ! theTable )
        theTable = db.users;

    theTable.setConstructor( User );

    if ( ! thing )
        return null;

    var u = { length: function(){ return 0; } }; // or DBCursor to db.users
    if ( thing.match( /@/ ) )
        u = theTable.find( { email : content.RegExp.literal(thing, 'i') } );

    if ( u.length() == 0 )
        u = theTable.find( { name : thing } );

    if ( u.length() == 0 && theTable.base != "admin" && thing.match( /@10gen.com/ ) )
        return User.find( thing , db[".admin.users"] );

    if ( u.length() == 0 ) return null;

    if ( u.length() != 1 ){
        throw Exception.Redirect(User.findMyLocation() + "/fixDuplicate?thing="+thing);
    }

    return u[0];
};

if ( db ){
    db.users.setConstructor( User );

    db.users.ensureIndex( { email : 1 } );
    db.users.ensureIndex( { name : 1 } );
    db.users.ensureIndex( { permissions : 1 } );
}

/** Get user status
 * @param {string} status
 * @returns {string} If status is "confirmed_email", returns "confirming your email", otherwise return nothing
 * @static
 */
User.statusName = function(status){
    if(status == "confirmed_email")
        return "confirming your email";

};

/** Link to email sent confirmation page
 * @param {string} status
 * @param {string} URL to "email confirmation sent" page
 * @static
 */
User.statusLink = function(status){
    if(status == "confirmed_email")
        return new URL(User.findMyLocation()+"confirm_send").toString()
};

User.fixURL = function(url){
    if ( ! url )
        return url;
    if ( url.startsWith( "http://" ) ||
         url.startsWith( "https://" ) ||
         url.startsWith( "/" ) )
        return url;
    return 'http://'+url;
};

log.user.level = log.LEVEL.ERROR;

return 0;
