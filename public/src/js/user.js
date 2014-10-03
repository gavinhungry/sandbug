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

  var flash  = require('flash');
  var popups = require('popups');

  // ---

  var user = utils.module('user');

  /**
   * Prompt a user to login
   */
  user.login = function() {
    return popups.popup('login');
  };

  /**
   * Log the current user out
   */
  user.logout = function() {
    $.post('/api/logout').then(function(data) {
      bus.trigger('user:logout');
    }).fail(function() {
      flash.message_bad('@logout_error');
    });
  };

  return user;
});
