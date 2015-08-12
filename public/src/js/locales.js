/*
 * debugger.io: An interactive web scripting sandbox
 *
 * locales.js: localized strings
 */

define(function(require) {
  'use strict';

  var $      = require('jquery');
  var _      = require('underscore');
  var bus    = require('bus');
  var config = require('config');
  var utils  = require('utils');

  var observers = require('observers');

  // ---

  var locales = utils.module('locales');

  var dir = '/locales';
  var cache = {};
  var sync = {};

  var prefix = '@';

  bus.init(function(av) {
    locales.console.log('init locales module');

    // localize nodes with `data-localize` attribute as added
    observers.register_listener(function(mutation) {
      var $localize = $(mutation.addedNodes).filter('[data-localize]');
      locales.localize_dom_nodes($localize);
    });

    bus.on('config:locale', function(localeStr) {
      locales.string('onbeforeunload');
      locales.localize_dom_nodes();
    });
  });

  /**
   * Load locales, extending the base locale, into cache
   *
   * @param {String | Array} - locale(s) to load
   */
  locales.load = function(ids) {
    _.each(utils.ensure_array(ids), function(id) {
      id = utils.sanitize_resource_id(id);
      if (!id || cache[id]) { return; }

      var d = $.Deferred();
      cache[id] = d.promise();

      var localeUri = _.str.sprintf('%s/%s.json', dir, id);
      if (!config.prod) { localeUri += '?v=' + (new Date()).getTime(); }

      $.getJSON(localeUri).done(function(locale, status, xhr) {
        if (id !== config.base_locale) {
          locales.get(config.base_locale).done(function(baseLocale) {
            d.resolve(_.extend(baseLocale, locale));
          }).fail(d.reject);
        } else {
          d.resolve(locale);
        }
      }).fail(function(xhr, status, err) {
        d.reject(err);
      });
    });
  };

  /**
   * Make sure a locale is loaded (either from cache or the server),
   * then return a promise to return extended locale
   *
   * @param {String} id - locale id
   * @return {Promise} promise to return the extended locale
   */
  locales.get = function(id) {
    id = utils.sanitize_resource_id(id);
    locales.load(id);
    var d = $.Deferred();

    cache[id].done(function(locale) {
      d.resolve(utils.clone(locale));
    }).fail(d.reject);

    return d.promise();
  };

  /**
   * Flush the entire locale cache, forcing the next call to locales.load or
   * locales.get to fetch a fresh version of the locale
   */
  locales.flush = function() {
    cache = {};
  };

  /**
   * Returned a localized string from a string ID
   *
   * @param {String} strId - a string ID
   * @param {String} [...] - strings to pass to _.str.sprintf, if applicable
   * @return {Promise} to return localed string matching `strId`
   */
  locales.string = function(strId) {
    var d = $.Deferred();

    var args = _.rest(arguments);

    locales.get(config.locale).done(function(locale) {
      var str = (locale.strings && strId) ? locale.strings[strId] : null;
      if (!str) { return d.resolve(null); }

      // count the number of sprintf placeholders are present
      var sprintfMatches = str.match(/\%s/g);
      var sprintfCount = sprintfMatches ? sprintfMatches.length : 0;

      // an array of the same length, with missing values set to an empty string
      var sprintfArgs = _.map((new Array(sprintfCount)), function(val, i) {
        var arg = args[i];
        return (arg || (arg === 0)) ? arg : '';
      });

      sprintfArgs.unshift(str);
      var formattedStr = _.str.sprintf.apply(null, sprintfArgs);
      sync[strId] = formattedStr; // sprintfArgs are not cached
      d.resolve(formattedStr);
    }).fail(function(err) {
      d.reject(null);
    });

    return d.promise();
  };

  /**
   * For an array of string IDs, return an object mapping them to their strings
   *
   * @example
   * // returns {Promise} => { foo: 'Foo!', bar: 'Bar?' }
   *
   * locales.multi_string(['foo', 'bar']);
   *
   * @param {Array} strIds
   * @return {Promise}
   */
  locales.strings = function(strIds) {
    var strs_p = _.map(utils.ensure_array(strIds), function(strId) {
      return locales.string(strId);
    });

    return $.when.apply(null, strs_p).then(function() {
      return _.object(strIds, arguments);
    });
  };

  /**
   * Returns a promise to localize a string if a leading prefix is found
   *
   * @param {Mixed}
   * @return {Promise|String}
   */
  locales.prefixed = function(val) {
    return (_.isString(val) && locales.is_prefixed(val)) ?
      locales.string(_.str.strRight(val, prefix)) : val;
  };

  /**
   * Checks if a string is local prefixed
   *
   * @param {String} str
   * @return {Boolean} true if str is prefixed, false otherwise
   */
  locales.is_prefixed = function(str) {
    return !str.indexOf(prefix);
  };

  /**
   * Localize DOM nodes with `data-localize` attribute
   *
   * @param {jQuery} [$localize] - set of nodes to localize
   * @return {Promise} to resolve upon completion
   */
  locales.localize_dom_nodes = function($localize) {
    var d = $.Deferred();
    $localize = $localize || $('[data-localize]');

    locales.get(config.locale).done(function(locale) {
      $localize.each(function() {
        // get the locale string ID
        var localize = $(this).attr('data-localize');

        // replace the first text node with the localized string, if present
        $(this).contents().filter(function() { return this.nodeType === 3; })
          .first().each(function() {
            var that = this;
            locales.string(localize).done(function(localizedValue) {
              if (localizedValue) { that.nodeValue = localizedValue; }
            });
          });
      });

      d.resolve(true);
    }).fail(d.reject);

    return d.promise();
  };

  /**
   * Return a synchronous value from existing cache
   *
   * @param {String} strId - a string ID
   * @return {String} Localed string matching `strId`
   */
  locales.sync = function(strId) {
    return sync[strId];
  };

  return locales;
});
