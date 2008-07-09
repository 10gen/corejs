/**
 * Filename: html.js
 * Author: Dana Spiegel (dana@10gen.com)
 */

if (!HTML)
    /** HTML encoding functions
     * @namespace
     */
    HTML = {};

if (!HTML.__init) {

    /** Return a given string with &amp;, &lt;, and &gt; correctly replaced.
     * @param {string} s HTML string
     * @return {string} Cleaned string.
     */
    HTML.encode = function(s) {
        return s ? s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : s;
    };

    HTML.__init = true;
}
