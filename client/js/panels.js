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
   * @param {jQuery} $cover (optional): overlay to toggle on during resizing
   */
  panels.resizable = function($panels, $cover) {
    var $resizer, $prevPanel, $nextPanel;
    var _prevOffset, _nextOffset;
    var mde; // mousedown event

    // default width, in percent
    var width = Math.floor(100 / ($panels.length || 1)) + '%';

    var bind_resize = function(e) {
      $prevPanel.addClass('resizing');

      // load previously-stored panel offsets
      _prevOffset = $prevPanel.data('width-offset') || 0;
      _nextOffset = $nextPanel.data('width-offset') || 0;

      $(document).on('mousemove', resize_panel);
      $(document).on('mouseup', unbind_resize);
    };

    var unbind_resize = function(e) {
      if ($cover) { $cover.hide(); }
      $panels.filter('iframe').removeClass('nopointer');

      $(document).off('mousemove', resize_panel);
      $(document).off('mouseup', unbind_resize);

      $prevPanel.removeClass('resizing');
    };

    var resize_panel = function(e) {
      if (!$resizer) { return; }

      var distance = e.pageX - mde.pageX;
      var prevOffset = _prevOffset + distance;
      var nextOffset = _nextOffset - distance;

      $prevPanel.attr('style', _.sprintf('width: calc(%s + %spx) !important;', width, prevOffset));
      $nextPanel.attr('style', _.sprintf('width: calc(%s + %spx) !important;', width, nextOffset));

      // store panel offsets
      $prevPanel.data('width-offset', prevOffset);
      $nextPanel.data('width-offset', nextOffset);
    };

    $panels.next('.panel-resizer').on('mousedown', function(e) {
      if ($cover) { $cover.show(); }
      $panels.filter('iframe').addClass('nopointer');

      $resizer = $(e.target).closest('.panel-resizer');
      $prevPanel = $resizer.prev('.panel');
      $nextPanel = $resizer.next('.panel');
      mde = e;

      bind_resize(e);
    });
  };

  return panels;
});
