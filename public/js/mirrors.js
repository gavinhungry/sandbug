/*
 * debugger.io: An interactive web scripting sandbox
 *
 * mirrors.js: CodeMirror instances
 */

define([
  'config', 'utils', 'jquery', 'underscore',
  'bus', 'codemirror', 'dom'
],
function(config, utils, $, _, bus, CodeMirror, dom) {
  'use strict';

  var mirrors = utils.module('mirrors');

  var instances = [];
  var last_focused;

  /**
   * Initialize a set of panels to contain CodeMirror instances
   *
   * @param {jQuery} $panels - set of panels
   */
  mirrors.init = function($panels) {
    _.each($panels, function(panel) {
      var $panel = $(panel);
      var $textarea = $panel.children('textarea');
      var mode = $panel.children('.mode').val();

      var cm = CodeMirror.fromTextArea($textarea[0], {
        lineNumbers: true,
        lineWrapping: true,
        mode: mode
      });

      var mirror = {
        panel: $panel.attr('id'),
        $panel: $panel,
        $textarea: $textarea,
        cm: cm,
        mode: mode
      };

      cm.on('focus', function() {
        bus.trigger('mirror:focus', mirror);
        last_focused = mirror;
      });

      mirrors.scrollable(mirror);
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
   * Hack for letting a scrollbar at least be a visual scroll indicator
   *
   * @param {String | Object} m - panel id or mirror
   */
  mirrors.scrollable = function(m) {
    var mirror = mirrors.get_instance(m);
    if (!mirror) { return null; }

    var $scroll = mirror.$panel.find('.CodeMirror-vscrollbar').first();
    $scroll.addClass('nano').css({ 'overflow': 'visible', 'width': '10px' });
    $scroll.children().first().addClass('content');

    dom.init_scrollbar($scroll);
    var $slider = $scroll.find('.pane > .slider');

    var track_remainder = function() {
      return $scroll.height() - $slider.height() - 4; // - margin
    };

    // update the scrollbar to match the current mirror position
    var update_scrollbar = function(info, remainder) {
      info = info || mirror.cm.getScrollInfo();
      remainder = remainder || track_remainder();

      var multiplier = (info.top / (info.height - info.clientHeight)) || 0;

      $slider.css({ 'top': multiplier * remainder });
      $scroll.css({
        'display': info.height > info.clientHeight ? 'block' : 'none'
      });
    };

    // update the mirror position to match the current scrollbar position
    var update_mirror_scroll = function(info, remainder) {
      info = info || mirror.cm.getScrollInfo();
      remainder = remainder || track_remainder();

      var top = parseInt($slider.css('top'), 10);
      var multiplier = top / remainder;
      mirror.cm.scrollTo(null, multiplier * (info.height - info.clientHeight));
    };

    (function() {
      var mde; // mousedown event
      var top = 0;
      var info;
      var remainder;

      var bind_scroll = function(e) {
        mde = e;
        top = parseInt($slider.css('top'), 10);
        info = mirror.cm.getScrollInfo();
        remainder = track_remainder();

        $(document).on('mousemove', do_scroll);
        $(document).on('mouseup', unbind_scroll);
      };

      var unbind_scroll = function(e) {
        $(document).off('mousemove', do_scroll);
        $(document).off('mouseup', unbind_scroll);
      };

      var do_scroll = function(e) {
        var distanceY = e.pageY - mde.pageY;
        $slider.css('top', utils.clamp(top + distanceY, 0, remainder));

        update_mirror_scroll(info, remainder);
      };

      // let the user drag the scrollbars
      $slider.on('mousedown', bind_scroll);
    })();

    // or, click on the track to move the scrollbar
    $scroll.on('click', function(e) {
      if ($slider.is(e.target)) { return; }

      var midPoint = e.offsetY - $slider.height() / 2;
      var newTop = utils.clamp(midPoint, 0, track_remainder());
      $slider.css('top', newTop);

      update_mirror_scroll();
    });

    mirror.cm.on('change', function() {
      $scroll[0].nanoscroller.reset();
      update_scrollbar();
    });

    mirror.cm.on('scroll', function() {
      update_scrollbar();
    });

    bus.on('panels:resizing', function() {
      _.defer(function() { CodeMirror.signal(mirror.cm, 'change'); });
    });

    bus.on('window:resize panels:resized', function() {
      _.defer(function() { mirrors.simulate_change(mirror); });
    });
  };

  var mirror_mode_sets = {
    'markup': [
      { label: 'HTML', mode: 'htmlmixed' },
      { label: 'Markdown', mode: 'gfm' }
    ],
    'style': [
      { label: 'CSS', mode: 'css' },
      { label: 'LESS', mode: 'less' },
      { label: 'SCSS', mode: 'scss', cm_mode: 'text/x-scss' }
    ],
    'script': [
      { label: 'JavaScript', mode: 'javascript' },
      { label: 'CoffeeScript', mode: 'coffeescript' },
      {
        label: 'TypeScript', mode: 'typescript',
        cm_mode: 'application/typescript'
      }, {
        label: 'GorillaScript', mode: 'gorillascript',
        cm_mode: 'javascript'
      }
    ]
  };

  var get_mode_set = function(panel, mode) {
    return _.find(mirror_mode_sets[panel], function(set) {
      return set.mode === mode || set.cm_mode === mode;
    });
  };

  /**
   * Get the mode for a mirror
   *
   * @param {String | Object} m - panel id or mirror
   * @return {String} current mirror mode
   */
  mirrors.get_mode = function(m) {
    var mirror = mirrors.get_instance(m);
    if (!mirror) { return null; }

    return mirror.mode;
  };

  /**
   * Set the mode for a mirror
   *
   * @param {String | Object} m - panel id or mirror
   * @param {String} mode - new mode to set
   */
  mirrors.set_mode = function(m, mode) {
    var mirror = mirrors.get_instance(m);
    if (!mirror || !_.isString(mode)) { return; }

    var set = get_mode_set(mirror.panel, mode);
    if (!set) { return; }

    mirror.cm.setOption('mode', set.cm_mode || set.mode);
    mirror.mode = set.mode;

    var eventName = _.sprintf('mirrors:%s:mode', mirror.panel);
    bus.trigger(eventName, set.mode, set.label);
  };

  /**
   * Rotate a mirror through available modes
   *
   * @param {String | Object} m - panel id or mirror
   */
  mirrors.cycle_mode = function(m) {
    var mirror = mirrors.get_instance(m);
    var panel = mirror.panel;

    var modes = mirror_mode_sets[panel];
    var mode = mirrors.get_mode(panel);
    if (!modes) { return; }

    var set = get_mode_set(panel, mode);
    var i = _.indexOf(modes, set);

    var newMode = modes[++i % modes.length];
    mirrors.set_mode(panel, newMode.mode);
  };

  /**
   * Get the theme for a mirror
   *
   * @param {String | Object} m - panel id or mirror
   * @return {String} current mirror theme
   */
  mirrors.get_theme = function(m) {
    var mirror = mirrors.get_instance(m);
    if (!mirror) { return null; }

    return mirror.cm.getOption('theme');
  };

  /**
   * Set the theme for a mirror
   *
   * @param {String | Object} m - panel id or mirror
   * @param {String} theme - new theme to set
   */
  mirrors.set_theme = function(m, theme) {
    var mirror = mirrors.get_instance(m);
    if (!mirror || !_.isString(theme)) { return; }

    mirror.cm.setOption('theme', theme);
  };

  /**
   * Set the theme for all mirrors
   *
   * @param {String} theme - new theme to set
   */
  mirrors.set_theme_all = function(theme) {
    _.each(instances, function(mirror) {
      mirrors.set_theme(mirror, theme);
    });
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
   * Trigger a real change event by inserting and then removing a character
   *
   * @param {String | Object} m - panel id or mirror
   */
  mirrors.simulate_change = function(m) {
    var mirror = mirrors.get_instance(m);
    if (!mirror) { return; }

    mirror.cm.replaceRange(' ', { line: 0, ch: 0 });
    mirror.cm.replaceRange('',  { line: 0, ch: 0 }, { line: 0, ch: 1 });
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
