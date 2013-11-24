/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'module', 'path', 'cjson'
],
function(module, path, cjson) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  return cjson.load(__dirname + '/../config.json');
});
