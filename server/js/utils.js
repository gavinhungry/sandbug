/*
 * jsbyte: An interactive JS/HTML/CSS environment
 */

define(['module', 'path', 'underscore', 'http', 'https', 'q'],
function(module, path, _, http, https, Q) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var utils = {};

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
   * Log messages to console
   *
   * @param {Mixed} - messages to log
   */
  utils.log = function() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('==>');
    console.log.apply(console, args);
  };

  return utils;
});
