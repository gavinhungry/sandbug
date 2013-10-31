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
  var cache = {}; // promise cache

  /**
   * Load compiled template function(s) into cache
   *
   * @param {String | Array} - template(s) to load
   */
  templates.load = function(ids) {
    _.each(utils.ensure_array(ids), function(id) {
      if (cache[id]) { return; }

      var template_deferred = $.Deferred();
      cache[id] = template_deferred.promise();

      var templateUri = _.sprintf('%s/%s.html', dir, id);
      if (config.debug) { templateUri += '?v=' + (new Date()).getTime(); }

      $.get(templateUri).done(function(data, status, xhr) {
        // resolve with compiled template function
        template_deferred.resolve(_.template(data));
      }).fail(function(xhr, status, err) {
        template_deferred.reject(err);
      });
    });
  };

  /**
   * Make sure a template is loaded (either from cache or the server),
   * then return a promise to return the compiled template
   *
   * @param {String} id - template id
   * @param {Object} [context] - context to bind to done callbacks
   * @return {Promise} promise to return the compiled template function
   */
  templates.get = function(id, context) {
    templates.load(id);
    var d = $.Deferred();

    context = context || null;

    cache[id].done(function(template_fn) {
      d.resolveWith(context, [template_fn]);
    }).fail(function(err) {
      d.rejectWith(context, [err]);
    });

    return d.promise();
  };

  /**
   * Flush the entire template cache, forcing the next call to templates.load
   * or templates.get to fetch a fresh version of the template
   */
  templates.flush = function() {
    cache = {};
  };

  return templates;
});
