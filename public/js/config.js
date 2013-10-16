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
    'default_theme': 'dark',
    'panel_min': 52, // config.*.less:@panel_options_height + 10px
    'cdn_results': 32, // number of filtered CDN results to display at once
    'cdn_height': 298, // px, cdn.less:#cdn-results max-height
    'layout_time': 300, // ms
    'github': 'https://github.com/gavinhungry/debugger.io',
    'root': 'http://localhost:8080/', // https://debugger.io/
    'frame': 'http://localhost:8081/' // https://frame.debugger.io/
  };

  // options may always be functions, but any option originally declared as a
  // boolean must either be a boolean or a function that returns a boolean
  _.each(options, function(value, option) {
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
  });

  if (config.debug) { window.config = config; }
  return config;
});
