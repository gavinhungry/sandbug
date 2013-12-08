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
  return cjson.load(__dirname + '/../../config.json') || {};
});
