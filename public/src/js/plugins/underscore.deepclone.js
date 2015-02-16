/* https://github.com/mateusmaso/underscore.deepclone
 * MIT license
 *
 * Re-written for AMD by Gavin Lloyd <gavinhungry@gmail.com>
 */
define(function(require) {
  'use strict';

  var _ = require('underscore');

  _.mixin({
    deepClone: function(object) {
      var clone = _.clone(object);

      _.each(clone, function(value, key) {
        if (_.isObject(value)) {
          clone[key] = _.deepClone(value);
        }
      });

      return clone;
    }
  });

});
