define(['jquery', 'underscore', 'jasmine_jquery'],
function($, _) {
  'use strict'

  /**
   * Create a new matcher
   *
   * @param {Function} passer
   * @param {Function} [failer]
   */
  var create_matcher = function(passer, failer) {

    // default fail handlers is the inverse of the pass handler
    failer = failer || function(actual, expected) {
      return !passer(actual, expected);
    };

    return function(util) {
      return {
        compare: function(actual, expected) {
          return { pass: passer(actual, expected) };
        },
        negativeCompare: function(actual, expected) {
          return { pass: failer(actual, expected) };
        }
      };
    };
  };

  var matchers = {
    toBeAjQueryObject: create_matcher(function(actual, expected) {
      return actual instanceof $;
    }),

    toBeAnArray: create_matcher(function(actual, expected) {
      return _.isArray(actual);
    })
  };

  return {
    addMatchers: function() {
      beforeEach(function() { jasmine.addMatchers(matchers); });
    }
  };

});
