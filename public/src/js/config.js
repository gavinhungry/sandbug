/*
 * debugger.io: An interactive web scripting sandbox
 *
 * config.js: simple configuration manager
 */

define(['promise!p_config'], function(config) {
  if (!config.prod) { window.config = config; }
  return config;
});

define('p_config', ['jquery', 'underscore'],
function($, _) {
  'use strict';

  var config = {};

  var hostname = window.location.hostname;

  // default options
  var options = {
    'panel_min': 52, // debuggerio.[theme].less:@panel_options_height + 10px
    'cdn_results': 32, // number of filtered CDN results to display at once
    'cdn_height': 219, // px, cdn.less:#cdn-results max-height
    'layout_time': 300, // ms
    'github': 'https://github.com/gavinhungry/debugger.io',
    'root': _.sprintf('//%s/', hostname), // debugger.io
    'frame': _.sprintf('//frame.%s/', hostname) // frame.debugger.io
  };

  /**
   * Create a new config option
   *
   * Values may always be functions, but any value originally declared as a
   * boolean must either be a boolean or a function that returns a boolean
   *
   * @param {String} option - option name
   * @param {Mixed} value - initial value
   */
  config.option = function(option, value) {
    if (config.hasOwnProperty(option)) { return; }

    var isBool = _.isBoolean(value);

    Object.defineProperty(config, option, {
      get: function() {
        var val = options[option];
        var isFn = _.isFunction(val);
        return isFn ? (isBool ? !!val() : val()) : val;
      },
      set: function(val) {
        var isFn = _.isFunction(val);
        options[option] = (isBool && !isFn) ? !!val : val;
      }
    });

    config[option] = value;
  };

  /**
   * Create multiple new config options
   *
   * @param {Object} opts - key/value pairs
   */
  config.options = function(opts) {
    _.each(opts, function(value, option) { config.option(option, value); });
  };

  config.options(options);

  // get additional client-side config options from the server
  var d = $.Deferred();
  $.get('/config').done(function(data) {
    config.options(data);
    d.resolve(config);
  }).fail(function() {
    d.resolve(config);
  });

  return d.promise();
});
