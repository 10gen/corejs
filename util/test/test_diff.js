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

core.util.diff();

var a = "1\n2";
var b = "1\n3";

var d = Util.Diff.diffStr(a, b);
var n = Util.Diff.applyBackwardsStr( b , d );
assert( a == n );

var d2 = Util.Diff.diff( a , b );
var n2 = Util.Diff.applyBackwards( b , d2 );
assert(d2 == d);

assert(n2 == n);
assert(n2 == a);

var a = 3;
var b = 5;
var d = Util.Diff.diffInt( a , b );
var n = Util.Diff.applyBackwardsInt( b , d );
assert( a == n );

var d2 = Util.Diff.diff(a, b);
var n2 = Util.Diff.applyBackwards(b, d2);
assert(d2 == d);

assert(n2 == n);
assert(n2 == a);

var a = new Date( 2008, 01, 03, 7, 30, 0, 0 );
var b = new Date( 2008, 01, 04, 7, 30, 0, 0 );
var d = Util.Diff.diffDate( a , b );
var n = Util.Diff.applyBackwardsDate( b, d );

assert( a == n );
