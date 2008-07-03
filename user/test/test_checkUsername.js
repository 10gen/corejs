db = connect("tests");
db.users.remove({});
core.testing.client();

c = new testing.Client();

c.setAnswer('output');

var checkUsername = function(args){
    return c.setURL("checkUsername").addArgs(args).execute(core.user.checkUsername);
};

assert(checkUsername({'username': 'Ethan', 'email': 'ethan@10gen.com',
                      'nickname': 'ethan'}) == "good");

assert(checkUsername({'username': 'Ethan', 'email': 'ethan@10gen.com',
                      'nickname': 'ethan'}) == "good");

// Numbers as usernames are valid
assert(checkUsername({'username': '11111', 'email': 'ethan@10gen.com',
                      'nickname': 'ethan'}) == "good");

// Invalid email
assert(checkUsername({'username': 'Ethan', 'email': '11!11@10gen.com',
                      'nickname': 'ethan'}) != "good");

// Invalid username
assert(checkUsername({'username': 'Ethan%', 'email': 'ethan@10gen.com',
                      'nickname': 'ethan'}) != "good");

// Valid email
assert(checkUsername({'username': 'Ethan', 'email': 'ethan.and.friends@10gen.com',
                      'nickname': 'ethan'}) == "good");

core.user.user();
u = new User();
u.name = "Ethan";
u.email = "ethan@10gen.com";
u.setPassword("ethan");
db.users.save(u);

// Duplicate name
assert(checkUsername({'username': 'Ethan', 'email': 'eeeeee@10gen.com',
                      'nickname': 'eeeeee'}) != "good");

// Duplicate email
assert(checkUsername({'username': 'uuuuu', 'email': 'ethan@10gen.com',
                      'nickname': 'eeeeee'}) != "good");
