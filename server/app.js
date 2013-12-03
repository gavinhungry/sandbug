/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'module', 'path', 'config', 'utils', 'us', 'q',
  'auth', 'cdn', 'express', './frame'
],
function(
  module, path, config, utils, _, Q,
  auth, cdn, express, frame
) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var app = {};

  // Express server
  var server = express();
  app.port = config.ports.server;

  auth.init(server);

  // GET /cdn - list of CDN packages
  server.get('/cdn', function(req, res) {
    cdn.get_cache().done(function(packages) {
      res.send(packages);
    });
  });

  // GET /login
  server.get('/login', auth.authenticate, function(req, res) {
    res.redirect('/');
  });

  app.init = function() {
    server.listen(app.port);
    frame.start();
  };

  return app;
});
