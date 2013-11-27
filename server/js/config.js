/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'module', 'path', 'us', 'q',
  'cjson'
],
function(
  module, path, _, Q,
  cjson
) {
  'use strict';

  var __dirname = path.dirname(module.uri);

  // TODO: ensure defaults or bail
  var appConfig = cjson.load(__dirname + '/../../config.json') || {};
  return appConfig.server;
});
