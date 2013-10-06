/*
 * debugger.io: An interactive web scripting sandbox
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
    'panel_min': 48, // config.less:@panel_options_height + 10px
    'cdn_results': 16, // number of filtered CDN results to display at once
    'layout_ms': 300,
    'github': 'https://github.com/gavinhungry/debugger.io',
    'root': 'http://localhost:8080/', // https://debugger.io/
    'frame': 'http://localhost:8081/' // https://frame.debugger.io/
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
