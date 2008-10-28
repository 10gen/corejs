processRequestNotice = function(){
    if(request.notice){
        addToNotice("request", request.notice);
    }
};

/** Universal header for html pages.
 * If global variable <tt>useHeader</tt> is set, it will call that instead.
 * If local.pieces.header is set, it will call that instead.
 * If neither is set, it will print a basic header.
 * @param {string} [title="10gen Application"] Page &lt;title&gt;
 */
htmlheader = function(title) {
    processRequestNotice();  // I'm not sure this is the right thing in general

    title = title || '10gen Application';

    if ( useHeader )
        return useHeader( { title : title } );

    if ( local && local.pieces && local.pieces.header )
        return local.pieces.header( { title: title } );

    print('<html><head><title>' + title + '</title></head><body>');
}

/** Universal footer for html pages.
 * If global variable <tt>useFooter</tt> is set, it will call that instead.
 * If local.pieces.footer is set, it will call that instead.
 * If neither is set, it will print a basic footer.
 */
htmlfooter = function() {
    if ( useFooter )
        return useFooter();

    if ( local && local.pieces && local.pieces.footer )
        return local.pieces.footer();

    print('</body></html>');
}

core.content.html();

addToNotice = function(key, value){
    // FIXME: This is a XSS attack waiting to happen.
    // Want us to show some code? Just link to a URL like
    // /?notice=<script>...</script>
        // This is a problem and I'd really like to fix it but
    // I don't know how. Right now login system uses this;
    // the form handler redirects to a different page, possibly
    // with a notice. The only way to handle this is by passing
    // something through the URL. We really need something like
    // Rails's Flash object.
    // Maybe if we had a routes system, we could just call the target
    // of whatever URL it was, rather than redirect.. but right now
    // we can't.
    if(! notice){
        notice = {};
    }

    log.addToNotice.debug("Got " + value);

    // Try to prevent XSS, at least.
    value = content.HTML.escape(value);
    notice[key] = value;
};

/**
 *   Function to mask how we add modules so we can change the underlying mechanism ASAP
 *
 *   @param {String} name Name of module to install.  Currently this is the path from corejs root.  Horrors.
 *   @param {Object} params Paramter object for the specified module
 */
addModule = function(name, params) {
    if (!allowModule) {
	allowModule = {};
    }

    allowModule[name] = params || {};
}
