/** Seeded random number generator
 * @namespace
 * @name random
 */
var foo = {};

/** Seeds a random number generator.
 * @param {number} seed The seed to use
 * @return {random_generator} A seed random number generator.
 * @name random.getRandom
 */
foo.getRandom = function(seed) {
    return javaCreate("java.util.Random", seed);
};

return foo;


