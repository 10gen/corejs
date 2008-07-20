
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

ui.elements.Menu = function(){
    
};

ui.elements.Menu.display = function( o ){
    head.addCSS( "/@@/yui/current/base/base.css" );
    head.addCSS( "/@@/yui/current/menu/assets/skins/sam/menu.css" );

    head.addScript( "/@@/yui/current/yahoo-dom-event/yahoo-dom-event.js" );
    head.addScript( "/@@/yui/current/container/container_core.js" );
    head.addScript( "/@@/yui/current/menu/menu.js" );

    core.ui.elements.html.menuBase( o );
};

ui.elements.Menu.example = function(){
    
    var m =[
        { name : "Search Engines" , link : "/searchEngines" ,
          submenu : [
              { name : "Google" , link : "http://www.google.com/" } ,
              { name : "Yahoo!" , link : "http://www.yahoo.com/" }
          ]
        } ,

        { name : "Tech Blogs" , link : "/techBlogs" ,
          submenu : [
              { name : "Slashdot" , link : "http://slashdot.org" } ,
              { name : "Mac Rumors" , link : "http://www.macrumors.com/" }
          ] 
        } , 
        
        { name : "Foo" , link : "Bar" } , 
        
        { name : "A" , link : "B" ,
          submenu : [
              { name : "1" , link : "1" ,
                submenu : [
                    { name : "11" , link : "11" }
                ]
              } ,
              { name : "2" , link : "2" } 
          ]
        }
        
    ];
    
    ui.elements.Menu.display( m );
    
};
