/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'module', 'path', 'config', 'utils', 'underscore', 'q',
  'auth','bugs', 'cdn'
],
function(
  module, path, config, utils, _, Q,
  auth, bugs, cdn
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
      username: auth.sanitize_username(user.username),
      csrf: req.csrfToken(),
      mode: { mobile: !!req.mobile, phone: !!req.phone, tablet: !!req.tablet },
      themes: config.themes
    });
  };

  // GET /cdn - list of CDN packages
  routes.get.cdn = function(req, res) {
    cdn.get_cache().then(function(packages) {
      res.json(packages);
    }, utils.server_error_handler(res)).done();
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
      auth.authenticate(req, res, function(err) {
        if (err) { utils.server_error(res); }
        else { res.json(user.username); }
      });
    }, function(msg) {
      if (msg instanceof utils.LocaleMsg) { res.status(409).json(msg); }
      else { utils.server_error(res); }
    }).done();
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
    res.json(true);
  };

  // GET /bugs/:bugslug, /users/:username/bugs/:bugslug
  routes.get.bug = function(req, res) {
    var user = req.user || {};

    bugs.get_bug_by_slug(req.params.username, req.params.bugslug)
    .done(function(bug) {
      var err = new utils.LocaleMsg();

      if (!bug) { return res.status(404).json(err.set_id('bug_not_found')); }
      if (bug.secret && bug.username !== user.username &&
        !_.contains(bug.secret, user.username)) {
        return res.status(403).json(err.set_id('bug_is_private'));
      }

      res.json(bug);
    }, utils.server_error_handler(res));
  };

  // POST /bugs/:bugslug
  routes.post.bug = function(req, res) {

  };

  return routes;
});
