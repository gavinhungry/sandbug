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

  return dom;
});
