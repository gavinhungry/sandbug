/*
 * debugger.io: An interactive web scripting sandbox
 */

/**
 * jQuery
 *
 * Includes: Transit, nanoScroller.js
 */
define(['jqueryjs', 'transit', 'nano'],
function($, transit, nano) {
  // jQuery.transit fallback to $.fn.animate
  if (!$.support.transition) { $.fn.transition = $.fn.animate; }

  return $; // $.noConflict(false);
});
