/** String comparison function.
 * @param {string} x
 * @param {string} y
 * @returns {number} 1 if <tt>x</tt> is semantically greater than <tt>y</tt>, -1 if <tt>x</tt> is less than <tt>y</tt>, 0 if they are the same.
 */
Ext.stringCompare = function(x, y){
    if (x > y) return 1;
    if (x < y) return -1;
    return 0;
};
