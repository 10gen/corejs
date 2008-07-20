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

db = connect("test");

core.user.user();

db.users.remove({});

var assertException = function(f){
    exception = null;
    try {
        f();
    }
    catch(e){
        exception = e;
    }

    assert(exception);
};

u1 = new User();

u1.name = "Test User";
u1.email = "test@10gen.com";
u1.setPassword("test");

u1.nickname = "Testy";

db.users.save(u1);

assert(User.find("Test User") != null);




// duplicate user testing

u2 = Object.extend(new User(), u1); // shallow copy of u1

delete u2._save; // u2 is like u1, but not in the database!
delete u2._update;
delete u2._ns;
delete u2._id;

db.users.save(u2); // this save works because the uniqueness hash hasn't changed

assertException(function(){ User.find("Test User"); });

assertException(function(){ User.find("test@10gen.com"); });

// presave test

// 1. Try an object which is in the DB but without a uniqueness hash
delete u2.uniqueness_hash;

assertException(function(){ db.users.save(u2); });

// 2. An object which is not in the DB

db.users.remove( {_id: u2._id } );
delete u2._id;

if(u2.uniqueness_hash) delete u2.uniqueness_hash;

assertException(function(){ db.users.save(u2); });
assert(u2._id == null);

// username is duplicated
u2.name = "Test User";
u2.email = "not_duplicate@10gen.com";
u2.nickname = "Testaroo";

assertException(function(){ db.users.save(u2); });
assert(u2._id == null);

// email is duplicated
u2.name = "Second User";
u2.email = "test@10gen.com";
u2.nickname = "Testaroo";

assertException(function(){ db.users.save(u2); });
assert(u2._id == null);

// nickname is duplicated
u2.name = "Second User";
u2.email = "not_duplicate@10gen.com";
u2.nickname = "Testy";

assertException(function(){ db.users.save(u2); });
assert(u2._id == null);

// 3. An object which is in the DB whose username or email changed

u3 = new User();

u3.name = "Freddy User";
u3.email = "test3@10gen.com";
u3.nickname = "Fred";

db.users.save(u3);

// name changes to be duplicate
u3.name = "Test User";
assertException(function(){ db.users.save(u3); });

// email changes to be duplicate
u3.name = "Freddy User";
u3.email = "test@10gen.com";
assertException(function(){ db.users.save(u3); });

// nickname changes to be duplicate
u3.email = "test3@10gen.com";
u3.nickname = "Testy";
assertException(function(){ db.users.save(u3); });

// 4. re-saving a unique object without a uniqueness hash (this shouldn't fail)

delete u1.uniqueness_hash;

try {
    db.users.save(u1);
    // shouldn't raise an exception
}
catch(e){
    print(e);
    assert(false);
}
