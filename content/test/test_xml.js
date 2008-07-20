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

core.content.xml();
s = "<thingy attr='name'>hi</thingy>";

function dump(s){
    s = s.replace(/<!--.*?-->/gm, "");
    f = xml._xmlTokenizerchar(s);
    while(true){
        tok = f();
        if (tok == -1) break;
        print(tok);
    }
}

x = xml.fromString(s);
assert(x._name == "thingy");
assert(x._props.attr == "name");
assert(x.$ == "hi");

s = "<recursetest attr='noobs' hello=\"goodbye\"><hello>test</hello></recursetest>";

x = xml.fromString(s);

assert(x._name == "recursetest");
assert(x._props.attr == "noobs");
assert(x._props.hello == 'goodbye');
assert(x.children[0]._name == "hello");
assert(x.children[0]._props == null);
assert(x.children[0].$ == "test");

s = "<emptytest/>"

x = xml.fromString(s);

assert(x._name == "emptytest");
assert(x.$ == null);

s = "<multtest><elem1>hi</elem1><elem2>yo</elem2></multtest>";

x = xml.fromString(s);

assert(x._name == "multtest");
assert(x.children[0]._name == "elem1");
assert(x.children[0].$ == "hi");
assert(x.children[1]._name == "elem2");
assert(x.children[1].$ == "yo");

s = "<listtest><elem>hi</elem><elem>hi2</elem></listtest>";

x = xml.fromString(s);

assert(x._name == "listtest");
assert(x._props == null);
assert(x.children[0]._name == "elem");
assert(x.children[0].$ == "hi");
assert(x.children[1]._name == "elem");
assert(x.children[1].$ == "hi2");

s = "<nulllisttest><elem/><elem>hi</elem></nulllisttest>";
x = xml.fromString(s);


assert(x._name == "nulllisttest");
assert(x.children[0]._name == "elem");
assert(x.children[0].$ == null);
assert(x.children[1].$ == "hi");
assert(x.children[1]._name == "elem");

s = "<?xml version=\"1.0\" ?><methodResponse><params><param><value><struct><member><name>difference</name><value><i4>3</i4></value></member><member><name>sum</name><value><i4>9</i4></value></member></struct></value></param></params></methodResponse>";
x = xml.fromString(s);

assert(x.children[0].children[0].children[0].children[0].children[0]._name == "member");
assert(x.children[0].children[0].children[0].children[0].children[0].children[0]._name == "name");
assert(x.children[0].children[0].children[0].children[0].children[0].children[0].$ == "difference");

s = "        <     ?        xml         version        =        \"1.0\"        ?        ><     spaceytest       a       =       'yo'         >        <        elem         /        >       <         elem2        >hi<        /           elem2        >       <       / spaceytest      >";

//dump(s);
x = xml.fromString(s);
assert(x._name == "spaceytest");
assert(x._props.a == "yo");
assert(x.children[0].$ == null);
assert(x.children[0]._name == "elem");
assert(x.children[1]._name == "elem2");
assert(x.children[1].$ == "hi");


s = "  \n< \n  ?  xml   version  =  \"1.0\"  \n?  >\n  <  newlinetest \n  > \t <  \n elem\tattr\n= 'hi'\t>  \ncdata     \n \t< \n/\telem>\t<\nelem\n\t/><elem /\n> </newlinetest>";
newlinetest = s;
x = xml.fromString(s);

assert(x._name == "newlinetest");
assert(x.children[0]._props.attr == "hi");
assert(x.children[0]._name == "elem");
assert(x.children[0].$ == "cdata");
assert(x.children[1]._name == "elem");
assert(x.children[1].$ == null);
assert(x.children[2]._name == "elem");
assert(x.children[2].$ == null);

var x = xml.fromString("<result><param><value>0</value><value>1</value></param><value>3</value></result>");

var f = xml.find(x, {_name: "value"});
assert(f.length == 3);
assert(f[0]._name == "value");
assert(f[1]._name == "value");
assert(f[2]._name == "value");

var s = "<pctest>hi<elem>1</elem>sup<elem>2</elem>yeah</pctest>";
var x = xml.fromString(s);

assert(x._name == "pctest");
assert(x.children[0]._name == "PCDATA");
assert(x.children[0].$ == "hi");
assert(x.children[1]._name == "elem");
assert(x.children[1].$ == "1");
assert(x.children[2]._name == "PCDATA");
assert(x.children[2].$ == "sup");
assert(x.children[3]._name == "elem");
assert(x.children[3].$ == "2");
assert(x.children[4]._name == "PCDATA");
assert(x.children[4].$ == "yeah");

var s = "<ctest><![CDATA[<greeting>hello</greeting>]]></ctest>";
var x = xml.fromString(s);
assert(x.$ == "<greeting>hello</greeting>");

var s = "<ctest><![CDATA[<greeting>hello&amp;</greeting>]]></ctest>";
var x = xml.fromString(s);
assert(x.$ == "<greeting>hello&amp;</greeting>");

var s = "<ctest>&lt;greeting&gt;</ctest>";
var x = xml.fromString(s);
assert(x.$ == "<greeting>");

var s = "<?xml version=\"1.0\"?><!-- ignore me\n--><result/>";
var x = xml.fromString(s);
assert(x._name == "result");

var s = "<?xml version=\"1.0\"?><ns:whoo f:attr=\"namespace\">test</ns:whoo>";
var x = xml.fromString(s);
assert(x._name == "ns:whoo");
assert(x.$ == "test");

var s = "<?xml version=\"1.0\"?><result><!-- comment 1 -->hi<!-- comment 2 --></result>";
var x = xml.fromString(s);
assert(x.$ == "hi");

var s = "<moo>hi</moo>invalid";
var e = true;
try {
    var x = xml.fromString(s);
    e = false;
}
catch (e) {
    print(e);
}
assert(e);

var s = "invalid";
var e = true;
try {
    var x = xml.fromString(s);
    e = false;
}
catch(e) {
    print(e);
}
assert(e);

var s = "<abc></invalid>";
var e = true;

try {
    var x = xml.fromString(s);
    e = false;
}
catch(e) {
    print(e);
}
assert(e);


// JSON test
var s = "<abc>text</abc>";
var j = xml.parseJsonFromString(s);
assert(Object.keys(j).length == 1);
assert(j.abc.length == 1);
assert(j.abc[0] == "text");

var s = "<abc><def>text</def><ghi>more text</ghi></abc>";
var j = xml.parseJsonFromString(s);
assert(Object.keys(j).length == 1);
assert(Object.keys(j.abc[0]).length == 2);
assert(j.abc[0].def[0] == "text");
assert(j.abc[0].ghi[0] == "more text");

var s = "<abc><def>word1</def><def>word2</def></abc>";
var j = xml.parseJsonFromString(s);
assert(Object.keys(j).length == 1);
assert(Object.keys(j.abc).length == 1);
assert(j.abc[0].def.length == 2);
assert(j.abc[0].def[0] == "word1");
assert(j.abc[0].def[1] == "word2");

var s = "<abc foo='bar'/>";
var j = xml.parseJsonFromString(s);
assert(Object.keys(j).length == 1);
assert(j.abc.length == 1);
assert(j.abc[0]._props.foo == "bar");

var s = "<abc foo='bar'>words</abc>";
var j = xml.parseJsonFromString(s);
assert(Object.keys(j).length == 1);
assert(j.abc.length == 1);
assert(j.abc[0]._props.foo == "bar");
assert(j.abc[0] == "words");
