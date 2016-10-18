/*
 * sandbug: An interactive web scripting sandbox
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

  // ---

  var user = utils.module('user');

  bus.init(function(av) {
    bus.on('login', user.login);
    bus.on('logout', user.logout);
    bus.on('user:login', user.get_settings);

    if (config.username) {
      _.defer(function() {
        user.get_settings();
      });
    }
  });

  /**
   * Prompt a user to login
   */
  user.login = function() {
    bus.trigger('popup:login');
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

  /**
   * @return {Promise}
   */
  user.get_settings = function() {
    return $.ajax({
      method: 'GET',
      url: '/api/user'
    }).then(function(user) {
      _.each(user.settings, function(value, setting) {
        config[setting] = value || config['default_' + setting];
      });
    });
  };

  return user;
});
