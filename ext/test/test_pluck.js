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

core.ext.pluck();

var f = Ext.pluck("name");

var o = {name: "Name", email: "Email"};

assert(f(o) == "Name");

var o2 = {name: "Name2", email: "email@noob.com"};

assert(f(o2) == "Name2");

var f2 = Ext.pluck("project.owner.email");

var b1 = {title: "This is a bug", project: {name: "core", owner: {name: "Ethan", email: "ethan@10gen.com"}}};

assert(f2(b1) == "ethan@10gen.com");
