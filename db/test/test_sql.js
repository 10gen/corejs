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

t = new SQL.Tokenizer( "clicked = 1 " );
assert( "clicked" == t.nextToken() );
assert( "=" == t.nextToken() );
assert( 1 == t.nextToken() );
assert( null == t.nextToken() );


t = new SQL.Tokenizer( "clicked=1 " );
assert( "clicked" == t.nextToken() );
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

f = SQL.parseWhere( "clicked = 1 " );
assert( f.clicked == 1 );

f = SQL.parseWhere( "clicked = 1 and z = 3" );
assert( f.clicked == 1 );
assert( f.z == 3 );
