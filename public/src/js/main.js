/*
 * sandbug: An interactive web scripting sandbox
 */

(function() {
  'use strict';

  var WAIT_SECONDS = 10;

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

  var hasError = false;

  /**
   * Start progress loading bar
   *
   * @return {Object} - {Function} complete, {Function} error
   */
  var progress = function() {
    var loading = document.querySelector('#loading');
    var progBar = loading.querySelector('.overlay-progress');
    var overlayError = loading.querySelector('.overlay-err');
    var overlayErrorText = loading.querySelector('.overlay-err-text');

    var i, p = 0;
    var completed = false;

    var stop = function() {
      clearInterval(i);
    };

    var complete = function() {
      stop();

      if (completed) { return; }
      completed = true;

      if (!hasError) {
        progBar.classList.add('transition');
        progBar.style.width = '100%';
      }
    };

    var error = function(err) {
      stop();

      if (err) {
        console.error(err.message);
        overlayErrorText.innerText = err.message.split('\n')[0];
      }

      overlayError.style.opacity = 1;
      progBar.classList.add('timeout');

      hasError = true;
    };

    i = setInterval(function() {
      progBar.style.width = (p++) + '%';
      if (p > 100) { error(); complete(); }
    }, WAIT_SECONDS * 10); // (WAIT_SECONDS * 1000) / 100

    return {
      complete: complete,
      error: error
    };
  };

  ready(function() {
    var progression = progress();

    require.config({
      waitSeconds: WAIT_SECONDS
    });

    require(['require.config'], function() {
      require(['app'], function(app) {
        if (hasError) { return; }

        var sandbug = new app.App();
        sandbug.once('reveal', progression.complete);
      }, progression.error);
    });
  });

})();
