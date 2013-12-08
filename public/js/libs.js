/*
 * debugger.io: An interactive web scripting sandbox
 */

/**
 * jQuery
 *
 * Includes: jQuery UI, Transit, nanoScroller.js
 */
define('jquery', ['jqueryjs', 'ui', 'transit', 'nano'],
function($, ui, transit, nano) {
  // jQuery.transit fallback to $.fn.animate
  if (!$.support.transition) { $.fn.transition = $.fn.animate; }

  return $; // $.noConflict(false);
});

/**
 * Underscore.js
 *
 * Includs: Underscore.string, underscore.inflection
 */
define('underscore', ['underscorejs', 'string', 'inflection'],
function(_, str, inflection) {
  _.mixin(str.exports());
  return _; // _.noConflict();
});

/**
 * Backbone.js
 *
 * Includes: nothing additional yet
 */
define('backbone', ['backbonejs'],
function(Backbone) {
  return Backbone; // Backbone.noConflict();
});

/**
 * CodeMirror
 *
 * Includes: Overlay, Search, XML, HTML, MD, GFM, CSS, LESS, JS, CoffeeScript
 */
define('codemirror', [
  'codemirrorjs', 'codemirror_overlay', 'codemirror_search',
  'codemirror_xml', 'codemirror_html', 'codemirror_markdown', 'codemirror_gfm',
  'codemirror_css', 'codemirror_less',
  'codemirror_js', 'codemirror_coffeescript'
],
function(CodeMirror, overlay, search, xml, html, md, gfm, css, less, js, cs) {
  return CodeMirror;
});

/**
 * Jasmine
 *
 * Includes: jasmine-html, jasmine-jquery
 */
define('jasmine', ['jquery', 'jasminejs', 'jasmine_html', 'jasmine_jquery'],
function($, jasmine, jasmine_html, jasmine_jquery) {
  return jasmine;
});
