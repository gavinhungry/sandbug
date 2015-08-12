/*
 * debugger.io: An interactive web scripting sandbox
 */

/**
 * CodeMirror
 *
 * Includes: Overlay, Search, XML, HTML, MD, GFM, CSS/LESS, JS, CoffeeScript
 */
define([
  'codemirrorjs', 'cm_overlay', 'cm_search', 'cm_scrollbars', 'cm_xml',
  'cm_html', 'cm_markdown', 'cm_gfm', 'cm_jade', 'cm_haml', 'cm_css', 'cm_js',
  'cm_coffeescript'
],
function(CodeMirror) {
  return CodeMirror;
});
