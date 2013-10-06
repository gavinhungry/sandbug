/*
 * debugger.io: An interactive web scripting sandbox
 *
 * dom.js: DOM helpers
 */

define(['config', 'utils', 'jquery', 'underscore'],
function(config, utils, $, _) {
  'use strict';

  var dom = utils.module('dom');

  /**
   * Cache DOM elements by id and class name onto another object
   *
   * @param {Object} context - object to save references to
   * @param {jQuery} $source - source set within which to find elements
   * @param {Object} elements - { 'by_id' => Array, 'by_class' => Array }
   * @return {Object} context used
   */
  dom.cache = function(context, $source, elements) {
    context = context || {};

    // #output cached to this.$output
    _.each(utils.ensure_array(elements.by_id), _.bind(function(id) {
      this['$' + _.underscored(id)] = $source.find('#' + id);
    }, context));

    // .panel-options elements cached to this.$panel_options
    _.each(utils.ensure_array(elements.by_class), _.bind(function(c) {
      this['$' + _.pluralize(_.underscored(c))] = $source.find('.' + c);
    }, context));

    return context;
  };

  /**
   * Get a *rounded* approximation of the width of an element, as a percentage
   *
   * @param {jQuery} $element - some element in the DOM
   * @return {String} percentage string
   */
  dom.get_percent_width = function($element) {
    var width = $element.width();
    var parentWidth = $element.parent().width();
    return Math.round((width / parentWidth) * 100) + '%';
  };

  /**
   * Get a *rounded* approximation of the height of an element, as a percentage
   *
   * @param {jQuery} $element - some element in the DOM
   * @return {String} percentage string
   */
  dom.get_percent_height = function($element) {
    var height = $element.height();
    var parentHeight = $element.parent().height();
    return Math.round((height / parentHeight) * 100) + '%';
  };

  return dom;
});
