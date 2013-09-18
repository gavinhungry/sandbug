/*
 * jsbyte: An interactive JS/HTML/CSS environment
 */

define([
  'module', 'path', 'http', 'https', 'underscore', 'underscore.string', 'fs',
  'server/js/utils'
],
function(module, path, http, https, _, str, fs, utils) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var cdn = {};

  _.mixin(str.exports());

  /**
   * Load CDNJS packages.json
   *
   * @param {Function} callback: function provided with statusCode, parsed JSON
   * @return {http.ClientRequest}
   */
  var cdnjsBusy = false;
  cdn.getCDNJS = function(callback) {

    // /* --- debug: return local file
    var str = fs.readFileSync('./server/packages.json', 'utf8');
    var cdnjs = JSON.parse(str);

    // simulate a return
    callback(200, _.map(cdnjs.packages, function(pkg) {
      return _.pick(pkg, 'name', 'filename', 'version');
    }));

    return;
    // --- */

    if (cdnjsBusy) { return; }
    cdnjsBusy = true;

    return utils.getJSON({
      host: 'cdnjs.com',
      path: '/packages.json',
      port: 443
    }, function(statusCode, cdnjs) {
      cdnjsBusy = false;
      callback(statusCode, _.map(cdnjs.packages, function(pkg) {
        return _.pick(pkg, 'name', 'filename', 'version');
      }));
    });
  };

  /**
   * Filter CDN packages by a filter, sort by Levenshtein distance from filter
   *
   * @param {Array} pkgs: array of CDN packages
   * @param {String} filter: filter to search for
   * @return {Array}: sorted packages matching filter
   */
  cdn.filterBy = function(pkgs, filter) {
    var filtered = _.filter(pkgs, function(pkg) {
      return pkg.name.indexOf(filter) >= 0;
    });

    return _.sortBy(filtered, function(pkg) {
      return _.levenshtein(filter, pkg.name);
    });
  };

  return cdn;
});
