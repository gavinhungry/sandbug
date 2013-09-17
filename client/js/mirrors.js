/*
 * jsbyte: An interactive JS/HTML/CSS environment
 *
 * mirrors.js: CodeMirror instances
 */

define(['jquery', 'underscore', 'config', 'utils', 'codemirror'],
function($, _, config, utils, CodeMirror) {
  'use strict';

  var mirrors = utils.module('mirrors');

  var active_mirrors = [];

  /**
   * Initialize a set of textareas to be CodeMirror instances
   *
   * @param {jQuery} $textareas: set of textareas
   */
  mirrors.init = function($textareas) {
    $textareas.each(function() {
      var $textarea = $(this);

      var cm = CodeMirror.fromTextArea(this, {
        mode: $textarea.attr('data-mode'),
        lineWrapping: true
      });

      var element = cm.getWrapperElement();

      active_mirrors.push({
        id: $textarea.attr('id'),
        cm: cm,
        $textarea: $textarea
      });
    });
  };

  /**
   * Set the mode for a CodeMirror instance
   *
   * @param {String} mirrorName: 'markup', 'style' or 'script'
   * @param {String} mode: new mode to set, or use the mode from data-mode
   */
  mirrors.set_mirror_mode = function(mirrorName, mode) {
    var mirror = _.find(active_mirrors, function(mirror_element) {
      return mirror_element.id === mirrorName;
    });

    if (!mirror) { return; }

    mode = mode || mirror.$textarea.attr('data-mode');
    mirror.cm.setOption('mode', mode);
  };

  return mirrors;
});
