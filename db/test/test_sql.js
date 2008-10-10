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

core.db.sql();

assert( isNumber( SQL._parseToNumber( "5" ) ) );
assert.eq( "=5" , SQL._parseToNumber( "=5" ) );

assert( isAlpha( "a" ) );
assert( ! isAlpha( "1" ) );
assert( isDigit( "1" ) );
assert( ! isDigit( "a" ) );
assert( ! isAlpha( "=" ) );
assert( ! isDigit( "=" ) );

t = new SQL.Tokenizer( "clicked = 1 " );
assert( "clicked" == t.nextToken() );
assert( "=" == t.nextToken() );
assert( 1 == t.nextToken() );
assert( null == t.nextToken() );


t = new SQL.Tokenizer( "clicked=1 " );
assert( "clicked" == t.nextToken() );
assert.eq( "=" , t.nextToken() );
assert( 1 == t.nextToken() );
assert( ! t.hasMore() );
assert( null == t.nextToken() );

t = new SQL.Tokenizer( "clicked2=1 " );
assert.eq( "clicked2" , t.nextToken() );
assert( "=" == t.nextToken() );
assert( 1 == t.nextToken() );
assert( ! t.hasMore() );
assert( null == t.nextToken() );

t = new SQL.Tokenizer( "clicked=1 and foo = 5" );
assert( "clicked" == t.nextToken() );
assert( "=" == t.nextToken() );
assert( 1 == t.nextToken() );
assert( "and" == t.nextToken() );
assert( "foo" == t.nextToken() );
assert( "=" == t.nextToken() );
var z = t.nextToken();
assert( 5 == z );
assert( isNumber( z ) );
assert( null == t.nextToken() );

t = new SQL.Tokenizer( "name = 'foo'" );
assert( "name" == t.nextToken() );
assert( "=" == t.nextToken() );
z = t.nextToken();
assert( isString( z ) );
assert( "foo" == z );
assert( null == t.nextToken() );

t = new SQL.Tokenizer( "name = \"bar\"" );
assert( "name" == t.nextToken() );
assert( "=" == t.nextToken() );
z = t.nextToken();
assert( isString( z ) );
assert( "bar" == z );
assert( null == t.nextToken() );

t = new SQL.Tokenizer( "name = 'foo''bar'" );
assert( "name" == t.nextToken() );
assert( "=" == t.nextToken() );
z = t.nextToken();
assert( isString( z ) );
assert( "foo'bar" == z );
assert( null == t.nextToken() );

t = new SQL.Tokenizer( "age <= 42" );
assert( "age" == t.nextToken() );
assert( "<=" == t.nextToken() );
assert( 42 == t.nextToken() );

t = new SQL.Tokenizer( "age <> 42" );
assert( "age" == t.nextToken() );
assert( "<>" == t.nextToken() );
assert( 42 == t.nextToken() );

t = new SQL.Tokenizer( "(1, 2, 3)");
assert( "(" == t.nextToken() );
var arr = SQL._inArray(t);
assert( arr.length == 3 );
assert( ! t.hasMore() );
assert( arr[0] == 1 );
assert( arr[1] == 2 );
assert( arr[2] == 3 );

f = SQL._regexpFromString( '%foo%' );
assert( f.toString() == '/foo/i');
f = SQL._regexpFromString( 'foo%' );
assert( f.toString() == '/^foo/i');
f = SQL._regexpFromString( '%foo' );
assert( f.toString() == '/foo$/i');
f = SQL._regexpFromString( 'foo' );
assert( f.toString() == '/^foo$/i');

f = SQL.parseWhere( "clicked = 1 " );
assert( f.clicked == 1 );

f = SQL.parseWhere( "clicked = 1 and z = 3" );
assert( f.clicked == 1 );
assert( f.z == 3 );

f = SQL.parseWhere( "name = 'foo'" );
assert( f.name = 'foo' );

f = SQL.parseWhere( "name like '%foo%'");
assert( f.name.toString() == '/foo/i' );
f = SQL.parseWhere( "name like 'foo%'");
assert( f.name.toString() == '/^foo/i' );

f = SQL.parseWhere( "foo <> 'bar'" );
assert( f.foo['$ne'].toString() == "bar" );

f = SQL.parseWhere( "foo != 'bar'" );
assert( f.foo['$ne'].toString() == "bar" );

f = SQL.parseWhere( "foo in (1, 2, 'a')" );
assert( f.foo['$in'].toString() == "1,2,a" );

f = SQL.parseWhere( "foo in ('a', 'b', 'c')" );
assert( f.foo['$in'].toString() == "a,b,c" );

f = SQL.parseWhere( "name = 'the word '' or '' anywhere (surrounded by spaces) used to throw an error'" )
assert( f.name = "the word '' or '' anywhere (surrounded by spaces) used to throw an error" );

try {
    f = SQL.parseWhere( "name = 'foo' or name = 'bar'" )
    assert( false );
}
catch (err) {
    assert( err.toString() == "sql parser can't handle ors yet" );
}

// ---- executeQuery testing ----

db = connect( "test_sql" );
db.basicSelect1.drop();
db.basicSelect1.save( { a : 1 , b : 2 } );

cursor = SQL.executeQuery( db , "select * from basicSelect1" );
assert.eq( 1 , cursor.length() );
assert.eq( 1 , cursor[0].a );
assert.eq( 2 , cursor[0].b );

cursor = SQL.executeQuery( db , "select b from basicSelect1" );
assert.eq( 1 , cursor.length() );
assert.eq( null , cursor[0].a );
assert.eq( 2 , cursor[0].b );

cursor = SQL.executeQuery( db , "select a  from basicSelect1" );
assert.eq( 1 , cursor.length() );
assert.eq( 1 , cursor[0].a );
assert.eq( null , cursor[0].b );

cursor = SQL.executeQuery( db , "select a , b from basicSelect1" );
assert.eq( 1 , cursor.length() );
assert.eq( 1 , cursor[0].a );
assert.eq( 2 , cursor[0].b );

db.basicSelect1.save( { a : 3 , b : 4 , c : 'the word or is in this string' } );

cursor = SQL.executeQuery( db , "select * from basicSelect1" );
assert.eq( 2 , cursor.length() );

cursor = SQL.executeQuery( db , "select * from basicSelect1 where a = 1" );
assert.eq( 1 , cursor.length() );
assert.eq( 1 , cursor[0].a );
assert.eq( 2 , cursor[0].b );

cursor = SQL.executeQuery( db , "select * from basicSelect1 where a = 3" );
assert.eq( 1 , cursor.length() );
assert.eq( 3 , cursor[0].a );
assert.eq( 4 , cursor[0].b );

cursor = SQL.executeQuery( db , "select * from basicSelect1 where a = 0" );
assert.eq( 0 , cursor.length() );

cursor = SQL.executeQuery( db , "select a from basicSelect1 order by a" );
assert.eq( 2 , cursor.length() );
assert.eq( 1 , cursor[0].a );
assert.eq( 3 , cursor[1].a );

cursor = SQL.executeQuery( db , "select a from basicSelect1 order by a asc" );
assert.eq( 2 , cursor.length() );
assert.eq( 1 , cursor[0].a );
assert.eq( 3 , cursor[1].a );

cursor = SQL.executeQuery( db , "select a from basicSelect1 order by a desc" );
assert.eq( 2 , cursor.length() );
assert.eq( 3 , cursor[0].a );
assert.eq( 1 , cursor[1].a );

cursor = SQL.executeQuery( db , "select a from basicSelect1 where a > 0 order by a desc" );
assert.eq( 2 , cursor.length() );
assert.eq( 3 , cursor[0].a );
assert.eq( 1 , cursor[1].a );

cursor = SQL.executeQuery( db , "select * from basicSelect1 where c = 'the word or is in this string'" );
assert.eq( 1 , cursor.length() );
assert.eq( 'the word or is in this string' , cursor[0].c );

try {
  SQL.executeQuery( db , "select * from basicSelect1 where c = 'foo' or c = 'bar'" );
  assert( false );
}
catch(err) {
    assert( err.toString() == "sql parser can't handle ors yet" );
}

cursor = SQL.executeQuery( db , "select a from basicSelect1 where a in (1, 2, 3)" );
assert.eq( 2 , cursor.length() );
assert.eq( 1 , cursor[0].a );
assert.eq( 3 , cursor[1].a );
