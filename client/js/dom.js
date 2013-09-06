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
   * Cache DOM elements and save onto a Backbone View
   *
   * @param {Object} context: relevant Backbone View (must have $el)
   * @param {Object} elements: { 'by_id' => Array, 'by_class' => Array }
   * @return {Object}: context used
   */
  dom.backbone_cache = function(context, elements) {
    // #output cached to this.$output
    _.each(utils.ensure_array(elements.by_id), _.bind(function(id) {
      this['$' + id] = this.$el.find('#' + id);
    }, context));

    // .panel elements cached to this.$panels
    _.each(utils.ensure_array(elements.by_class), _.bind(function(c) {
      this['$' + c + 's'] = this.$el.find('.' + c);
    }, context));

    return context;
  };

  return dom;
});
