// Parent-based reply class.

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
threaded.data.ReplyParent = function(){
    threaded.data.Reply.call(this);
    this.parent = null;
};

threaded.data.ReplyParent.prototype = new threaded.data.Reply();
threaded.data.ReplyParent.prototype.constructor = threaded.data.ReplyParent;

threaded.data.ReplyParent.prototype.getReplies = function(){
    var q = db[this.threaded_tablename].find({parent: this});
    return q.sort({ts: 1}).toArray();
    return threaded.data.Reply.sort(q.toArray());
};

threaded.data.ReplyParent.prototype.addReply = function(rep){
    rep.parent = this;
    db[this.threaded_tablename].save(rep);
};

threaded.data.ReplyParent.prototype.getID = function(){
    return this._id;
};

threaded.data.ReplyParent.prototype.getDescendant = function(desc_id){
    if(desc_id == "true"){
        return this;
    }
    return db[this.threaded_tablename].findOne({_id: desc_id});
};

threaded.data.ReplyParent.saveDescendant = function(desc){
    db[this.threaded_tablename].save(desc);
};

threaded.data.ReplyParent.initialize = function(obj){
    threaded.data.Reply.initialize(obj);
};

threaded.data.ReplyParent.find_Query = function(query){
    return db[this.prototype.threaded_tablename].find(query);
};
