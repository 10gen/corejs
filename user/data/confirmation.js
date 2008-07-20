// Class representing an account waiting to be confirmed
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

User.Confirmation = function(user){
    this.user = user;
};

core.db.dbutil();
dbutil.associate(User.Confirmation, db.users.confirmations);
db.users.confirmations.setConstructor(User.Confirmation);

core.net.url();

core.core.mail();

User.Confirmation.prototype.send = function(){
    this.save();

    if( ! mail){
        log.user.confirmation.error( "want to send confirmation but no mail configured" );
        return;
    }

    // Send a mail to the user
    var subj = "[" + siteName + "] Confirmation email";
    var link = User.fullLink('/confirm_receive').addArg('id', this._id.toString()).toString();

    var body = "Dear "+ this.user.getDisplayName() + "\n" +
        "\n"+
        "Thanks for registering with "+siteName+". Before your user account is activated, you must verify your email address. Please click the link below or copy and paste it into your browser.\n"+
        "\n"+
        "Your username: "+this.user.name+"\n"+
        "\n"+
        link+"\n"+
        "\n"+
        "Regards,\n"+
        "\n"+
        siteName;

    m = new Mail.Message( subj, body );
    m.addRecipient(  this.user.email  );
    m.send( mail );
};
