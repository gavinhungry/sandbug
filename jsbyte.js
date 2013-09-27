#!/usr/bin/env node

/*
 * jsbyte: An interactive JS/HTML/CSS environment
 */

(function() {
  var requirejs = require('requirejs');

  requirejs(['server/server', 'server/frame'],
  function(jsbyte, frame) {
    jsbyte.server.listen(jsbyte.port);
    frame.server.listen(frame.port);
  });

})();
