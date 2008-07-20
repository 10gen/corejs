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

/** Generic functionality for invoking a logging system in a web browser
 * @namespace
 */
log.Client = function() {};

var createLogReaderCode = '<script type="text/javascript">\n' +
                            'createLogReader = new function() { logReader = new YAHOO.widget.LogReader(); };\n' +
                            'YAHOO.util.Event.onDOMReady(createLogReader);' +
                            '</script>';
//BROKEN

/** Install YUI logger.
 * @namespace
 */
log.Client.Install = function() {
    head.push('<link type="text/css" rel="stylesheet" href="/@@/yui/current/logger/assets/skins/sam/logger.css"/>');
    head.push('<script type="text/javascript" src="/@@/yui/current/logger/logger.js"></script>');
//    head.push(createLogReaderCode);
};
