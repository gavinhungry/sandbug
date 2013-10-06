#!/usr/bin/env node

/*
 * debugger.io: An interactive web scripting sandbox
 */

(function() {
  var requirejs = require('requirejs');

  requirejs(['server/server', 'server/frame'],
  function(DebuggerIO, frame) {
    DebuggerIO.server.listen(DebuggerIO.port);
    frame.server.listen(frame.port);
  });

})();
