/*
 * debugger.io: An interactive web scripting sandbox
 *
 * locales.js: localized strings
 */

define([
  'config', 'utils', 'jquery', 'underscore',
  'bus', 'observers'
],
function(
  config, utils, $, _, bus, observers
) {
  'use strict';

  var locales = utils.module('locales');

  var dir = '/locales';
  var cache = {};

  bus.once('init', function(av) {
    utils.log('init locales module');

    // localize nodes with `data-localize` attribute as added
    observers.register_listener(function(mutation) {
      var $localize = $(mutation.addedNodes).filter('[data-localize]');
      locales.localize_dom_nodes($localize);
    });

    bus.on('config:locale', function(localeStr) {
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

      var localeUri = _.sprintf('%s/%s.json', dir, id);
      if (!config.prod) { localeUri += '?v=' + (new Date()).getTime(); }

      $.get(localeUri).done(function(localeStr, status, xhr) {

        try {
          var locale = JSON.parse(localeStr);
        } catch(err) {
          d.reject(err);
          return;
        }

        if (id !== config.base_locale) {
          locales.get(config.base_locale).done(function(baseLocale) {
            d.resolve(_.extend(baseLocale, locale));
          }).fail(function(err) {
            d.reject(err);
          });
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
    }).fail(function(err) {
      d.reject(err);
    });

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
   * @param {String} [...] - strings to pass to _.sprintf, if applicable
   * @return {Promise} to return localed string matching `strId`
   */
  locales.string = function(strId) {
    var d = $.Deferred();
    var args = _.rest(arguments);

    locales.get(config.locale).done(function(locale) {
      var str = strId ? locale[strId] : null;
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
      var formattedStr = _.sprintf.apply(null, sprintfArgs);
      d.resolve(formattedStr);
    }).fail(function(err) {
      d.reject(null);
    });

    return d.promise();
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
    }).fail(function(err) {
      d.reject(err);
    })

    return d.promise();
  };

  return locales;
});
