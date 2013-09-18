/*
 * jsbyte: An interactive JS/HTML/CSS environment
 */

define(['module', 'path', 'http', 'https'],
function(module, path, http, https, _, fs) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var utils = {};

  /**
   * Load remote JSON
   *
   * @param {Object} opts: options to http.get
   * @param {Function} callback: function provided with statusCode, parsed JSON
   * @return {http.ClientRequest}
   */
  utils.getJSON = function(opts, callback) {
    var protocol = (opts.port === 443) ? https : http;

    return protocol.get(opts, function(res) {
      var datas = [];
      res.on('data', function (data) { datas.push(data); });
      res.on('end', function() {
        callback(res.statusCode, JSON.parse(datas.join('')));
      });
    });
  };

  return utils;
});
