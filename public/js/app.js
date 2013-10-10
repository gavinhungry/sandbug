/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'config', 'utils', 'jquery', 'underscore',
  'backbone', 'cdn', 'dom', 'keys', 'mirrors', 'panels', 'templates', 'themes'
],
function(
  config, utils, $, _,
  Backbone, cdn, dom, keys, mirrors, panels, templates, themes
) {
  'use strict';

  var app = utils.module('app');

  app.App = Backbone.View.extend({
    template: 'app',
    el: '#debuggerio',

    initialize: function() {
      var that = this;

      // fetch the CDN package cache right away
      cdn.update_cache();

      this.render(function() {
        // init various components
        mirrors.init(this.$input_panels);
        panels.init(this.$panels);
        cdn.init_filter();
        themes.init();

        this.register_keys();
        this.remove_splash();
      });
    },

    events: {
      'click #theme': function(e) { themes.cycle_theme(); },
      'click #layout': function(e) { panels.cycle_layout(); },
      'click #github': function(e) { window.open(config.github); },
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

      keys.init();
    },

    remove_splash: function() {
      var that = this;
      _.delay(function() {
        $('#loading').transition({ 'opacity': '0' }, 500, function() {
          $(this).remove();

          that.$title.transition({ 'opacity': 1 }, 'slow');
        });
      }, config.debug ? 0 : 1000);
    },

    render: function(callback) {
      templates.get(this.template, function(template) {
        var html = _.template(template, { frame: config.frame });
        this.$el.html(html);

        // cache elements to the Backbone View
        dom.cache(this, this.$el, {
          'by_id': ['title', 'markup', 'style', 'script', 'input', 'output'],
          'by_class': ['panel', 'input-panel', 'panel-options']
        });

        this.$iframe = this.$output.children('iframe');

        if (_.isFunction(callback)) { callback.call(this); }
      }, this);

      return this;
    }
  });

  return app;
});
