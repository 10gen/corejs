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

core.content.xml();

/**
 * Creates a new XML-RPC Client.
 *
 * Specification: http://www.xmlrpc.com/spec
 *
 * @param {string} [host=""] Name of the RPC host
 * @param {number} [port=80] Port to use
 * @param {string} [path="/"]
 * @namespace
**/
ws.xmlrpc.Client = function(host, port, path) {
    // member variables
    this.host = host || '';
    this.port = port || 80;
    this.path = path || '/';
    this.contentType = 'text/xml';
    this.isAsynchronous = false;
    this.xmlHTTPRequest = new XMLHttpRequest();
    this.isLastResponseFault = false;
    this.lastResponse = '';
    this.lastValue = '';
    this.lastResponseCode = null;
};


/**
 * Makes an XML-RPC method call to the configured host:port/path
 * @param {string} methodName Name of the method to call in the request
 * @param {Array} [parameters] Parameters to pass
 * @return {string} Response text.
 */
ws.xmlrpc.Client.prototype.methodCall = function(methodName, parameters) {

    if (!methodName) {
        return; // this should really throw an exception
    }

    var content = '<?xml version="1.0"?>\n';
    var callObject = { methodName : methodName, params: [] };

    if (parameters) {
        // process each passed in parameter in the parameters array, and convert to the proper type
        for (var i in parameters) {
            var parameter = parameters[i];
            var value = null;
            if (isNumber(parameter)) value = { i4 : parameter.toFixed() }; // we need also a double
            else if (isDate(parameter)) value = { 'dateTime.iso8601': parameter.format("yyyyMMdd'T'HH:mm:ss") };
            else if (isBool(parameter)) value = { 'boolean': parameter ? 1 : 0 };
            else if (isString(paramter)) value = parameter;
            else value = parameter // this should be base64

            callObject.params.push( { _name : "param" , value : value });
        }
    }
    // get the XML for the parameters
    assert( xml , "why is xml null" );
    content += xml.toString( "methodCall" , callObject );

    var url = 'http://' + this.host + ':' + this.port + this.path;
    this.xmlHTTPRequest.open("POST", url, this.isAsynchronous);
    this.xmlHTTPRequest.setRequestHeader("Content-Type", this.contentType);
    this.xmlHTTPRequest.send(content);

    // handle the response from the server
    // TODO: rewrite this as a switch statement
    this.lastResponseCode = this.xmlHTTPRequest.stats;
    if (this.xmlHTTPRequest.status == 200) {
        // got a valid method response, so process it
        return this._processResponse(this.xmlHTTPRequest.responseText);
    } else {
        // there's a lower level issue, so fail
        log.ws.xmlrpc("Error: " + this.xmlHTTPRequest.status + ': ' + this.xmlHTTPRequest.statusText
            + ' : ' + this.xmlHTTPRequest.header
            + ' : ' + this.xmlHTTPRequest.responseText);
    }
};

ws.xmlrpc.Client.prototype._processResponse = function(responseText) {
    if (!responseText) {
        // we received no response to process
        this.lastResponse = null;
        return null;
    }

    var response = xml.fromString(responseText);
    this.lastResponse = response;
    if (response) {
        if (response._name == 'methodResponse') {
            if (response.children[0]._name == 'params') {
                // we got a valid response
                this.isLastResponseFault = false;

                // get the contents of the response, which should be a single value
                var value = response.children[0].children[0].children[0].children[0]
                this.lastValue = value;

                return {isFault: false, value: value};
            } else if (response.children[0]._name == 'fault') {
                // we got an XML-RPC fault
                this.isLastResponseFault = true;

                // get the contents of the response, which should be a faultString and faultValue
                var value = response.children[0].children[0].children[0]
                this.lastValue = value;

                var faultString = value.children[0].children[1].$;
                var faultValue = value.children[1].children[1].children[0].$;
                return {isFault: true, faultString: faultString, faultValue: faultValue};
            }
        }
    }

    // we received no response or an invalid response
    return null;
};

ws.xmlrpc.Client.Test = function() {
    // create a new object
    var client = new ws.xmlrpc.Client('ping.feedburner.com');
    //var client = new ws.xmlrpc.Client('rpc.technorati.com', 80, '/rpc/ping');
    //var client = new ws.xmlrpc.Client('rpc.pingomatic.com', 80, '/RPC2');

    // test XML-RPC blog ping
    var response = client.methodCall('weblogUpdates.ping', ['Silicon Alley Insider', 'http://www.alleyinsider.com/', 'http://www.alleyinsider.com/2008/2/barack_obama__live_from_seattle']);

    if (!response) {
        log.ws.xmlrpc('Got empty response');
    } else {
        if (response.isFault) {
            // we got a fault
            log.ws.xmlrpc('Fault: (' + response.faultValue + ') ' + response.faultString);
        } else {
            log.ws.xmlrpc('Success: ' + tojson(response.value));
        }
    }
};
