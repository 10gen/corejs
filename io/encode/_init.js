/** Print encoding utilities.
 * @namespace
 */
io.Encode = {
    /** Return an string of whitespace of a given length
     * @param {number} num Length of indent
     * @return {string} String of blank spaces.
     */
    indent: function(num){
        var result = "";
        for(var i = 0; i < num; i++){
            result += " ";
        }
        return result;
    },

};

