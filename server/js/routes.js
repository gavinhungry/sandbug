/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'module', 'path', 'config', 'utils', 'us', 'q'
],
function(
  module, path, config, utils, _, Q
) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var routes = {};

  routes.index = function(req, res) {
    res.sendfile('public/index.html');
  };

  routes.login = function(req, res) {
    res.redirect('/');
  };

  return routes;
});
