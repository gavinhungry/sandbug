/*
 * debugger.io: An interactive web scripting sandbox
 */

/**
 * CodeMirror
 *
 * Includes: Overlay, Search, XML, HTML, MD, GFM, CSS, LESS, JS, CoffeeScript
 */
define([
  'codemirrorjs', 'codemirror_overlay', 'codemirror_search',
  'codemirror_xml', 'codemirror_html', 'codemirror_markdown', 'codemirror_gfm',
  'codemirror_css', 'codemirror_less',
  'codemirror_js', 'codemirror_coffeescript'
],
function(CodeMirror, overlay, search, xml, html, md, gfm, css, less, js, cs) {
  return CodeMirror;
});