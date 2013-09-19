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

  return cdn;
});
