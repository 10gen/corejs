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

log.threaded.data.reply.debug("Running replyfile. threaded="+threaded + " data="+threaded.data);
core.content.html();
core.content.simple();
core.net.url();

/** Initializes a generic reply.
 * @constructor
 */
threaded.data.Reply = function(){
    this.ts = new Date();
    this.author = "";
    this.title = "";
    this.content = "";
    this.deleted = false;
};

/** Return a copy of an array of replies sorted based on timestamp.
 * @param {Array} ary Array of replies.
 * @return {Array} Sorted array copy.
 */
threaded.data.Reply.sort = function(ary){
    ary = ary.filter(function(u){return u});
    return ary.slice().sort( function(a, b) {
        return a.ts - b.ts;
    });
};

/** Call a rendering function on this reply.
 * @param {string} part Can be "threaded.replies", "threaded.replylink", or "threaded.replyform".
 * @param {Object} options Passed to renderer.  If options.replyable is null and <tt>part</tt> is set to "threaded.replies", options.replyable will be set to this reply's threaded_replyable.
 */
threaded.data.Reply.prototype.decoratorsRender = function(part, options){
    part = part || "replies";
    options = options || {};
    if(part == "threaded.replies"){
        if(options.replyable == null) options.replyable = this.threaded_replyable;
        var reps = this.getReplies();
        for (var i in reps){
            if(i == "_dbCons") continue;
            reps[i].render(options, this.threaded_pieces);
        }
    }
    if(part == "threaded.replylink"){
        if(! request.reply || request.reply_target){
            u = new URL(request.getURL()).replaceArg("reply", "true").toString();
            print("<a href=\""+u+"\">Reply</a>");
        }
    }
    if(part == "threaded.replyform"){
        if(request.reply == "true" && ! request.reply_target){
            this.threaded_pieces.reply_form.call(this, true, options);
        }
    }

};

/** Checks if reply is valid.
 * @param {anytype} r Content/reply to check.
 * @return {boolean} true
 */
threaded.data.Reply.prototype.validateReply = function(r){
    return true;
};

/** Escape HTML in a reply to guard against cross site scripting attacks and replace newlines with &lt;br /&gt;s.
 * @param {string} text String to be encoded.
 * @return {string} Encoded HTML.
 */
threaded.data.Reply.prototype.encodeContent = function(txt){
    var s = new content.Simple();
    txt = content.HTML.escape_html(txt);
    txt = s.toHtml(txt);
    return txt;
};

/** Add a reply.
 * @param {Object} [args={}]
 * @return {boolean} true
 */
threaded.data.Reply.prototype.decoratorsHandle = function(args){
    var ret = false;
    args = args || {};
    if(request.reply_target){
        var desc = this.getDescendant(request.reply);
        r = new this.Reply();
        if(this.threaded_users == "free"){
            r.author_name = request.nauthor;
            r.author_email = request.nemail;
            r.author_url = request.nurl;
        }
        else{
            r.author_name = user.getDisplayName();
            r.author_email = user.email;
            r.author_url = user.url;
            r.author = user;
        }
        r.title = request.ntitle;
        r.content = this.encodeContent(request.ncontent);
        r.ip = request.getRemoteIP();
        r.useragent = request.getHeader('User-Agent');
        if(this.validateReply(r)){
            desc.addReply(r);
            ret = r;
        }
    }
    return ret;
};

/** Use either the default or a user-passed function to render the replies.
 * @param {Object} options Any rendering options
 * @param {Object} pieces If pieces.reply is a function, pass it this reply to render
 */
threaded.data.Reply.prototype.render = function(options, pieces){
    pieces = pieces || core.threaded.html;
    pieces.reply(this, options);
};

/** Initializes a given reply with 0 posts.
 * @param {Object} obj Reply to initialize.
 */
threaded.data.Reply.initialize = function(obj){
    obj.threaded_numPosts = 0;
};

core.util.format();

log.threaded.data.reply.level = log.LEVEL.ERROR;
