/*
 * debugger.io: An interactive web scripting sandbox
 */

/**
 * jQuery
 *
 * Includes: jQuery UI, Transit, nanoScroller.js
 */
define(['jqueryjs', 'transit', 'nano', 'hammer'],
function($, transit, nano, Hammer) {
  // jQuery.transit fallback to $.fn.animate
  if (!$.support.transition) { $.fn.transition = $.fn.animate; }

  return $; // $.noConflict(false);
});
