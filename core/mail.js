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

/** @namespace Functions for sending and receiving email
 * @docmodule core.core.mail
 */
Mail = {};

/** The mail log: log.core.mail
 * @type log
 */
Mail.log = log.core.mail;
/** to, cc, and bcc
 * @type Array
 */
Mail.recipientTypes = [ "to" , "cc" , "bcc" ];
Mail.recipientTypesJava = [ javaStaticProp( "javax.mail.Message:RecipientType" , "TO" ) ,
                            javaStaticProp( "javax.mail.Message:RecipientType" , "CC" ) ,
                            javaStaticProp( "javax.mail.Message:RecipientType" , "BCC" ) ];

/** @constructor Message creation and sending functions
 * @param {string} subject Email subject line.
 * @param {string} content Email message content.
 * @docmodule core.core.mail.message
 */
Mail.Message = function( subject , content ){
    this.subject = subject;
    this.content = content;
};

/** Add a recipient to the message.
 * @param {string} to email address
 * @param {string} type can be null, or "to" , "cc" , "bcc"
 */
Mail.Message.prototype.addRecipient = function( addr , type ){
    type = ( type || "to" ).toLowerCase();


    if ( ! Mail.recipientTypes.contains( type ) )
        throw " don't know type [" + type + "]";

    if ( ! this[ type ] )
        this[type] = Array();

    this[type].push( addr );

    Mail.log.debug( "added recipient for type [" + type + "]" );
};

/** Send the message.
 * @param {Mail.SMTP} smtp SMTP object
 */
Mail.Message.prototype.send = function( smtp ){
    var m = javaCreate( "javax.mail.internet.MimeMessage" , smtp._session );

    m.setFrom( javaCreate( "javax.mail.internet.InternetAddress" , smtp.addr ) );
    m.setSubject( this.subject );
    m.setContent( this.content , "text/plain" );

    for ( var i=0; i<Mail.recipientTypes.length; i++ ){

        var type = Mail.recipientTypes[i];

        if ( ! this[type] )
            continue;

        var realType = Mail.recipientTypesJava[i];

        this[type].forEach( function(z){
                                m.addRecipient( realType , javaCreate( "javax.mail.internet.InternetAddress" , z ) );
                            } );

    }

    javaStatic( "javax.mail.Transport" , "send" , m );
};

/** @constructor Creates an object for sending email via SMTP.
 * @param {string} addr Address of email sender
 * @param {string} server Host server
 * @param {string} username Email username
 * @param {string} password Email password
 * @param {boolean} [ssl=false] If ssl should be used
 * @param {number} [port] Port to use.  Default is 465 or 25, depending on whether ssl is on or off.
 * @docmodule core.core.mail.smtp
 */
Mail.SMTP = function( addr , server , username , password , ssl , port ){

    this.addr = addr;
    this.server = server;
    this.username = username;
    this.password = password;

    this.ssl = ssl || false;
    this.port = port || ( ssl ? 465 : 25 );

    if ( ! this.server )
        throw "server is required";

    if ( ! this.username )
        throw "username is required";

    if ( ! this.password )
        throw "password is required";

    this._props = javaCreate( "java.util.Properties" );
    this._props.setProperty( "mail.smtp.host" , this.server );
    this._props.setProperty( "mail.smtp.auth" , "true" );
    this._props.setProperty( "mail.smtp.port" , this.port );

    this._props.setProperty( "mail.smtp.socketFactory.port" , this.port );

    // only if we want SSL should we use SSL...
    if (ssl) {
        this._props.setProperty( "mail.smtp.socketFactory.class" , "javax.net.ssl.SSLSocketFactory" );
    }

    this._props.setProperty( "mail.smtp.socketFactory.fallback" , "false" );

    this._session = javaStatic( "ed.util.MailUtil" , "createSession" , this._props , this.username , this.password );

};

/* NOTE:
 * The algorithm the Python bridge uses to determine if something is a
 * constructor or a regular function is something like "if there is anything
 * in the prototype then it's a constructor, otherwise not". This SMTP
 * constructor, therefore, doesn't work in Python (where it's being used as
 * part of the AppEngine Mail API). By putting this little bit into the
 * prototype we get it to work.
 */
Mail.SMTP.prototype._hack_for_python = true;

/** Send message from a Gmail account.
 * @param {string} username Gmail username
 * @param {string} password Gmail password
 * @returns {Mail.SMTP} Gmail SMTP connection
 */
Mail.SMTP.gmail = function( username , password ){
    if ( ! username.match( /@gmail.com$/ ) )
        username += "@gmail.com";

    return new Mail.SMTP( username , "smtp.gmail.com" , username , password , true , 465 );
};


/** @constructor Creates a new imap session (not connected)
 * @param {string} addr Address of email sender
 * @param {string} server Host server
 * @param {string} username Email username
 * @param {string} password Email password
 * @param {boolean} ssl If ssl should be used
 * @param {number} port Port to use.
 * @docmodule core.core.mail.imap
 */
Mail.IMAP = function( addr , server , username , password , ssl , port ){

    this.addr = addr;
    this.server = server;
    this.username = username;
    this.password = password;

    this.starttls = {};
    this.starttls.enable = true;
    this.port = port;

    if ( ! this.server )
        throw "server is required";

    if ( ! this.username )
        throw "username is required";

    if ( ! this.password )
        throw "password is required";


    this._props = javaCreate( "java.util.Properties" );
    this._props.setProperty( "mail.imap.host" , this.server );
    this._props.setProperty( "mail.imap.port" , this.port );

    this._props.setProperty( "mail.imap.socketFactory.port" , this.port );
    this._props.setProperty( "mail.imap.socketFactory.class" , "javax.net.ssl.SSLSocketFactory" );
    this._props.setProperty( "mail.imap.socketFactory.fallback" , "false" );

    this._props.setProperty( "mail.debug", "true");
    this._session = javaStatic( "ed.util.MailUtil" , "createSession" , this._props , this.username , this.password );

};


/** Fetch messages from a Gmail inbox.
 * @param {string} username Gmail username
 * @param {string} password Gmail password
 * @returns {Array} An array of Java MimeMessages
 */
Mail.IMAP.gmail = function( username , password ){
    if ( ! username.match( /@gmail.com$/ ) )
        username += "@gmail.com";

    imap = new Mail.IMAP( username , "imap.gmail.com" , username , password , true , 993 );
    imap._session.setDebug(true);

    var store = imap._session.getStore("imap");
    store.connect("imap.gmail.com", 993, username, password);

    if(!store.isConnected()) {
        log("not connected");
        return;
    }

    var folder = store.getFolder("INBOX");
    if(!folder.exists()) {
        log("the folder does not exist.");
        return;
    }

    folder.open(1);
    return folder.getMessages();
};
