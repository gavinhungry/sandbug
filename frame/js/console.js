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

        // send to debugger console

      }
    }
  });

})(window.console);
