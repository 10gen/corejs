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

core.util.format();
HTMLBuilder = {};

HTMLBuilder.element = function(attrs){
    this.attrs = attrs || {};
    this.children = [];
};

HTMLBuilder.element.prototype.add = function(elem){
    this.children.push(elem);
    return this;
};

HTMLBuilder.element.prototype.toString = function(){
    s = "";
    s += "<" + this.tagname;
    var attrs = Util.format_htmlattr(this.attrs);
    if(attrs)
        s += " " + attrs;
    if(this.children && this.children.length > 0){
        s += ">";
        this.children.forEach(function(c){ s += c.toString(); });
        s += "</" + this.tagname + ">";
    }
    else {
        s += "/>";
    }
    return s;
};

HTMLBuilder.a = function(attrs){
    HTMLBuilder.element.call(this, attrs);
};

HTMLBuilder.a.prototype = new HTMLBuilder.element();
HTMLBuilder.a.prototype.tagname = "a";

HTMLBuilder.form = function(attrs){
    HTMLBuilder.element.call(this, attrs);
};

HTMLBuilder.form.prototype = new HTMLBuilder.element();
HTMLBuilder.form.prototype.tagname = "form";

HTMLBuilder.select = function(attrs){
    HTMLBuilder.element.call(this, attrs);
};

HTMLBuilder.select.prototype = new HTMLBuilder.element();
HTMLBuilder.select.prototype.tagname = "select";

HTMLBuilder.input = function(attrs){
    HTMLBuilder.element.call(this, attrs);
};

HTMLBuilder.input.prototype = new HTMLBuilder.element();
HTMLBuilder.input.prototype.tagname = "input";

HTMLBuilder.option = function(attrs){
    HTMLBuilder.element.call(this, attrs);
};

HTMLBuilder.option.prototype = new HTMLBuilder.element();
HTMLBuilder.option.prototype.tagname = "option";
