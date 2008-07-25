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

/** Seeded random number generator
 * @namespace
 * @name random
 */
var foo = {};

/** Seeds and returns a Java random number generator.
 * See Java's java.util.Random documentation for more info.
 *
 * @param {number} seed The seed to use
 * @return {random_generator} A seed random number generator.
 * @name random.getRandom
 *
 * @example
 *   var r = core.util.random().getRandom(42);
 *   r.nextInt();
 */
foo.getRandom = function(seed) {
    return javaCreate("java.util.Random", seed || 0);
};

return foo;
