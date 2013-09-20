/*
 * jsbyte: An interactive JS/HTML/CSS environment
 *
 * utils.js: utility functions
 */

define(['jquery', 'underscore', 'config'],
function($, _, config) {
  'use strict';

  var utils = {};
  if (config.debug) { window.utils = utils; }

  /**
   * Log messages to console only in debug
   *
   * @params {Mixed}: messages to log
   */
  utils.log = function() {
    if (config.debug) {
      var args = Array.prototype.slice.call(arguments);
      args.unshift('==>');
      console.log.apply(console, args);
    }
  };

  /**
   * Ensure that a value is, in fact, an array
   * (useful when passing an unknown value to Array.forEach)
   *
   * @param {Mixed} value
   */
  utils.ensure_array = function(value) {
    if (value === undefined || value === null) { return []; }
    return _.isArray(value) ? value : [value];
  };

  /**
   * New module is just an empty object, but attach it to the global window
   * object if config.debug is set
   *
   * @param {String} name: name of the module (only relevant to window)
   * @return {Object}: empty module object
   */
  utils.module = function(name) {
    var module = {};
    if (config.debug) { window[name] = module; }
    return module;
  };

  /**
   * Get an absolute URI on the jsbyte domain
   * TODO: if URI is already absolute, return the string unmodified
   *
   * @param {String} path: relative or absolute URI
   * @return {String}: absolute URI
   */
  utils.uri = function(path) {
    return config.root + path;
  };

  return utils;
});
