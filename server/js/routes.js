/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'module', 'path', 'config', 'utils', 'underscore', 'q',
  'auth', 'cdn', 'db'
],
function(
  module, path, config, utils, _, Q,
  auth, cdn, db
) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var routes = { get: {}, post: {} };

  // GET /
  routes.get.index = function(req, res) {
    var user = req.user || {};

    res.render('index', {
      prod: config.prod,
      rev: config.build.rev,
      username: utils.sanitize_username(user.username),
      csrf: req.csrfToken(),
      mode: { mobile: !!req.mobile, phone: !!req.phone, tablet: !!req.tablet }
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

  // POST /signup
  routes.post.signup = function(req, res) {
    var username = req.body.username;
    var email    = req.body.email;
    var password = req.body.password;
    var confirm  = req.body.confirm;

    auth.create_user(username, email, password, confirm).then(function(user) {
      res.json(user.username);
    }, function(msg) {
      if (msg instanceof utils.ClientMsg) { res.status(409).json(msg); }
      else { res.status(500).json(new utils.ClientMsg('server_error')); }
    });
  };

  // POST /login
  routes.post.login = function(req, res) {
    var user = req.user || {};
    var username = utils.sanitize_username(user.username);
    res.json(username);
  };

  // POST /logout
  routes.post.logout = function(req, res) {
    req.logout();
    res.json(true);
  };

  // default
  routes.default = function(req, res) {
    res.status(404).render('default', {
      build: config.build
    });
  };

  return routes;
});
