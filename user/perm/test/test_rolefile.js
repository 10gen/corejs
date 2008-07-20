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

core.testing.client();
core.core.file();
core.user.perm.rolefile();
var cases = core.user.perm.test.roletests();

var f = File.create("author: ['admin/blog/post_edit', 'admin/files', 'admin/analytics.*']\n");

var p = new User.Perm.RoleFile(f);

cases(p);
