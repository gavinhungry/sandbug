/*
 * debugger.io: An interactive web scripting sandbox
 *
 * user.js: user actions
 */

define(function(require) {
  'use strict';

  var $      = require('jquery');
  var _      = require('underscore');
  var bus    = require('bus');
  var config = require('config');
  var utils  = require('utils');

  var flash = require('flash');

  // ---

  var user = utils.module('user');

  /**
   * Log the current user out
   */
  user.logout = function() {
    $.post('/api/logout').done(function(data) {
      bus.trigger('user:logout');
    }).fail(function() {
      flash.message_bad('@logout_error');
    });
  };

  return user;
});
