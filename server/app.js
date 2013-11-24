/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'module', 'path', 'config', 'express', 'us', 'q', 'utils',
  './frame', 'cdn', 'routes'
],
function(module, path, config, express, _, Q, utils, frame, cdn, routes) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var app = {};

  // Express server
  var server = express();
  app.port = config.ports.server;

  app.start = function() {
    server.listen(app.port);
    frame.start();
  };

  // get list of CDN packages
  server.get('/cdn', function(req, res) {
    cdn.get_cache().done(function(packages) {
      res.send(packages);
    });
  });

  server.get('/', routes.index);

  // develop: serve all static content via Express
  // server.use(express.static(__dirname + '/../public'));

  return app;
});
