/*
 * debugger.io: An interactive web scripting sandbox
 *
 * conn.js: output console
 */

define(function(require) {
  'use strict';

  var $      = require('jquery');
  var _      = require('underscore');
  var bus    = require('bus');
  var config = require('config');
  var utils  = require('utils');

  // ---

  var conn = utils.module('conn');

  /**
   * Add a new message to the conn
   *
   * @param {String} type - console method, one of ('log', 'error', etc.)
   * @param {String} timestamp - ISO formatted timestamp
   * @param {Array} args
   */
  conn.write = function(type, timestamp, args) {

    conn.console.debug(type, timestamp, args);

  };

  return conn;
});
