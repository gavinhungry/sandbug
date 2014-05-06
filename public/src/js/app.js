/*
 * debugger.io: An interactive web scripting sandbox
 */

define([
  'config', 'utils', 'jquery', 'underscore',
  'backbone', 'bugs', 'bus', 'cdn', 'dom', 'flash', 'frame', 'keys', 'locales',
  'mirrors', 'panels', 'router', 'templates', 'themes', 'toolbar'
],
function(
  config, utils, $, _,
  Backbone, bugs, bus, cdn, dom, flash, frame, keys, locales, mirrors, panels,
  router, templates, themes, toolbar
) {
  'use strict';

  var app = utils.module('app');

  app.App = Backbone.View.extend({
    template: 'app',
    el: '#debuggerio',

    initialize: function() {
      utils.log('init app module');

      var that = this;

      bus.on('user:login', function(username) {
        config.username = username;

        flash.message_good(locales.string('logged_in', username),
          locales.string('logged_in_msg'));

        that.$save.transitIn();
      });

      bus.on('user:logout', function() {
        config.username = null;

        flash.message(locales.string('logged_out'),
          locales.string('logged_out_msg'));

        that.$save.transitOut();
      });

      bus.on('config:mode', function(mode) {
        var $body = $('body');
        var modes = _.keys(mode);

        _.each(modes, function(modeClass) {
          $body.toggleClass(modeClass, mode[modeClass]);
        });
      });

      bus.on('config:autorun', function(autorun) {
        that.$auto.toggleClass('checked', autorun);
      });

      this.render(function() {
        bus.trigger('init', this);

        this.register_keys();
        this.remove_splash();
      });
    },

    events: {
      'click #run': 'run',
      'click #save': 'save',
      'click #auto': function(e) { config.autorun = !config.autorun; }
    },

    // submit bug to the frame server
    run: function() {
      frame.update();
    },

    save: function() {
      bugs.save();
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
      $('#loading').transition({ 'opacity': '0' }, function() {
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
          'by_id': [
            'title', 'markup', 'style', 'script', 'input', 'output', 'save',
            'auto'
          ],
          'by_class': ['panel', 'input-panel', 'panel-options']
        });

        this.$save[!config.username ? 'transitOut' : 'transitIn']();
        this.$iframe = this.$output.children('iframe');
        this.$auto.prop('checked', config.autorun);

        _.isFunction(callback) && callback.call(this);
      });

      return this;
    }
  });

  return app;
});
