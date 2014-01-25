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
  var protocol = window.location.protocol;
  var proxyable_sub_options = ['mode'];

  // default options
  var options = {
    github: 'https://github.com/gavinhungry/debugger.io',
    root: _.sprintf('%s//%s/', protocol, hostname),
    frame: _.sprintf('%s//frame.%s', protocol, hostname),
    username: locals.username,
    csrf: locals.csrf,
    mode: locals.mode
  };

  /**
   * Proxy config values from an update to the event bus
   *
   * @param {String} option - option name
   */
  config._priv.proxy = function(option) {
    $(document).trigger('_debugger_io-config', {
      option: option,
      value: config[option]
    });
  };

  /**
   * Create a new config option
   *
   * Values may always be functions, but any value originally declared as a
   * boolean must either be a boolean or a function that returns a boolean
   *
   * @param {String} option - option name
   * @param {Mixed} value - initial value
   * @param {Boolean} [parent] - parent option
   */
  config._priv.set_option = function(option, value, parent) {
    if (config.hasOwnProperty(option)) { return; }
    var dest = parent ? config[parent] : config;

    var isBool = _.isBoolean(value);

    Object.defineProperty(dest, option, {
      get: function() {
        var val = options[option];
        var isFn = _.isFunction(val);
        return isFn ? (isBool ? !!val() : val()) : val;
      },
      set: function(val) {
        var wasUndefined = (options[option] === undefined);

        var isFn = _.isFunction(val);
        options[option] = (isBool && !isFn) ? !!val : val;

        if (!wasUndefined) { config._priv.proxy(parent || option); }

        // define proxyable sub-options
        if (_.contains(proxyable_sub_options, option) && !parent) {
          config._priv.set_options(val, option);
        }
      }
    });

    dest[option] = value;
  };

  /**
   * Create multiple new config options
   *
   * @param {Object} opts - key/value pairs
   * @param {Boolean} [parent] - parent option
   */
  config._priv.set_options = function(opts, parent) {
    _.each(opts, function(value, option) {
      config._priv.set_option(option, value, parent);
    });
  };

  config._priv.set_options(options);

  // get additional client-side config options from the server
  var d = $.Deferred();
  $.get('/api/config').done(function(data) {
    config._priv.set_options(data);
    d.resolve(config);
  }).fail(function() {
    d.resolve(config);
  });

  return d.promise();
});
