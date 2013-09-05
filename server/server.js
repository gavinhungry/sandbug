/*
 * jsbyte: An interactive JS/HTML/CSS environment
 */

define(['module', 'path', 'express', 'less', 'underscore'],
function(module, path, express, less, _) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var jsbyte = {};

  // Express server
  jsbyte.server = express();
  jsbyte.port = 8080;

  jsbyte.server.use(express.static(__dirname + '/../client'));

  // LESS parser
  jsbyte.parser = new(less.Parser);

  return jsbyte;
});
