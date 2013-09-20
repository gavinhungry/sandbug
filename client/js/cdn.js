/*
 * jsbyte: An interactive JS/HTML/CSS environment
 *
 * cdn.js: client-side CDN cache and filter
 */

define(['jquery', 'underscore', 'config', 'utils'],
function($, _, config, utils) {
  'use strict';

  var cdn = utils.module('cdn');

  var cache = null;

  /**
   * Check if client-side CDN package cache exists
   *
   * @return {Boolean}: true if cache exists, false otherwise
   */
  cdn.cache_exists = function() {
    return _.isArray(cache) && cache.length > 0;
  };

  /**
   * Return a cached version of CDN packages
   *
   * @param {Boolean} update: if true, force the cache to update first
   * @return {Promise}: promise to return the CDN packages
   */
  cdn.get_cache = function(update) {
    var d = $.Deferred();

    if (!update && cdn.cache_exists()) {
      d.resolve(cache);
    } else {
      cdn.update_cache().done(function(packages) {
        d.resolve(packages);
      }).fail(function(err) {
        d.resolve(cdn.cache_exists() ? cache : []);
      });
    }

    return d.promise();
  };

  /**
   * Update the CDN package cache now
   *
   * @return {Promise}
   */
  cdn.update_cache = function() {
    var d = $.Deferred();

    $.get(utils.uri('cdn')).done(function(packages) {
      cache = packages;
      d.resolve(packages);
    }).fail(function(err) {
      d.reject(err);
    });

    return d.promise();
  };

  /**
   * Init the CDN input for filterable library selection
   *
   * @param {jQuery} $cdn: CDN input element
   */
  cdn.init_filter = function($cdn) {
    var $results = $cdn.next('ol.results');
    if (!$results.length) {
      $results = $('<ol class="results"></ol>');
      $cdn.after($results);
    }

    var results_visible = false;

    $cdn.on('keyup', _.debounce(function(e) {
      var filter = _.trim($cdn.val().toLowerCase());

      // hide results when there is no filter
      if (!filter) {
        $results.stop().transition({ 'opacity': 0 }, 'fast', function() {
          if (!results_visible) { $results.css('display', 'none'); }
          results_visible = false;
        });

        return;
      }

      results_visible = true;

      cdn.get_cache().done(function(packages) {
        var filtered = _.filter(packages, function(pkg) {
          return _.str.include(pkg.name.toLowerCase(), filter);
        });

        var sorted = _.sortBy(filtered, function(pkg) {
          return _.levenshtein(filter, pkg.name.toLowerCase());
        });

        $results.empty();
        _.each(sorted, function(pkg) {
          var liStr = _.sprintf('<li>%s <span class="version">%s</span></li>',
            pkg.name, pkg.version);

          var $pkg = $(liStr).attr('data-filename', pkg.filename);
          $results.append($pkg);
        });

        $results.css('display', 'block');
        $results.stop().transition({ 'opacity': 1 }, 'fast');
      });
    }, 10));

    // only enable the filter input if there are packages in the cache
    cdn.get_cache().done(function(packages) {
      $cdn.prop('disabled', !packages.length);
    });
  };

  return cdn;
});