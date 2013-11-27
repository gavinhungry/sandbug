/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'module', 'path', 'us', 'q',
  'http', 'https'
],
function(
  module, path, _, Q,
  http, https
) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var utils = {};

  /**
   * Log messages to console
   *
   * @param {Mixed} - messages to log
   */
  utils.log = function() {
    var args = _.toArray(arguments);
    args.unshift('==>');
    console.log.apply(console, args);
  };

  /**
   * Load remote JSON
   *
   * @param {Object} opts - options to http.get
   * @return {Promise} promise to return JSON
   */
  utils.get_JSON = function(opts) {
    var d = Q.defer();

    var protocol = (opts.port === 443) ? https : http;

    protocol.get(opts, function(res) {
      var datas = [];
      res.on('data', function (data) { datas.push(data); });
      res.on('end', function() {
        var result = JSON.parse(datas.join(''));
        d.resolve(result);
      });
    }).on('error', function(err) {
      d.reject(err);
    });

    return d.promise;
  };

  /**
   * Ensure that a value is a string
   *
   * @param {Mixed} value
   * @return {String}
   */
  utils.ensure_string = function(value) {
    return _.isString(value) ? value : (value ? value + '' : '');
  };

  /**
   * Determing the age of a Unix timestamp
   *
   * @param {Number | String} timestamp - a Unix timestamp
   * @return {Number} ms since `timestamp` occurred
   */
  utils.timestamp_age = function(timestamp) {
    var then = parseInt(timestamp, 10);
    var now = new Date().getTime();

    var diff = now - then;

    return _.isNaN(diff) ? Math.POSITIVE_INFINITY : diff;
  };

  return utils;
});
