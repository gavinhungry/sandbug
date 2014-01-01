/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'module', 'path', 'config', 'utils', 'underscore', 'q',
  'fs'
],
function(
  module, path, config, utils, _, Q,
  fs
) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var cdn = {};

  var cache = null;

  /**
   * Pick out only the desired properties from a set of CDN packages
   *
   * @param {Array} packages - set of CDN packages
   * @return {Array} set of CDN packages with only the desired properties
   */
  cdn.pick_properties = function(packages) {
    return _.map(packages, function(pkg) {
      var pick = _.pick(pkg, 'name', 'description', 'filename', 'version');
      pick.description = _.escape(pick.description);
      return pick;
    });
  };

  /**
   * Load CDNJS packages.json
   *
   * @return {Promise} promise to return CDN JSON
   */
  cdn.get_JSON = function() {
    var d = Q.defer();

    // /* --- debug: return local file
    var str = fs.readFileSync('./server/cdnjs.json', 'utf8');

    var cdnjs = JSON.parse(str);

    var picked = cdn.pick_properties(cdnjs ? cdnjs.packages : []);
    d.resolve(picked);
    return d.promise;
    // --- */

    utils.get_JSON({
      host: 'cdnjs.com',
      path: '/packages.json',
      port: 443
    }).then(function(result) {
      var picked = cdn.pick_properties(result ? result.packages : []);
      d.resolve(picked);
    }, d.reject);

    return d.promise;
  };

  /**
   * Check if server-side CDN package cache exists
   *
   * @return {Boolean} true if cache exists, false otherwise
   */
  cdn.cache_exists = function() {
    return _.isArray(cache) && cache.length > 0;
  };

  /**
   * Return a cached version of CDN packages
   *
   * @param {Boolean} update - if true, force the cache to update first
   * @return {Promise} promise to return the CDN packages
   */
  cdn.get_cache = function(update) {
    var d = Q.defer();

    if (!update && cdn.cache_exists()) {
      d.resolve(cache);
    } else {
      cdn.update_cache().then(function(packages) {
        d.resolve(packages);
      }, function(err) {
        d.resolve(cdn.cache_exists() ? cache : []);
      });
    }

    return d.promise;
  };

  /**
   * Update the CDN package cache now
   *
   * @return {Promise}
   */
  cdn.update_cache = function() {
    var d = Q.defer();
    utils.log('Updating CDN cache');

    cdn.get_JSON().then(function(packages) {
      cache = packages;
      d.resolve(packages);
    }, d.reject);

    return d.promise;
  };

  return cdn;
});
