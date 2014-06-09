/*
 * debugger.io: An interactive web scripting sandbox
 */

/**
 * jQuery
 *
 * Includes: Transit, nanoScroller.js, transitIn/transitOut, jQuery.cookie,
 * jQuery Storage API
 */
define(['jqueryjs', 'transit', 'nano', 'cookie', 'storage'],
function($) {
  // jQuery.transit fallback to $.fn.animate
  if (!$.support.transition) { $.fn.transition = $.fn.animate; }

  $.fn.transitIn = function(speed, easing, callback) {
    this.css({ display: 'block' });
    this.transition({ opacity: 1 }, speed, easing, function() {
      typeof callback === 'function' && callback.call(this);
    });
  };

  $.fn.transitOut = function(speed, easing, callback) {
    this.transition({ opacity: 0 }, speed, easing, function() {
    this.css({ display: 'none' });
      typeof callback === 'function' && callback.call(this);
    });
  };

  return $; // $.noConflict(false);
});
