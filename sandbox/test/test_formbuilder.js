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

db = connect('tests');  // stupid workaround for threaded needing the DB

core.sandbox.formbuilder();

FormBuilder = sandbox.FormBuilder;

var qw = function(s){ return s.trim().split(/\s+/); };

print(qw('  a b c').length);

var form = new FormBuilder({
    fields: qw('name gender email'),
    attr: {action: "form_whoo"},
    action: "form_handler",
});

form.field("gender", {options: qw('male female')});

print(form.render());
