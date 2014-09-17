/*
 * debugger.io: An interactive web scripting sandbox
 */

/**
 * jQuery
 *
 * Includes: Transit, nanoScroller.js, transitIn/transitOut, jQuery.cookie,
 * jQuery Storage API, jQuery UI, jQuery UI Touch Punch
 */
define([
  'jqueryjs', 'transit', 'nano', 'cookie', 'storage', 'ui', 'touchpunch',
  'chosen'
],
function($) {
  // jQuery.transit fallback to $.fn.animate
  if (!$.support.transition) { $.fn.transition = $.fn.animate; }

  $.fn.transitIn = function(speed, easing, callback) {
    this.css({ display: 'block' });
    this.transition({ opacity: 1 }, speed, easing, function() {
      typeof callback === 'function' && callback.call(this);
    });

    return this;
  };

  $.fn.transitOut = function(speed, easing, callback) {
    this.transition({ opacity: 0 }, speed, easing, function() {
    this.css({ display: 'none' });
      typeof callback === 'function' && callback.call(this);
    });

    return this;
  };

  $.fn.flowDown = function(callback) {
    var $content = this.children().first();
    if (!$content.length) { return this; }

    var wHeight = this.outerHeight(true);
    var cHeight = $content.outerHeight(true);
    var closed = cHeight > wHeight;

    this.transition({
      maxHeight: closed ? cHeight + wHeight + 2 : wHeight
    }, 100);

    $content.transition({ opacity: 1 }, 150, callback);

    return this;
  };

  $.fn.flowUp = function(callback) {
    var $content = this.children().first();
    if (!$content.length) { return this; }

    this.transition({ maxHeight: 0 }, 100);
    $content.transition({ opacity: 0 }, 150, callback);

    return this;
  };

  $.fn.flowToggle = function(callback) {
    var $content = this.children().first();
    if (!$content.length) { return this; }

    var wHeight = this.outerHeight(true);
    var cHeight = $content.outerHeight(true);
    var closed = cHeight > wHeight;

    this.transition({
      maxHeight: closed ? cHeight + wHeight + 2 : 0
    }, 100);

    $content.transition({ opacity: closed ? 1 : 0 }, 150, callback);

    return this;
  };

  return $; // $.noConflict(false);
});
