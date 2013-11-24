define(['underscore', 'underscore.string'],
function(_, str) {
  _.mixin(str.exports());
  return _; // _.noConflict();
});
