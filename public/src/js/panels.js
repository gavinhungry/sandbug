/*
 * debugger.io: An interactive web scripting sandbox
 *
 * panels.js: resizable panels and layouts
 */

define([
  'config', 'utils', 'jquery', 'underscore',
  'bus', 'dom', 'mirrors'
],
function(config, utils, $, _, bus, dom, mirrors) {
  'use strict';

  var panels = utils.module('panels');

  var layouts = ['layout-cols', 'layout-top', 'layout-left'];
  var layout_transitioning = false;
  var min_size;
  var $active_panels;

  bus.init(function(av) {
    utils.log('init panels module');

    $active_panels = av.$panels;
    panels.update_resize_handlers();
    panels.init_input_modes();

    var optionsHeight = dom.css('#input > .panel .panel-options')['height'];
    min_size = (parseInt(optionsHeight, 10) || 0) + 10;

    bus.on('config:mode', function(mode) {
      // immediately update the layout in phone mode
      if (mode.phone) {
        config.default_layout = 'layout-top';
        panels.set_layout(config.default_layout, true);
      }
    });

    panels.set_layout(config.default_layout, true);
  });

  /**
   * Remove resize handlers
   */
  panels.disable_resize_handlers = function() {
    panels.get_all_resizers().off('mousedown').off('dblclick');
  };

  /**
   * Update resize handlers for the current layout
   */
  panels.update_resize_handlers = function() {
    var $body = $('body');
    var $parent = panels.get_parent();
    var $panels = panels.get_all_panels();
    var layout = panels.get_layout();

    utils.log('updating panel resize handlers for', layout);
    panels.disable_resize_handlers();

    // remove any old resize handlers
    var $resizers = panels.get_all_resizers();
    var $inputResizers = panels.get_input_resizers();
    var $master = panels.get_master_resizer();
    var $inputs = panels.get_input_panels();
    var $output = panels.get_output_panel();

    var $inputsAll = $inputs.add($inputResizers);

    var $resizer, isInputResizer, isHorizResizer;
    var $prev, $next, prevWidth, prevHeight, nextWidth, nextHeight;
    var _prevOffsetX, _prevOffsetY, _nextOffsetX, _nextOffsetY;
    var lastX, lastY; // cursor position during mousemove
    var mde; // mousedown event

    var leftEdge, minEdge, rightEdge;

    _.each($panels, function(panel) {
      var $panel = $(panel);

      $panel.data('default-width', dom.get_percent_width($panel));
      $panel.data('default-height', dom.get_percent_height($panel));
      $panel.data('x-offset', 0);
      $panel.data('y-offset', 0);
    });

    var bind_resize = function(e) {
      $resizer.addClass('dragging');
      $output.addClass('nopointer');
      $body.addClass(isHorizResizer ? 'ns' : 'ew');

      $(document).on('mousemove', do_resize);
      $(document).on('mouseup', unbind_resize);
    };

    var unbind_resize = function(e) {
      $resizer.removeClass('dragging');
      $output.removeClass('nopointer');
      $body.removeClass('ns ew');

      $(document).off('mousemove', do_resize);
      $(document).off('mouseup', unbind_resize);

      bus.trigger('panels:resized');
    };

    var do_resize = function(e) {
      if (!$resizer) { return; }

      var minDistX = -1 * (minEdge.left - leftEdge.left - min_size);
      var maxDistX = rightEdge.left - minEdge.left - min_size;
      var minDistY = -1 * (minEdge.top - leftEdge.top - min_size);
      var maxDistY = rightEdge.top - minEdge.top - min_size;

      var distanceX = utils.clamp(e.pageX - mde.pageX, minDistX, maxDistX);
      var distanceY = utils.clamp(e.pageY - mde.pageY, minDistY, maxDistY);

      var prevOffsetX = _prevOffsetX + distanceX;
      var prevOffsetY = _prevOffsetY + distanceY;
      var nextOffsetX = _nextOffsetX - distanceX;
      var nextOffsetY = _nextOffsetY - distanceY;

      var newPrevWidth = _.sprintf('calc(%s + %spx)', prevWidth, prevOffsetX);
      var newNextWidth = _.sprintf('calc(%s + %spx)', nextWidth, nextOffsetX);
      var newPrevHeight = _.sprintf('calc(%s + %spx)', prevHeight, prevOffsetY);
      var newNextHeight = _.sprintf('calc(%s + %spx)', nextHeight, nextOffsetY);

      lastX = e.pageX;
      lastY = e.pageY;

      switch(layout) {
        case 'layout-cols':
          $prev.width(newPrevWidth).data('x-offset', prevOffsetX);
          $next.width(newNextWidth).data('x-offset', nextOffsetX);
        break; case 'layout-top':
          if (isInputResizer) {
            $prev.width(newPrevWidth).data('x-offset', prevOffsetX);
            $next.width(newNextWidth).data('x-offset', nextOffsetX);
          } else { // master resizer
            $inputsAll.height(newPrevHeight).data('y-offset', prevOffsetY);
            $next.height(newNextHeight).data('y-offset', nextOffsetY);
          }
        break; case 'layout-left':
          if (isInputResizer) {
            $prev.height(newPrevHeight).data('y-offset', prevOffsetY);
            $next.height(newNextHeight).data('y-offset', nextOffsetY);
          } else { // master resizer
            $inputsAll.width(newPrevWidth).data('x-offset', prevOffsetX);
            $next.width(newNextWidth).data('x-offset', nextOffsetX);
            $master.css({ 'left': newPrevWidth });
          }
        break;
      };

      bus.trigger('panels:resizing');
    };

    $panels.next('.panel-resizer').on('mousedown', function(e) {
      $resizer = $(e.target).closest('.panel-resizer');
      isInputResizer = _.contains(panels.get_input_resizers(), $resizer[0]);
      isHorizResizer = _.contains(panels.get_horiz_resizers(), $resizer[0]);

      e.preventDefault();
      lastX = e.pageX;
      lastY = e.pageY;
      mde = e;

      // find the surrounding panels
      $prev = $resizer.prevAll('.panel').first();
      $next = $resizer.nextAll('.panel').first();

      leftEdge = $prev.offset();
      minEdge = $next.offset();
      rightEdge = {
        'left': minEdge.left + $next.width(),
        'top': minEdge.top + $next.height()
      };

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

    // reset panels on double-click
    }).on('dblclick', function(e) {
      $resizer = $(e.target).closest('.panel-resizer');
      isInputResizer = _.contains(panels.get_input_resizers(), $resizer[0]);
      isHorizResizer = _.contains(panels.get_horiz_resizers(), $resizer[0]);

      var callback = _.debounce(function() {
        bus.trigger('panels:resized');
      }, 10);

      if(isHorizResizer) {
        _.each(panels.get_horiz_panels(), function(panel) {
          reset_horiz_panel(panel, false, callback);
        });

        if (layout === 'layout-top' && !isInputResizer) {
          _.each(panels.get_input_panels(), function(panel) {
            reset_horiz_panel(panel, true, callback);
          });
        }
      } else {
        _.each(panels.get_vert_panels(), function(panel) {
          reset_vert_panel(panel, false, callback);
        });

        if (layout === 'layout-left' && !isInputResizer) {
          _.each(panels.get_input_panels(), function(panel) {
            reset_vert_panel(panel, true, callback);
          });
        }
      }
    });
  };

  var reset_horiz_panel = function(panel, withResizer, callback) {
    var $panel = utils.ensure_jquery(panel);
    var h = $panel.data('default-height');
    var dur = config.layout_time;

    $panel.data('y-offset', 0).transition({ 'height': h }, dur, callback);

    if (withResizer) {
      $panel.prev('.panel-resizer').transition({ 'height': h }, dur, callback);
    }
  };

  var reset_vert_panel = function(panel, withResizer, callback) {
    var $panel = utils.ensure_jquery(panel);
    var w = $panel.data('default-width');
    var dur = config.layout_time;

    $panel.data('x-offset', 0).transition({ 'width': w }, dur, callback);

    if (withResizer) {
      $panel.prev('.panel-resizer').transition({ 'width': w }, dur, callback);
      panels.get_master_resizer().transition({ 'left': w }, dur, callback);
    }
  };

  /**
   * Init mode cycles on input panels
   */
  panels.init_input_modes = function() {
    var $inputs = panels.get_input_panels();

    _.each($inputs, function(inputPanelNode) {
      var $panel = $(inputPanelNode);
      var panel = $panel.attr('id');

      var $mode = $panel.children('.mode');
      var $cycle = $panel.find('.panel-options > .cycle');

      $cycle.on('click', function(e) { mirrors.cycle_mode(panel); });

      bus.on(_.sprintf('mirrors:%s:mode', panel), function(mode, label) {
        // set a fixed width now, change the label and transition
        // to an "auto-esque" state
        var width = $cycle.outerWidth();
        $cycle.css({ 'min-width': width, 'max-width': width });

        // update the cycle label and hidden input
        $mode.val(mode);
        $cycle.text(label);

        // HACK: wait for a repaint
        _.delay(function() {
          $cycle.stop().transition({ 'min-width': 0, 'max-width': 300 });
        }, 10);
      });
    });
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
   * Get only the horizontal panels
   *
   * @return {jQuery} horizontal panels
   */
  panels.get_horiz_panels = function() {
    var $panels = panels.get_horiz_resizers().next('.panel');
    var $first = $panels.first();

    if (_.contains(panels.get_input_panels(), $first[0])) {
      $panels = $panels.add($first.prevAll('.panel'));
    }

    return $panels;
  };

  /**
   * Get only the vertical panels
   *
   * @return {jQuery} vertical panels
   */
  panels.get_vert_panels = function() {
    return panels.get_all_panels().not(panels.get_horiz_panels());
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
   * Get all panel resizers
   *
   * @return {jQuery} all panel resizers
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
   * Get only the input panel resizers
   *
   * @return {jQuery} input panel resizers
   */
  panels.get_input_resizers = function() {
    var $master = panels.get_master_resizer();
    return panels.get_all_resizers().not($master);
  };

  /**
   * Get only the horizontal panel resizers
   *
   * @return {jQuery} horizontal panel resizers
   */
  panels.get_horiz_resizers = function() {
    return $(_.filter(panels.get_all_resizers(), function(resizer) {
      return !!$(resizer).width();
    }));
  };

  /**
   * Get only the vertical panel resizers
   *
   * @return {jQuery} vertical panel resizers
   */
  panels.get_vert_resizers = function() {
    return panels.get_all_resizers().not(panels.get_horiz_resizers());
  };

  /**
   * Set the layout by layout id
   *
   * @param {String} layout - id of layout to set
   * @param {Boolean} now - if true, do not transition the layout change
   */
  panels.set_layout = function(layout, now) {
    if (layout_transitioning) { return; }

    // do nothing if an invalid layout or the current layout is requested
    if (!_.contains(layouts, layout) || layout === panels.get_layout()) {
      layout_transitioning = false;
      return;
    }

    layout_transitioning = true;

    var $parent = panels.get_parent();
    var $panels = panels.get_all_panels();
    var $resizers = panels.get_all_resizers()
    var $master = panels.get_master_resizer();
    var $inputs = panels.get_input_panels();
    var $output = panels.get_output_panel();

    // use the original widths to start the transition
    var widths = _.map($inputs, function(panel) { return $(panel).width(); });

    $panels.removeAttr('style');
    $resizers.removeAttr('style');
    $master.removeAttr('style');

    _.each(layouts, _.bind($.fn.removeClass, $parent));
    $parent.addClass(layout);

    var dur = now ? 0 : config.layout_time;
    var callback = _.once(function() {
      panels.update_resize_handlers();
      bus.trigger('panels:resized');
      layout_transitioning = false;
    });

    // additional transition effects
    if (layout === 'layout-cols') {
      $inputs.css({ 'width':  '33.3%' });
      $panels.transition({ 'width': '25%' }, dur, callback);
    }

    else if (layout === 'layout-top') {
      // restore the original width temporarily
      _.each(widths, function(width, i) { $inputs.eq(i).width(width); });

      var $sym = $inputs.eq(1);
      $output.transition({ 'height': '50%' }, dur);
      $sym.transition({ 'width': '34%', 'height': '50%' }, dur);
      $inputs.not($sym).transition({
        'width': '33%', 'height': '50%'
      }, dur, callback);
    }

    else if (layout === 'layout-left') {
      $master.transition({ 'left' : '40%' }, dur);
      $inputs.transition({ 'width': '40%' }, dur);
      $output.transition({ 'right': 0 }, dur, callback);
    }
  };

  /**
   * Rotate panels parent through available layouts
   */
  panels.cycle_layout = function() {
    var index = _.indexOf(layouts, panels.get_layout());
    var nextLayout = layouts[(index + 1) % layouts.length];
    panels.set_layout(nextLayout);
  };

  return panels;
});
