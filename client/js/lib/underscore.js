define(['underscorejs', 'string', 'inflection'],
function(_, str, inflection) {
  _.mixin(str.exports());
  return _.noConflict();
});
