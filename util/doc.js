/**
*      Copyright (C) 2008 10gen Inc.
*
*    Licensed under the Apache License, Version 2.0 (the "License");
*    you may not use this file except in compliance with the License.
*    You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*    Unless required by applicable law or agreed to in writing, software
*    distributed under the License is distributed on an "AS IS" BASIS,
*    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*    See the License for the specific language governing permissions and
*    limitations under the License.
*/

core.core.file();

/** The interface between docgen module and the appserver.
 * Only programs in corejs can call Java functions.
 * @namespace
 * @docmodule core.util.doc
 */
Util.Doc = {
    /** Semaphore raised while documentation is being generated.
     * @type boolean
     */
    inProgress : false
};

/** Initializes variables used for documentation.
 */
Util.Doc.initialize = function() {
    javaStatic("ed.doc.Generate", "initialize");
}

/** Given a source file or directory, generate documentation and store it in db.doc
 * @param {string} file Name of the file or directory for which to generate documentation
 */
Util.Doc.srcToDb = function(file) {
    this.inProgress = true;
    javaStatic("ed.doc.Generate", "connectToDb");
    javaStatic("ed.doc.Generate", "srcToDb", file);
}

/** Takes the list of Java sources and creates database documentation objects for them.
 */
Util.Doc.javaSrcsToDb = function() {
    javaStatic("ed.doc.Generate", "javaSrcsToDb");
    this.inProgress = false;
}

Util.Doc.toDb = function( file ) {
    Util.Doc.initialize();
    Util.Doc.srcToDb( file );
    Util.Doc.javaSrcsToDb();
}

/** Generate html files from db.doc and store them in db.doc.html.
 * @param {string} out_dir Location to store temporary output files
 */
Util.Doc.dbToHTML = function(out_dir) {
    this.inProgress = true;
    javaStatic("ed.doc.Generate", "connectToDb");

    // put any global variables in the db
    javaStatic("ed.doc.Generate", "globalToDb");

    javaStatic("ed.doc.Generate", "setupHTMLGeneration", out_dir);

    var d = db.doc.find();

    while(d.hasNext()) {
        this.dbObjToHTML(d.next(), out_dir);
    }

    javaStatic("ed.doc.Generate", "postHTMLGeneration", out_dir);
    db.doc.ensureIndex({name : 1});
    this.inProgress = false;
}

/** Generates an html file from a db.doc object
 * @param {Object} obj Object from the db.doc collection
 * @param {string} out_dir Directory to store html files temporarily
 */
Util.Doc.dbObjToHTML = function(obj, out_dir) {
    javaStatic("ed.doc.Generate", "toHTML", tojson(obj._index), out_dir);
}

