/**
 *  Test whether a given string is a valid email address.
 *  For a laugh, check http://ex-parrot.com/~pdw/Mail-RFC822-Address.html to see
 *  how to support RFC822 email addresses. We don't do that; we just check for
 *  basic email syntax.
 *  @param {string} s the string to test
 *  @returns {boolean}
 */
net.isEmail = function(s){
    return s.match(/^\w[\w\+\.]*@\w+(\.\w+)+$/);
};

