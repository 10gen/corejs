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
var log = log.content.test;

var test1 = xml.parseDomFromString('<root rattr1="rattr1Value"><child1 c1attr1="c1attr1Value" /></root>');
assert(test1.localName == "root");
assert(test1.attributes.rattr1.value == "rattr1Value");
assert(test1.elements[0].localName == "child1");
assert(test1.elements[0].attributes.c1attr1.value == "c1attr1Value");


var test2 = xml.parseDomFromString('<root xmlns="http://moo" xmlns:NS="http://moo2"><child1 attr1="attr1" NS:attr2="attr2" /><NS:child2 /></root>');
assert(test2.localName == "root");
assert(test2.qName == "root");
assert(test2.uri == "http://moo");

assert(test2.elements[0].localName=="child1");
assert(test2.elements[0].qName=="child1");
assert(test2.elements[0].uri=="http://moo");
assert(test2.elements[0].attributes["attr1"].qName=="attr1");
assert(test2.elements[0].attributes["attr1"].localName=="attr1");
assert(test2.elements[0].attributes["attr1"].uri=="");  //attributes don't inherit default namespace?
assert(test2.elements[0].attributes["attr1"].value=="attr1");
assert(test2.elements[0].attributes["NS:attr2"].qName=="NS:attr2");
assert(test2.elements[0].attributes["NS:attr2"].localName=="attr2");
assert(test2.elements[0].attributes["NS:attr2"].uri=="http://moo2");
assert(test2.elements[0].attributes["NS:attr2"].value=="attr2");
assert(test2.elements[1].localName=="child2");
assert(test2.elements[1].qName=="NS:child2");
assert(test2.elements[1].uri=="http://moo2");
