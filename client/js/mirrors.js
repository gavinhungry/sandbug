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
        panel: $textarea.closest('.panel').attr('id'),
        cm: cm,
        $textarea: $textarea
      });
    });
  };

  /**
   * Get a mirror by its id
   *
   * @param {String} id: panel id
   * @return {CodeMirror}: mirror with matching panel id
   */
  mirrors.get_by_id = function(id) {
    var mirror = _.find(active_mirrors, function(mirror) {
      return mirror.panel === id;
    });

    return mirror ? mirror.cm : mirror;
  };

  /**
   * Set the mode for a CodeMirror instance
   *
   * @param {String} id: panel id
   * @param {String} mode: new mode to set, or use the mode from data-mode
   */
  mirrors.set_mirror_mode = function(id, mode) {
    var mirror = mirrors.get_by_id(id);
    if (!mirror) { return; }

    mode = mode || mirror.$textarea.attr('data-mode');
    mirror.cm.setOption('mode', mode);
  };

  return mirrors;
});
