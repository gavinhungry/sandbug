/**
 * Underscore.js (Lo-Dash)
 *
 * Includes: Underscore.string
 */
define(['lodash', 'underscore.string'],
function(_, str) {
  _.mixin(str.exports());
  return _; // _.noConflict();
});
