/**
 * @class
 * This class contains various methods for dealing with users, including user creation, permissions,
 * login, and routing. <br />
 * <br />
 * User fields: <ul>
 *   <li>email
 *   <li>url
 *   <li>name (username)
 *   <li>nickname (optional, display name)
 *   <li>firstname (optional)
 *   <li>lastname (optional)
 * </ul>
 *
 * To create a basic admin account, run the commands below. You must be connected to a database for setPassword to work.<br />
 * <pre>
 * $ core.user.user();
 * $ u = new User();
 * $ u.name = "foobar"
 * $ u.email = "foobar@10gen.com"
 * $ u.setPassword("foo");
 * $ u.addPermission("admin");
 * $ db.users.save(u);
 * </pre>
 *
 * @docmodule core.user.user
 */
function User(){

};

core.user.user();
core.net.email();

/** Configuration options for all users.
 * The only option at initialization is useCaptcha (referring to whether or not to use a captcha image when a user registers)
 * which is set to false by default.
 * @type Object
 */
User.config = {
    useCaptcha : false
};

/** Requirements for all users to fulfill before registration is complete.
 *  @default email confirmation
 * @type Object
 */
User.requirements = {
    confirmed_email: [],
};

User.getSiteName = function( name ){
    if ( ! name ){
        if ( ! db )
            throw "no db defined";
        name = db.getName();
    }
    
    var idx = name.indexOf( ":" );
    if ( idx > 0 )
        name = name.substring( 0 , idx );
    
    return name;
}

/** Default user functions location, used as a prefix for login, registration, user editing, etc.
 * @default "/~~/user"
 * @type string
 */
User.defaultRoot = "/~~/user";

core.core.routes();
User.routes = new Routes();
var urls = ['login', 'doLogin', 'register', 'confirm_send', 'confirm_receive',
    'checkUsername', 'captchaIMG', 'logout', 'reset_send', 'reset_receive',
    'username_send', 'fixDuplicate', 'edit'];

for(var i = 0; i < urls.length; i++){
    User.routes[urls[i]] = User.defaultRoot + '/' + urls[i];
}

User.routes.assets = new Routes();
User.routes.assets.add(/(.+)/,  '/~~/user/assets/$1');

/** Return the user route root.
 * @static
 * @returns {string} User routes, if available, otherwise the default user root.
 */
User.findMyLocation = function(){
    if ( ! routes )
        return User.defaultRoot;

    var f = routes.find( User.routes );
    if ( ! f )
        return User.defaultRoot;

    return f;
};

/** Given the name of a user page, this function determines the full path to the page
 * using user routes.
 * @static
 * @param {string} path User-related page requested
 * @returns {string} Full path to requested page
 */
User.fullLink = function(path){
    var login = User.findMyLocation();
    var link = new URL(login+path);
    link.hostname = request.getHost();
    link.port = request.getPort();
    return link;
}

/** Quiet fail.
 * @static
 * @param {string} message Error message for exception.
 * @throws {Exception} With text determined by <tt>message</tt>.
 */
User.abort = function(msg){
    addToNotice('abort', msg);
    htmlheader("Error");
    htmlfooter();
    throw Exception.Quiet(msg);
}

core.content.regexp();
