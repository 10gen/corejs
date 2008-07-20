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

core.net.email();

emails = ["ethan@10gen.com", "fred.j.bloggs@example.net", "ethan+NOSPAM@10gen.com", "ethan@10gen.co.uk"];
for(i in emails){
    s = emails[i];
    assert(net.isEmail(s));
}

notemails = ["Dana", "ethan!@10gen.com", "ethan@ethan@ethan", "-email@10gen.com"];
for(i in notemails){
    s = notemails[i];
    assert(! net.isEmail(s));
}

exit();
