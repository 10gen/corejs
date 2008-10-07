import os
import httplib2
from xml.dom import minidom, Node

host = "localhost"
port = 8080
user = "igor"
password = "moo"


def assert_equals(expected, actual, msg):
    if(expected != actual):
        print(msg + ". Expected: [%s], Actual: [%s]" % (expected, actual) )

def assert_true(con, msg):
    if(not con):
        print(msg)

def do_dav(method, path, is_auth=True, body=None, headers={}):
    h = httplib2.Http()
    
    if(is_auth):
        h.add_credentials(user, password)
    
    url = "http://%s:%d%s" % (host, port, path)
    
    base_headers = {"User-Agent":"webdav"}
    base_headers.update(headers)
    
    return h.request(url, method, body, headers=base_headers)

def do_xml(xmlStr):
    def cleanUpNodes( nodes ):
        """Removes all TEXT_NODES in parameter nodes that contain only         characters
        that are defined as whitespace in the string library"""
    
        for node in nodes.childNodes:
            if node.nodeType == Node.TEXT_NODE:
                node.data = string.strip(node.data)
        nodes.normalize()
    
    doc = minidom.parseString(xmlStr)
    cleanUpNodes(doc)
    
    
    
    return doc

def put_file(path, contents):
    h = httplib2.Http()
    h.add_credentials(user, password)

    url = "http://%s:%d%s" % (host, port, path)
    return h.request(url, "PUT", contents, headers={"user-agent":"webdav" }) 

def test_options():
    r,c = do_dav("OPTIONS", "", False)
    assert_equals(200, r.status, "OPTIONS not OK")
    
    allowed_methods = r["allow"].split(",")
    
    for m in ["OPTIONS", "GET", "PROPFIND", "PUT", "PROPPATCH", "LOCK", "UNLOCK"]:
        assert_true(m in allowed_methods, "Unsupported method: %s" %m)

def test_admin_only():
    r,c = do_dav("GET", "/", False)
    
    assert_equals(401, r.status, "expected Permission denied responsew")
    
    r,c = do_dav("GET", "/", True)
    assert_equals(200, r.status, "expected OK")

def test_mkcol():
    dir_name = "/mkcol"

    #create it
    r,c = do_dav("MKCOL", dir_name)
    assert_equals(200, r.status, "Expected OK for mkcol")
    #assert_equals("", c.strip(), "Message body should be empty")

    #make sure you can't create it twice
    r,c = do_dav("MKCOL", dir_name)
    assert_equals(405, r.status, "Expected 405 for  duplicate dir")
    
    #make sure it exists
    r,c = do_dav("PROPFIND", dir_name)
    doc = do_xml(c)
    hrefs = doc.getElementsByTagNameNS("DAV:", "href")
    assert_equals(1, len(hrefs), "expected only one href after mkcol")
    assert_equals(hrefs[0].firstChild.data, dir_name, "created dir not found")
    
    #cleanup
    do_dav("DELETE", dir_name)

def test_put():
    filename = "/post.txt"
    contents = "contents"

    #create
    r,c = put_file(filename, contents) 
    assert_equals(201, r.status, "Wrong status for file creation")

    #verify
    r,c = do_dav("GET", filename)
    assert_equals(contents, c, "contents differ")
    
    #cleanup
    do_dav("DELETE", filename)

def test_propfind():
    r,c = do_dav("PROPFIND", "/", True)
    assert_equals(207, r.status, "wrong status code for propfind")

    from xml.etree import ElementTree
    
    ms = ElementTree.fromstring(c)
    assert_equals("{DAV:}multistatus", ms.tag, "expected multistatus")
    assert_equals(1, len(ms.findall("{DAV:}response")), "Expected exactly one repsonse")
    assert_equals(ms.find("{DAV:}response/{DAV:}href").text, "/", "Failed to find root response")
    assert_equals(ms.find("{DAV:}response/{DAV:}propstat/{DAV:}status").text, "HTTP/1.1 200 OK", "Failed to find lockdiscovery")
    assert_equals(ms.find("{DAV:}response/{DAV:}propstat/{DAV:}prop/{DAV:}getcontenttype").text, "httpd/unix-directory", "incorrect directory contenttype")
    assert_true(ms.find("{DAV:}response/{DAV:}propstat/{DAV:}prop/{DAV:}getlastmodified") is not None, "Failed to find last modified")
    assert_true(ms.find("{DAV:}response/{DAV:}propstat/{DAV:}prop/{DAV:}getetag") is not None, "Failed to find ETag")
    assert_true(ms.find("{DAV:}response/{DAV:}propstat/{DAV:}prop/{DAV:}resourcetype/{DAV:}collection") is not None, "Failed to find resourcetype")
    assert_true(ms.find("{DAV:}response/{DAV:}propstat/{DAV:}prop/{DAV:}supportedlock") is not None, "Failed to find supportedlock")
    assert_true(ms.find("{DAV:}response/{DAV:}propstat/{DAV:}prop/{DAV:}lockdiscovery") is not None, "Failed to find lockdiscovery")
    
    do_dav("MKCOL", "/propfind_dir1")
    put_file("/propfind_file1.txt", "propfile_file1")
    put_file("/propfind_dir1/propfind_file2.txt", "propfile_file2")
    do_dav("MKCOL", "/propfind_dir1/propfind_dir2")
    put_file("/propfind_dir1/propfind_dir2/propfind_file3.txt", "propfile_file2")
    
    
    #Depth 1 propfind
    r,c = do_dav("PROPFIND", "/", headers={"Depth":"1"})
    ms = ElementTree.fromstring(c)
    hrefs = sorted([n.text for n in ms.findall('{DAV:}response/{DAV:}href')])
    assert_equals(["/", "/propfind_dir1", "/propfind_file1.txt"], hrefs, "depth 1 propfind failed")
    
    #Multi Depth propfind
    r,c = do_dav("PROPFIND", "/", headers={"Depth":"100"})
    ms = ElementTree.fromstring(c)
    hrefs = sorted([n.text for n in ms.findall('{DAV:}response/{DAV:}href')])
    assert_equals(sorted(
                  ["/", 
                   "/propfind_file1.txt",
                   "/propfind_dir1",
                   "/propfind_dir1/propfind_file2.txt",
                   "/propfind_dir1/propfind_dir2", 
                   "/propfind_dir1/propfind_dir2/propfind_file3.txt", 
                   ]), hrefs, "depth 1 propfind failed")
    
    
    #make sure files & dirs are presented correctly
    for response in ms.findall("{DAV:}response"):
        href = response.find("{DAV:}href").text

        if "file" in href:
            assert_true(response.find("{DAV:}propstat/{DAV:}prop/{DAV:}resourcetype/{DAV:}collection") is None, "File %s thinks its a dir" % href)
            assert_equals("text/plain", response.find("{DAV:}propstat/{DAV:}prop/{DAV:}getcontenttype").text, "file isn't plain text: %s" % href)
            assert_equals("14", response.find("{DAV:}propstat/{DAV:}prop/{DAV:}getcontentlength").text, "incorrect file size %s" % href)
        else:
            assert_true(response.find("{DAV:}propstat/{DAV:}prop/{DAV:}resourcetype/{DAV:}collection") is not None, "File %s thinks its a file" % href)
            assert_equals("httpd/unix-directory", response.find("{DAV:}propstat/{DAV:}prop/{DAV:}getcontenttype").text, "file isn't plain text: %s" % href)
    
    #cleanup
    do_dav("DELETE", "/propfind_file1.txt")
    do_dav("DELETE", "/propfind_dir1/")
    do_dav("DELETE", "/propfind_dir1/propfind_file2.txt")
    do_dav("DELETE", "/propfind_dir1/propfind_dir2/")
    do_dav("DELETE", "/propfind_dir1/propfind_dir2/propfind_file3.txt")

def test_move():
    filename1 = "/move1.txt"
    filename2 = "/move2.txt"
    contents = "contents"
    
    put_file(filename1, contents)
    
    r,c = do_dav("MOVE", filename1, headers={"Destination":filename2})
    assert_equals(200, r.status, "Error code for move")
    
    r,c = do_dav("GET", filename2)
    assert_equals(200, r.status, "Error getting renamed file")
    assert_equals(contents, c, "Contents mismatched")
    
    r,c = do_dav("GET", filename1)
    assert_equals(404, r.status, "original file not removed")
    
    do_dav("DELETE", filename2)

def test_lock_superficial():
    filename = "/lock.txt"
    
    put_file(filename, "contents")
    r,c = do_dav("LOCK", filename)

    doc = do_xml(c)
    
    prop = doc.getElementsByTagNameNS("DAV:","prop")[0]
    assert_true(prop.parentNode == doc, "expected prop")
    
    #prop/lockdiscovery/
    lockdisc = prop.getElementsByTagNameNS("DAV:","lockdiscovery")[0]
    assert_true(lockdisc.parentNode == prop, "expected lockdiscovery")
    
    #prop/lockdiscovery/activelock
    activelock = lockdisc.getElementsByTagNameNS("DAV:","activelock")[0]
    assert_true(activelock.parentNode == lockdisc, "expected activelock")
    
    #prop/lockdiscovery/activelock/locktype
    locktype = activelock.getElementsByTagNameNS("DAV:",'locktype')[0]
    assert_true(locktype.parentNode == activelock, "expected locktype")
    write = locktype.getElementsByTagNameNS("DAV:",'write')[0]
    assert_true(write.parentNode == locktype, "expected write")
    
    #prop/lockdiscovery/activelock/lockscope
    lockscope = activelock.getElementsByTagNameNS("DAV:", 'lockscope')[0]
    assert_true(lockscope.parentNode == activelock, "expected lockscope")
    exclusive = lockscope.getElementsByTagNameNS("DAV:", 'exclusive')[0]
    assert_true(exclusive.parentNode == lockscope, "expected exclusive")
    
    #prop/lockdiscovery/activelock/depth
    depth = activelock.getElementsByTagNameNS("DAV:", 'depth')[0]
    assert_true(depth.parentNode == activelock, "expected depth")
    infinity = depth.getElementsByTagName('infinity')[0]
    assert_true(infinity.parentNode == depth, "expected infinity")
    
    #prop/lockdiscovery/activelock/locktoken
    locktoken = activelock.getElementsByTagNameNS("DAV:", 'locktoken')[0]
    assert_true(locktoken.parentNode == activelock, "expected locktoken")
    href = locktoken.getElementsByTagNameNS("DAV:", 'href')[0]
    assert_true(href.parentNode == locktoken, "expected href")
    
    #cleanup
    do_dav("DELETE", filename)
    
test_options()
test_admin_only()
test_mkcol()
test_put()
test_propfind()
test_move()
test_lock_superficial()