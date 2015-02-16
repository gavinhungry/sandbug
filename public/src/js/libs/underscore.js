/*
 * debugger.io: An interactive web scripting sandbox
 */

/**
 * Underscore.js
 *
 * Includes: Underscore.string, underscore.inflection, _.objMapFunctions,
 * underscore.deepclone
 */
define(function(require) {
  'use strict';

  var _ = require('underscorejs');
  var str = require('string');
  var inflection = require('inflection');
  var objmap = require('objmap');
  var deepclone = require('deepclone');

  _.str = str;
  _.mixin(objmap);

  return _;
});
