/**
 *  Test whether a string is an IP address.
 *  @param {string} s The string to test.
 *  @returns {boolean}
 */
net.isIPAddr = function(s){
    return s.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
};
