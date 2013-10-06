/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'module', 'path', 'express', 'underscore', 'q', 'server/js/utils',
  'server/js/cdn'
],
function(module, path, express, _, Q, utils, cdn) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var DebuggerIO = {};

  // Express server
  DebuggerIO.server = express();
  DebuggerIO.port = 8080;

  // get list of CDN packages
  DebuggerIO.server.get('/cdn', function(req, res) {
    cdn.get_cache().done(function(packages) {
      res.send(packages);
    });
  });

  DebuggerIO.server.use(express.static(__dirname + '/../client'));

  return DebuggerIO;
});
