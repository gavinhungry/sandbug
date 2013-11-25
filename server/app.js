/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'module', 'path', 'config', 'utils', 'us', 'q', 'express',
  './frame', 'cdn', 'routes', 'passport', 'auth'
],
function(
  module, path, config, utils, _, Q, express,
  frame, cdn, routes, passport, auth
) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var app = {};

  // Express server
  var server = express();
  app.port = config.ports.server;

  app.start = function() {
    auth.init();
    server.listen(app.port);
    frame.start();
  };

  // get list of CDN packages
  server.get('/cdn', function(req, res) {
    cdn.get_cache().done(function(packages) {
      res.send(packages);
    });
  });

  server.use(express.cookieParser());
  server.use(express.session({
    secret: 'kitten', key: 'session'
  }));

  server.use(passport.initialize());
  server.use(passport.session());

  server.get('/', routes.index);
  server.get('/login', auth.authenticate(), routes.login);

  return app;
});
