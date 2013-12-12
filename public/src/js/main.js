/*
 * debugger.io: An interactive web scripting sandbox
 */

(function() {
  'use strict';

  require(['require.config'], function() {
    require(['jquery', 'app'], function($, app) {
      $(function() { new app.App(); });
    });
  });

})();
