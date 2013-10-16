/*
 * debugger.io: An interactive web scripting sandbox
 *
 * templates.js: template cache manager
 */

define(['config', 'utils', 'jquery', 'underscore'],
function(config, utils, $, _) {
  'use strict';

  var templates = utils.module('templates');

  var dir = '/templates';
  var load_cache = {}; // promises
  var template_cache = {}; // promises

  /**
   * Load template(s) into cache (preload)
   *
   * @param {String | Array} - template(s) to load
   */
  templates.load = function(ids) {
    _.each(utils.ensure_array(ids), function(id) {
      if (template_cache[id]) { return; }

      var templateUri = dir + '/' + id + '.html';
      if (config.debug) { templateUri += '?v=' + (new Date()).getTime(); }

      var load_promise = $.get(templateUri);
      var template_deferred = $.Deferred();

      load_promise.done(function(template) {
        var template_fn = _.template(template);
        template_deferred.resolve(template_fn)
      });

      load_cache[id] = load_promise;
      template_cache[id] = template_deferred.promise();
    });
  };

  /**
   * Make sure a template is loaded (either from cache or the server),
   * then return a promise to return the compiled template
   *
   * @param {String} id - template id
   * @param {Object} [context] - context to bind to done callbacks
   * @return {Promise} promise to return the compiled _.template function
   */
  templates.get = function(id, context) {
    templates.load(id);
    var d = $.Deferred();

    template_cache[id].done(function(template_fn) {
      d.resolveWith(context || null, [template_fn]);
    });

    return d.promise();
  };

  return templates;
});
