
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

core.core.routes()

// test 1

routes = new Routes();
routes.add( "a" , "/A.jxp" );
routes.b = "/B.jxp";

assert( "/A.jxp" == routes.apply( "/a" ) );
assert( "/A.jxp" == routes.apply( "/a/" ) );
assert( "/A.jxp" == routes.apply( "/a/asd" ) );
assert( null == routes.apply( "/c/a/asd" ) );
assert( "/B.jxp" == routes.apply( "/b/asd" ) );

assert( "/B.jxp" == routes.apply( "/b.asd" ) );

routes[ "b.asd" ] = "/foobar.asd";
assert( "/foobar.asd" == routes.apply( "/b.asd" ) );


routes.setDefault( "/index" );
assert( "/index" == routes.apply( "/c/a/asd" ) );

routes.setDefault( null );
assert( null == routes.apply( "/c/a/asd" ) );

routes.add( /.*\/c\/.*/ , "/abc" );
assert( "/abc" == routes.apply( "/c/a/asd" ) );

assert( null == routes.apply( "/sub/d/foo" ) );

routes.sub = new Routes();
routes.sub.d = "/eliot";
assert( "/eliot" == routes.apply( "/sub/d/foo" ) );

routes.sub = new Routes();
routes.sub.e = "funky";
assert( "/sub/funky" == routes.apply( "/sub/e/a" ) );

assert( null == routes.apply( "/sub/asd" ) );

routes.sub.setDefault( "view" );
assert( "/sub/view" == routes.apply( "/sub/asd" ) );

// test 2

routes = new Routes();
routes.wiki = new Routes();
routes.wiki.add( /.*\.jpg$/ , "/~~/wiki/$0" );
assert( "/~~/wiki/a/1.jpg" == routes.apply( "/wiki/a/1.jpg" ) );
routes.wiki.add( /.*\.gif/ , "~~/wiki/$0" );
assert( "/wiki/~~/wiki/a/2.gif" == routes.apply( "/wiki/a/2.gif" ) );

routes.wiki.add( /\/?(.*)/ , "/~~/wiki/" , { names : [ "name" ] } );
request = javaStatic( "ed.net.httpserver.HttpRequest" , "getDummy" , "/" );
assert( "/~~/wiki/" == routes.apply( "/wiki/abc" , request ) );
assert( request.name == "abc" );

// test 3

routes = new Routes();
routes.wiki = new Routes();

routes.wiki.add( /(\w+)\/(\w+)/ , "/~~/wiki/" , { names : [ "action" , "value" ] } );
request = javaStatic( "ed.net.httpserver.HttpRequest" , "getDummy" , "/" );
assert( "/~~/wiki/" == routes.apply( "/wiki/do/4" , request ) );
assert( request.action == "do" );
assert( request.value == "4" );

// Nesting w/o regexps
routes = new Routes();
routes.forum = new Routes();
routes.forum.images = new Routes();
routes.forum.images["feed-icon16x16"] = "/~~/app/forum/images/feed-icon16x16";

var res = routes.apply('/forum/images/feed-icon16x16', null);
assert( res == "/~~/app/forum/images/feed-icon16x16" );

routes.forum.setDefault("/~~/app/forum/index");
var res = routes.apply('/forum/', null);

assert( res == "/~~/app/forum/index");

// redirects

var response = { sendRedirectTemporary: function(arg1){ target = arg1; } };

request = javaStatic( "ed.net.httpserver.HttpRequest" , "getDummy" , "/forum" );

target = null;
res = routes.apply('/forum', request, response);
assert(target == "/forum/");

target = null;
assert( "/~~/app/forum/index" == routes.apply('/forum/', request, response) );
assert( target == null );

request = javaStatic( "ed.net.httpserver.HttpRequest" , "getDummy" , "/forum?a" );
target = null;
assert( "/~~/app/forum/index" == routes.apply('/forum', request, response ) );
assert( "/forum/?a" == target );

// ---

routes = new Routes();
routes.wiki = new Routes();

routes.wiki.add( /(\w+)\/(\w+)\/(\w+)/ , "/~~/wiki/" , { names : [ "action" , "value" , "value" ] } );
request = javaStatic( "ed.net.httpserver.HttpRequest" , "getDummy" , "/" );
assert( "/~~/wiki/" == routes.apply( "/wiki/do/4/5" , request ) );
assert( request.action == "do" );
assert( request.getParameters( "value" ).length == 2 );
assert( request.getParameters( "value" )[0] == "4" );
assert( request.getParameters( "value" )[1] == "5" );

// Testing the find function

routes = new Routes();
routes.wiki = new Routes();
routes.wiki.page1 = new Routes();

assert( '/wiki' == routes.find( routes.wiki ) );
assert( '/wiki/page1' == routes.find( routes.wiki.page1 ) );

var r1 = new Routes();
routes.add(/.+/, r1);
try {
    routes.find(r1);
    print("should never get here");
} catch (e) {

}

assert(null == routes.find( new Routes() ));

routes.wiki2 = "hi";
assert(null == routes.find( new Routes() ));

routes.add(/.+/, "yo");
assert(null == routes.find( new Routes() ));

assert( routes.find( routes.add ) == null );

var myr2 = new Routes();

myr2.add(/.+/, 'yo');

assert( myr2.apply( '/add' ) == 'yo' );


var fr = new Routes();
var myfunc = function(){ print("a"); };
fr.add( /r(\w+)/ , myfunc , { names : [ "eliot" ] } );

request = javaStatic( "ed.net.httpserver.HttpRequest" , "getDummy" , "/ra" );
assert( isFunction( fr.apply( "ra" , request ) ) );
assert.eq( "a" , request.eliot );

// Test non-matching subroutes

routes = new Routes();
routes.sub = new Routes();
routes.add('up', 'down');
routes.sub.add('something', 'nothing');

assert(null === routes.apply('/'));
assert(null === routes.apply('/foo'));
assert('down' === routes.apply('/up'));
assert(null === routes.apply('/sub/'));
assert('/sub/nothing' === routes.apply('/sub/something'));
assert(null === routes.apply('/sub/random'));

routes.setDefault('foo');
assert('foo' === routes.apply('/what'));
assert('down' === routes.apply('/up'));
assert(null === routes.apply('/sub/'));
assert('/sub/nothing' === routes.apply('/sub/something'));
assert(null === routes.apply('/sub/random'));

routes.sub.setDefault('ha');
assert('/sub/ha' === routes.apply('/sub/'));
assert('/sub/nothing' === routes.apply('/sub/something'));
assert('/sub/ha' === routes.apply('/sub/random'));

// Test three level subroutes

routes = new Routes();
routes.sub = new Routes();
routes.sub.subest = new Routes();
routes.add('up', 'down');
routes.sub.add('something', 'nothing');
routes.sub.subest.add('east', 'west');

assert(null === routes.apply('/'));
assert(null === routes.apply('/foo'));
assert('down' === routes.apply('/up'));
assert(null === routes.apply('/sub/'));
assert('/sub/nothing' === routes.apply('/sub/something'));
assert(null === routes.apply('/sub/random'));
assert(null === routes.apply('/sub/subest/'));
//assert('/sub/subest/west' === routes.apply('/sub/subest/east'));
assert(null === routes.apply('/sub/subest/random'));
