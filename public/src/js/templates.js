/*
 * sandbug: An interactive web scripting sandbox
 *
 * templates.js: template cache manager
 */

define(function(require) {
  'use strict';

  var $      = require('jquery');
  var _      = require('underscore');
  var bus    = require('bus');
  var config = require('config');
  var utils  = require('utils');

  // ---

  var templates = utils.module('templates');

  var dir = '/templates';
  var cache = {}; // promise cache

  // variables available to all templates
  var locals = {
    csrf: config.csrf
  };

  /**
   * Load compiled template function(s) into cache
   *
   * @param {String | Array} - template(s) to load
   */
  templates.load = function(ids) {
    _.each(utils.ensure_array(ids), function(id) {
      id = utils.sanitize_resource_id(id);
      if (!id || cache[id]) { return; }

      var d = $.Deferred();
      cache[id] = d.promise();

      var templateUri = _.str.sprintf('%s/%s.html', dir, id);
      templateUri += config.prod ?
        ('?v=' + config.build.rev) :
        ('?t=' + (new Date()).getTime());

      $.get(templateUri).done(function(template, status, xhr) {
        // resolve with compiled template function
        var template_fn = _.template(template);

        d.resolve(function(data) {
          // extend data passed to template with locals
          return template_fn(_.extend(data, locals));
        });
      }).fail(function(xhr, status, err) {
        d.reject(err);
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
    id = utils.sanitize_resource_id(id);
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
