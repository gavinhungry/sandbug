/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'module', 'path', 'config', 'utils', 'us', 'q',
  'auth', 'cdn', 'express', './frame', 'routes'
],
function(
  module, path, config, utils, _, Q,
  auth, cdn, express, frame, routes
) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var app = {};

  // Express server
  var server = express();
  app.port = config.ports.server;

  auth.init(server);

  // get list of CDN packages
  server.get('/cdn', function(req, res) {
    cdn.get_cache().done(function(packages) {
      res.send(packages);
    });
  });

  server.get('/', routes.index);
  server.get('/login', auth.authenticate, routes.login);

  app.init = function() {
    server.listen(app.port);
    frame.start();
  };

  return app;
});
