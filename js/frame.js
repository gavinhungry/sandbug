/*
 * jsbyte: An interactive JS/HTML/CSS environment
 *
 * frame.js: iframe output
 */

define(['jquery', 'underscore', 'config', 'utils'],
function($, _, config, utils) {
  'use strict';

  var frame = utils.module('frame');

  /**
   * Build an iframe with the given markup, script and style
   * This is the output representation
   *
   * @param {String} markup: string of HTML
   * @param {String} script: string of JavaScript
   * @param {String} style: string of CSS
   * @return {jQuery}: iframe ready for insertion into page
   */
  frame.build_frame = function(markup, script, style) {
    var $frame = $('<iframe>');
    $frame[0].src = utils.uri('resources/frame.html');
    if (config.debug) { window.$frame = $frame; }

    $frame.on('load', function() {
      utils.log('output iframe loaded');

      // FIXME
      $frame.contents().find('body').append(markup);
    });

    return $frame;
  };

  return frame;
});
