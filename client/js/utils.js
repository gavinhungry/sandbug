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
   * (useful when passing an unknown value to Array.forEach)
   *
   * @param {Mixed} value
   * @return {Array}
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
   * @param {Object} base (optional): base model to use
   * @return {Object}: empty module object
   */
  utils.module = function(name, base) {
    var module = base || {};
    if (config.debug) { window[name] = module; }
    return module;
  };

  /**
   * Remove all double quotes (") from a string
   *
   * @param {String} str: input string
   * @return {String}: input string with double quotes removed
   */
  utils.no_quotes = function(str) {
    return _.isString(str) ? str.replace(/\"/g, '') : '';
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
   * @param {String} uri: URI of script
   * @param {String} type (optional): script MIME type, defaults to JavaScript
   * @return {String}: script string
   */
  utils.script_element_string = function(uri, type) {
    uri = _.trim(utils.no_quotes(uri));
    type = type || ext_map['js'].type;

    return _.sprintf('<script type="%s" src="%s"></script>', type, uri);
  };

  /**
   * Get string for a new stylesheet link element
   *
   * @param {String} uri: URI of stylesheet
   * @param {String} type (optional): style MIME type, defaults to CSS
   * @return {String}: style link string
   */
  utils.style_element_string = function(uri, type) {
    uri = _.trim(utils.no_quotes(uri));
    type = type || ext_map['css'].type;

    return _.sprintf('<link rel="stylesheet" type="%s" href="%s">', type, uri);
  };

  /**
   * Map file extensions to functions generating the appropriate element string
   *
   * {Function} fn: function accepting URI and (optional) MIME type
   * {String} type: MIME type
   */
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

  return utils;
});
