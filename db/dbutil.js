// dbutil.js - database helper functions

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

dbutil = {
    // associate a class with a table
    associate: function(cls, table){
        cls.find = table.find;
        cls.findOne = table.findOne;
        cls.save = table.save;
        cls.remove = table.remove;
        cls.prototype.save = function(){ table.save(this); };
    }
};
