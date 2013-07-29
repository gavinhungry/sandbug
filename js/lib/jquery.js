define(['jqueryjs', 'transit'],
function($, transit) {
  // jQuery.transit fallback to $.fn.animate
  if (!$.support.transition) { $.fn.transition = $.fn.animate; }

  // remove global $, but keep global jQuery
  return $.noConflict(false);
});
