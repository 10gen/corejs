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

/** Default user agent: "10gen/1.0"
 * @type string
 */
ws.akismet.USER_AGENT = '10gen/1.0';
/** Default host: "rest.akismet.com/1.1"
 * @type string
 */
ws.akismet.HOST = 'rest.akismet.com/1.1';

log.ws.akismet.level = log.LEVEL.ERROR;

/**
 * Akismet Client
 *
 * Specification: http://akismet.com/development/api/
 *
 * @param {string} apiKey
 * @param {string} blogUri
**/
ws.akismet.Akismet = function(apiKey, blogUri) {
    // member variables
    this.apiKey = apiKey || '';
    this.blogUri = blogUri|| '';
    this.contentType = 'application/x-www-form-urlencoded';
    this.isAsynchronous = false;
    this.xmlHTTPRequest = new XMLHttpRequest();
};

ws.akismet.Akismet.prototype.__remoteMethod = function(method, userIp, userAgent, commentAuthor, commentContent, commentAuthorEmail, commentAuthorUrl) {
    var url = 'http://' + this.apiKey + '.' + ws.akismet.HOST + '/' + method;
    log.ws.akismet.debug ('Calling REST Method: ' + url);

    // This could re-use the XMLHttpRequest but there's currently a bug
    // and it doesn't get us anything so why bother.
    this.xmlHTTPRequest = new XMLHttpRequest("POST", url, this.isAsynchronous);
    this.xmlHTTPRequest.setRequestHeader("Content-Type", this.contentType);
    this.xmlHTTPRequest.setRequestHeader("User-Agent", ws.akismet.USER_AGENT);

    var content = 'blog=' + escape(this.blogUri);
    content += '&user_ip=' + escape(userIp);
    content += '&user_agent=' + escape(userAgent || ws.akismet.USER_AGENT);
    content += '&comment_author=' + escape(commentAuthor);
    if(commentAuthorEmail){
        content += '&comment_author_email=' + escape(commentAuthorEmail);
    }
    if(commentAuthorUrl){
        content += '&comment_author_url=' + escape(commentAuthorUrl);
    }
    content += '&comment_type=comment';
    content += '&comment_content=' + escape(commentContent);

    log.ws.akismet.debug('Content string: ' + content);

    this.xmlHTTPRequest.send(content);

    // handle the response from the server
    // TODO: rewrite this as a switch statement
    if (this.xmlHTTPRequest.status == 200) {
        log.ws.akismet.debug('Got Response: ' + this.xmlHTTPRequest.responseText);
        if( this.xmlHTTPRequest.responseText == 'invalid' ){
            log.ws.akismet.debug( 'Failed due to ' +this.xmlHTTPRequest.headers['X-akismet-debug-help']);
        }
        return this.xmlHTTPRequest.responseText;
    } else {
        // there's a lower level issue, so fail
        log.ws.akismet.ERROR("Error: " + this.xmlHTTPRequest.status + ': ' + this.xmlHTTPRequest.statusText);
        return null;
    }
};

/** Sends a request to the akismet host to verify the api key
 * @return {boolean} true if the api key is valid.
 */
ws.akismet.Akismet.prototype.verifyKey = function() {
    var url = 'http://' + ws.akismet.HOST + '/verify-key';
    log.ws.akismet('Calling REST Method: ' + url);

    this.xmlHTTPRequest.open("POST", url, this.isAsynchronous);
    this.xmlHTTPRequest.setRequestHeader("Content-Type", this.contentType);
    this.xmlHTTPRequest.setRequestHeader("User-Agent", ws.akismet.USER_AGENT);

    var content = 'blog=' + escape(this.blogUri);
    content += '&key=' + escape(this.apiKey);

    log.ws.akismet.debug('Request Content: ' + content);

    this.xmlHTTPRequest.send(content);

    // handle the response from the server
    // TODO: rewrite this as a switch statement
    if (this.xmlHTTPRequest.status == 200) {
        // got a valid method response, so process it
        log.ws.akismet.debug('Got Response: ' + this.xmlHTTPRequest.responseText);
        return this.xmlHTTPRequest.responseText == 'valid';
    } else {
        // there's a lower level issue, so fail
        log.ws.akismet.error("Error: " + this.xmlHTTPRequest.status + ': ' + this.xmlHTTPRequest.statusText);
    }
};

/** Checks that a comment is valid (isn't spam)
 * @param {string} userIp IP of the user who submitted the comment
 * @param {string} userAgent Submitter's user agent
 * @param {string} commentAuthor Submitter's name
 * @param {string} commentContent The text of the comment
 * @param {string} commentEmail [Optional] The email address of the commenter.
 * @param {string} commentUrl [Optional] The "personal" url of the commenter.
 * @return {boolean} true if the comment is valid
 */
ws.akismet.Akismet.prototype.commentCheck = function(userIp, userAgent, commentAuthor, commentContent, commentEmail, commentUrl) {
    var response = this.__remoteMethod('comment-check', userIp, userAgent, commentAuthor, commentContent, commentEmail, commentUrl);
    if( ! response ){
        return null;
    }
    // got a valid method response, so process it
    return this.xmlHTTPRequest.responseText == 'false';
};

/** Tells akismet that a comment is spam
 * @param {string} userIp IP of the user who submitted the comment
 * @param {string} userAgent Submitter's user agent
 * @param {string} commentAuthor Submitter's name
 * @param {string} commentContent The text of the comment
 * @param {string} commentEmail [Optional] The email address of the commenter.
 * @param {string} commentUrl [Optional] The "personal" url of the commenter.
 * @return {boolean} true if akismet successful processed the request
 */
ws.akismet.Akismet.prototype.submitSpam = function(userIp, userAgent, commentAuthor, commentContent, commentEmail, commentUrl) {
    return this.__remoteMethod('submit-spam', userIp, userAgent, commentAuthor, commentContent, commentEmail, commentUrl);
};

/** Tells akismet that a comment is ham
 * @param {string} userIp IP of the user who submitted the comment
 * @param {string} userAgent Submitter's user agent
 * @param {string} commentAuthor Submitter's name
 * @param {string} commentContent The text of the comment
 * @param {string} commentEmail [Optional] The email address of the commenter.
 * @param {string} commentUrl [Optional] The "personal" url of the commenter.
 * @return {boolean} If akismet successful processed the request
 */
ws.akismet.Akismet.prototype.submitHam = function(userIp, userAgent, commentAuthor, commentContent, commentEmail, commentUrl) {
    return this.__remoteMethod('submit-ham', userIp, userAgent, commentAuthor, commentContent, commentEmail, commentUrl);
};
