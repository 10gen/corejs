core.core.file();

/** The interface between docgen module and the appserver.
 * Only programs in corejs can call Java functions.
 * @namespace
 */
Util.Doc = {};

Util.Doc.initialize = function() {
    javaStatic("ed.doc.Generate", "initialize");
}

/** Given a source file or directory, generate documentation and store it in db.doc
 * @param {string} file Name of the file or directory for which to generate documentation
 */
Util.Doc.srcToDb = function(file) {
    javaStatic("ed.doc.Generate", "connectToDb");
    javaStatic("ed.doc.Generate", "srcToDb", file);
}

Util.Doc.javaSrcsToDb = function() {
    javaStatic("ed.doc.Generate", "javaSrcsToDb");
}


/** Generate html files from db.doc and store them in db.doc.html.
 * @param {string} out_dir Location to store temporary output files
 * @param {string} version Version of the documentation being generated
 */
Util.Doc.dbToHTML = function(out_dir, version) {
    javaStatic("ed.doc.Generate", "connectToDb");

    // put any global variables in the db
    javaStatic("ed.doc.Generate", "globalToDb");

    javaStatic("ed.doc.Generate", "setupHTMLGeneration", out_dir);

    var d = db.doc.find({version : version});

    while(d.hasNext()) {
        this.dbObjToHTML(d.next(), out_dir);
    }
    db.doc.html.drop();
    db.doc.html.resetIndexCache();

    javaStatic("ed.doc.Generate", "postHTMLGeneration", out_dir);

    db.doc.html.ensureIndex({name:1});
}

/** Generates an html file from a db.doc object
 * @param {Object} obj Object from the db.doc collection
 * @param {string} out_dir Directory to store html files temporarily
 */
Util.Doc.dbObjToHTML = function(obj, out_dir) {
    javaStatic("ed.doc.Generate", "toHTML", tojson(obj._index), out_dir);
}

/** Sets the documentation version.
 * @param {string} version The name of the version
 */
Util.Doc.setVersion = function(version) {
    javaStatic("ed.doc.Generate", "setVersion", version);
}
