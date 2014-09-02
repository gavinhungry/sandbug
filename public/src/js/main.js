/*
 * debugger.io: An interactive web scripting sandbox
 */

(function() {
  'use strict';

  var WAIT_SECONDS = 5;

  /**
   * Execute callback when (or if) the DOM is ready
   *
   * @param {Function} callback
   */
  var ready = function(callback) {
    var state = document.readyState;
    if (state === 'interactive' || state === 'complete') { callback(); return; }
    document.addEventListener('DOMContentLoaded', callback);
  };

  /**
   * Start progress loading bar
   *
   * @return {Function} call to set completed progress early
   */
  var progress = function() {
    var loading = document.querySelector('#loading');
    var progBar = loading.querySelector('.overlay-progress');

    var i, p = 0;

    var complete = function() {
      progBar.style.width = '100%';
      clearInterval(i);
    };

    i = setInterval(function() {
      progBar.style.width = (p++) + '%';
      if (p > 100) { complete(); }
    }, WAIT_SECONDS * 10); // (WAIT_SECONDS * 1000) / 100

    return complete;
  };

  ready(function() {
    require.config({ waitSeconds: WAIT_SECONDS });
    var complete = progress();

    require(['require.config'], function() {
      require(['app'], function(app) {
        var debuggerio = new app.App();
        debuggerio.once('reveal', complete);
      }, function(err) {
        console.error(err.message);
        var overlayError = loading.querySelector('.overlay-err');
        overlayError.style.opacity = 1;
      });
    });
  });

})();
