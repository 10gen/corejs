/**
   e.g.:

   xml.to( print, "myobjtype", { name: "foo", x : 3 } );

   <myobjtype>
     <name>foo</name>
     <x>3</x>
   </myobjtype>

*/
core.content.html();

var log = log.content.xml;

/** @namespace XML helper functions
 */
xml = {
    /** Print an object in XML
     * @param {string} name The title
     * @param {Object} obj Object to be parsed
     * @returns {string} XML string
     */
    toString : function( name , obj ){
        var s = "";
        xml.to( function( z ){ s += z; } , name , obj );
        return s;
    } ,

    /** Make an object into XML
     * @param {function} append Appender function
     * @param {string} name Title
     * @param {Object} obj Object to be transformed
     * @param {number} indent Number of spaces to indent each child
     * @param {boolean} [isPrettyPrint=true] Use indentation and newlines
     */
    to : function( append , name , obj , indent , isPrettyPrint ){
        isPrettyPrint = (typeof(isPrettyPrint) == "boolean")? isPrettyPrint : "true";

        if ( ! indent ) indent = 0;

        if ( ! name )
            name = obj._name;

        var newLine = false;

        if ( name && name != "PCDATA" ){
            if(isPrettyPrint)
                xml._indent( append , indent );

            append( "<" + name  );
            if ( isObject( obj ) && isObject( obj._props ) ){
                for ( var a in obj._props ){
                    append( " " + a + "=\"" + content.HTML.escape_html(obj._props[a]) + "\" " );
                }
            }

            if ( obj == null || (haskey(obj, "$") && obj["$"] == null) || (haskey(obj, "children") && (obj.children == null || obj.children.length == 0))){
                append( " />" );
                return;
            }

            append( ">" );
        }

        if ( obj == null ){
        }
        else if ( isString( obj ) || isDate( obj ) ){
            append( content.HTML.escape_html(obj.toString()) );
        }
        else if ( isObject( obj ) ){

            newLine = true;
            if(isPrettyPrint)
                append( "\n" );

            for ( var prop in obj ){
                if ( prop == "_props" || prop == "_name" || prop == "$" || prop == "children" )
                    continue;

                var child = obj[prop];

                if ( isArray( obj ) && isObject( child ) && child._name && prop.match( /\d+/ ) )
                    xml.to( append , null , child , indent + 1, isPrettyPrint );
                else
                    xml.to( append , prop , child , indent + 1, isPrettyPrint );
            }
        }
        else {
            append( obj );
        }

        if ( isObject( obj ) && obj["$"] )
            xml.to(append, null, obj["$"], indent+1, isPrettyPrint);

        if ( isObject( obj ) && isArray(obj.children) )
            xml.to(append, null, obj.children, indent+1, isPrettyPrint);


        if ( name && name != "PCDATA" ){
            if(isPrettyPrint) {
                if ( newLine )
                    xml._indent( append , indent );
                append( "</" + name + ">\n" );
            } else {
                append( "</" + name + ">" );
            }
        }

    } ,


    /** Make an array into XML.
     * @param {function} append Appender function
     * @param {string} name Title
     * @param {Object} obj Object to be transformed
     * @param {number} indent Number of spaces to indent each child
     */
    toArray : function( append, name, obj, indent ){
        for( var i=0; i<obj.length; i++ ){
            xml.to(append, null , obj[i], indent);
        }
    } ,

    /** Indent a line.
     * @param {function} append Appender function
     * @param {number} indent Number of spaces to indent each child
     */
    _indent : function( append , indent ){
        for ( var i=0; i<indent; i++ )
            append( " " );
    } ,

    /** Turn a string from XML into an object.
     * @param {string} s String to be parsed
     * @returns {Object} JavaScript object
     */
    fromString : function( s ){
        s = s.replace(/<!--.*?-->/gm, "");
        return xml.from(xml._xmlTokenizerchar(s));
    },

    _re_nonspace : /[^ \t\n]/,
    _re_space : /[ \t\n]/,
    _re_word : /[^\w&;:]/,
    _re_close_cdata: /\]\]>/,

    _xmlTokenizerre : function( s ){
        var pos = 0;
        var insideTag = false;
        var attrName = false;
        var attrValue = false;
        var tagName = false;
        var f = function(){
            if(f.lookahead){
                l = f.lookahead;
                f.lookahead = null;
                return l;
            }
            var exec = xml._re_nonspace.exec(s);
            if (exec == null) return -1;
            var start = exec.index;
            var sub = s.substring(start, s.length);
            if(insideTag == false){
                if(s[start] == '<'){
                    insideTag = true;
                    var s2 = xml._re_nonspace.exec(sub.substring(1, sub.length)).index+1;
                    if(sub[s2] == '?'){
                        s = sub.substring(s2+1, sub.length);
                        return "<?";
                    }
                    if(sub.substring(s2, s2+8) == "!\[CDATA\["){
                        var s3 = xml._re_close_cdata.exec(sub).index;
                        s = sub.substring(s3+3, sub.length);
                        insideTag = false;
                        return sub.substring(s2+8, s3);
                    }
                    s = s.substring(start+1, s.length);
                    return "<";
                }
                var next = sub.indexOf("<");
                if(next == -1) next = sub.length;
                s = sub.substring(next, sub.length);
                // CDATA node
                return content.HTML.unescape_html(sub.substring(0, next).trim());
            }
            else {
                if(s[start] == '?'){
                    var s2 = xml._re_nonspace.exec(sub.substring(1, sub.length)).index+1;
                    if(sub[s2] == '>'){
                        s = sub.substring(s2+1, sub.length);
                        tagName = insideTag = false;
                        return "?>";
                    }
                }
                if(s[start] == '/'){
                    s = s.substring(start+1, s.length);
                    return "/";
                }
                if(s[start] == '>'){
                    tagName = insideTag = false;
                    s = s.substring(start+1, s.length);
                    return ">";
                }
                if(!tagName){
                    var s2 = xml._re_word.exec(sub).index;
                    s = s.substring(start+s2, s.length);
                    tagName = true;
                    return sub.substring(0, s2);
                }
                if(!attrName){
                    var s2 = xml._re_word.exec(sub).index;
                    s = sub.substring(s2, sub.length);
                    attrName = true;
                    return sub.substring(0, s2);
                }
                if(attrValue){
                    var q = s[start];
                    var i = s.indexOf(q, start+1);
                    s2 = i;
                    attrName = attrValue = false;
                    var ret = s.substring(start+1, s2);
                    s = s.substring(s2+1, s.length);
                    return ret;
                }
                else if(!attrValue) {
                    var s2 = sub.indexOf("=");
                    s = sub.substring(s2+1, sub.length);
                    attrValue = true;
                    return "=";
                }

            }
        };
        return f;
    },

    _xmlTokenizerchar : function( s ){
        var pos = 0;
        var insideTag = false;
        var attrName = false;
        var attrValue = false;
        var tagName = false;
        var f = function(){
            if(f.lookahead){
                l = f.lookahead;
                f.lookahead = null;
                return l;
            }
            var i = 0;
            while(isSpace(s[i])) ++i;
            if (i >= s.length) return -1;
            var start = i;
            var sub = s.substring(start, s.length);
            if(insideTag == false){
                if(s[start] == '<'){
                    insideTag = true;
                    i = 1;
                    while(isSpace(sub[i])) ++i;
                    var s2 = i;
                    if(sub[s2] == '?'){
                        s = sub.substring(s2+1, sub.length);
                        return "<?";
                    }
                    if(sub.substring(s2, s2+8) == "!\[CDATA\["){
                        var s3 = xml._re_close_cdata.exec(sub).index;
                        s = sub.substring(s3+3, sub.length);
                        insideTag = false;
                        return sub.substring(s2+8, s3);
                    }
                    s = s.substring(start+1, s.length);
                    return "<";
                }
                var next = sub.indexOf("<");
                if(next == -1) next = sub.length;
                s = sub.substring(next, sub.length);
                // CDATA node
                return content.HTML.unescape_html(sub.substring(0, next).trim());
            }
            else {
                if(s[start] == '?'){
                    i = 1;
                    while(isSpace(sub[i])) ++i;
                    var s2 = i;
                    if(sub[s2] == '>'){
                        s = sub.substring(s2+1, sub.length);
                        tagName = insideTag = false;
                        return "?>";
                    }
                }
                if(s[start] == '/'){
                    s = s.substring(start+1, s.length);
                    return "/";
                }
                if(s[start] == '>'){
                    tagName = insideTag = false;
                    s = s.substring(start+1, s.length);
                    return ">";
                }
                if(!tagName){
                    i = 0;
                    while(isAlpha(sub[i]) || isDigit(sub[i]) || sub[i] == ":") ++i;
                    var s2 = i;
                    s = s.substring(start+s2, s.length);
                    tagName = true;
                    return sub.substring(0, s2);
                }
                if(!attrName){
                    i = 0;
                    while(isAlpha(sub[i]) || isDigit(sub[i]) || sub[i] == ":") ++i;
                    var s2 = i;
                    s = sub.substring(s2, sub.length);
                    attrName = true;
                    return sub.substring(0, s2);
                }
                if(attrValue){
                    var q = s[start];
                    var i = s.indexOf(q, start+1);
                    s2 = i;
                    attrName = attrValue = false;
                    var ret = s.substring(start+1, s2);
                    s = s.substring(s2+1, s.length);
                    return ret;
                }
                else if(!attrValue) {
                    var s2 = sub.indexOf("=");
                    s = sub.substring(s2+1, sub.length);
                    attrValue = true;
                    return "=";
                }

            }
        };
        return f;
    },

    /** Get the JavaScript object represented by an XML string
     * @param {object} tokenizer A string that has been run through a tokenizer
     * @returns {object} The object
     * @throws {Exception} Root is not an element (if the root is not an object)
     * @throws {Exception} Things outside the root (if there is more than one root-level element)
     */
    from : function( tokenizer ){
        var i = 0;

        var next = tokenizer();
        if(next == "<?"){
            // XML declaration
            // FIXME: do something
            while (next != "?>") next = tokenizer();
        }
        else tokenizer.lookahead = next;

        var root = xml._from(tokenizer);
        if(typeof root != "object"){
            throw "root is not an element";
        }
        if(root.length != 1){
            throw "things outside of root";
        }
        return root[0]; // root is always one element
    } ,

    _from : function( tokenizer ){
        var root = [];
        var next;

        while(true){
            next = tokenizer();
            if (next == -1) break;
            if (next != "<"){
                //CDATA
                root.push(next);
                continue;
            }
            else if (next == "<"){
                var name = tokenizer();
                if(name == "/"){
                    // our root element just ended; return what we have
                    break;
                }
                var props = {};
                var slash = false;
                var hasprops = false;
                next = tokenizer();
                while(next != ">"){
                    if (next == "/") slash = true;
                    else{
                        var eq = tokenizer();
                        var val = tokenizer();
                        val = content.HTML.unescape_html(val);
                        props[next] = val;
                        hasprops = true;
                    }
                    next = tokenizer();
                }
                if(! slash){
                    var result = xml._from(tokenizer);
                    // Either we just read a literal, in which case
                    // we need to read </name>, or the recursion ended after
                    // reading </, so we need to read name>.
                    var next = tokenizer();
                    if(next == "<"){ tokenizer(); next = tokenizer(); }
                    tokenizer();
                    if(name != next) {
                        throw ("Error: malformed XML -- "+name+" does not match "+next);
                    }
                }
                else var result = null;
                var topush = {_name: name};
                if(hasprops){ topush._props = props; }
                if(result == null || isString(result))
                    topush.$ = result;
                else
                    topush.children = result;
                root.push(topush);
            }
        }

        if(root.length == 1 && (root[0] == null || isString(root[0])))
            return root[0];
        for(var i in root){
            if (isString(root[i])){
                root[i] = {_name: "PCDATA", $: root[i]};
            }
        }
        return root;

    },

    /** Determine if two objects have the same properties.
     * @param {Object} obj1
     * @param {Object} obj2
     * @returns {boolean} If the two objects match
     */
    match: function(obj, query){
        for(var prop in query){
            var match = false;
            if(isString(obj[prop]) && query[prop])
                match = obj[prop] == query[prop];
            else
                match = xml.match(obj[prop], query[prop]);

            if(! match) return false;
        }
        return true;
    },

    /** Determine if one object is a subobject of another.
     * @param {Object} obj Object to search
     * @param {Object} query Subobject for which to search
     * @return {Array} An array of query matches from result
     */
    find: function(obj, query){
        var results = [];
        if(xml.match(obj, query)) results.push(obj);
        if(obj.children && obj.children.length > 0){
            for(var i in obj.children){
                var tmp = xml.find(obj.children[i], query);
                if(! tmp) continue;
                for(var tmpi in tmp){
                    results.push(tmp[tmpi]);
                }
            }
        }
        if(results.length > 0)
            return results;
    },


    /** Create an object from XML using a Sax parser
     * @oaram {function} handler
     * @param {string} xml String to be parsed
     * @return {Object} Parsed object
     */
    parseSaxFromString: function(handler, xmlString) {
        return javaStatic("ed.js.JSSaxParser", "getParser")(handler, xmlString);
    },

    /** Turn a string into a DOM
     * @param {string} content String to be converted
     * @returns {Object} The root node of the DOM
     */
    parseDomFromString: function( content ) {
        var handler = {
            root: null,
            stack : [],
            startElement : function(uri, localName, name, attributes) {

                var node = new xml.Node( localName , name , uri );

                attributes.forEach(function(attr) {
                    node.attributes[attr.qName] = attr;
                });


                if(this.stack.length > 0) {
                    this.stack[this.stack.length - 1].elements.push(node);
                } else {
                    this.root = node;
                }
                this.stack.push(node);
            },
            endElement : function(uri, localName, name) {
                this.stack.pop();
            },
            text : function(text) {
                var textOwner = this.stack[this.stack.length - 1];

                if(textOwner.text.length > 0)
                    textOwner.textString += " " + text;
                else
                    textOwner.textString = text;

                textOwner.text.push(text);
            },
            warning: function(msg) {
                log.warn(msg);
            },
            error: function(msg) {
                log.error(msg)
            },
            fatalError: function(msg) {
                log.error("FATAL: " + msg);
            }
        };


        this.parseSaxFromString(handler, content);

        return handler.root;
    },

    /** Turn a json string into an object
     * @param {string} content
     * @returns {Object}
     */
    parseJsonFromString: function( content ){
        var x = xml.parseDomFromString( content );
        return xml.__domToJson(x);
    },
    __domToJson: function(node){
        var o = {};
        if(node.elements.length == 0 && node.text.length == 1){
            var s = node.text[0];
            o[node.localName] = [s];
            s._props = {};
            for(var key in node.attributes){
                var a = node.attributes[key];
                s._props[key] = a.value;
            }
            return o;
        }

        node.elements.forEach(function(c){
            var j = xml.__domToJson(c);
            var key = Object.keys(j)[0];
            if(key in o){
                o[key].push(j[key][0]);
            }
            else {
                o[key] = j[key];
            }
        });
        if(Object.keys(node.attributes).length > 0){
            o._props = {};
            for(var key in node.attributes){
                var a = node.attributes[key];
                o._props[key] = a.value;
            }
        }
        var n = {};
        n[node.localName] = [o];
        return n;
    },

};

/** @constructor A node of XML
 * @param {string} localName Tag name
 * @param {string} qName
 * @param {string} uri
 */
xml.Node = function( localName , qName , uri ){
    this.localName = localName;
    this.qName = qName;
    this.uri = uri;
    this.text = [];
    this.textString = null;
    this.attributes = {};
    this.elements = [];
};

/** Find all elements with a certain tag
 * @param {string} tag Tag name
 * @param {Array} lst Tags that match
 * @param {Array} The array of matching tags (<tt>lst</tt>)
 */
xml.Node.prototype.getAllByTagName = function( tag  , lst ){
    if ( ! lst )
        lst = [];

    if ( this.localName == tag )
        lst.add( this );

    for ( var i=0; i<this.elements.length; i++){
        this.elements[i].getAllByTagName( tag , lst );
    }

    return lst;
};

/** Get a uniquely named tag
 * @param {string} tag Tag name
 * @returns {xml_tag} Matching tag or null
 * @throws {Exception} If more than one tag matches
 */
xml.Node.prototype.getSingleChild = function( tag ){
    var n = null;

    for ( var i=0; i<this.elements.length; i++){
        if ( this.elements[i].localName == tag ){
            if ( n )
                throw "more than 1 '" + tag + "'";
            n = this.elements[i];
        }
    }

    return n;
}

/** Print tag name
 * @returns {string} Local name
 */
xml.Node.prototype.toString = function(){
    return "Node:" + this.localName;
}

/** Determine if an object has a given property name
 * @param {Object} obj Object to check
 * @param {string} prop Property to match
 */
function haskey(obj, prop){
    if ( ! isObject( obj ) )
        return false;
    for (var i in obj){
        if (i == prop){
            return true;
        }
    }
    return false;
}

