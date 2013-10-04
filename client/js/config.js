/*
 * jsbyte: An interactive JS/HTML/CSS environment
 *
 * config.js: simple configuration manager
 */

define(['jquery', 'underscore'],
function($, _) {
  'use strict';

  var config = {};

  // default options
  var options = {
    'debug': true,
    'panel_min': 100,
    'cdn_results': 16, // number of filtered CDN results to display at once
    'layout_ms': 800,
    'github': 'https://github.com/gavinhungry/jsbyte',
    'root': 'http://localhost:8080/', // https://jsbyte.net/
    'frame': 'http://localhost:8081/' // https://frame.jsbyte.net/
  };

  // options may always be functions, but any option originally declared as a
  // boolean must either be a boolean or a function that returns a boolean
  _.each(options, function(value, option) {
    var is_bool = _.isBoolean(value);

    Object.defineProperty(config, option, {
      get: function() {
        var val = options[option];
        var is_fn = _.isFunction(val);
        return is_fn ? (is_bool ? !!val() : val()) : val;
      },
      set: function(val) {
        var is_fn = _.isFunction(val);
        options[option] = (is_bool && !is_fn) ? !!val : val;
      }
    });
  });

  if (config.debug) { window.config = config; }
  return config;
});
