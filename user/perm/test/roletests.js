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

return function(p){
    var u = {name: "Ethan", email: "ethan@10gen.com", nickname: "Muscles"};


    var c = new testing.Client().setAnswer('value');

    var tryAllowed = function(path){
        return c.setURL(path).execute(function(){ return p.allowed(u, request); });
    };

    var output = tryAllowed("/woog");

    assert(output == false);

    var output = tryAllowed("/admin/blog/post_edit");

    assert(output == false);

    u.permissions = ["author"];

    var output = tryAllowed("/woog");

    assert(output == false);

    var output = tryAllowed("/admin/blog/post_edit");

    assert(output == true);

    p.forum = new User.Perm();  // which fails open by default
    
    var output = tryAllowed("/forum/woog");
    assert(output == true);

    var output = tryAllowed("/admin/forum");
    assert(output == false);

    var bigPerm = new User.Perm();
    bigPerm.roles = p;
    
    var tryAllowed = function(path){
        return c.setURL(path).execute(function(){ return bigPerm.allowed(u, request); });
    };

    assert(tryAllowed("/roles/forum/woog") == true);
    assert(tryAllowed("/open") == true);
    assert(tryAllowed("/roles/admin/unknown") == false);
    assert(tryAllowed("/roles/admin/files") == true);
};
