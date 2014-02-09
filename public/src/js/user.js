/*
 * debugger.io: An interactive web scripting sandbox
 *
 * user.js: user actions
 */

define([
  'config', 'utils', 'jquery', 'underscore',
  'bus', 'flash'
],
function(
  config, utils, $, _,
  bus, flash
) {
  'use strict';

  var user = utils.module('user');

  /**
   * Log the current user out
   */
  user.logout = function() {
    $.post('/api/logout').done(function(data) {
      bus.trigger('user:logout');
    }).fail(function() {
      flash.message_bad(locales.string('logout_error'));
    });
  };

  return user;
});
