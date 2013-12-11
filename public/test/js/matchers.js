define(['jquery', 'underscore'],
function($, _) {
  'use strict'

  var matchers = {
    toBeAjQueryObject: function() { return this.actual instanceof $; },
    toBeAnArray: function() { return _.isArray(this.actual); }
  };

  return {
    addMatchers: function() {
      beforeEach(function() { this.addMatchers(matchers); });
    }
  };

});
