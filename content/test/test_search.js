
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

db = connect( "foo" );
t = db.tests.search;
t.remove( {} );

core.content.search();

var OPTIONS = { title : 1 , text : 0.5 };
Search.fixTable( t , OPTIONS );

o = {
  title : "the title" ,
  text : "some content should go here title",
  ts : 45
};
Search.index( o , OPTIONS );
t.save( o );

Search.fixTable( t , OPTIONS );

assert( Search.search( t , "title" , { min : 1 } ).length == 1 );
assert( Search.search( t , "content" , { min : 1 } ).length == 1 );

o = {
  title : "content test" ,
  text : "some content should go here title",
  ts : 12
};
Search.index( o , OPTIONS );
t.save( o );

assert( Search.search( t , "content" , { min : 1 } ).length == 1 );
assert.eq( Search.search( t , "content" , { min : 10 } ).length , 2 );

var results = Search.search( t, 'content', {sort: {ts: -1 } , ignoreRelevancy: true } );
var lastTS = 1000000;
results.forEach(function(p){
                  assert(p.ts < lastTS);
                  lastTS = p.ts;
  });

var results = Search.search( t, 'content', {sort: {ts: 1} , ignoreRelevancy: true} );

var lastTS = 0;
results.forEach(function(p){
                  assert(p.ts > lastTS);
                  lastTS = p.ts;
  });




// nested indexing
t.remove( { _id: o._id } );
var OPTIONS = { title: 1, posts: {text: 1}};
o = {
  title: 'the title',
  posts: [
    {text: "some text"},
    {text: "more text"}
  ],
};

Search.index(o, OPTIONS);
t.save(o);
Search.fixTable(t, OPTIONS);

assert( Search.search( t, "text", {min: 1}). length == 1);
assert( Search.search( t, "go", {min: 1}). length == 0);

t.remove( { _id: o._id } );

// nested indexing with funny weights
var OPTIONS = { title: 1, posts: {text: 0.2}};
o = {
    title: 'the title',
    posts: [
        {text: "some text"},
        {text: "more text"}
    ]
};

Search.index(o, OPTIONS);
t.save(o);
Search.fixTable(t, OPTIONS);

assert( Search.search( t, "text", {min: 1}). length == 1);
assert( Search.search( t, "go", {min: 1}). length == 0);

t.remove( {_id: o._id } );

// HTML stripping
var WEIGHTS = { title: 1, posts: {text: 0.2}};
o = {
    title: 'the &lt; title',
    posts: [
        {text: "some &lt; text"},
        {text: "<b>more</b> text"}
    ]
};

var OPTIONS = {posts: {text: {stripHTML: true}}};
Search.index(o, WEIGHTS, OPTIONS);
t.save(o);
Search.fixTable(t, WEIGHTS);

assert( Search.search( t, "lt", {min: 1}).length == 1);
assert( Search.search( t, "b", {min: 1}).length == 0);

//exit();


// ----------------- Snippets testing -----------

s1 = "hi";
query = "hi";
assert(Search.match(s1, query));

s1 = "hi";
query = "hi there";
assert(Search.match(s1, query));

s1 = "hi there";
query = "hi";
assert(Search.match(s1, query));

o1 = {  a: "hi" };
query = "hi";
opts = {a: 1};

results = Search.snippet(o1, query, opts);
assert(results.length == 1);
assert(results[0].object == o1);

// should return o1

o1 = { a : ["hi", "there"]};
query = "hi";
opts = {a: 1};
results = Search.snippet(o1, query, opts);
assert(results.length == 1);
assert(results[0].object == o1);

o1 = { a : { content: ["hi", "yo"] } };
query = "yo";
opts = {a: {content: 1}};
results = Search.snippet(o1, query, opts);
assert(results.length == 1);
assert(results[0].object == o1.a);

o1 = { a : [{ content: "hi"} , {content: "yo"}] };
query = "yo";
opts = {a: {content: 1}};
results = Search.snippet(o1, query, opts);
assert(results.length == 1);
assert(results[0].object == o1.a[1]);


o1 = { a : ["hi", {content: "yo"}, {content: "hey"}]};
query = "hey";
opts = {a: {
    content: 1
}};
results = Search.snippet(o1, query, opts);
assert(results.length == 1);
assert(results[0].object == o1.a[2]);

o1 = { a: ["hi", "hi there", "hey hi"]};
query = "hi";
opts = {a: 1};
results = Search.snippet(o1, query, opts);
assert(results.length == 3);
assert(results[0].object == o1);
assert(results[0].text == o1.a[0]);
assert(results[1].object == o1);
assert(results[1].text == o1.a[1]);
assert(results[2].object == o1);
assert(results[2].text == o1.a[2]);

o1 = { a : ["hi", null, "hey"]};
query = "hi";
opts = {a: 1};
results = Search.snippet(o1, query, opts);
assert(results.length == 1);
assert(results[0].object == o1);

o1 = {a: [{content: null}, {content: "hi"}]};
query = "hi";
opts = {a: {content: 1}};
results = Search.snippet(o1, query, opts);
assert(results.length == 1);
assert(results[0].object == o1.a[1]);


