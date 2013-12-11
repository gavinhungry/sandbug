/*
 * debugger.io: An interactive web scripting sandbox
 */

(function() {
  'use strict';

  require(['jquery', 'app'], function($, app) {
    $(function() { new app.App(); });
  });

})();
