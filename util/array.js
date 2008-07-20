// array utility methods

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

/* true if elements distinct.
   Warning: not a particularly fast distinct implementation! 
*/
Array.prototype.distinct = function() { 
    for( var i = 0; i < this.length; i++ )
	for( var j = 1; j < this.length; j++ )
	    if( i!=j && this[i] == this[j] ) { 
		return false;
					     }
    return true;
}

Array.prototype.car = function() { return this[0]; }
Array.prototype.cdr = function() { return this.slice(1); }
