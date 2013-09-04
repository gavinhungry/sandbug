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
    'root': 'http://localhost:8080/', // https://jsbyte.net/
    'frame': 'http://localhost:8081/frame/' // https://echo.jsbyte.net/frame/
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
