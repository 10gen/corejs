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

/* local source code filesystem access

   Normally you want to put your files in the database -- see f.jxp

   Note: subject to change, temp implementation.
*/

File = {};

/* creates a virtual file object, with content.  later you can write it out with 
   the writeToLocalFile() method.
*/
File.create = function( content ){
    return javaCreate( "ed.js.JSInputFile" , null , null , content );
};

File.open = function( file ){
    return openFile( file );
};

File.mkdirs = function( dir ){
    var temp = File.create( "garbage" );
    temp.writeToLocalFile( dir + "/.temp" );
};

File.join = function( s , e ){
    if ( s.endsWith( "/" ) )
        return s + e;
    return s + "/" + e;
};

File.read = function( file ){
    var f = File.open( file );
    if ( ! f.exists() )
        throw "file doesn't exist";
    return f.asString();
};

File.dirname = function( dirname ){
    var idx = dirname.lastIndexOf( "/" );
    if ( idx < 0 )
        return dirname;
    return dirname.substring( 0 , idx );
}
