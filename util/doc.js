core.core.file();

Util.Doc = {};

Util.Doc.SrcToDb = function(file) {
    javaStatic("ed.doc.Generate", "srcToDb", file);
}

Util.Doc.DbToHTML = function(out_dir, version) {
    
    javaStatic("ed.doc.Generate", "setupHTMLGeneration", out_dir);
    
    db.doc.html.drop();
    var d = db.doc.find({version : version});
    while(d.hasNext()) {
        this.DbObjToHTML(d.next(), out_dir);
    }
    
    db.doc.html.ensureIndex({name:1});
    
    javaStatic("ed.doc.Generate", "postHTMLGeneration", out_dir);
    
}

Util.Doc.DbObjToHTML = function(obj, out_dir) {
    javaStatic("ed.doc.Generate", "toHTML", tojson(obj._index), out_dir);
}

Util.Doc.setVersion = function(version) {
    javaStatic("ed.doc.Generate", "setVersion", version);
}
