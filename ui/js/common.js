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

/** Trim whitespace from the beginning and end of this string.
 * @return {string} Trimmed string.
 */
String.prototype.trim = function(){
    return this.replace( /(^ *| *$)/ , "" );
};

/** Gets an HTML element by id, if <tt>e</tt> is a string, otherwise returns <tt>e</tt>.
 * @param {Object|string} e Element or element id to get.
 * @returns {Object} HTML element, if found.
 */
function getElement( e ){
    if ( typeof(e) == "string" )
        return document.getElementById( e );
    return e;
};

/** Sets an element's "display" style property to "block".
 * @param {Object|string} e Element or element id.
 */
function showElement( e ){
    e = getElement( e );
    e.style.display = "block";
}

/** Sets an element's "display" style property to "none".
 * @param {Object|string} e Element or element id.
 */
function hideElement( e ){
    e = getElement( e );
    e.style.display = "none";
}

/** Toggles an element's "display" style property between "block" and "none".
 * @param {Object|string} e Element or element id.
 */
function toggleElement ( e ) {
    var e = getElement( e );
	if ( e.style.display == "none" ) {
	  e.style.display = "block";
	} else {
	  e.style.display = "none";
	 }
}

/** Gets the correct type of XML request object, based on browser type.
 * @return {Object|string} XML request object, or the string "no XMLHttpRequest support".
 */
function getXMLRequestObject(){

    if ( window.XMLHttpRequest )
        return new XMLHttpRequest();

    if (window.ActiveXObject) // branch for IE/Windows ActiveX version
        return new ActiveXObject("Microsoft.XMLHTTP");

    throw "no XMLHttpRequest support";
}

/** Sends an HTTP request and waits for it to return.
 * @param {string} url URL to which to send request.
 * @param {string} data Text to send with request.
 * @return {string} The request's response text.
 */
function loadDocSync( url , data ){

    var req = getXMLRequestObject();
    req.open( data ? "POST" : "GET", url, false);
    req.send( data );

    var d = req.responseText;
    if ( ! d )
        return "";

    return d;
}

/** Sends an HTTP request and does not wait for it to return.
 * @param {string} url URL to which to send request.
 * @param {function} handler Function to which to send response.
 * @param {string} data Text to send with request.
 * @param {boolean} [passFullRequest] If the full response should be sent to the handler, versus only the response text
 * @return {string} The request's response.
 */
function loadDocAsync( url , handler , data , passFullRequest ){

    var req = getXMLRequestObject();
    req.open( data ? "POST" : "GET", url, true );

    req.onreadystatechange = function() {
        if ( req.readyState == 4 && handler ){
            handler( passFullRequest ? req : req.responseText );
        }
    }

    req.send( data );
}

/** Sends an HTTP request and does not wait for it to return.  When it returns, handle the request's responseXML field.
 * @param {string} url URL to which to send request.
 * @param {function} handler Function to which to send response.
 * @param {string} data Text to send with request.
 * @return {string} The request's XML response.
 */
function loadXMLAsync( url, handler, data ) {
    var req = getXMLRequestObject();
    req.open( data ? "POST" : "GET", url, true );

    req.onreadystatechange = function() {
        if ( req.readyState == 4 && handler ){
            handler( req.responseXML );
        }
    }

    req.send( data );
}

/** Sends an HTTP request and does not wait for it to return.
 * @param {string} data Text to send with request.
 * @param {string} url URL to which to send request.
 * @param {function} handler Function to which to send response.
 * @return {string} The request's response.
 * @deprecated Use loadDocAsync instead.
 */
function ajax(passData, to, responder, method) {

    if ( ! method)
        method = "POST";

    var xmlhttp = getXMLRequestObject();

    xmlhttp.open(method, to, true);
    xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState==4) {
            if(responder)
                responder(xmlhttp.responseText);
        }
    }
    xmlhttp.send(passData);
}

/** Gets the class of an element.
 * @param {Object|string} Element or element id to find.
 * @return {string} Class.
 */
function getCSSClass( e ){
    e = getElement( e );
    if ( e ){
        return e.className;
    }
    return null;
}

/** Sets the class of an element.
 * @param {Object|string} Element or element id to find.
 * @param {string} Class name.
 */
function setClass( e , c ){
    e = getElement( e );
    if ( e ){
        e.className = c;
    }
}

/** Sets a browser cookie.
 * @param {string} name Cookie name.
 * @param {string} value Cookie value.
 * @param {number} hours Hours from now cookie should expire.
 */
function setCookie( name , value , hours ) {
    var expires = "";

    if ( hours ) {
        var date = new Date();
        date.setTime( date.getTime() + ( hours * 60*60*1000 ) );
        expires = "; expires=" + date.toGMTString();
    }

    document.cookie = name + "=" + value + expires + "; path=/";
}

/** Gets a browser cookie.
 * @param {string} name Cookie name.
 */
function getCookie( name)  {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];

        while (c.charAt(0)==' '){
            c = c.substring(1,c.length);
        }

        if (c.indexOf(nameEQ) == 0){
            return c.substring(nameEQ.length,c.length);
        }
    }
    return null;
}

/** Removes a browser cookie.
 * @param {string} name Cookie name.
 */
function clearCookie(name) {
    getCookie(name,"",-1);
}
