/*
 * debugger.io: An interactive web scripting sandbox
 */

/**
 * jQuery
 *
 * Includes: Transit, transitIn/transitOut, jQuery.cookie,
 * jQuery Storage API, jQuery UI, jQuery UI Touch Punch
 */
define([
  'jqueryjs', 'transit', 'cookie', 'storage', 'ui', 'touchpunch', 'chosen'
],
function($) {
  // jQuery.transit fallback to $.fn.animate
  if (!$.support.transition) { $.fn.transition = $.fn.animate; }

  $.fn.waitFor = function(fn, time) {
    var that = this;
    time = time || 1000; // 1 second default wait time

    return this.queue('fx', function (next, hooks) {
        var i, t;

        i = setInterval(function() {
          if (fn.call(that)) {
            done();
            return next();
          }
        }, 1);

        var done = function() {
          clearInterval(i);
          clearTimeout(t);
        };

        t = setTimeout(done, time);
        hooks.stop = done;
    });
  };

  $.fn.transitIn = function(speed, easing, callback) {
    speed = speed || 'fast';
    this.css({ display: 'block' });
    this.transition({ opacity: 1 }, speed, easing, function() {
      typeof callback === 'function' && callback.call(this);
    });

    return this;
  };

  $.fn.transitOut = function(speed, easing, callback) {
    speed = speed || 'fast';
    this.transition({ opacity: 0 }, speed, easing, function() {
    this.css({ display: 'none' });
      typeof callback === 'function' && callback.call(this);
    });

    return this;
  };

  $.fn.flowDown = function() {
    var $content = this.children().first();
    if (!$content.length) { return this; }

    this.show();

    var wHeight = this.outerHeight(true);
    var cHeight = $content.outerHeight(true);
    var closed = cHeight > wHeight;

    return this.transition({
      opacity: 1,
      maxHeight: closed ? cHeight + wHeight + 2 : wHeight
    }, 100);
  };

  $.fn.flowUp = function() {
    return this.transition({ opacity: 0, maxHeight: 0 }, 'fast', function() {
      this.hide();
    });
  };

  $.fn.flowToggle = function() {
    var $content = this.children().first();
    if (!$content.length) { return this; }

    var wHeight = this.outerHeight(true);
    var cHeight = $content.outerHeight(true);
    var closed = cHeight > wHeight;

    return closed ? this.flowDown() : this.flowUp();
  };

  $.fn.selectText = function() {
    var range = document.createRange();
    range.selectNodeContents(this[0]);

    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    return this.focus();
  };

  return $; // $.noConflict(false);
});
