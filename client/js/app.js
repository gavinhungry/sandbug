/*
 * jsbyte: An interactive JS/HTML/CSS environment
 */

define([
  'jquery', 'underscore', 'backbone', 'templates', 'dom', 'config', 'utils',
  'keys', 'panels', 'mirrors'
],
function($, _, Backbone, templates, dom, config, utils, keys, panels, mirrors) {
  'use strict';

  var jsbyte = utils.module('jsbyte');

  jsbyte.App = Backbone.View.extend({
    template: 'app',
    el: '#jsbyte',

    initialize: function() {
      this.render();
      this.register_keys();
    },

    post_render: function() {
      // init CodeMirror and resizable panels
      mirrors.init(this.$panels.not('iframe').children('textarea'));
      panels.init(this.$panels);

      this.remove_splash();
    },

    events: {
      'click #github': function(e) { window.open(config.github); }
    },

    // submit byte to the echo server
    run: function() {
      this.$input.submit();
    },

    register_keys: function() {
      var that = this;

      keys.register_handler({ ctrl: true, key: 'enter'}, function(e) {
        that.run();
      });

      keys.init();
    },

    remove_splash: function() {
      var that = this;
      _.delay(function() {
        $('#loading').transition({ 'opacity': '0' }, 500, function() {
          $(this).remove();

          that.$title.children('.text').transition({ 'opacity': 1 }, 'slow');
        });
      }, config.debug ? 0 : 1000);
    },

    render: function() {
      templates.get(this.template, function(template) {
        var html = _.template(template, { frame: config.frame });
        this.$el.html(html);

        // cache elements to the Backbone View
        dom.cache(this, this.$el, {
          'by_id': ['title', 'markup', 'style', 'script', 'input', 'output'],
          'by_class': ['panel']
        });

        this.post_render();
      }, this);
    }
  });

  return jsbyte;
});
