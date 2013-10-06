/*
 * debugger.io: An interactive web scripting sandbox
 *
 * mirrors.js: CodeMirror instances
 */

define([
  'config', 'utils', 'jquery', 'underscore',
  'bus', 'codemirror'
],
function(config, utils, $, _, bus, CodeMirror) {
  'use strict';

  var mirrors = utils.module('mirrors');

  var instances = [];
  var last_focused;

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

      var mirror = {
        panel: $textarea.closest('.panel').attr('id'),
        $textarea: $textarea,
        cm: cm
      };

      cm.on('focus', function() {
        bus.trigger('mirror:focus', mirror);
        last_focused = mirror;
      });

      instances.push(mirror);
    });

    bus.on('cdn:result:select', function(uri) {
      mirrors.add_lib_to_markup(uri);
      mirrors.refocus();
    });
  };

  /**
   * Get a mirror by its panel id
   *
   * @param {String} id - panel id
   * @return {CodeMirror} mirror with matching panel id, null otherwise
   */
  mirrors.get_by_id = function(id) {
    var mirror = _.find(instances, function(mirror) {
      return mirror.panel === id;
    });

    return mirror && mirror.cm instanceof CodeMirror ? mirror : null;
  };

  /**
   * Get a mirror for either its panel id or the mirror itself
   *
   * @param {String | Object} m - panel id or mirror
   * @return {CodeMirror} - null if requested mirror does not exist
   */
  mirrors.get_instance = function(m) {
    return m && m.cm instanceof CodeMirror ? m : mirrors.get_by_id(m);
  };

  /**
   * Set the mode for a mirror
   *
   * @param {String | Object} m - panel id or mirror
   * @param {String} mode - new mode to set, or use the mode from data-mode
   */
  mirrors.set_mode = function(m, mode) {
    var mirror = mirrors.get_instance(m);
    if (!mirror) { return; }

    mode = mode || mirror.$textarea.attr('data-mode');
    mirror.cm.setOption('mode', mode);
  };

  /**
   * Set the cursor focus on a mirror
   *
   * @param {String | Object} m - panel id or mirror
   */
  mirrors.focus = function(m) {
    var mirror = mirrors.get_instance(m);
    if (!mirror) { return; }

    mirror.cm.focus();
  };

  /**
   * Refocus the last focused mirror
   */
  mirrors.refocus = function() {
    mirrors.focus(last_focused);
  };

  /**
   * Search a mirror for the first occurrence of a string
   *
   * @param {String | Object} m - panel id or mirror
   * @param {String | RegExp} str - string to search for
   * @param {Boolean} ci - if true, search is case-insensitive
   * @return {Object} position map { line, ch } if found, null otherwise
   */
  mirrors.search_first = function(m, str, ci) {
    var mirror = mirrors.get_instance(m);
    if (!mirror || (!_.isString(str) && !_.isRegExp(str))) { return null; }

    var cur = mirror.cm.getSearchCursor(str, null, !!ci);
    return (cur && cur.find()) ? { from: cur.from(), to: cur.to() } : null;
  };

  /**
   * Search a mirror for the last occurrence of a string
   *
   * @param {String | Object} m - panel id or mirror
   * @param {String | RegExp} str - string to search for
   * @param {Boolean} ci - if true, search is case-insensitive
   * @return {Object} position map { line, ch } if found, null otherwise
   */
  mirrors.search_last = function(m, str, ci) {
    var mirror = mirrors.get_instance(m);
    if (!mirror || (!_.isString(str) && !_.isRegExp(str))) { return null; }

    var cur = mirror.cm.getSearchCursor(str, null, !!ci);

    var pos;
    while (cur && cur.find()) {
      pos = { from: cur.from(), to: cur.to() };
    }

    return pos || null;
  };

  /**
   * Add content to a mirror at a specific position
   *
   * @param {String | Object} m - panel id or mirror
   * @param {String} str - content to add
   * @param {Object} pos - position map { line, ch } to insert at
   */
  mirrors.add_content_at = function(m, str, pos) {
    var mirror = mirrors.get_instance(m);
    if (!mirror || !_.isString(str)) { return; }

    mirror.cm.replaceRange(str, pos);
  };

  /**
   * Add content to a mirror as the first line(s)
   *
   * @param {String | Object} m - panel id or mirror
   * @param {String} str - content to add
   */
  mirrors.add_content_start = function(m, str) {
    if (!_.isString(str)) { return; }
    return mirrors.add_content_at(m, str + '\n', { line: 0, ch: 0 });
  };

  /**
   * Add content to a mirror as the last line(s)
   *
   * @param {String | Object} m - panel id or mirror
   * @param {String} str - content to add
   */
  mirrors.add_content_end = function(m, str) {
    var mirror = mirrors.get_instance(m);
    if (!mirror || !_.isString(str)) { return; }

    var lastLine = mirror.cm.lastLine();
    var lastLineContent = mirror.cm.getLine(lastLine);
    var nlStr = !lastLineContent ? str : '\n' + str;

    return mirrors.add_content_at(m, nlStr, { line: lastLine });
  };

  /**
   * Add a library element string at the best position that can be found
   *
   * @param {String} uri - URI of the library to be added
   */
  mirrors.add_lib_to_markup = function(uri) {
    var markup = mirrors.get_by_id('markup');
    if (!markup || !uri) { return; }

    var indent = markup.cm.getOption('indentUnit'); // default 2
    var tag = utils.resource_tag(uri);
    var lib = utils.resource_element_string(uri); // <script ...> or <link ...>
    var indentLib = _.sprintf('%s%s', indent, lib);

    var scriptPos, linkPos, headPos, htmlPos;

    // put the new script element after the last script element in the document
    if (scriptPos = mirrors.search_last(markup, /<script [^>]*><\/script>/i)) {
      if (tag === 'script') {
        lib = _.sprintf('\n%s%s', _.repeat(' ', scriptPos.from.ch), lib);
        return mirrors.add_content_at(markup, lib, scriptPos.to);
      }
    }

    // put the new link element after the last link element in the document
    if (linkPos = mirrors.search_last(markup, /<link [^>]*>/i)) {
      if (tag === 'link') {
        lib = _.sprintf('\n%s%s', _.repeat(' ', linkPos.from.ch), lib);
        return mirrors.add_content_at(markup, lib, linkPos.to);
      }
    }

    // put the new element as the last item in <head>
    if (headPos = mirrors.search_first(markup, '</head>', true)) {
      lib = _.sprintf('%s%s\n', _.repeat(' ', indent), lib);
      return mirrors.add_content_at(markup, lib, headPos.from);
    }

    // put the new element as the first item in <head>
    if (headPos = mirrors.search_first(markup, '<head>', true)) {
      lib = _.sprintf('\n%s%s', _.repeat(' ', headPos.from.ch + indent), lib);
      return mirrors.add_content_at(markup, lib, headPos.to);
    }

    // put the new element as the first item in <html>
    if (htmlPos = mirrors.search_first(markup, '<html>', true)) {
      lib = _.sprintf('\n%s%s', _.repeat(' ', htmlPos.from.ch + indent), lib);
      return mirrors.add_content_at(markup, lib, htmlPos.to);
    }

    // last resort: just prepend the entire document
    mirrors.add_content_start(markup, lib);
  };

  return mirrors;
});
