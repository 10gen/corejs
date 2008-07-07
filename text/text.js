Text = {
    /** Return a "snippet" of a string, comprising of the first few 
     *  hundred characters.
     *  @param {string} s the string to truncate
     *  @returns {string}
     */
    snippet: function(s) { 
	if( !isString(s) )
	    return s;
	s = s.substring(0,4000);
	s = s.replace(/<[^>]*>/g, "");
	var i = 210;
	if( s.length > i+20 ) {
	    while( s.charAt(i) != '.' && s.charAt(i) != ' ' && i < s.length ) { 
		i++;
	    }
	    s = s.substring(0,i);
	    return s + "...";
	}
	return s;
    }

}
