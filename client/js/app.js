/*
 * jsbyte: An interactive JS/HTML/CSS environment
 */

define([
  'jquery', 'underscore', 'backbone', 'templates', 'dom', 'config', 'utils',
  'keys'
],
function($, _, Backbone, templates, dom, config, utils, keys) {
  'use strict';

  var jsbyte = utils.module('jsbyte');

  jsbyte.App = Backbone.View.extend({
    template: 'app',
    el: '#jsbyte',

    initialize: function() {
      this.render();
      this.init_keys();
    },

    run: function() {
      this.$input.submit();
    },

    init_keys: function() {
      var that = this;

      keys.register_handler({ ctrl: true, key: 'enter'}, function(e) {
        that.run();
      });

      keys.init();
    },

    // resizable panels
    init_panels: function() {
      var $resizer, $prevPanel, $nextPanel;
      var _prevOffset, _nextOffset;
      var mde; // mousedown event

      var bind_resize = function(e) {
        $prevPanel.addClass('resizing');

        // load previously-stored panel offsets
        _prevOffset = $prevPanel.data('width-offset') || 0;
        _nextOffset = $nextPanel.data('width-offset') || 0;

        $(document).on('mousemove', resize_panel);
        $(document).on('mouseup', unbind_resize);
      };

      var unbind_resize = function(e) {
        $(document).off('mousemove', resize_panel);
        $(document).off('mouseup', unbind_resize);

        $prevPanel.removeClass('resizing');
      };

      var resize_panel = function(e) {
        if (!$resizer) { return; }

        var distance = e.pageX - mde.pageX;
        var prevOffset = _prevOffset + distance;
        var nextOffset = _nextOffset - distance;

        $prevPanel.attr('style', 'width: calc(25% + ' + prevOffset + 'px) !important');
        $nextPanel.attr('style', 'width: calc(25% + ' + nextOffset + 'px) !important');

        // store panel offsets
        $prevPanel.data('width-offset', prevOffset);
        $nextPanel.data('width-offset', nextOffset);
      };

      $('.panel-resizer').on('mousedown', function(e) {
        $resizer = $(e.target).closest('.panel-resizer');
        $prevPanel = $resizer.prev('.panel');
        $nextPanel = $resizer.next('.panel');
        mde = e;

        bind_resize(e);
      });
    },

    render: function() {
      templates.get(this.template, function(template) {
        var html = _.template(template, { frame: config.frame });
        this.$el.html(html);

        dom.backbone_cache(this, {
          'by_id': ['markup', 'style', 'script', 'input', 'output'],
          'by_class': ['panel']
        });

        this.init_panels();

      }, this);
    }
  });

  return jsbyte;
});
