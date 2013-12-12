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

  // TODO: ensure defaults or bail
  var config = cjson.load(__dirname + '/../../config.json') || { client: {} };
  config.prod = config.client.prod = (process.env.NODE_ENV === 'production');

  return config;
});
