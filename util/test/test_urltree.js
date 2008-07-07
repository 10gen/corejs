core.util.urltree();

var u = new Util.URLTree();
u.foo = new Util.URLTree();
u.foo.bar = 'hi';
var terminal = function(end){ return end; };
u.unwind = function(result){ return '2'+result+'2'; };
u.foo.terminal = terminal;
assert(u.apply(null, '/foo/bar', null, null) == '2hi2');
