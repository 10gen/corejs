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

core.ext.stringcompare();
core.user.perm.rolebased();

User.Perm.RoleFile = Class.create(User.Perm.RoleBased, {
    initialize: function($super, file){
        $super();
        this._file = file;
        this._roles = scope.eval("({" + file.asString() + "})");
    },
    getRoleURLs: function(role){
        return this._roles[role];
    },
    /** get all roles that can access a URL (or, just, all roles)
     *  This doesn't check subobjects.
     */
    getRoles: function(url){
        var keys = Object.keys(this._roles).sort(Ext.stringCompare);
        var output = [];
        var that = this;
        keys.forEach(function(z){
            var allowed = ! url || that._roles[z].some(function(r){
                return new RegExp(r).match(url);
            });

            if(allowed)
                output.push({name: z});
        });
        return output;
    },
});
