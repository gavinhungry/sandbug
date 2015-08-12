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

  var routes = {
    put: {},
    get: {},
    post: {},
    delete: {}
  };

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

  // GET /api/resource/locales
  routes.get.locales = function(req, res) {
    utils.dir_json(LOCALES_PATH, 'locale').then(function(locales) {
      res.json(locales);
    }, utils.server_error_handler(res)).done();
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

  // POST /api/bugs
  routes.post.bug = function(req, res) {
    bugs.crud.create(req.body, bugs.crud.rest(res));
  };

  // GET /api/bug/:slug
  routes.get.bug = function(req, res) {
    // FIXME: need to handle 403 private here
    bugs.crud.read(req.params.slug, bugs.crud.rest(res));
  };

  // PUT /api/bug/:slug
  routes.put.bug = function(req, res) {
    bugs.crud.update(req.params.slug, req.body, bugs.crud.rest(res));
  };

  // DELETE /api/bug/:slug
  routes.delete.bug = function(req, res) {
    // FIXME
  };

  return routes;
});
