// apc.js

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

// not really done

// must be loaded in _init.js so that cache is in the server-wide scope

apc = { 
    cache: { },
    constants: { }
};

function apc_define_constants(name, c) { 
    var n = 0;
    for( var i in c ) n++;
    print("<pre>apc_define_constants " + name + " defines " + n + " constants\n");
    apc.constants[name] = c;
    return true;
}

function apc_load_constants(name) { 
    var c = apc.constants[name];
    if( c ) {
	for( i in c ) {
	    globals[i] = c[i];
	}
	return true; 
    }
    print("loadconstants returns false\n");
    return false;
}
