/*
 * jsbyte: An interactive JS/HTML/CSS environment
 *
 * mirrors.js: CodeMirror instances
 */

define(['config', 'utils', 'jquery', 'underscore', 'codemirror'],
function(config, utils, $, _, CodeMirror) {
  'use strict';

  var mirrors = utils.module('mirrors');

  var active_mirrors = [];

  /**
   * Initialize a set of textareas to be CodeMirror instances
   *
   * @param {jQuery} $textareas - set of textareas
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
   * Get a mirror by its panel id
   *
   * @param {String} id - panel id
   * @return {CodeMirror} mirror with matching panel id, null otherwise
   */
  mirrors.get_by_id = function(id) {
    var mirror = _.find(active_mirrors, function(mirror) {
      return mirror.panel === id;
    });

    return mirror ? mirror.cm : null;
  };

  /**
   * Get a mirror for either its panel id or the mirror itself
   *
   * @param {String | CodeMirror} m - panel id or mirror
   * @return {CodeMirror} - null if requested mirror does not exist
   */
  mirrors.get_instance = function(m) {
    return m instanceof CodeMirror ? m : mirrors.get_by_id(m);
  };

  /**
   * Set the mode for a mirror
   *
   * @param {String | CodeMirror} m - panel id or mirror
   * @param {String} mode - new mode to set, or use the mode from data-mode
   */
  mirrors.set_mode = function(m, mode) {
    var mirror = mirrors.get_instance(m);
    if (!mirror) { return; }

    mode = mode || mirror.$textarea.attr('data-mode');
    mirror.cm.setOption('mode', mode);
  };

  /**
   * Search a mirror for the first occurrence of a string
   *
   * @param {String | CodeMirror} m - panel id or mirror
   * @param {String | RegExp} str - string to search for
   * @param {Boolean} ci - if true, search is case-insensitive
   * @return {Object} position map { line, ch } if found, null otherwise
   */
  mirrors.search_first = function(m, str, ci) {
    var mirror = mirrors.get_instance(m);
    if (!mirror || (!_.isString(str) && !_.isRegExp(str))) { return null; }

    var cur = mirror.getSearchCursor(str, null, !!ci);
    return (cur && cur.find()) ? { from: cur.from(), to: cur.to() } : null;
  };

  /**
   * Search a mirror for the last occurrence of a string
   *
   * @param {String | CodeMirror} m - panel id or mirror
   * @param {String | RegExp} str - string to search for
   * @param {Boolean} ci - if true, search is case-insensitive
   * @return {Object} position map { line, ch } if found, null otherwise
   */
  mirrors.search_last = function(m, str, ci) {
    var mirror = mirrors.get_instance(m);
    if (!mirror || (!_.isString(str) && !_.isRegExp(str))) { return null; }

    var cur = mirror.getSearchCursor(str, null, !!ci);

    var pos;
    while (cur && cur.find()) {
      pos = { from: cur.from(), to: cur.to() };
    }

    return pos || null;
  };

  /**
   * Add content to a mirror at a specific position
   *
   * @param {String | CodeMirror} m - panel id or mirror
   * @param {String} str - content to add
   * @param {Object} pos - position map { line, ch } to insert at
   */
  mirrors.add_content_at = function(m, str, pos) {
    var mirror = mirrors.get_instance(m);
    if (!mirror || !_.isString(str)) { return; }

    mirror.replaceRange(str, pos);
  };

  /**
   * Add content to a mirror as the first line(s)
   *
   * @param {String | CodeMirror} m - panel id or mirror
   * @param {String} str - content to add
   */
  mirrors.add_content_start = function(m, str) {
    if (!_.isString(str)) { return; }
    return mirrors.add_content_at(m, str + '\n', { line: 0, ch: 0 });
  };

  /**
   * Add content to a mirror as the last line(s)
   *
   * @param {String | CodeMirror} m - panel id or mirror
   * @param {String} str - content to add
   */
  mirrors.add_content_end = function(m, str) {
    var mirror = mirrors.get_instance(m);
    if (!mirror || !_.isString(str)) { return; }

    var lastLine = mirror.lastLine();
    var lastLineContent = mirror.getLine(lastLine);
    var nlStr = !lastLineContent ? str : '\n' + str;

    return mirrors.add_content_at(m, nlStr, { line: lastLine });
  };

  return mirrors;
});
