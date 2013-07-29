define(['underscorejs', 'string'],
function(_, str) {
  _.mixin(str.exports());
  return _.noConflict();
});
