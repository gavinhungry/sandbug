define([
  'config', 'utils', 'jquery', 'underscore',
  'bus'
],
function(
  config, utils, $, _, bus
) {
  'use strict';

  var locales = utils.module('locales');

  var dir = '/locales';
  var cache = {};

  bus.once('init', function(av) {
    utils.log('init locales module');

    // fetch the locale right away
    locales.load(config.locale || config.base_locale);
  });


  /**
   * Load locales, extending the base locale, into cache
   *
   * @param {String | Array} - locale(s) to load
   */
  locales.load = function(ids) {
    _.each(utils.ensure_array(ids), function(id) {
      if (cache[id]) { return; }

      var d = $.Deferred();
      cache[id] = d.promise();

      var localeUri = _.sprintf('%s/%s.json', dir, id);
      if (!config.prod) { localeUri += '?v=' + (new Date()).getTime(); }

      $.get(localeUri).done(function(localeStr, status, xhr) {

        try {
          var locale = JSON.parse(localeStr);
        } catch(err) {
          console.error('X');
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
   * @return {Promise} to return localed string matching `strId`
   */
  locales.string = _.memoize(function(strId) {
    var d = $.Deferred();

    locales.get(config.locale || config.base_locale).done(function(locale) {
      d.resolve(locale[strId] || null);
    }).fail(function(err) {
      d.reject(null);
    });

    return d.promise();
  });

  return locales;
});
