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

core.user.perm.rolebased();
// FIXME: currently, if a user doesn't have permission to access something, but
// there's a child permission object that grants permission to the same thing,
// permission will be granted. I don't know if this is the corrcet behavior
// or not.

// Similarly, if this class has a role that grants permission to something,
// child permissions aren't even consulted (even if they deny access to that
// thing).
User.Perm.RoleDB = Class.create(User.Perm.RoleBased, {
    initialize: function($super, collection){
        $super();
        this._collection = collection;
    },
    getRoleURLs: function(role){
        var r = this._collection.findOne({name: role});
        if(! r) return null;
        return r.urls;
    },
    getRoles: function(url){

    },
});
