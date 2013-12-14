/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'module', 'path', 'underscore', 'q',
  'cjson'
],
function(
  module, path, _, Q,
  cjson
) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var appRoot = __dirname + '/../../';

  var config = { client: {} };

  /**
   * Extend the config object with data from a JSON file, if available
   *
   * @param {String} prop - property to create (if needed) and extend
   * @param {String} filename - JSON filename, relative to `appRoot`
   */
  var extend_config_with_json = function(prop, filename) {
    var obj = prop ? (config[prop] || {}) : config;
    if (prop) { config[prop] = obj; }

    try {
      _.extend(obj, cjson.load(appRoot + filename));
    } catch(err) {
      // nothing to do
    }
  };

  extend_config_with_json(null, 'config.json');
  extend_config_with_json('build', 'build.json');

  config.prod = config.client.prod = (process.env.NODE_ENV === 'production');

  return config;
});
