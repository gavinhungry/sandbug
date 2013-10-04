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




  panels.update_resize_handlers = function() {
    var $body = $('body');
    var $parent = panels.get_parent();
    var $panels = panels.get_all_panels();
    var layout = panels.get_layout();

    utils.log('updating panel resize handlers for layout', layout);

    // remove any old resize handlers
    var $resizers = panels.get_all_resizers().off('mousedown').off('dblclick');
    var $master = panels.get_master_resizer();
    var $input_resizers = panels.get_input_resizers();
    var $output = panels.get_output_panel();

    var $resizer, $prev, $next, prevWidth, prevHeight, nextWidth, nextHeight;
    var _prevOffsetX, _prevOffsetY, _nextOffsetX, _nextOffsetY;
    var last_x, last_y; // cursor position during mousemove
    var mde; // mousedown event

    _.each($panels, function(panel) {
      var $panel = $(panel);

      $panel.data('default-width', dom.get_percent_width($panel));
      $panel.data('default-height', dom.get_percent_height($panel));
      $panel.data('x-offset', 0);
      $panel.data('y-offset', 0);
    });




    var bind_resize = function(e) {
      $parent.addClass('dragging');
      $output.addClass('nopointer');
      $body.addClass('ew');

      $(document).on('mousemove', do_resize);
      $(document).on('mouseup', unbind_resize);
    };

    var unbind_resize = function(e) {
      $parent.removeClass('dragging');
      $output.removeClass('nopointer');
      $body.removeClass('ew');

      $(document).off('mousemove', do_resize);
      $(document).off('mouseup', unbind_resize);
    };







    var do_resize = function(e) {
      if (!$resizer) { return; }

      var distanceX = e.pageX - mde.pageX;
      var distanceY = e.pageX - mde.pageX;

      var prevOffsetX = _prevOffsetX + distanceX;
      var prevOffsetY = _prevOffsetY + distanceY;
      var nextOffsetX = _nextOffsetX - distanceX;
      var nextOffsetY = _nextOffsetY - distanceY;

//      if (($prev.width() < config.panel_min && e.pageX < last_x) ||
//          ($next.width() < config.panel_min && e.pageX > last_x)) { return; }

      last_x = e.pageX;
      last_y = e.pageY;

      if (layout === 'layout-a' ||
        (layout === 'layout-b' && _.contains(panels.get_input_resizers(), $resizer[0])) ||
        (layout === 'layout-c' && $resizer.is($master)))
      {
        $prev.css({ 'width': _.sprintf('calc(%s + %spx)', prevWidth, prevOffsetX) });
        $next.css({ 'width': _.sprintf('calc(%s + %spx)', nextWidth, nextOffsetX) });
      }


      // store panel offsets
      $prev.data('x-offset', prevOffsetX);
      $prev.data('y-offset', prevOffsetY);
      $next.data('x-offset', nextOffsetX);
      $next.data('y-offset', nextOffsetY);
    };





    $panels.next('.panel-resizer').on('mousedown', function(e) {
      $resizer = $(e.target).closest('.panel-resizer');

      e.preventDefault();
      last_x = e.pageX;
      last_y = e.pageY;
      mde = e;

      // find the surrounding panels
      $prev = $resizer.prevAll('.panel').first();
      $next = $resizer.nextAll('.panel').first();

      // default widths
      prevWidth = $prev.data('default-width');
      prevHeight = $prev.data('default-height');
      nextWidth = $next.data('default-width');
      nextHeight = $next.data('default-height');

      // load previously-stored panel offsets
      _prevOffsetX = $prev.data('x-offset') || 0;
      _prevOffsetY = $prev.data('y-offset') || 0;
      _nextOffsetX = $next.data('x-offset') || 0;
      _nextOffsetY = $next.data('y-offset') || 0;

      bind_resize(e);

    // reset dividers on double-click
    }).on('dblclick', function(e) {
      utils.log('default that bitch');
    });
  };






  /**
   * Initialize a set of panels and panel resizers
   *
   * @param {jQuery} $panels - set of panels
   */
  panels.init = function($panels) {
    $active_panels = $panels;
    panels.update_resize_handlers();
  };
















  /**
   * Get all active panels
   *
   * @return {jQuery} active panels
   */
  panels.get_all_panels = function() {
    return utils.ensure_jquery($active_panels);
  };

  /**
   * Get a panel by its id
   *
   * @param {String} id - panel id
   * @return {jQuery} - panel with matching id
   */
  panels.get_by_id = function(id) {
    var panel = _.find(panels.get_all_panels(), function(panel) {
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
    return panels.get_all_panels().first().parent();
  };

  /**
   * Get the input panels
   *
   * @return {jQuery} input panels
   */
  panels.get_input_panels = function() {
    return panels.get_all_panels().filter('.input-panel');
  };

  /**
   * Get the output panel
   *
   * @return {jQuery} out panel
   */
  panels.get_output_panel = function() {
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
   *
   */
  panels.get_all_resizers = function() {
    return panels.get_parent().find('.panel-resizer');
  };

  /**
   * Get the master resizer (between input and output panels)
   *
   * @return {jQuery} master resizer
   */
  panels.get_master_resizer = function() {
    return panels.get_all_resizers().filter('.panel-master-resizer').first();
  };

  /**
   *
   */
  panels.get_input_resizers = function() {
    var $master = panels.get_master_resizer();
    return panels.get_all_resizers().not($master);
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

    var $parent = panels.get_parent();
    var $panels = panels.get_all_panels();
    var $inputs = panels.get_input_panels();
    var $output = panels.get_output_panel();
    var $master = panels.get_master_resizer();

    // use the original widths to start the transition
    var widths = _.map($panels, function(panel) { return $(panel).width(); });

    $panels.removeAttr('style');
    $master.removeAttr('style');

    _.each(layouts, $.fn.removeClass.bind($parent));
    $parent.addClass(layout);

    var callback = _.once(panels.update_resize_handlers);

    // additional transition effects
    if (layout === 'layout-a') {
      $inputs.css({ 'width':  '33.3%' });
      $panels.transition({ 'width': '25%' }, config.layout_ms, callback);
    }

    else if (layout === 'layout-b') {
      var $sym = $inputs.eq(1);
      $output.transition({ 'height': '50%' }, config.layout_ms);
      $sym.transition({ 'width': '34%', 'height': '50%' }, config.layout_ms);
      $inputs.not($sym).transition({ 'width': '33%', 'height': '50%' },
        config.layout_ms, callback);
    }

    else if (layout === 'layout-c') {
      $master.transition({ 'left' : '40%' }, config.layout_ms);
      $inputs.transition({ 'width': '40%' }, config.layout_ms);
      $output.transition({ 'right': 0 }, config.layout_ms, callback);
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
