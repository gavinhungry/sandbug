/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'module', 'path', 'utils', 'us',
  'db'
],
function(module, path, utils, _, db) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var routes = {};

  routes.index = function(req, res) {
    res.sendfile('public/index.html');
  };

  return routes;
});
