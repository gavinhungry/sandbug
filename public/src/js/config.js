/*
 * debugger.io: An interactive web scripting sandbox
 *
 * config.js: simple configuration manager
 */

define(['promise!config_p'], function(config) {
  delete window._debugger_io;
  if (!config.prod) { window.config = config; }
  return config;
});

define('config_p', ['jquery', 'underscore'],
function($, _) {
  'use strict';

  var config = { _priv: {} };

  var locals = window._debugger_io || {};
  var hostname = window.location.hostname;

  // default options
  var options = {
    github: 'https://github.com/gavinhungry/debugger.io',
    root: _.sprintf('//%s/', hostname), // //debugger.io/
    frame: _.sprintf('//frame.%s/', hostname), // //frame.debugger.io/
    username: locals.user,
    csrf: locals.csrf,
    mode: locals.mode
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
  config._priv.option = function(option, value) {
    if (config.hasOwnProperty(option)) { return; }

    var isBool = _.isBoolean(value);

    Object.defineProperty(config, option, {
      get: function() {
        var val = options[option];
        var isFn = _.isFunction(val);
        return isFn ? (isBool ? !!val() : val()) : val;
      },
      set: function(val) {
        var wasUndefined = (options[option] === undefined);

        var isFn = _.isFunction(val);
        options[option] = (isBool && !isFn) ? !!val : val;

        // proxy config updates to event bus
        if (!wasUndefined) {
          $(document).trigger('_debugger_io-config', {
            option: option,
            value: config[option]
          });
        }
      }
    });

    config[option] = value;
  };

  /**
   * Create multiple new config options
   *
   * @param {Object} opts - key/value pairs
   */
  config._priv.options = function(opts) {
    _.each(opts, function(value, option) {
      config._priv.option(option, value);
    });
  };

  config._priv.options(options);

  // get additional client-side config options from the server
  var d = $.Deferred();
  $.get('/config').done(function(data) {
    config._priv.options(data);
    d.resolve(config);
  }).fail(function() {
    d.resolve(config);
  });

  return d.promise();
});
