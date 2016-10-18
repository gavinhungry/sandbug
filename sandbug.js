#!/usr/bin/env node

/*
 * sandbug: An interactive web scripting sandbox
 */

(function() {
  'use strict';

  var requirejs = require('requirejs');

  requirejs.config({
    baseUrl: 'server/js',
    paths: {
      underscore: 'libs/underscore'
    }
  });

  requirejs(['../app', 'utils'], function(app, utils) {
    app.init();
    utils.log('sandbug running on port ' + app.port);
  });

  // export with local config
  module.exports = { require: requirejs };

})();
