/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'module', 'path', 'express', 'underscore', 'q', 'utils',
  './frame', 'cdn'
],
function(module, path, express, _, Q, utils, frame, cdn) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var app = {};

  // Express server
  var server = express();
  app.port = 8080;

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

  server.use(express.static(__dirname + '/../public'));

  return app;
});
