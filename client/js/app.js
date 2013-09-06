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

    init_panels: function() {
      var $resizer;

      var bind_resize = function(e) {
        $(document).on('mousemove', resize_panel);
        $(document).on('mouseup', unbind_resize);
      };

      var unbind_resize = function(e) {
        $(document).off('mousemove', resize_panel);
        $(document).off('mouseup', unbind_resize);
      };

      var resize_panel = function(e) {
        if (!$resizer) { return; }

        var $prev = $resizer.prev();
        var $next = $resizer.next();
      };

      $('.panel-resizer').on('mousedown', function(e) {
        $resizer = $(e.target).closest('.panel-resizer');
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
