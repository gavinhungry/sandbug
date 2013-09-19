/*
 * jsbyte: An interactive JS/HTML/CSS environment
 */

define([
  'module', 'path', 'express', 'less', 'underscore', 'q', 'server/js/utils',
  'server/js/cdn'
],
function(module, path, express, less, _, Q, utils, cdn) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var jsbyte = {};

  // Express server
  jsbyte.server = express();
  jsbyte.port = 8080;

  // get list of CDN packages
  jsbyte.server.get('/cdn', function(req, res) {
    cdn.get_cache().done(function(packages) {
      res.send(packages);
    });
  });

  jsbyte.server.use(express.static(__dirname + '/../client'));

  // LESS parser
  jsbyte.parser = new(less.Parser);

  return jsbyte;
});
