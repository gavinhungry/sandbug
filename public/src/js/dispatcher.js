/*
 * debugger.io: An interactive web scripting sandbox
 *
 * dispatcher.js:
 */

define(function(require) {
  'use strict';

  var $      = require('jquery');
  var _      = require('underscore');
  var bus    = require('bus');
  var config = require('config');
  var utils  = require('utils');

  // ---

  var dispatcher = utils.module('dispatcher');

  return dispatcher;
});
