/*
 * debugger.io: An interactive web scripting sandbox
 */

define(function(require) {
  'use strict';

  var _      = require('underscore');
  var config = require('config');
  var utils  = require('utils');

  var auth    = require('auth');
  var cons    = require('consolidate');
  var express = require('express');
  var mobile  = require('connect-mobile-detection');
  var routes  = require('routes');

  var module    = require('module');
  var path      = require('path');
  var __dirname = path.dirname(module.uri);

  // ---

  var app = {};

  // Express server
  var server = express();
  app.port = config.server.port;

  auth.init(server);

  app.init = function() {
    server.listen(app.port);
  };

  // connect-mobile-detection
  server.use(mobile());

  // use Underscore/Lodash templates
  server.engine('html', cons.underscore);
  server.set('view engine', 'html');
  server.set('views', __dirname + '/templates');

  // routes
  server.get('/', routes.get.index);
  server.get('/api/config', routes.get.config);
  server.post('/api/signup', routes.post.signup);
  server.post('/api/login', auth.authenticate, routes.post.login);
  server.post('/api/logout', routes.post.logout);

  server.get('/api/bug/:bugslug', routes.get.bug);
  server.put('/api/bug/:bugslug', routes.put.bug);
  server.post('/api/bug/:bugslug', routes.post.bug);

  server.get('/api/model/bug', routes.get.bug_model);
  server.get('/api/resource/locales', routes.get.locales);

  server.get('/api/*', function(req, res) {
    res.status(404).json(new utils.LocaleMsg('not_found'));
  });

  server.use(routes.get.index);

  return app;
});
