/*
 * debugger.io: An interactive web scripting sandbox
 */

/**
 * Underscore.js (Lo-Dash)
 *
 * Includes: Underscore.string, underscore.inflection, _.objMapFunctions
 */
define(function(require) {
  'use strict';

  var _ = require('underscorejs');
  var str = require('string');
  var inflection = require('inflection');
  var objmap = require('objmap');

  _.mixin(str.exports());
  _.mixin(objmap);

  return _;
});
