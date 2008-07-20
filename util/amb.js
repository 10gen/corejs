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

/* amb - for "nondeterministic" programs
*/

/** Check that a given variable is true.
 * @param {any} x Variable to check.
 * @throws {Exception} If the variable is false.
 */
function require(x) {
    if( !x )
        throw "tryagain";
}

/** Logical evalutation of expressions.
 * @example Adapted from Structure and Interpretation of Computer Programs
   Abelson/Sussman/Sussman section 4.3.2

res =  [1,2,3,4,5].amb( function(baker) {
return [1,2,3,4,5].amb( function(cooper) {
return [1,2,3,4,5].amb( function(fletcher) {
return [1,2,3,4,5].amb( function(miller) {
return [1,2,3,4,5].amb( function(smith) {

    require( [baker, cooper, fletcher, miller, smith].distinct() );
    require( baker != 5 );
    require( cooper != 1 );
    require( fletcher != 5 && fletcher != 1 );
    require( miller > cooper );
    require( abs(smith-fletcher) != 1 );
    require( abs(fletcher-cooper) != 1 );

    return [['baker',baker],
	    ['cooper',cooper],
	    ['fletcher',fletcher],
	    ['miller',miller],
	    ['smith',smith]];

})})})})});

*/
function amb(f, values) {
    for( var i = 0; i<values.length; i++ ) {
        try {
            var res = f(values[i]);
	    if( res ) return res;
        } catch(e if e=="tryagain") {
        }
    }
    return null;
}

Array.prototype.amb = function(f) { return amb(f,this); };
