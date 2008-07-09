/**
 * File object
 * contains multiple useful static functions
 * @author Dana Spiegel dana@10gen.com
 * @namespace
 */
file.File = function() {};

/** Upload a file to the _files collection.
 * @param {file} file File to be saved.
 * @return {ObjectId} The object id of a file if it was valid and successfully saved.  Otherwise, null.
 */
file.File.upload = function(file) {
    if (file) {
        db._files.save(file);
        return file._id;
    }
    return null;
}