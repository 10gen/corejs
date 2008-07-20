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

core.util.urltree();

var u = new Util.URLTree();
u.foo = new Util.URLTree();
u.foo.bar = 'hi';
var terminal = function(end){ return end; };
u.unwind = function(result){ return '2'+result+'2'; };
u.foo.terminal = terminal;
assert(u.apply(null, '/foo/bar', null, null) == '2hi2');
