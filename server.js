#!/usr/bin/env node

/*
 * jsbyte: An interactive JS/HTML/CSS environment
 */

(function() {
  var requirejs = require('requirejs');

  requirejs(['server/jsbyte', 'server/echo'],
  function(jsbyte, echo) {
    jsbyte.server.listen(jsbyte.port);
    echo.server.listen(echo.port);
  });

})();
