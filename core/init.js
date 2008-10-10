
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

SERVER_HOSTNAME = javaStatic( "java.net.InetAddress" , "getLocalHost" ).getHostName();

function mapUrlToJxpFileCore( uri , request , response ){

    if ( uri.startsWith( "/~~/f/" ) )
        return "/~~/f.jxp";

    // webdav
    var ua = request.getHeader( "User-Agent" );
    if ( ua &&
         ( ua.match( /webdav/i )
           || ua.match( /BitKinex/ )
           || ua.match( /\bneon\b/ )
           || ua.match( /Microsoft Data Access Internet Publishing Provider DAV/ )
           || ua.match( /Microsoft Data Access Internet Publishing Provider Protocol Discovery/ )
           || ua.match(/WebDrive/)
           || ua.match(/Contribute/)
           )
         ){
        return "/~~/webdav.jxp";
    }

    if (
        uri.match( /.*~$/ )
        || uri.match( /\/\.#/ )
         )
        return "~~/bad";

    // admin
    if ( ( uri.match( /^(\/|\/~~\/)admin\// )
           || uri.match( /^\/admin/ )
         ) ){
        if ( uri.match(/assets/) ){
            var idx = uri.indexOf( "/admin" );
            return "/~~/modules" + uri.substring( idx );
        }
        else {
            return "/~~/modules/admin/index.jxp";
        }
    }

    // these are special things which you can't override.
    if ( uri.match( /^\/~~\// ) ||
         uri.match( /^\/@@\// ) )
        return uri;

    if ( routes && routes.apply ){
        var res = routes.apply( uri , request , response );
        if ( res )
            return res;
    }

};


core.core.log();

if ( ! MemoryAppender.find( log ) ){
    log.appenders.push( MemoryAppender.create() );
}
if ( ! BasicDBAppender.find( log ) ){
    var dba = BasicDBAppender.create();
    if ( dba )
        log.appenders.push( dba );
}
