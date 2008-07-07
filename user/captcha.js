
core.util.words();

/** @namespace Check for an organic life form.
 */
Captcha = {

    /** Toggle debug.
     * @type {boolean}
     */
    DEBUG : false ,

    /** @namespace Create captcha content
     */
    words : {
        /** Find a real word from the English dictionary
         * @param {number} [min] Minimum length of word.  Defaults to 3.
         * @param {number} [max] Maximum length of word.  Defaults to 5.
         * @returns {string} English word
         */
	english : function( minLen , maxLen ){
	    return Captcha.words._word( Util.Words.usa , minLen , maxLen );
	},

	_word : function( words , minLen , maxLen ){

	    assert( words );

	    var min = minLen || 3
	    var max = maxLen || 5;

	    assert( max >= min );

	    while ( true ){
		var s = words.getRandomWord();
		s = s.replace( /[^\w]+/g , "" );
		s = s.toLowerCase();

		if ( s.length >= min && s.length <= max )
		    return s;
	    }

	} ,

        /** Create a nonsense word
         * @param {number} [length] The number of characters in the word.  Defaults to 6.
         */
	gobblygook : function( minLen ){
	    var min = minLen || 6;

            var s = "";
            while ( s.length < min )
		s += md5( Math.random() ).replace( /\d/g , "" ).substring( 0 , 6 );

	    return s;
	}

    } ,

    /** Create a captcha image.  <tt>response</tt> must be a valid HTTP response.
     * @returns {img} The captcha image
     */
    img : function(){
        if ( ! response )
            throw( "need a response" );

	var s = Captcha.words.english();

        JSCaptcha.img( s , response );
        return Captcha.USE.img( s );
    } ,

    /** Checks if the user response to a captcha is valid.
     * @param {Object} HTTP request
     * @returns {boolean} Whether or not the input was valid
     */
    valid : function( request ){
        if ( ! request )
            return false;

        var id = request.getCookie( "cid" );
        if ( Captcha.DEBUG ) SYSOUT( " captcha id : " + id );
        if ( ! id )
            return false;

        var res = request.captcha;
        if ( Captcha.DEBUG ) SYSOUT( " captcha res : " + res );
        if ( ! res )
            return false;

        return Captcha.USE.valid( id , res );
    } ,

    /** @namespace Hashing the captcha
     */
    hash : {
        /** Adds a cookie to the repsonse with the name "cid" and an md5 encoding of the captcha word
         * @param {string} word Captcha word
         */
        img : function ( s ){
            response.addCookie( "cid" , md5( s ) );
        } ,

        /** Checks if the user's input matches the captcha
         * @param {string} id Encoded correct HTTP response
         * @param {Object} HTTP response
         * @returns {boolean} Whether or not the captcha was valid
         */
        valid : function( id , res ){
            return id == md5( res );
        }
    } ,

    /** @namespace Using the database to save and check captchas
     */
    db : {
        /** Add a captcha word to the db.  About 1% of the time this is called, all images six hours or older
         * will be deleted. Sets a cookie, so <tt>response</tt> must be a valid HTTP response.
         * @param {string} Unencoded captcha word
         */
        img : function( s ){

            if ( ! db )
                throw( "need a db" );

            if ( Math.random() > .99 ){
                var d = new Date();
                d = new Date( d.getTime() - ( 1000 * 3600 * 6 ) );
                if ( Captcha.DEBUG ) SYSOUT( "deleting before : " + d );
                db.user._captcha.remove( { ts : { $lt : d } } );
            }

            var obj = { s : s , ts : new Date() };
            db.user._captcha.save( obj );
            if ( Captcha.DEBUG ) SYSOUT( tojson( obj ) );
            response.addCookie( "cid" , obj._id );
        } ,

        /** Check if a user correctly identified the captcha.
         * @param {string} id The object id of the captcha's database entry
         * @param {string} res User's captcha response text
         */
        valid : function( id , res ){

            id = ObjectId( id );

            var c = db.user._captcha.findOne( id );
            if ( Captcha.DEBUG ) SYSOUT( "c:" + tojson( c ) );

            if ( ! c )
                return false;

            return res == c.s;
        }
    }

};

/** Which captcha method to use
 * @default Captcha.hash
 */
Captcha.USE = Captcha.hash;
