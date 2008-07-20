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

core.content.htmlbuilder();

s = "<a style=\"mylink\">Click here</a>";
h = new HTMLBuilder.a({style: "mylink"}).add("Click here");

assert(s == h.toString());

hb = HTMLBuilder;
s = '<form><input type="hidden" name="select" value="someID"/><input type="hidden" name="action" value="sticky"/><input type="submit" value="go"/></form>';
h = new hb.form()
.add(new hb.input({type: 'hidden', name: 'select', value: 'someID'}))
.add(new hb.input({type: 'hidden', name: 'action', value: 'sticky'}))
.add(new hb.input({type: 'submit', value: 'go'}));

assert(s == h.toString());

s = '<form><a>text</a></form>';
h = new hb.form().add(new hb.a().add("text"));

assert(s == h.toString());

exit();
