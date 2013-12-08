#!/usr/bin/env node

/*
 * debugger.io: An interactive web scripting sandbox
 */

(function() {
  'use strict';

  var requirejs = require('requirejs');
  requirejs.config({
    baseUrl: 'server/js'
  });

  requirejs(['libs'], function() {
    requirejs(['../app', 'utils'],
    function(app, utils) {
      app.init();
      utils.log('debugger.io running on port ' + app.port);
    });
  });

})();
