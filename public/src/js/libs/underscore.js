/*
 * debugger.io: An interactive web scripting sandbox
 */

/**
 * Underscore.js (Lo-Dash)
 *
 * Includes: Underscore.string, underscore.inflection
 */
define(['underscorejs', 'string', 'inflection'],
function(_, str, inflection) {
  _.mixin(str.exports());
  return _; // _.noConflict();
});
