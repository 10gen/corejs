// Children-based reply class.
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

core.threaded.data.reply();

threaded.data.ReplyChildren = function(){
    threaded.data.Reply.call(this);
    this.threaded_children = [];
    this.threaded_children._dbCons = this.__constructor__;
    this.parentid = "";
    this.index = "";
};

threaded.data.ReplyChildren.prototype = new threaded.data.Reply();
threaded.data.ReplyChildren.prototype.constructor = threaded.data.ReplyChildren;

threaded.data.ReplyChildren.prototype.getReplies = function(){
    var ary = this.threaded_children;
    return threaded.data.Reply.sort(ary);
};

threaded.data.ReplyChildren.prototype.addReply = function(r){
    r.index = this.threaded_children.push(r)-1;
    r.parentid = (this.getID && this.getID());
};

threaded.data.ReplyChildren.prototype.getID = function(){
    return this.parentid? this.parentid + '.': "" + this.index.toFixed(0);
};

threaded.data.ReplyChildren.prototype.getDescendant = function(desc_id){
    if(desc_id == "true"){
        return this;
    }
    var ary = desc_id.split(/\./);
    return threaded.data.ReplyChildren.prototype.getDescendantFromArray.call(this, ary);
};

threaded.data.ReplyChildren.prototype.getDescendantFromArray = function(ary){
    var child = this;
    for(var i in ary){
        var index = ary[i];
        child = child.threaded_children[index];
    }
    return child;
};

threaded.data.ReplyChildren.prototype.removeDescendant = function(desc_id){
    this.placeDescendant(null, desc_id);
};

threaded.data.ReplyChildren.prototype.placeDescendant = function(r, desc_id){
    var ary = desc_id.split(/\./);
    var last = ary.pop();

    var child = threaded.data.ReplyChildren.prototype.getDescendantFromArray.call(this, ary);
    child.threaded_children[last] = r;
};

threaded.data.ReplyChildren.prototype.threaded_reorderChildren = function(){
    this.threaded_children = threaded.data.Reply.sort(this.threaded_children);
};

threaded.data.ReplyChildren.prototype.saveDescendant = function(desc_id){
    // Be sure to save your object too!
};

threaded.data.ReplyChildren.initialize = function(obj){
    threaded.data.Reply.initialize(obj);
    obj.threaded_children = [];
    obj.threaded_children._dbCons = obj.Reply;
};
