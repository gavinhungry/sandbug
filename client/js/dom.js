/*
 * jsbyte: An interactive JS/HTML/CSS environment
 *
 * dom.js: DOM helpers
 */

define(['jquery', 'underscore', 'config', 'utils'],
function($, _, config, utils) {
  'use strict';

  var dom = utils.module('dom');

  /**
   * Cache DOM elements by id and class name onto another object
   *
   * @param {Object} context: object to save references to
   * @param {jQuery} $source: source set within which to find elements
   * @param {Object} elements: { 'by_id' => Array, 'by_class' => Array }
   * @return {Object}: context used
   */
  dom.cache = function(context, $source, elements) {
    context = context || {};

    // #output cached to this.$output
    _.each(utils.ensure_array(elements.by_id), _.bind(function(id) {
      this['$' + id] = $source.find('#' + id);
    }, context));

    // .panel elements cached to this.$panels
    _.each(utils.ensure_array(elements.by_class), _.bind(function(c) {
      this['$' + _.pluralize(c)] = $source.find('.' + c);
    }, context));

    return context;
  };

  /**
   * Get string for a new script element
   *
   * @param {String} uri: URI of script
   * @param {String} type (optional): script MIME type, defaults to JavaScript
   * @return {String}: script string
   */
  dom.script_element_string = function(uri, type) {
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
  dom.style_element_string = function(uri, type) {
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
    'js': { fn: dom.script_element_string, type: 'application/javascript' },
    'css': { fn: dom.style_element_string, type: 'text/css' }
  };

  /**
   * Get string for a new resource element, based on extension
   *
   * @param {String} uri: URI of resource
   * @return {String}: script or style link string
   */
  dom.resource_element_string = function(uri) {
    uri = _.trim(utils.no_quotes(uri));
    var ext = _.strRightBack(uri, '.');

    var map = ext_map[ext];
    return map ? map.fn(uri, map.type) : null;
  };

  return dom;
});
