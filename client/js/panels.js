/*
 * jsbyte: An interactive JS/HTML/CSS environment
 *
 * panels.js: resizable panels
 */

define(['jquery', 'underscore', 'config', 'utils'],
function($, _, config, utils) {
  'use strict';

  var panels = utils.module('panels');

  /**
   * Initializes a set of panels to be horizontally resizable
   *
   * @param {jQuery} $panels: set of panels
   */
  panels.resizable = function($panels) {
    var $resizer, $prev, $next;
    var _prevOffset, _nextOffset;
    var last_x; // cursor x position during mousemove
    var mde; // mousedown event

    // default width, in percent
    var width = Math.floor(100 / ($panels.length || 1)) + '%';

    var bind_resize = function(e) {
      $prev.addClass('resizing');

      // load previously-stored panel offsets
      _prevOffset = $prev.data('width-offset') || 0;
      _nextOffset = $next.data('width-offset') || 0;

      $(document).on('mousemove', resize_panel);
      $(document).on('mouseup', unbind_resize);
    };

    var unbind_resize = function(e) {
      $panels.filter('iframe').removeClass('nopointer');

      $(document).off('mousemove', resize_panel);
      $(document).off('mouseup', unbind_resize);

      $panels.removeClass('resizing resizing-limit');
    };

    var resize_panel = function(e) {
      if (!$resizer) { return; }

      var distance = e.pageX - mde.pageX;
      var prevOffset = _prevOffset + distance;
      var nextOffset = _nextOffset - distance;

      if (($prev.width() < config.panel_min && e.pageX < last_x) ||
          ($next.width() < config.panel_min && e.pageX > last_x))
      {
        $prev.addClass('resizing-limit');
        return;
      }

      $prev.removeClass('resizing-limit');
      last_x = e.pageX;

      $prev.attr('style', _.sprintf('width: calc(%s + %spx) !important;', width, prevOffset));
      $next.attr('style', _.sprintf('width: calc(%s + %spx) !important;', width, nextOffset));

      // store panel offsets
      $prev.data('width-offset', prevOffset);
      $next.data('width-offset', nextOffset);
    };

    $panels.next('.panel-resizer').on('mousedown', function(e) {
      last_x = e.pageX;

      $panels.filter('iframe').addClass('nopointer');

      $resizer = $(e.target).closest('.panel-resizer');
      $prev = $resizer.prev('.panel');
      $next = $resizer.next('.panel');
      mde = e;

      bind_resize(e);
    }).on('dblclick', function(e) {
      $panels.data('width-offset', 0).transition({ 'width': width }, 'fast');
    });
  };

  return panels;
});
