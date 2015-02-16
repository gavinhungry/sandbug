/**
 * Underscore.js
 *
 * Includes: Underscore.string, underscore-deep-extend
 */
define(['underscorejs', 'underscore.string', 'underscore-deep-extend'],
function(_, str, deepExtend) {
  _.str = str;
  _.mixin({ deepExtend: deepExtend(_) });

  return _; // _.noConflict();
});
