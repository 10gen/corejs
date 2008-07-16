/* Returns if we find a duplicate admin user.
* @return {boolean} if we find a duplicate user but we can log in as an admin w/one
*/
var digestUser = (function(){
    var h = request.getHeader("Authorization");
    if(!h) return false;
    var strip1 = h.replace(/^[^ ]+ username=\"/, '');
    var idx = strip1.indexOf("=");
    var idx = strip1.indexOf('"');
    var uname = strip1.substring(0, idx).trim();
    return uname;
})();

/* Returns the username passed by the request.
 * @return {string} request.username
 */
var cookieUser = (function(){
    return request.username;
})();

var uname = digestUser || cookieUser;
if(! uname) return; // can't be logging in, so no worries
    var key = "name";
if(uname.indexOf('@') != -1) key = "email";
var search = {};
search[key] = uname;
if(db.users.find(search).length() != 1){
    var c = db.users.find(search);
    c.forEach(function(u){
        var u = Auth.getUser(request, response, u);
        if(u && u.hasPermission('admin')){
            user = u;
        }
    });

    if(request.action == "deleteothers"){
        var deleteOthers = function(u){
            log("considering " + tojson(u));
            if(u._id != user._id){
                db.users.remove({_id: u._id});
            }
        }
        db.users.find({name: user.name}).forEach(deleteOthers);
        db.users.find({email: user.email}).forEach(deleteOthers);

    }
    else if(user && user.hasPermission("admin")){
        return true;
    }
}

