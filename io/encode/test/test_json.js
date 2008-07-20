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

core.io.encode.json();

objEqual = function(a, b){
    // Freakin' ridiculous that I have to implement this in JS
    if(a == b)
        return true;
    if(a instanceof Array){
        if(! (b instanceof Array) || a.length != b.length) return false;
        for(var i = 0; i < a.length; i++){
            if(! objEqual(a[i], b[i])){
                return false;
            }
        }
        return true;
    }

    var bfields = Object.keys(b);
    for(var field in a){
        if(!(field in b)){
            return false;
        }
        if(! objEqual(a[field], b[field])){
            print(a[field] + " != " + b[field]);
            return false;
        }
        bfields.remove(bfields.indexOf(field));
    }
    if(bfields.length > 0) return false;
    return true;
};

var objects = ["abc", 5, [1, 2, 3], ["abc", 4],
    {a: 4, b: "abc"}, [{a: 5, b: "abc"}, {a: "ccc", b: {c: "note", d: null}}],
    {A: true, "abc.d\"ef": false}];

for(var i = 0; i < objects.length; i++){
    o1 = objects[i];
    var s = io.Encode.JSON(o1);
    print(s);
    o2 = scope.eval("(" + s.replace(/\n/g, '') + ")");
    print(io.Encode.JSON(o2));
    assert(objEqual(o1, o2));
}

var s = "a\nb";
var s2 = io.Encode.JSON(s);
var o2 = scope.eval(s2);
assert(s == o2);
