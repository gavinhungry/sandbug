/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'module', 'path', 'config', 'utils', 'underscore', 'q',
  'auth', 'cdn'
],
function(
  module, path, config, utils, _, Q,
  auth, cdn
) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var routes = { get: {}, post: {} };

  // GET /
  routes.get.index = function(req, res) {
    var user = req.user || {};
    res.render('index', {
      prod: config.prod,
      rev: config.build.rev
    });
  };

  // GET /cdn - list of CDN packages
  routes.get.cdn = function(req, res) {
    cdn.get_cache().done(function(packages) {
      res.json(packages);
    });
  };

  // GET /config - additional client-side config options
  routes.get.config = function(req, res) {
    res.json(config.client);
  };

  // POST /login
  routes.post.login = function(req, res) {
    var user = req.user || {};
    var username = auth.sanitize_username(user.username);
    res.json(username);
  };

  // POST /logout
  routes.post.logout = function(req, res) {
    req.logout();
    res.redirect('/');
  };

  // default
  routes.default = function(req, res) {
    res.status(404).render('default', {
      build: config.build
    });
  };

  return routes;
});
