/*
 * debugger.io: An interactive web scripting sandbox
 */

define(function(require) {
  'use strict';

  var _      = require('underscore');
  var config = require('config');
  var utils  = require('utils');

  var auth = require('auth');
  var bugs = require('bugs');

  var module    = require('module');
  var path      = require('path');
  var __dirname = path.dirname(module.uri);

  // ---

  var routes = { get: {}, put: {}, post: {} };

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
        if (err) { utils.server_error(res, err); }
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

  // GET /bugs/:bugslug
  routes.get.bug = function(req, res) {
    var user = req.user || {};

    bugs.get_by_slug(req.params.bugslug)
    .done(function(bug) {
      var msg = new utils.LocaleMsg();

      if (!bug) { return res.status(404).json(msg.set_id('bug_not_found')); }
      if (bug.private && bug.username !== user.username &&
        !_.contains(bug.collaborators, user.username)) {
        return res.status(403).json(msg.set_id('bug_is_private'));
      }

      res.json(bug);
    }, utils.server_error_handler(res));
  };

  // PUT /bugs/:bugslug
  routes.put.bug = function(req, res) {
    var user = req.user || {};

    var data = req.body;
    var msg = new utils.LocaleMsg();

    bugs.get_model_by_slug(data.slug).done(function(bug) {

      _.merge(bug, data);

      bug.save(function(err) {
        if (err) { return utils.server_error(res, err); }
        res.json(msg.set_id('bug_saved'));
      });
    }, utils.server_error_handler(res));
  };

  // POST /bugs/:bugslug
  routes.post.bug = function(req, res) {
    var user = req.user || {};

    bugs.new_bug(req.body).done(function(bug) {
      bug.save(function(err) {
        // ?
      });
    });
  };

  return routes;
});
