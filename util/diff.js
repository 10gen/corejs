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

/** Utilities for diffing and undiffing data structures.
 * @namespace
 * @docmodule core.util.diff
 */
Util.Diff = {

    /** Diffs two strings.
     * @param {string} a First string
     * @param {string} b Second string
     * @return {string} The difference between <tt>a</tt> and <tt>b</tt>.
     */
    diffStr : function( a , b ){
        if(a == b) return "";
        // you need a '+""' at the end to convert it from a "native_string" to a "string"
        var x= javaStatic( "ed.util.DiffUtil" , "computeDiff" , a , b )+"";
        return x;
    } ,

    /** Applies a diff to an altered string to return the original string.
     * @param {string} base Altered string
     * @param {string} diff String diff
     * @return {string} The original string
     */
    applyBackwardsStr : function( base , diff ){
        return javaStatic( "ed.util.DiffUtil" , "applyScript" , base , diff );
    } ,

    // diff(3, 5) -> 2
    // applyBackwards(5, 2) -> 3
    /** Diffs two numbers.
     * @param {number} a First number
     * @param {number} b Second number
     * @return {number} The difference between <tt>a</tt> and <tt>b</tt>.
     */
    diffInt : function( a , b ){
        return b-a;
    } ,

    /** Applies a diff to a number to return the original number.
     * @param {number} base Altered number
     * @param {number} diff Numeric diff
     * @return {number} The original number
     */
    applyBackwardsInt : function( base, diff ){
        return base-diff;
    } ,

    // diffDate takes Date, Date -> number
    /** Diffs two dates.
     * @param {number} a First date
     * @param {number} b Second date
     * @return {number} The difference between <tt>a</tt> and <tt>b</tt>.
     */
    diffDate : function( a , b ){
        return b.getTime() - a.getTime();
    },

    // applyBackwardsDate takes Date, number -> Date
    /** Applies a diff to a date to return the original date.
     * @param {number} base Altered date
     * @param {number} diff Date diff
     * @return {number} The original date
     */
    applyBackwardsDate : function( base, diff ){
        return new Date(base.getTime() - diff);
    },

    test : function(){
        var a = "1\n2";
        var b = "1\n3";

        var d = Util.Diff.diffStr( a , b );
        var n = Util.Diff.applyBackwardsStr( b , d );

        assert( a == n );

        var a = 3;
        var b = 5;
        var d = Util.Diff.diffInt( a , b );
        var n = Util.Diff.applyBackwardsInt( b , d );

        assert( a == n );

        var a = new Date( 2008, 01, 03, 7, 30, 0, 0 );
        var b = new Date( 2008, 01, 04, 7, 30, 0, 0 );
        var d = Util.Diff.diffDate( a , b );
        var n = Util.Diff.applyBackwardsDate( b, d );

        assert( a == n );

        return true;
    },

    /** Diffs two arrays.
     * @param {Array} a First array
     * @param {Array} b Second array
     * @return {Object} The difference between <tt>a</tt> and <tt>b</tt>.  If the nth element of an array changed, this would be expressed as: { "n" : { add : "whatever" } }.
     */
    diffArray : function( a , b ){
        var newa = Object.extend([], a);
        var newb = Object.extend([], b);

        var dArr = {};
        for(var i in newa) {
            if(newb[i]) {
                var d = Util.Diff.diff(newa[i], newb[i]);
                if(d != 0 &&
                   (d.length && d.length != 0) ||
                   (d instanceof Object && Object.keys(d).length > 0))
                    dArr[i] = d;
            }
            else {
                dArr[i] = {add : newa[i]};
            }
        }
        for(var i = newa.length; i<newb.length; i++) {
            dArr[i] = {add: newb[i]};
        }
        return dArr;
    },

    /** Not yet implemented: Apply a diff to an array.
     * @param {Array} base Array that was diffed
     * @param {Object} diff An array diff
     * @return The array with diff applied.
     */
    applyBackwardsArray : function( base , diff ){
        throw new Exception("Not yet implemented");
    },

    /** Diffs two boolean values
     * @param {boolean} a First boolean value
     * @param {boolean} b Second boolean value
     * @return {Object} Description of change if <tt>a != b</tt>.
     */
    diffBool : function( a, b ) {
        if(a == b) return 0;
        return { add : a, remove: b};
    },

    /** Given two objects of any type, attempt to apply the correct type of diff to them.
     * @param {any} a First object
     * @param {any} b Second object
     * @return {Object} An object decribing any differences between the first and second given objects.
     */
    diffObj : function( a , b ){
        var d = {};
        var valid_type = ["string", "number", "boolean", "objectid"];
        var valid_instance = ["Array", "Object", "Date"];
        for(var prop in a){
            if(! (prop in b) ){
                // mark it as removed
                d[prop] = {remove: a[prop]};
            }
            else if(typeof a[prop] == typeof b[prop] && valid_type.contains(typeof a[prop])){
                var diffy = Util.Diff.diffFunc[typeof a[prop]](a[prop], b[prop]);
                if(diffy && ((typeof diffy == "number" && diffy != 0)
                             || (typeof diffy == "string" && diffy != "")
                             || (typeof diffy == "object" && Object.keys(diffy).length > 0)
                            )) {
                    d[prop] = {change: diffy};
                }
            }
            else if(a[prop] instanceof Date && b[prop] instanceof Date) {
                var diffy = Util.Diff.diffFunc["Date"](a[prop], b[prop]);
                if(diffy && diffy != 0) {
                    d[prop] = {change: diffy};
                }
            }
            else if(a[prop] instanceof Array && b[prop] instanceof Array) {
                var diffy = Util.Diff.diffFunc["Array"](a[prop], b[prop]);
                if(diffy && Object.keys(diffy).length > 0) {
                    d[prop] = {change: diffy};
                }
            }
            else if(a[prop] instanceof Object && b[prop] instanceof Object) {
                var diffy = Util.Diff.diffFunc["Object"](a[prop], b[prop]);
                if(diffy instanceof Object && Object.keys(diffy).length > 0) {
                    d[prop] = {change: diffy};
                }
            }
            else {
                log.diff.warning("property " + prop + " is of different types in the two objects");
                d[prop] = {change: {remove: a[prop], add: b[prop]}};
            }
        }
        for(var prop in b){
            if(! (prop in a) ){
                // add it
                if(!d.add) d.add = {};
                d.add[prop] = b[prop];
            }
        }
        return d;
    },

    /** Applys the given diff to a given object.
     * @param {Object} base the object to which the diff should be applied
     * @param {Object} diff an object diff
     * @return {Object} The result of applying the diff to the object
     */
    applyBackwardsObj : function( base , diff ){
        var res = {};
        for(var prop in base){
            res[prop] = base[prop];
        }
        for(var prop in diff){
            var d = diff[prop];
            if(d.add){
                // apply backwards, i.e. delete it
                delete res[prop];
            }
            if(d.remove){
                // apply backwards, i.e. add it
                res[prop] = d.remove;
            }
            if(d.change){
                if(typeof base[prop] == "number"){
                    res[prop] = Util.Diff.applyBackwardsInt(base[prop], diff[prop].change);
                }
                else if(typeof base[prop] == "string"){
                    res[prop] = Util.Diff.applyBackwardsStr(base[prop], diff[prop].change);
                }
                else{
                    throw new Exception("not implemented, leave me alone");
                }

            }
        }
        return res;
    },

    /** Given two variables, diff them
     * @param {any} a First variable
     * @param {any} b Second variable
     * @return {Object} An object describing the differences between the two variables
     */
    diff : function(a, b){
        var diffy = Util.Diff.diffObj({arg: a}, {arg: b})["arg"];
        if(!diffy) return null;
        else if(diffy.change) return diffy.change;
        else return diffy;
    },

    applyBackwards : function(base, diff){
        return Util.Diff.applyBackwardsObj({arg: base}, {arg: {change: diff}})["arg"];
    },

};

/** A mapping of variable types to diffing functions
 * @type Object
 */
Util.Diff.diffFunc = { "string" : Util.Diff.diffStr,
                       "number" : Util.Diff.diffInt,
                       "boolean" : Util.Diff.diffBool,
                       "objectid" : Util.Diff.diffBool,
                       "Object" : Util.Diff.diffObj,
                       "Array" : Util.Diff.diffArray,
                       "Date" : Util.Diff.diffDate
                     };
