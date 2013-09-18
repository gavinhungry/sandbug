/*
 * jsbyte: An interactive JS/HTML/CSS environment
 */

define(['module', 'path', 'express', 'less', 'underscore', 'server/js/cdn'],
function(module, path, express, less, _, cdn) {
  'use strict';

  var __dirname = path.dirname(module.uri);
  var jsbyte = {};

  jsbyte.cdn = {};
  jsbyte.updateCDN = function() {
    cdn.getCDNJS(function(statusCode, cdnjs) {
      if (statusCode === 200) { jsbyte.cdn = cdnjs; }
    });
  };

  // Express server
  jsbyte.server = express();
  jsbyte.port = 8080;

  jsbyte.updateCDN();
  jsbyte.server.get('/cdn/:filter?', function(req, res) {
    var filter = req.params.filter;
    var pkgs = cdn.filterBy(jsbyte.cdn, filter);

    res.send(pkgs);
  });

  jsbyte.server.use(express.static(__dirname + '/../client'));

  // LESS parser
  jsbyte.parser = new(less.Parser);

  return jsbyte;
});
