
core.content.forms();

f = new Forms.Form( { a : 1 , b : 2 } , "z_" );
assert( f.text( "a" ).trim() == "<input  type name=\"z_a\"  value=\"1\" >" , f.text("a" ) );
