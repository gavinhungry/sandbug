/*
 * debugger.io: An interactive web scripting sandbox
 */

(function() {
  'use strict';

  window._debugger_io_require(null, true, function() {
    require(['jquery', 'app'], function($, app) {
      $(function() { new app.App(); });
    });
  });

})();
