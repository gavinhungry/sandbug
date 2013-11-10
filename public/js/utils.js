/*
 * debugger.io: An interactive web scripting sandbox
 *
 * utils.js: utility functions
 */

define(['config', 'jquery', 'underscore'],
function(config, $, _) {
  'use strict';

  var utils = {};
  if (config.debug) { window.utils = utils; }

  /**
   * Log messages to console only in debug
   *
   * @param {Mixed} - messages to log
   */
  utils.log = function() {
    if (config.debug) {
      var args = _.toArray(arguments);
      args.unshift('==>');
      console.log.apply(console, args);
    }
  };

  /**
   * Ensure that a value is wrapped with jQuery
   *
   * @param {Mixed} value
   * @return {jQuery}
   */
  utils.ensure_jquery = function(value) {
    if (value instanceof $) { return value; }
    if ((value instanceof HTMLElement) || _.isArray(value)) { return $(value); }
    return $();
  };

  /**
   * Ensure that a value is an array
   *
   * @param {Mixed} value
   * @return {Array}
   */
  utils.ensure_array = function(value) {
    if (value === undefined || value === null) { return []; }
    return _.isArray(value) ? value : [value];
  };

  /**
   * Ensure that a value is a string
   *
   * @param {Mixed} value
   * @return {String}
   */
  utils.ensure_string = function(value) {
    return _.isString(value) ? value : (value ? value + '' : '');
  };

  /**
   * New module is just an empty object, but attach it to the global window
   * object if config.debug is set
   *
   * @param {String} name - name of the module (only relevant to window)
   * @param {Object} [base] - base object to use
   * @param {Boolean} [global] - if true, attach to global window object as well
   * @return {Object} empty module object
   */
  utils.module = function(name, base, global) {
    var module = base || {};
    module.priv = module.priv || {};

    if (global || (global === undefined && config.debug)) {
      window[name] = module;
    }

    return module;
  };

  /**
   * Remove all double quotes (") from a string
   *
   * @param {String} str - input string
   * @return {String} input string with double quotes removed
   */
  utils.no_quotes = function(str) {
    return _.isString(str) ? str.replace(/\"/g, '') : '';
  };

  /**
   * Get an absolute URI on the debugger.io domain
   * TODO: if URI is already absolute, return the string unmodified
   *
   * @param {String} path - relative or absolute URI
   * @return {String} absolute URI
   */
  utils.uri = function(path) {
    return config.root + path;
  };

  /**
   * Get the extension of a URI or filename
   *
   * @param {String} uri - URI or filename
   * @returns {String} extension
   */
  utils.extension = function(uri) {
    uri = _.trim(utils.no_quotes(uri));
    return _.strRightBack(uri, '.');
  };

  /**
   * Get string for a new script element
   *
   * @param {String} uri - URI of script
   * @param {String} [type] - script MIME type, defaults to JavaScript
   * @return {String} script string
   */
  utils.script_element_string = function(uri, type) {
    uri = _.trim(utils.no_quotes(uri));
    type = type || ext_map['js'].type;

    return _.sprintf('<script type="%s" src="%s"></script>', type, uri);
  };

  /**
   * Get string for a new stylesheet link element
   *
   * @param {String} uri - URI of stylesheet
   * @param {String} [type] - style MIME type, defaults to CSS
   * @return {String} style link string
   */
  utils.style_element_string = function(uri, type) {
    uri = _.trim(utils.no_quotes(uri));
    type = type || ext_map['css'].type;

    return _.sprintf('<link rel="stylesheet" type="%s" href="%s">', type, uri);
  };

  // map file extensions to functions generating the appropriate element string
  var ext_map = {
    'js': {
      tag: 'script',
      type: 'application/javascript',
      fn: utils.script_element_string
    },

    'css': {
      tag: 'link',
      type: 'text/css',
      fn: utils.style_element_string
    }
  };

  /**
   * Get the tag name that should be used for a resource, based on extension
   *
   * @param {String} uri - URI of resource
   * @return {String} tag name of resource
   */
  utils.resource_tag = function(uri) {
    var ext = utils.extension(uri);

    var map = ext_map[ext];
    return map ? map.tag : null;
  };

  /**
   * Get string for a new resource element, based on extension
   *
   * @param {String} uri - URI of resource
   * @return {String} resource element string
   */
  utils.resource_element_string = function(uri) {
    var ext = utils.extension(uri);

    var map = ext_map[ext];
    return map ? map.fn(uri, map.type) : null;
  };

  /**
   * Create a promise that resolves to a value now
   *
   * @param {Mixed} value - value that the promise will resolve to
   * @return {Promise} promise to return value
   */
  utils.promise_now = function(value) {
    return $.Deferred().resolve(value).promise();
  };

  /**
   * Return a number clamped by a minimum and maximum
   *
   * @param {Number} value - number to clamp
   * @param {Number} [min] - minimum value, defaults to 0
   * @param {Number} [max] - maximum value, defaults to `value`
   * @return {Number} clamped value
   */
  utils.clamp = function(value, min, max) {
    value = _.isFinite(value) ? value: 0;
    min = _.isFinite(min) ? min : Number.NEGATIVE_INFINITY;
    max = _.isFinite(max) ? max : Number.POSITIVE_INFINITY;

    return Math.min(Math.max(value, min), max);
  };

  /**
   * An array of limited capacity
   *
   * @param {Number} cap - capacity of the buffer
   */
  utils.Buffer = function(cap) {
    this._data = [];
    this.set_cap(cap);
  };

  utils.Buffer.prototype = {

    /**
     * Buffer some value(s), then truncating to capacity
     *
     * @param {Mixed} - value(s) to buffer
     * @return {this}
     */
    buf: function() {
      _.each(arguments, function(arg) { this._data.push(arg); }, this);
      if (this._data.length > this._cap) {
        this._data.splice(0, this._data.length - this._cap);
      }

      return this;
    },

    set_cap: function(cap) { this._cap = utils.clamp(cap, 0); },
    get: function() { return this._data.slice(0); },
    flush: function() { this._data = []; }
  };

  return utils;
});
