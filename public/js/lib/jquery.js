define(['jqueryjs', 'ui', 'transit', 'nano'],
function($, ui, transit, nano) {
  // jQuery.transit fallback to $.fn.animate
  if (!$.support.transition) { $.fn.transition = $.fn.animate; }

  return $; // $.noConflict(false);
});
