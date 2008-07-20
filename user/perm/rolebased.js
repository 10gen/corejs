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

/** Role-based authorization.
 *  Every permission in the user is checked and the URLs it grants are
 *  looked up.
 *  Subclasses have to define getRoleURLs(permission).
 *  URLs are matched inexactly against the URL we've been given; I'm not sure
 *  this is the correct behavior. Well, you can always write expressions that
 *  start with ^ and end with $.
 */
User.Perm.RoleBased = Class.create(User.Perm, {
    initialize: function($super){
        $super();
        this.setDefault(false, {});
    },
    // See note in roledb
    allowed: function($super, user, request, uri){
        if(! uri) uri = request.getURI();
        var perm = false;
        if(user.permissions){
            var t = this;
            perm = user.permissions.some(function(p){
                var urls = t.getRoleURLs(p);
                if(! urls) return false;

                return urls.some(function(r){
                    return new RegExp(r).match(uri);
                });

            });
        }
        if(perm) return perm;
        return $super(user, request, uri);
    },

    /**
     * getRoleURLs: return a list of URL expressions for a given permission.
     * This method must be overridden by subclasses.
     * @param {String} permission The role to get URLs for.
     */
    getRoleURLs: function(permission){
        throw "getRoleURLs on a RoleBased class";
    },
});
