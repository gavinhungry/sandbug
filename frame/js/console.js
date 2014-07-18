/*
 * debugger.io: An interactive web scripting sandbox
 */

(function(console) {
  'use strict';

  ['debug', 'error', 'info', 'log', 'warn'].forEach(function(method) {
    var fn = console[method];
    if (typeof fn === 'function') {

      console[method] = function() {
        // send to built-in console
        fn.apply(console, arguments);

        // send up towards debugger conn
        var e = new CustomEvent('console', {
          detail: {
            timestamp: (new Date()).toISOString(),
            type: method,
            args: Array.prototype.slice.call(arguments)
          }
        });

        parent.dispatchEvent(e);
      }
    }
  });

})(window.console);
