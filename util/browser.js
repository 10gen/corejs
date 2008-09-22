// browser.js

/*
* this sets up your scope to feel more like a browser
*/

navigator = {
    userAgent : "10gen" ,
    appVersion : "1" ,
    mimeTypes : { } ,
    language : "en"
};

document = {
    getElementsByTagName : function( tag ){
	return [];
    }
};

window = { 
    document : document 

};
