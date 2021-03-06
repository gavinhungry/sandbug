/*
 * sandbug: An interactive web scripting sandbox
 */

(function(console) {
  'use strict';

  ['clear', 'debug', 'error', 'info', 'log', 'warn'].forEach(function(method) {
    var fn = console[method];
    if (typeof fn === 'function') {

      console[method] = function() {
        // send to built-in console
        fn.apply(console, arguments);

        // send up towards sandbug conn
        var e = new CustomEvent('console', {
          detail: {
            timestamp: new Date(),
            time: performance.now() / 1000,
            type: method,
            args: Array.prototype.slice.call(arguments)
          }
        });

        parent.dispatchEvent(e);
      };
    }
  });

})(window.console);
