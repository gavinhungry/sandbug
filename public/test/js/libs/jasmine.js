/**
 * Jasmine
 *
 * Includes: jasmine-html
 */
define(['jquery', 'jasmine_boot'],
function($, jasmine) {
  window.jasmine.onJasmineLoad = window.onload;
  window.onload = null;

  return window.jasmine;
});
