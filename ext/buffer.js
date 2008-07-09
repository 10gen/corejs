/** Initializes buffer for appending strings.
 * @return {function} Buffer appender function.
 */
Ext.buffer = function(){
    var buf = "";
    var f = function(s){
        buf += s;
    };
    f.getBuffer = function() { return buf; }
    return f;
};
