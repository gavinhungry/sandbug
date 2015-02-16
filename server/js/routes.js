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

  var LOCALES_PATH = './public/locales';

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

  // GET /api/config - additional client-side config options
  routes.get.config = function(req, res) {
    res.json(config.client);
  };

  // POST /api/signup
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

  // POST /api/login
  routes.post.login = function(req, res) {
    var user = req.user || {};
    var username = auth.sanitize_username(user.username);
    res.json(username);
  };

  // POST /api/logout
  routes.post.logout = function(req, res) {
    req.logout();
    res.json(true);
  };

  // GET /api/bug/:bugslug
  routes.get.bug = function(req, res) {
    var user = req.user || {};

    bugs.get_by_slug(req.params.bugslug)
    .then(function(bug) {
      var msg = new utils.LocaleMsg();

      if (!bug) { return res.status(404).json(msg.set_id('bug_not_found')); }
      if (bug.private && bug.username !== user.username &&
        !_.contains(bug.collaborators, user.username)) {
        return res.status(403).json(msg.set_id('bug_is_private'));
      }

      res.json(bug);
    }, utils.server_error_handler(res)).done();
  };

  // PUT /api/bug/:bugslug
  routes.put.bug = function(req, res) {
    var user = req.user || {};
    var msg = new utils.LocaleMsg();

    bugs.get_model_by_slug(req.params.bugslug)
    .then(bugs.ensure_bug)
    .then(function(bug) {
      _.deepExtend(bug, req.body);
      return bugs.save(bug);
    }).then(function(updated) {
      res.json(updated);
    }, utils.server_error_handler(res)).done();
  };

  // POST /api/bug/:bugslug
  routes.post.bug = function(req, res) {
    var user = req.user || {};
    var msg = new utils.LocaleMsg();

    var opts = _.clone(req.body);
    opts.slug = req.params.bugslug;

    bugs.new_bug(opts)
      .then(bugs.save, utils.server_error_handler(res)).done();
  };

  // GET /api/model/bug
  routes.get.bug_model = function(req, res) {
    bugs.new_bug({
      _id: undefined,
      created: undefined,
      updated: undefined,
      title: ''
    }).then(function(model) {
      res.json(model);
    }, utils.server_error_handler(res)).done();
  };

  // GET /api/resource/locales
  routes.get.locales = function(req, res) {
    utils.dir_json(LOCALES_PATH, 'locale').then(function(locales) {
      res.json(locales);
    }, utils.server_error_handler(res)).done();
  };

  return routes;
});
