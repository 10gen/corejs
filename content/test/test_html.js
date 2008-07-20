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

core.content.html();

var cases = [["Hello&ladies!", "Hello&amp;ladies!"],
             ["5 < 7", "5 &lt; 7"],
             ["std::vector<int> v;", "std::vector&lt;int&gt; v;"]]

for(var i in cases){
    assert(content.HTML.escape_html(cases[i][0]) == cases[i][1]);
    assert(cases[i][0] == content.HTML.unescape_html(cases[i][1]));
}

var cases = [["Hello <br> ladies", "Hello  ladies"],
    ["Hello &lt; ladies", "Hello  ladies"],
             ["<b>Hello ladies</b>", "Hello ladies"],
             ["<hi there guys", "<hi there guys"],
             ["<b>you</b> <i>there</i>", "you there"]
];


for(var i in cases){
    assert(content.HTML.strip(cases[i][0]) == cases[i][1]);
}
