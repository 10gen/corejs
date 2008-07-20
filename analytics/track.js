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

var pixelParams = "?rand=" + Math.random() + "&";

function addPixelParam( n , v ){
    pixelParams += n + "=" + v + "&";
}

function secondsTillNextDay(){
    var now = new Date();

    var diff = 0;

    diff += ( 23 - now.getHours() );
    diff *= 60;

    diff += ( 59 - now.getMinutes() );
    diff *= 60;

    diff += ( 59 - now.getSeconds() );

    return diff;
}

function secondsTillNextMonth(){
    var inc = 0;

    var d = new Date();
    var now = d.getMonth();

    d = new Date( d.getTime() + ( 1000 * 3600 * 24 ) );
    while ( d.getMonth() == now ){
	inc++;
	d = new Date( d.getTime() + ( 1000 * 3600 * 24 ) );
    }

    return ( inc * 86400 ) + secondsTillNextDay();
}

function setCookie( name , value , seconds ) {
    var expires = "";

    if ( seconds ) {
        var date = new Date();
        date.setTime( date.getTime() + ( seconds * 1000 ) );
        expires = "; expires=" + date.toGMTString();
    }

    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie( name )  {
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

// title
var possTitles = document.getElementsByTagName( "title" );
if ( possTitles && possTitles.length > 0 )
    addPixelParam( "title" , escape( possTitles[0].innerHTML ) );
        
// search
if ( window && window.searchTerm ){
    addPixelParam( "search" , window.searchTerm );
}

// referrer
if ( document.referrer ){
    var ru = document.referrer.replace( /(https?:..[^\/]+).*/ , "$1" );
    var du = window.location.href.replace( /(https?:..[^\/]+).*/ , "$1" );
    
    if ( ru != du )
	addPixelParam( "referrer" , document.referrer );
}

// section
if ( window && window.sectionName )
    addPixelParam( "section" , window.sectionName );

// refererSearch


function doUniqueStuff( c , p , t ){
    if ( getCookie( c ) )
        return;
    setCookie( c , "t" , t );
    addPixelParam( p , "t" );
}
doUniqueStuff( "uh" , "uniqueHour" , 3600 );
doUniqueStuff( "ud" , "uniqueDay" , 300 +  secondsTillNextDay() );
doUniqueStuff( "um" , "uniqueMonth" , 300 + secondsTillNextMonth() );

function writePixel(){
    var root = "";
    if ( window.trackRoot )
	root = trackRoot;
    document.write( "<img src=\"" + root + "/~~/analytics/pixel.jxp" + pixelParams + "\" width=1 height=1 border=0>" );    
}

writePixel();
