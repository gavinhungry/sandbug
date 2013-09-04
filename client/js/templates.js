/*
 * jsbyte: An interactive JS/HTML/CSS environment
 *
 * templates.js: template cache manager
 */

define(['jquery', 'underscore', 'config', 'utils'],
function($, _, config, utils) {
  'use strict';

  var templates = utils.module('templates');

  var dir = '/templates';
  var cache = {};

  /**
   * Load template(s) into cache
   *
   * @param {String | Array}: template(s) to load
   */ 
  templates.load = function(ids) {
    _.each(utils.ensure_array(ids), function(id) {
      var templateUri = dir + '/' + id + '.html';
      if (config.debug) { templateUri += '?v=' + (new Date()).getTime(); }

      var template = cache[id] || $.get(templateUri);
      cache[id] = template;
    });
  };

  /**
   * Make sure a template is loaded (either from cache or the server),
   * then pass the template to a callback function
   *
   * @param {String} id: 
   * @param {Function} callback: 
   * @param {Object} context: 
   */
  templates.get = function(id, callback, context) {
    templates.load(id);

    cache[id].done(function(template) {
      callback.call(context || null, template);
    });
  };

  return templates;
});
