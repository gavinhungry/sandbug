/*
 * jsbyte: An interactive JS/HTML/CSS environment
 *
 * panels.js: resizable panels
 */

define(['config', 'utils', 'jquery', 'underscore', 'bus'],
function(config, utils, $, _, bus) {
  'use strict';

  var panels = utils.module('panels');

  var layouts = ['layout-a', 'layout-b', 'layout-c'];
  var $active_panels;

  /**
   * Initialize a set of panels to be horizontally resizable
   *
   * @param {jQuery} $panels - set of panels
   */
  panels.init = function($panels) {
    $active_panels = $panels;
    return;

    var $body = $('body');
    var $resizer, $prev, $next;
    var _prevOffset, _nextOffset;
    var last_x; // cursor x position during mousemove
    var mde; // mousedown event

    var width = panels.get_default_width($panels);

    panels.set_default_width($panels, 0);

    var bind_resize = function(e) {
      $panels.filter('#output').addClass('nopointer');
      $resizer.addClass('dragging');
      $body.addClass('ew');

      $(document).on('mousemove', do_resize);
      $(document).on('mouseup', unbind_resize);
    };

    var unbind_resize = function(e) {
      $panels.filter('#output').removeClass('nopointer');
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
   * @param {jQuery} $panels - set of panels
   * @return {String} percentage string (eg. '25%')
   */
  panels.get_default_width = function($panels) {
    return Math.floor(100 / ($panels.length || 1)) + '%';
  };

  /**
   * Reset all panels back to default widths with a CSS transition
   *
   * @param {jQuery} $panels - set of panels
   * @param {String|Integer} [duration] - transition duration
   */
  panels.set_default_width = function($panels, duration) {
    var width = panels.get_default_width($panels);
    duration = duration !== undefined ? duration : 'fast';

    $panels.data('width-offset', 0).transition({ 'width': width }, duration);
  };

  /**
   * Get all active panels
   *
   * @return {jQuery} active panels
   */
  panels.get_panels = function() {
    return utils.ensure_jquery($active_panels);
  };

  /**
   * Get a panel by its id
   *
   * @param {String} id - panel id
   * @return {jQuery} - panel with matching id
   */
  panels.get_by_id = function(id) {
    var panel = _.find(panels.get_panels(), function(panel) {
      return panel.id === id;
    });

    return utils.ensure_jquery(panel);
  };

  /**
   * Get the parent of the active panels
   *
   * @return {jQuery} parent of active panels
   */
  panels.get_parent = function() {
    return panels.get_panels().first().parent();
  };

  /**
   * Get the input panels
   *
   * @return {jQuery} input panels
   */
  panels.get_inputs = function() {
    return panels.get_panels().filter('.input-panel');
  };

  /**
   * Get the output panel
   *
   * @return {jQuery} out panel
   */
  panels.get_output = function() {
    return panels.get_by_id('output');
  };

  /**
   * Get the current layout id
   *
   * @return {String} id of current layout
   */
  panels.get_layout = function() {
    var $parent = panels.get_parent();

    return _.find(layouts, function(layout) {
      return $parent.hasClass(layout);
    }) || _.first(layouts);
  };

  /**
   * Get the master resizer (between input and output panels)
   *
   * @return {jQuery} master resizer
   */
  panels.get_master_resizer = function() {
    return panels.get_parent().find('.panel-master-resizer');
  };

  /**
   * Set the layout by layout id
   *
   * @param {String} layout - id of layout to set
   */
  panels.set_layout = function(layout) {
    // do nothing if an invalid layout or the current layout is requested
    if (!_.contains(layouts, layout) || layout === panels.get_layout()) {
      return;
    }

    var $panels = panels.get_panels();
    var $parent = panels.get_parent();
    var $inputs = panels.get_inputs();
    var $output = panels.get_output();
    var $master = panels.get_master_resizer();

    $panels.removeAttr('style');
    $master.removeAttr('style');

    _.each(layouts, $.fn.removeClass.bind($parent));
    $parent.addClass(layout);

    // additional transition effects
    if (layout === 'layout-a') {
      $inputs.css({ 'width':  '33.3%' });
      $panels.transition({ 'width': '25%' }, config.layout_transition_time);
    } else if (layout === 'layout-c') {
      $master.transition({ 'left' : '40%' }, config.layout_transition_time);
      $inputs.transition({ 'width': '40%' }, config.layout_transition_time);
      $output.transition({ 'right': 0 }, config.layout_transition_time);
    }
  };

  /**
   * Rotate panels parent through available layouts
   */
  panels.cycle_layout = function() {
    var $parent = panels.get_parent();

    var hasLayout = _.some(layouts, function(layout, i) {
      if ($parent.hasClass(layout)) {
        var nextLayout = layouts[(i + 1) % layouts.length];
        panels.set_layout(nextLayout);

        return true;
      }
    });

    if (!hasLayout) { panels.set_layout(_.first(layouts)); }
  };

  return panels;
});
