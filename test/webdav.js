db = connect("test-webdav");

core.testing.client();

var oldOpenFile;
var sandboxDir;
var sandboxPath = "/tmp/webdav-test";

function setup() {
    sandboxDir = openFile(sandboxPath);

    sandboxDir.mkdirs();
    
    oldOpenFile = openFile;
    openFile = function(path) {
        var f = oldOpenFile(sandboxPath+"/"+path);       
        return f;
    }
}

var tests = [
            { 
                name: "options", 
                test: function() {
                    var t = new testing.Client();
                    t.setURL("");
                    t.setMethod("OPTIONS");
                    
                    var results = t.execute(core.webdav);
                    
                    assert(results == "", "Body isn't empty");
                    var allowedMethods = t.headers["Allow"];
                    for each(m in ["OPTIONS", "GET", "PROPFIND", "PUT", "PROPPATCH", "LOCK", "UNLOCK"])
                        assert(allowedMethods.indexOf(m) > -1, m + " is not supported!");
                    assert(t.headers["Dav"] != null, "Version not found");
                    assert(t.headers["MS-Author-Via"] == "DAV", "ms hack not found");
                }
            },
            {
                name: "admins only",
                test: function() {
                    var t = new testing.Client();
                    t.setURL("/");
                    
                    results = t.execute(core.webdav);
                    assert(t.responseCode == 401, "Expected unauthorized response, got: " + t.responseCode);
                    
                    results = t.withPermission("admin", core.webdav);
                    assert(t.responseCode == 200, "Invalid response, got: " + t.responseCode + ", expected: 200");
                }
            },
            {
                name: "mkcol",
                test: function() {
                    var t = new testing.Client();
                    t.setURL("/dir1");
                    t.setMethod("MKCOL");
                    
                    var results = t.withPermission("admin", core.webdav);
                    assert(t.responseCode, 200, "WebDAV returned error code: " + t.responseCode);
                    assert(results == "", "response body should be empty");
                    
                    var f = openFile("/dir1");
                    assert(f.isDirectory(), "failed to find the created folder");
                    
                    
                    results = t.withPermission("admin", core.webdav);
                    assert(results == "", "response body should be empty");
                    assert(t.responseCode == 405, "expected a 405 when recreating an existing dir, got: " + t.responseCode);
                }
            },
            {
                name: "fake post",
                test: function() {
                    createFile("f0.txt", "content0\n");
                    createFile("dir1/f20.txt", "content20\n");
                }
            },
            {
                name: "propfind",
                test: function() {
                    //level1
                    var result1 = propFind("/", 1, "admin");
                    assert(result1.response.length() == 3);
                    
                    assert(result1.response.(href == "/") != null);
                    assert(result1.response.(href == "/").propstat.prop.resourcetype.children()[0].localName() == "collection");
                    assert(result1.response.(href == "/").propstat.prop.getcontenttype == "httpd/unix-directory");
                    assert(result1.response.(href == "/dir1") != null);
                    assert(result1.response.(href == "/dir1").propstat.prop.resourcetype.children()[0].localName() == "collection");
                    assert(result1.response.(href == "/dir1").propstat.prop.getcontenttype == "httpd/unix-directory");
                    assert(result1.response.(href == "/f0.txt") != null);
                    assert(result1.response.(href == "/f0.txt").propstat.prop.resourcetype.children()[0].localName() != "collection");
                    assert(result1.response.(href == "/f0.txt").propstat.prop.getcontenttype != "httpd/unix-directory");
                    
                    assert(result1.response.propstat.prop.getlastmodified.length() == 3);
                    assert(result1.response.propstat.prop.getetag.length() == 3);
                    assert(result1.response.propstat.prop.supportedlock.length() == 3);
                    assert(result1.response.propstat.prop.supportedlock.children().length() == 0);
                    assert(result1.response.propstat.prop.lockdiscovery.children().length() == 0);
                    
                    
                    //multilevel
                    var result2 = propFind("/", 5, "admin");
                    assert(result2.response.length() == 4, result2.response);
                    assert(result2.response.(href == "/") != null);
                    assert(result2.response.(href == "/dir1") != null);
                    assert(result2.response.(href == "/f0.txt") != null);
                    assert(result2.response.(href == "/dir1/f20.txt") != null);
                    
                }
            },
            {
                name: "get",
                test: function() {
                    var t = new testing.Client();
                    t.setURL("/f0.txt");
                    t.setMethod("GET");
                    
                    t.withPermission("admin", core.webdav);
                    
                    assert(t.sentFiles.length == 1);
                    assert(t.sentFiles[0].asString() == "content0\n");
                }
            },
            {
                name: "delete",
                test: function() {
                    var t = new testing.Client();
                    t.setURL("/dir1");
                    t.setMethod("DELETE");
                    
                    t.withPermission("admin", core.webdav);
                    var r = propFind("/", 5, "admin");
                    
                    for(var href in r.response.href)
                        assert(!href.startsWith("/dir1"));
                }
            },
            {
                name: "put_post",
                test: function() {
                    //TODO: mock post data
                }
            },
            {
                name: "move",
                test: function() {
                    var t = new testing.Client();
                    t.setURL("/f0.txt");
                    t.setMethod("MOVE");
                    t.addHeader("Destination: /f1.txt");
                    t.withPermission("admin", core.webdav);
                    
                    assert(t.responseCode == 200);
                    
                    var r = propFind("/", 1, "admin");

                    assert(r.response.(href == "/f1.txt") != null);
                    assert(r.response.(href == "/f0.txt") == null);
                }
            },
            {
                name: "lock",
                test: function() {
                    var t = new testing.Client();
                    t.setURL("/f0.txt");
                    t.setMethod("LOCK");
                    
                  //fake a response.reset part1/2
                    var oldGetResponse = t.getResponse;
                    var resetMarker = "----JXP_WRITER_RESET----";
                    t.getResponse = function() {
                        var response = oldGetResponse.call(t);
                        response.getJxpWriter = function() { return { reset: function() { print(resetMarker); } } };
                        return response;
                    };
                    
                    var results = t.withPermission("admin", core.webdav);
                    
                    //hack around writer reset part2/2
                    var i = results.lastIndexOf(resetMarker);
                    i = (i == -1)? 0 : i+resetMarker.length;
                    results = results.substring(i);
                    
                    results = doXML(results);
                    
                    assert(results.lockdiscovery.activelock.locktype.children()[0].localName() == "write" );
                    assert(results.lockdiscovery.activelocktype.lockscope.children()[0].localName() == "exclusive" );
                    assert(results.lockdiscovery.activelocktype.depth.children()[0] == "infinity" );
                    assert(results.lockdiscovery.activelocktype.locktoken.href.text() );

                }
            }
            
            
];
//helpers
function cleanup() {
    openFile = oldOpenFile;
    sandboxDir.remove(true);
}

function runTests() {
    setup();
    try {
        for each(var test in tests) {
            log("testing: " + test.name);
            test.test();
        }
    }
    finally {
        try { cleanup(); } catch(e) {}
    }
}


//utility functions
function doXML(xmlStr) {
    //remove xml declaration, e4x doesnt support it
    //var declREStr = /<\?xml\s+version\s*=\s*(["'])[^\1]+\1[^?]*\?>/;
    var declREStr = /^\w*<\?xml\s+version\s*=\s*"[^"]+"[^?]*\?>/g;
    assert( declREStr.test(xmlStr), "xml doesn't start with a declaration" );    
    xmlStr = xmlStr.replace(declREStr, "").trim();

    return  new XML(xmlStr);
}

function createFile(path, name) {
    path = sandboxPath + "/" + path;
    
    var f = javaCreate("java.io.File", path);
    f.createNewFile();
    
    var stream = javaCreate("java.io.PrintStream", f);
    stream.print("content0\n");
    stream.close();
}

function propFind(path, depth, perms) {
    var t = new testing.Client();
    t.setURL(path);
    t.setMethod("PROPFIND");
    if(depth != null)
        t.addHeader("Depth: " + depth);
    
    //fake a response.reset part1/2
    var oldGetResponse = t.getResponse;
    var resetMarker = "----JXP_WRITER_RESET----";
    t.getResponse = function() {
        var response = oldGetResponse.call(t);
        response.getJxpWriter = function() { return { reset: function() { print(resetMarker); } } };
        return response;
    };
    
    var results = t.withPermission(perms, core.webdav);
    
    if(t.responseCode != 207)
        throw t;
    
    //hack around writer reset part2/2
    var i = results.lastIndexOf(resetMarker);
    i = (i == -1)? 0 : i+resetMarker.length;
    results = results.substring(i);

    results = doXML(results);
    
    assert(results.localName() == "multistatus");
    
    return results;
}


//go!
runTests();

