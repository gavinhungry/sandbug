/*
 * debugger.io: An interactive web scripting sandbox
 */

(function() {
  'use strict';

  require(['require.config'], function() {
    require(['jquery', 'app'], function($, app) {
      $(function() { new app.App(); });
    }, function(err) {
      console.error(err.message);

      var overlayError = document.querySelector('#loading .overlay-err');
      overlayError.style.opacity = 1;
    });
  });

})();
