#!/usr/bin/env node

/*
 * debugger.io: An interactive web scripting sandbox
 */

(function() {
  'use strict';

  var requirejs = require('requirejs');
  requirejs.config({ baseUrl: 'server/js' });

  requirejs(['../app', 'utils'],
  function(app, utils) {
    app.start();
    utils.log('debugger.io running on port ' + app.port);
  });

})();
