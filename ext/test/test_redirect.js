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

core.ext.redirect();

var assertThrows = function(f){
    var exc = null;
    try{
        f();
    }
    catch(e){
        exc = e;
    }
    assert(exc);
};

assertThrows(function(){ Ext.redirect(null); });

var out = Ext.redirect(function(){
    print("Hi");
    return 4;
});

assert(out.output == "Hi");
assert(out.value == 4);

assertThrows(function(){
    Ext.redirect(function(){
        throw "Hi";
    });
});

var out = Ext.redirect(function(){
    print("Yo");
    // no return
});

assert(out.output == "Yo");
assert(!out.value);
