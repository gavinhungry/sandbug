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
   * Initialize a set of panels to be horizontally resizable
   *
   * @param {jQuery} $panels: set of panels
   */
  panels.init = function($panels) {
    var $body = $('body');
    var $resizer, $prev, $next;
    var _prevOffset, _nextOffset;
    var last_x; // cursor x position during mousemove
    var mde; // mousedown event

    var width = panels.get_default_width($panels);

    panels.set_default_width($panels, 0);

    var bind_resize = function(e) {
      $panels.filter('iframe').addClass('nopointer');
      $resizer.addClass('dragging');
      $body.addClass('ew');

      $(document).on('mousemove', do_resize);
      $(document).on('mouseup', unbind_resize);
    };

    var unbind_resize = function(e) {
      $panels.filter('iframe').removeClass('nopointer');
      $resizer.removeClass('dragging');
      $body.removeClass('ew');

      $(document).off('mousemove', do_resize);
      $(document).off('mouseup', unbind_resize);
    };

    var do_resize = function(e) {
      if (!$resizer) { return; }

      var distance = e.pageX - mde.pageX;
      var prevOffset = _prevOffset + distance;
      var nextOffset = _nextOffset - distance;

      if (($prev.width() < config.panel_min && e.pageX < last_x) ||
          ($next.width() < config.panel_min && e.pageX > last_x)) { return; }

      last_x = e.pageX;

      $prev.css({ 'width': _.sprintf('calc(%s + %spx)', width, prevOffset) });
      $next.css({ 'width': _.sprintf('calc(%s + %spx)', width, nextOffset) });

      // store panel offsets
      $prev.data('width-offset', prevOffset);
      $next.data('width-offset', nextOffset);
    };

    $panels.next('.panel-resizer').on('mousedown', function(e) {
      e.preventDefault();
      last_x = e.pageX;

      $resizer = $(e.target).closest('.panel-resizer');
      $prev = $resizer.prevAll('.panel').first();
      $next = $resizer.nextAll('.panel').first();
      mde = e;

      // load previously-stored panel offsets
      _prevOffset = $prev.data('width-offset') || 0;
      _nextOffset = $next.data('width-offset') || 0;

      bind_resize(e);

    // reset dividers on double-click
    }).on('dblclick', function(e) {
      panels.set_default_width($panels);
    });
  };

  /**
   * Get the defult width of a single panel, as a percentage
   *
   * @param {jQuery} $panels: set of panels
   * @return {String}: percentage string (eg. '25%')
   */
  panels.get_default_width = function($panels) {
    return Math.floor(100 / ($panels.length || 1)) + '%';
  };

  /**
   * Reset all panels back to default widths with a CSS transition
   *
   * @param {jQuery} $panels: set of panels
   * @param {String|Integer} duration (optional): transition duration
   */
  panels.set_default_width = function($panels, duration) {
    var width = panels.get_default_width($panels);
    duration = duration !== undefined ? duration : 'fast';

    $panels.data('width-offset', 0).transition({ 'width': width }, duration);
  };

  return panels;
});
