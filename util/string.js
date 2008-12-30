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

/* string utilities

 */

String.prototype.startsWithLC = function(s) {
    var start = this.substring(0, s.length).toLowerCase();
    return start == s;
}
String.prototype.dontEnum("startsWithLC");

String.prototype.lessSuffix = function(s) {
    if( this.endsWith(s) )
	return this.substring(0, this.length - s.length);
    return this;
}
String.prototype.dontEnum("lessSuffix");

String.prototype.lessPrefix = function(s) {
    if( this.startsWith(s) )
	return this.substring(s.length);
    return this;
}
String.prototype.dontEnum("lessPrefix");

String.prototype.forEach = function(f) {
    for( var i = 0; i < this.length; i++ )
	f(this[i]);
}
String.prototype.dontEnum("forEach");

String.prototype.rtrim = function() {
    var i = this.length-1;
    var j = i;
    while( i >= 0 && this[i] == ' ' ) i--;
    if( i == j ) return this;
    return this.substring(0, i+1);
}
String.prototype.dontEnum("rtrim");

// returns # of times ch occurs in the string
String.prototype.nOccurrences = function(ch) {
    var n = 0;
    for( var i = 0; i < this.length; i++ )
	if( this[i] == ch ) n++;
    return n;
}
String.prototype.dontEnum("nOccurrences");

String.prototype.insert = function(at, str) {
    return this.substring(0, at) + str + this.substring(at);
}
String.prototype.dontEnum("insert");
