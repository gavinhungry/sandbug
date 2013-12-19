/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'config', 'utils', 'jquery', 'underscore',
  'backbone', 'bus', 'cdn', 'dom', 'flash', 'keys', 'mirrors', 'panels',
  'router', 'templates', 'themes', 'toolbar'
],
function(
  config, utils, $, _,
  Backbone, bus, cdn, dom, flash, keys, mirrors, panels, router, templates,
  themes, toolbar
) {
  'use strict';

  var app = utils.module('app');

  app.App = Backbone.View.extend({
    template: 'app',
    el: '#debuggerio',

    initialize: function() {
      utils.log('init app module');

      var that = this;

      // fetch the CDN package cache right away
      cdn.update_cache();

      bus.on('user:login', function(username) {
        config.username = username;
      });

      this.render(function() {
        bus.trigger('init', this);

        this.register_keys();
        this.remove_splash();
      });
    },

    events: {
      'click #run': 'run'
    },

    // submit bug to the frame server
    run: function() {
      this.$iframe.css({ 'opacity': '1' });
      this.$input.submit();
    },

    register_keys: function() {
      var that = this;

      keys.register_handler({ ctrl: true, key: 'enter' }, function(e) {
        that.run();
      });

      // don't submit anything on input return
      this.$panel_options.find('> input').on('input keydown', function(e) {
        if (e.keyCode === keys.key_code_for('enter')) { e.preventDefault(); }
      });

      this.$panel_options.find('> button').on('click', function(e) {
        e.preventDefault();
      });
    },

    remove_splash: function() {
      var that = this;
      $('#loading').transition({ 'opacity': '0' }, 500, function() {
        $(this).remove();
        that.$title.transition({ 'opacity': 1 }, 'slow');
      });
    },

    render: function(callback) {
      templates.get(this.template, this).done(function(template_fn) {
        var html = template_fn({ frame: config.frame });
        this.$el.html(html);

        // cache elements to the Backbone View
        dom.cache(this, this.$el, {
          'by_id': ['title', 'markup', 'style', 'script', 'input', 'output'],
          'by_class': ['panel', 'input-panel', 'panel-options']
        });

        this.$iframe = this.$output.children('iframe');

        _.isFunction(callback) && callback.call(this);
      });

      return this;
    }
  });

  return app;
});
