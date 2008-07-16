/** Simple text format processor, suitable for handling text from
 *  blog posts, etc.
 * @constructor
*/
content.Simple = function(){

};

/** Replace newline characters with &lt;br /&gt;s in a given string.
 * @param {string} str String to change.
 * @return {string} Altered string.
 */
content.Simple.prototype.toHtml = function(str){
    str = str.replace(/\r?\n/g, '<br/>');
    return str;
};
