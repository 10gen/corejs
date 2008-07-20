// html2.js

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

/* Usage
  
   print( div( {cls: "foo", id: "bar"}, "hello" ) );

   div( { hidden : true } );           // style visibility hidden

   form();
   input( { name: "fieldname", size : 40, value: "initial" } );
   textarea( { name: "fieldname", cols : 40, rows : 20 } );
   _form();

   ul("string");
   ul(function);

   li(...);
   

 */

function _genTag(name, args) {
 var s = '<' + name;
 s += '>';
 if( args[0] ) s += args[0];
 s += '</' + name + '>';
 return s;
}

function td() { return _genTag("td", arguments); }
function th() { return _genTag("th", arguments); }

function tr(x,opts) { 
    if( isArray(x) ) { 
	var elem = opts && opts.header ? "th" : "td";
	var s = "<tr>";
	for( var z in x )
	    s = s + "<" + elem + ">" + x[z] + "</" + elem + ">";
	return s + "</tr>\n";
    }
    return _genTag("tr", arguments); 
}







/*






function __echoAttribute(x,v) { 
    if( v )
	print(v + '="'+x[v]+'" ');
}

function A(url, text) {
    return '<a href="'+url+'">'+text+'</a>';
}

function a(url,text) { print( A(url,text) ); }

// todo: take extra arguments here and call __finishTag
function __doTag(name,x) { 
    var r = '<'+name+'>';
    if( typeof(x) == 'function' ) { 
	var val = x(); // todo: fix use =='function'
        if( val!=null ) print(val);
    }
    else print(x);
    print('</'); print(name); print('>');
}

function ul(x) { 
    __doTag("ul",x);
}

function li(x) { 
    __doTag("li", x);
}

function textarea(x) { 
    print('<textarea rows="'+x.rows+' cols="'+x.cols+'>');
    __echoAttribute(x,"name");
    var value = request[x.name] || x.value;
    if( value ) print(value);
    print('</textarea>\n');
}

function input(x) {
    print('<input ');
    __echoAttribute(x,"size");
    var value = request[x.name] || x.value;
}

function __finishTag(endtag, args) {
    var x = args[0];
    if( x.cls ) print(' class="'+x.cls+'"');
    __echoAttribute(x,"id"); 
    if( x.hidden ) print(' style="visibility: hidden;"');
    print('>');
    if( args[1] ) { print(args[1]); endtag(); }
}

function tr(x) { __doTag("tr",x); }
function td(x) { __doTag("td",x); }
function th(x) { __doTag("th",x); }

*/
